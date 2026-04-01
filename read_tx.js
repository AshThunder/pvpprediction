import { testnetBradbury as bradbury } from 'genlayer-js/chains';
import { createClient } from 'genlayer-js';

const RPC_URL = 'https://rpc-bradbury.genlayer.com';
const CONTRACT_ADDRESS = '0xD11954eEec44C104acF8B066959Dd0d371bA538f';

const ORACLE_DUEL_ABI = [
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
    "name": "get_duel",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{ "name": "duel_id", "type": "uint256" }],
    "outputs": [
      {
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
  }
];

async function main() {
  const client = createClient({
    chain: bradbury,
    transport: RPC_URL,
  });

  try {
    const nextDuelId = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ORACLE_DUEL_ABI,
      functionName: 'get_next_duel_id',
    });
    console.log('Next Duel ID:', nextDuelId);

    const count = Number(nextDuelId);
    for (let i = 1; i < count; i++) {
        const duel = await client.readContract({
            address: CONTRACT_ADDRESS,
            abi: ORACLE_DUEL_ABI,
            functionName: 'get_duel',
            args: [BigInt(i)]
        });
        console.log(`Duel ${i}:`, duel);
    }
  } catch (err) {
    console.error('Error reading contract:', err);
  }
}

main();
