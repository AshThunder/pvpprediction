# v3.0.0 // PVP PREDICTION ARENA — GenLayer Skill Compliant
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
import json
import re
from dataclasses import dataclass
import genlayer as gl
from genlayer import *

# ── Error Classification (SKILL.md §Error Classification) ──
ERROR_EXPECTED = "[EXPECTED]"
ERROR_LLM      = "[LLM_ERROR]"

@allow_storage
@dataclass
class Duel:
    challenger: Address
    opponent: Address
    claim: str
    stake: u256
    status: str  # OPEN, MATCHED, RESOLVED, CLAIMED, CANCELLED
    winner: Address
    evidence_a: str
    evidence_b: str


class PvPPredictionArena(gl.Contract):
    duels: TreeMap[u256, Duel]
    next_duel_id: u256
    house_fee_percent: u256
    owner: Address
    collected_fees: u256

    def __init__(self):
        self.next_duel_id = u256(1)
        self.house_fee_percent = u256(2)
        self.owner = gl.message.sender_address
        self.collected_fees = u256(0)

    @gl.public.write.payable
    def create_duel(self, claim_text: str) -> u256:
        stake = gl.message.value
        if stake <= 0:
            raise gl.UserError(f"{ERROR_EXPECTED} Stake must be greater than 0")

        duel_id = self.next_duel_id
        self.next_duel_id += u256(1)

        duel = Duel(
            challenger=gl.message.sender_address,
            opponent=Address("0x0000000000000000000000000000000000000000"),
            claim=claim_text,
            stake=stake,
            status="OPEN",
            winner=Address("0x0000000000000000000000000000000000000000"),
            evidence_a="",
            evidence_b=""
        )
        self.duels[duel_id] = duel
        return duel_id

    @gl.public.write.payable
    def match_duel(self, duel_id: u256, evidence_query: str) -> None:
        if duel_id not in self.duels:
            raise gl.UserError(f"{ERROR_EXPECTED} Duel does not exist")

        duel = self.duels[duel_id]
        if duel.status != "OPEN":
            raise gl.UserError(f"{ERROR_EXPECTED} Duel is not open for matching")
        if gl.message.value != duel.stake:
            raise gl.UserError(f"{ERROR_EXPECTED} Must match the exact stake amount")

        duel.opponent = gl.message.sender_address
        duel.evidence_b = evidence_query
        duel.status = "MATCHED"
        self.duels[duel_id] = duel

    @gl.public.write
    def cancel_duel(self, duel_id: u256) -> None:
        if duel_id not in self.duels:
            raise gl.UserError(f"{ERROR_EXPECTED} Duel does not exist")

        duel = self.duels[duel_id]
        if duel.status != "OPEN":
            raise gl.UserError(f"{ERROR_EXPECTED} Only OPEN duels can be cancelled")
        if gl.message.sender_address != duel.challenger:
            raise gl.UserError(f"{ERROR_EXPECTED} Only the challenger can cancel")

        duel.status = "CANCELLED"
        self.duels[duel_id] = duel

        # Refund the challenger
        duel.challenger.transfer(duel.stake)

    # ── LLM Resilience (SKILL.md §LLM Resilience) ──
    @staticmethod
    def _parse_json(text: str) -> dict:
        """Clean LLM JSON: strip wrapping text, fix trailing commas."""
        first = text.find("{")
        last = text.rfind("}")
        if first == -1 or last == -1:
            raise gl.UserError(f"{ERROR_LLM} No JSON object found in LLM output")
        text = text[first:last + 1]
        text = re.sub(r",(?!\s*?[{\[\"'\w])", "", text)
        return json.loads(text)

    def _judge_claim(self, claim: str, counter_evidence: str) -> dict:
        def leader_fn() -> dict:
            prompt = (
                "### PVP PREDICTION ARENA // JUDICIAL PROTOCOL ###\n"
                "You are an impartial, data-driven AI Judge.\n\n"
                f"CHALLENGER PROPOSITION: '{claim}'\n"
                f"OPPONENT COUNTER-STANCE/CONTEXT: '{counter_evidence}'\n\n"
                "YOUR MISSION:\n"
                "1. Independently verify the factual truth of the PROPOSITION.\n"
                "2. Analyze the COUNTER-STANCE to see if it invalidates the PROPOSITION.\n"
                "3. Reach a binary verdict: CHALLENGER wins if the claim is FACTUALLY TRUE. OPPONENT wins if the claim is FALSE or UNPROVABLE.\n\n"
                "OUTPUT JSON FORMAT (STRICT):\n"
                "{\n"
                '  "winner": "CHALLENGER" or "OPPONENT",\n'
                '  "reasoning": "A concise explanation"\n'
                "}"
            )
            try:
                result = gl.nondet.exec_prompt(prompt, response_format="json")
                parsed = self._parse_json(str(result))
                winner = str(parsed.get("winner", "OPPONENT")).strip().upper()
                if winner not in ("CHALLENGER", "OPPONENT"):
                    winner = "OPPONENT"
                return {
                    "winner": winner,
                    "reasoning": str(parsed.get("reasoning", "No valid explanation provided."))[:200]
                }
            except Exception as e:
                # Fallback on parsing error
                return {"winner": "OPPONENT", "reasoning": f"LLM parsing failed: {str(e)}"}

        def validator_fn(leaders_res: gl.vm.Result) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                # If leader raised an error (unlikely due to try/except, but possible), just disagree
                return False

            validator_result = leader_fn()
            
            # Extract both results
            leader_winner = leaders_res.calldata.get("winner")
            validator_winner = validator_result.get("winner")
            
            # Consensus strictly requires agreeing on the winner. Reasoning can differ.
            return leader_winner == validator_winner

        return gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

    @gl.public.write
    def resolve_duel(self, duel_id: u256) -> None:
        if duel_id not in self.duels:
            raise gl.UserError(f"{ERROR_EXPECTED} Duel does not exist")

        duel = self.duels[duel_id]
        if duel.status != "MATCHED":
            raise gl.UserError(f"{ERROR_EXPECTED} Duel must be matched to resolve")

        result = self._judge_claim(duel.claim, duel.evidence_b)

        if result.get("winner") == "CHALLENGER":
            duel.winner = duel.challenger
        else:
            duel.winner = duel.opponent

        duel.status = "RESOLVED"
        self.duels[duel_id] = duel

    @gl.public.write
    def claim_winnings(self, duel_id: u256) -> None:
        if duel_id not in self.duels:
            raise gl.UserError(f"{ERROR_EXPECTED} Duel does not exist")

        duel = self.duels[duel_id]
        if duel.status != "RESOLVED":
            raise gl.UserError(f"{ERROR_EXPECTED} Duel is not resolved yet")
        if gl.message.sender_address != duel.winner:
            raise gl.UserError(f"{ERROR_EXPECTED} Only the winner can claim")

        total_pot = duel.stake * u256(2)
        fee = (total_pot * self.house_fee_percent) // u256(100)
        winnings = total_pot - fee

        duel.status = "CLAIMED"
        self.duels[duel_id] = duel

        self.collected_fees += fee
        duel.winner.transfer(winnings)

    @gl.public.write
    def withdraw_fees(self) -> None:
        if gl.message.sender_address != self.owner:
            raise gl.UserError(f"{ERROR_EXPECTED} Only owner can withdraw fees")

        amount = self.collected_fees
        self.collected_fees = u256(0)
        self.owner.transfer(amount)

    @gl.public.view
    def get_duel(self, duel_id: u256) -> Duel:
        if duel_id not in self.duels:
            return Duel(
                challenger=Address("0x0000000000000000000000000000000000000000"),
                opponent=Address("0x0000000000000000000000000000000000000000"),
                claim="",
                stake=u256(0),
                status="NOT_FOUND",
                winner=Address("0x0000000000000000000000000000000000000000"),
                evidence_a="",
                evidence_b=""
            )

        return self.duels[duel_id]

    @gl.public.view
    def get_next_duel_id(self) -> u256:
        return self.next_duel_id

    @gl.public.view
    def get_owner(self) -> Address:
        return self.owner

    @gl.public.view
    def get_fee_balance(self) -> u256:
        return self.collected_fees
