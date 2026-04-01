export const ORACLE_DUEL_ABI = [
  {
    "name": "create_duel",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [
      { "name": "claim", "type": "string" }
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
      { "name": "duel_id", "type": "uint256" }
    ],
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
          { "name": "claim", "type": "string" },
          { "name": "stake", "type": "uint256" },
          { "name": "status", "type": "string" },
          { "name": "opponent", "type": "address" },
          { "name": "winner", "type": "address" },
          { "name": "reason", "type": "string" }
        ]
      }
    ]
  },
  {
    "name": "get_duel_count",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256" }
    ]
  }
];
