# v0.1.0
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
import genlayer as gl

def __init__():
    gl.set_state({
        'duel_count': 0,
        'duels': {},
        'owner': gl.get_sender()
    })

@gl.public
def create_duel(claim: str):
    sender = gl.get_sender()
    value = gl.get_value()
    
    if value < 10**18:
        raise Exception("Minimum stake is 1 GEN")
        
    state = gl.get_state()
    duel_id = state['duel_count']
    
    state['duels'][str(duel_id)] = {
        'challenger': sender,
        'opponent': "0x0000000000000000000000000000000000000000",
        'claim': claim,
        'stake': value,
        'status': "OPEN",
        'winner': "0x0000000000000000000000000000000000000000",
        'evidence_a': "",
        'evidence_b': "",
        'reason': ""
    }
    state['duel_count'] = duel_id + 1
    gl.set_state(state)
    return duel_id

@gl.public
def match_duel(duel_id: int):
    sender = gl.get_sender()
    value = gl.get_value()
    
    state = gl.get_state()
    duel = state['duels'].get(str(duel_id))
    
    if not duel:
        raise Exception("Duel not found")
    if duel['status'] != "OPEN":
        raise Exception("Duel already matched or resolved")
    if value != duel['stake']:
        raise Exception("Stake must match exactly")
        
    duel['opponent'] = sender
    duel['status'] = "MATCHED"
    state['duels'][str(duel_id)] = duel
    gl.set_state(state)

@gl.public
def resolve_duel(duel_id: int):
    state = gl.get_state()
    duel = state['duels'].get(str(duel_id))
    
    if not duel:
        raise Exception("Duel not found")
    if duel['status'] != "MATCHED":
        raise Exception("Duel must be matched to resolve")
        
    # AI Oracle Logic
    def get_llm_result() -> str:
        prompt = (
            "You are an impartial, deterministic judge for an Oracle Duel.\n"
            f"CLAIM: '{duel['claim']}'\n"
            "TASK:\n"
            "1. Search the web to verify the objective truth of the CLAIM.\n"
            "2. Determine if the CLAIM is objectively TRUE or FALSE.\n"
            "3. If TRUE, winner is CHALLENGER. If FALSE, winner is OPPONENT.\n"
            "OUTPUT FORMAT: Return ONLY a JSON object: {\"winner\": \"CHALLENGER\" or \"OPPONENT\", \"reasoning\": \"1 sentence\"}"
        )
        result = gl.exec_prompt(prompt)
        # Clean potential markdown
        clean = result.replace("```json", "").replace("```", "").strip()
        return clean

    # Consensus on AI output
    result_str = gl.eq_principle_strict_eq(get_llm_result)
    result = json.loads(result_str)
    
    if result.get('winner') == 'CHALLENGER':
        duel['winner'] = duel['challenger']
    else:
        duel['winner'] = duel['opponent']
        
    duel['status'] = "RESOLVED"
    duel['reason'] = result.get('reasoning', "No reason provided.")
    state['duels'][str(duel_id)] = duel
    gl.set_state(state)

@gl.public
def claim_winnings(duel_id: int):
    sender = gl.get_sender()
    state = gl.get_state()
    duel = state['duels'].get(str(duel_id))
    
    if not duel:
        raise Exception("Duel not found")
    if duel['status'] != "RESOLVED":
        raise Exception("Duel not resolved")
    if sender != duel['winner']:
        raise Exception("Only winner can claim")
        
    total = duel['stake'] * 2
    fee = (total * 2) // 100 # 2% house fee
    winnings = total - fee
    
    duel['status'] = "CLAIMED"
    state['duels'][str(duel_id)] = duel
    gl.set_state(state)
    
    gl.send(duel['winner'], winnings)
    gl.send(state['owner'], fee)

@gl.public
def get_duel_count():
    return gl.get_state().get('duel_count', 0)

@gl.public
def get_duel(duel_id: int):
    return gl.get_state()['duels'].get(str(duel_id))
