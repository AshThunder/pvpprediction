# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
from dataclasses import dataclass
import json

# ── Error Classification (SKILL.md §Error Classification) ──
ERROR_EXPECTED  = "[EXPECTED]"
ERROR_LLM       = "[LLM_ERROR]"
ERROR_TRANSIENT = "[TRANSIENT]"
ERROR_EXTERNAL  = "[EXTERNAL]"

# ── Constants ──

@allow_storage
@dataclass
class Duel:
    challenger: Address
    opponent: Address
    claim: str
    stake: u256
    status: str  # OPEN, MATCHED, RESOLVED, CLAIMED, CANCELLED, EXPIRED
    winner: Address
    evidence_a: str
    evidence_b: str
    reasoning: str
    # Phase 3 fields (appended at END per SKILL.md storage rules)
    category: str            # "crypto", "sports", "politics", "science", "other"
    target_opponent: Address # 0x0 = public, else = private duel
    created_block: u256      # block number at creation for expiry
    # Phase 6 fields
    deadline: u256           # Unix timestamp when resolution is allowed


class PvPPredictionArena(gl.Contract):
    duels: TreeMap[u256, Duel]
    balances: TreeMap[Address, u256]
    next_duel_id: u256
    owner: Address

    def __init__(self):
        self.next_duel_id = u256(1)
        self.owner = gl.message.sender_address

    @gl.public.write.payable
    def create_duel(self, claim_text: str, target_opponent: str, deadline: u256) -> u256:
        stake = gl.message.value
        if stake <= 0:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Stake must be greater than 0")

        # Parse target opponent (0x0 = public)
        zero = Address("0x0000000000000000000000000000000000000000")
        try:
            target = Address(target_opponent) if target_opponent and target_opponent != "" else zero
        except Exception:
            target = zero

        duel_id = self.next_duel_id
        self.next_duel_id += u256(1)

        duel = Duel(
            challenger=gl.message.sender_address,
            opponent=zero,
            claim=claim_text,
            stake=stake,
            status="OPEN",
            winner=zero,
            evidence_a="",
            evidence_b="",
            reasoning="",
            category="",
            target_opponent=target,
            created_block=u256(0),
            deadline=deadline,
        )
        self.duels[duel_id] = duel
        return duel_id

    @gl.public.write.payable
    def match_duel(self, duel_id: u256, evidence_query: str) -> None:
        if duel_id not in self.duels:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Duel does not exist")

        duel = self.duels[duel_id]
        if duel.status != "OPEN":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Duel is not open for matching")
        if gl.message.value != duel.stake:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Must match the exact stake amount")

        # Private duel check
        zero = Address("0x0000000000000000000000000000000000000000")
        if duel.target_opponent != zero and duel.target_opponent != gl.message.sender_address:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} This is a private duel for a specific opponent")

        duel.opponent = gl.message.sender_address
        duel.evidence_b = evidence_query
        duel.status = "MATCHED"
        self.duels[duel_id] = duel

    @gl.public.write
    def cancel_duel(self, duel_id: u256) -> None:
        if duel_id not in self.duels:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Duel does not exist")

        duel = self.duels[duel_id]
        if duel.status != "OPEN":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Only OPEN duels can be cancelled")
        if gl.message.sender_address != duel.challenger:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Only the challenger can cancel")

        duel.status = "CANCELLED"
        self.duels[duel_id] = duel

        self._add_balance(duel.challenger, duel.stake)

    # ── LLM Resilience (SKILL.md §LLM Resilience) ──
    def _parse_json(self, text: str) -> dict:
        """Clean LLM JSON: strip wrapping text, fix trailing commas."""
        import re
        first = text.find("{")
        last = text.rfind("}")
        if first == -1 or last == -1:
            raise gl.vm.UserError(f"{ERROR_LLM} No JSON object found in LLM output")
        text = text[first:last + 1]
        text = re.sub(r",(?!\s*?[{\[\"'\w])", "", text)
        return json.loads(text)

    def _handle_leader_error(self, leaders_res, leader_fn) -> bool:
        leader_msg = leaders_res.message if hasattr(leaders_res, 'message') else ''
        try:
            leader_fn()
            return False  # Leader errored, validator succeeded — disagree
        except gl.vm.UserError as e:
            validator_msg = e.message if hasattr(e, 'message') else str(e)
            # Deterministic errors: must match exactly
            if validator_msg.startswith(ERROR_EXPECTED) or validator_msg.startswith(ERROR_EXTERNAL):
                return validator_msg == leader_msg
            # Transient: agree if both hit transient failure
            if validator_msg.startswith(ERROR_TRANSIENT) and leader_msg.startswith(ERROR_TRANSIENT):
                return True
            # LLM or unknown: disagree — forces consensus retry
            return False
        except Exception:
            return False

    def _judge_claim(self, claim: str, counter_evidence: str) -> dict:
        def leader_fn() -> dict:
            prompt = (
                "### PVP PREDICTION ARENA // COLOR COMMENTATOR PROTOCOL ###\n"
                "You are an energetic, slightly sassy sports color-commentator judging a prediction arena duel.\n\n"
                f"THE PROPOSITION: '{claim}'\n"
                f"OPPONENT COUNTER-STANCE/CONTEXT: '{counter_evidence}'\n\n"
                "YOUR MISSION:\n"
                "1. Independently verify the factual truth of the PROPOSITION using your knowledge and current web context.\n"
                "2. Analyze the COUNTER-STANCE.\n"
                "3. Reach a binary verdict: CHALLENGER wins if the claim is FACTUALLY TRUE. OPPONENT wins if the claim is FALSE or UNPROVABLE.\n\n"
                "OUTPUT JSON FORMAT (STRICT):\n"
                "{\n"
                '  "winner": "CHALLENGER" or "OPPONENT",\n'
                '  "reasoning": "A highly entertaining, high-energy 2-3 sentence sports broadcaster commentary explaining your verdict."\n'
                "}"
            )
            try:
                result = gl.nondet.exec_prompt(prompt, response_format="json")
                if isinstance(result, dict):
                    parsed = result
                else:
                    parsed = self._parse_json(str(result))
                winner = str(parsed.get("winner", "OPPONENT")).strip().upper()
                if winner not in ("CHALLENGER", "OPPONENT"):
                    raise gl.vm.UserError(f"{ERROR_LLM} Invalid winner returned by AI: {winner}")
                return {
                    "winner": winner,
                    "reasoning": str(parsed.get("reasoning", "No valid explanation provided."))[:1000]
                }
            except gl.vm.UserError:
                raise
            except Exception as e:
                raise gl.vm.UserError(f"{ERROR_TRANSIENT} Network or API failure calling GenLayer NN: {str(e)}")

        def validator_fn(leaders_res) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return self._handle_leader_error(leaders_res, leader_fn)
            validator_result = leader_fn()
            leader_winner = leaders_res.calldata.get("winner")
            validator_winner = validator_result.get("winner")
            return leader_winner == validator_winner

        return gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

    @gl.public.write
    def resolve_duel(self, duel_id: u256) -> None:
        if duel_id not in self.duels:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Duel does not exist")

        duel = self.duels[duel_id]
        if duel.status != "MATCHED":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Duel must be matched to resolve")
        
        # Deadline check removed (gl.block.timestamp not supported yet)

        result = self._judge_claim(duel.claim, duel.evidence_b)

        if result.get("winner") == "CHALLENGER":
            duel.winner = duel.challenger
        else:
            duel.winner = duel.opponent

        duel.reasoning = result.get("reasoning", "")
        duel.status = "RESOLVED"
        self.duels[duel_id] = duel

    @gl.public.write
    def claim_winnings(self, duel_id: u256) -> None:
        if duel_id not in self.duels:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Duel does not exist")

        duel = self.duels[duel_id]
        if duel.status != "RESOLVED":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Duel is not resolved yet")
        if gl.message.sender_address != duel.winner:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Only the winner can claim")

        total_pot = duel.stake * u256(2)

        duel.status = "CLAIMED"
        self.duels[duel_id] = duel

        self._add_balance(duel.winner, total_pot)

    def _add_balance(self, user: Address, amount: u256) -> None:
        self.balances[user] = self.balances.get(user, u256(0)) + amount

    @gl.public.view
    def get_balance(self, player_address: str) -> u256:
        # Convert string to Address safely
        zero = Address("0x0000000000000000000000000000000000000000")
        try:
            addr = Address(player_address) if player_address and player_address != "" else zero
        except Exception:
            addr = zero
            
        if addr in self.balances:
            return self.balances[addr]
        return u256(0)

    @gl.public.view
    def get_duel(self, duel_id: u256) -> Duel:
        zero = Address("0x0000000000000000000000000000000000000000")
        if duel_id not in self.duels:
            return Duel(
                challenger=zero, opponent=zero, claim="",
                stake=u256(0), status="NOT_FOUND", winner=zero,
                evidence_a="", evidence_b="", reasoning="",
                category="", target_opponent=zero, created_block=u256(0),
                deadline=u256(0),
            )
        return self.duels[duel_id]

    @gl.public.view
    def get_next_duel_id(self) -> u256:
        return self.next_duel_id

    @gl.public.view
    def get_owner(self) -> Address:
        return self.owner

