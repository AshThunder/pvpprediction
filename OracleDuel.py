# v0.1.0
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
import json
from dataclasses import dataclass
import genlayer as gl
from genlayer import *

@allow_storage
@dataclass
class Duel:
    challenger: Address
    opponent: Address
    claim: str
    stake: u256
    status: str
    winner: Address
    evidence_a: str
    evidence_b: str


class OracleDuel(gl.Contract):
    duels: TreeMap[u256, Duel]
    next_duel_id: u256
    house_fee_percent: u256
    owner: Address

    def __init__(self):
        self.next_duel_id = u256(1)
        self.house_fee_percent = u256(2)
        self.owner = gl.message.sender_address

    @gl.public.write.payable
    def create_duel(self, claim_text: str) -> u256:
        stake = gl.message.value
        if stake <= 0:
            raise Exception("Stake must be greater than 0")
        
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
            raise Exception("Duel does not exist")
            
        duel = self.duels[duel_id]
        if duel.status != "OPEN":
            raise Exception("Duel is not open for matching")
        if gl.message.value != duel.stake:
            raise Exception("Must match the exact stake amount")
        
        duel.opponent = gl.message.sender_address
        duel.evidence_b = evidence_query
        duel.status = "MATCHED"
        self.duels[duel_id] = duel

    def _judge_claim(self, claim: str, evidence: str) -> dict:
        def get_llm_result() -> str:
            prompt = (
                "You are an impartial, deterministic judge for an Oracle Duel.\n"
                f"CLAIM (Challenger proposes): '{claim}'\n"
                f"COUNTER-EVIDENCE (Opponent provides): '{evidence}'\n\n"
                "TASK:\n"
                "1. Search the web to verify the objective truth of the CLAIM, taking into account the COUNTER-EVIDENCE.\n"
                "2. Determine if the CLAIM is objectively TRUE or FALSE.\n"
                "3. If TRUE, the winner is 'CHALLENGER'. If FALSE or unprovable, the winner is 'OPPONENT'.\n\n"
                "OUTPUT FORMAT:\n"
                "You MUST return ONLY a valid JSON object with exactly two keys. Do not include markdown code blocks or any other text.\n"
                "{\n"
                '  "winner": "CHALLENGER" or "OPPONENT",\n'
                '  "reasoning": "1 short sentence explanation."\n'
                "}"
            )
            result = gl.nondet.exec_prompt(prompt)
            clean_result = result.replace("```json", "").replace("```", "").strip()
            try:
                parsed = json.loads(clean_result)
                return json.dumps({"winner": parsed.get("winner", "OPPONENT"), "reasoning": parsed.get("reasoning", "")}, sort_keys=True, separators=(',', ':'))
            except Exception:
                return json.dumps({"reasoning": "Failed to parse oracle output.", "winner": "OPPONENT"}, sort_keys=True, separators=(',', ':'))

        result_json = json.loads(gl.nondet.eq_principle_strict_eq(get_llm_result))
        return result_json

    @gl.public.write
    def resolve_duel(self, duel_id: u256) -> None:
        if duel_id not in self.duels:
            raise Exception("Duel does not exist")
            
        duel = self.duels[duel_id]
        if duel.status != "MATCHED":
            raise Exception("Duel must be matched to resolve")

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
            raise Exception("Duel does not exist")
            
        duel = self.duels[duel_id]
        if duel.status != "RESOLVED":
            raise Exception("Duel is not resolved yet")
        if gl.message.sender_address != duel.winner:
            raise Exception("Only the winner can claim")
        
        total_pot = duel.stake * u256(2)
        fee = (total_pot * self.house_fee_percent) // u256(100)
        winnings = total_pot - fee
        
        duel.status = "CLAIMED"
        self.duels[duel_id] = duel
        
        duel.winner.transfer(winnings)
        self.owner.transfer(fee)

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
