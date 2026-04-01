# v0.1.0
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
from dataclasses import dataclass

@allow_storage
@dataclass
class Duel:
    challenger: Address
    claim: str
    stake: u256
    status: str
    opponent: Address
    winner: Address
    reason: str

class OracleDuel(gl.Contract):
    duel_count: u256
    duels: TreeMap[u256, Duel]

    def __init__(self):
        self.duel_count = u256(0)

    @gl.public.write.payable
    def create_duel(self, claim: str) -> u256:
        duel_id = self.duel_count
        self.duel_count += u256(1)
        
        new_duel = Duel(
            challenger=gl.message.sender_address,
            claim=claim,
            stake=gl.message.value,
            status="OPEN",
            opponent=Address("0x0000000000000000000000000000000000000000"),
            winner=Address("0x0000000000000000000000000000000000000000"),
            reason=""
        )
        self.duels[duel_id] = new_duel
        return duel_id

    @gl.public.write.payable
    def match_duel(self, duel_id: u256) -> None:
        duel = self.duels[duel_id]
        if duel.status != "OPEN":
            raise Exception("Duel not open")
        if gl.message.value != duel.stake:
            raise Exception("Stake mismatch")
            
        duel.opponent = gl.message.sender_address
        duel.status = "MATCHED"
        self.duels[duel_id] = duel

    @gl.public.view
    def get_duel_count(self) -> u256:
        return self.duel_count

    @gl.public.view
    def get_duel(self, duel_id: u256) -> Duel:
        return self.duels[duel_id]
