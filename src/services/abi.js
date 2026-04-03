export const ORACLE_DUEL_ABI = [
  {
    "name": "create_duel",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [
      { "name": "claim_text", "type": "string" }
    ],
    "outputs": [
      { "name": "", "type": "uint256" }
    ]
  },
  {
    "name": "match_duel",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [
      { "name": "duel_id", "type": "uint256" },
      { "name": "evidence_query", "type": "string" }
    ],
    "outputs": []
  },
  {
    "name": "cancel_duel",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "duel_id", "type": "uint256" }
    ],
    "outputs": []
  },
  {
    "name": "resolve_duel",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "duel_id", "type": "uint256" }
    ],
    "outputs": []
  },
  {
    "name": "claim_winnings",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "duel_id", "type": "uint256" }
    ],
    "outputs": []
  },
  {
    "name": "withdraw_fees",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [],
    "outputs": []
  },
  {
    "name": "get_duel",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "duel_id", "type": "uint256" }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          { "name": "challenger", "type": "address" },
          { "name": "opponent", "type": "address" },
          { "name": "claim", "type": "string" },
          { "name": "stake", "type": "uint256" },
          { "name": "status", "type": "string" },
          { "name": "winner", "type": "address" },
          { "name": "evidence_a", "type": "string" },
          { "name": "evidence_b", "type": "string" }
        ]
      }
    ]
  },
  {
    "name": "get_next_duel_id",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256" }
    ]
  },
  {
    "name": "get_fee_balance",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256" }
    ]
  }
];
