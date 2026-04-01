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
        'evidence_b:': ""
    }
    state['duel_count'] = duel_id + 1
    gl.set_state(state)
    return duel_id

@gl.public
def get_duel_count():
    return gl.get_state().get('duel_count', 0)

@gl.public
def get_duel(duel_id: int):
    return gl.get_state()['duels'].get(str(duel_id))
