import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

const RPC_URL = 'https://rpc-bradbury.genlayer.com';
const CONTRACT_ADDRESS = '0x981C50C390E768be6048d3cDF20473a2468351F7';

const ABI = [
  {
    "name": "get_next_duel_id",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  }
];

async function main() {
  const client = createClient({
    chain: testnetBradbury,
    transport: RPC_URL,
  });

  try {
    console.log('Querying:', CONTRACT_ADDRESS);
    const nextDuelId = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'get_next_duel_id',
    });
    console.log('SUCCESS! Next Duel ID:', nextId);
  } catch (err) {
    console.error('FAILED to read state:', err.message);
    if (err.details) console.error('Details:', err.details);
  }
}

main();
