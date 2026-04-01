import { testnetBradbury as bradbury } from 'genlayer-js/chains';
import { createClient as createGenClient } from 'genlayer-js';
import { privateKeyToAccount } from 'viem/accounts';
import { parseEther } from 'viem';
import * as dotenv from 'dotenv';

dotenv.config();

const RPC_URL = 'https://rpc-bradbury.genlayer.com';
const CONTRACT_ADDRESS = '0xD11954eEec44C104acF8B066959Dd0d371bA538f';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const ORACLE_DUEL_ABI = [
  {
    "name": "create_duel",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [{ "name": "claim_text", "type": "string" }],
    "outputs": [{ "name": "", "type": "uint256" }]
  }
];

async function main() {
  const account = privateKeyToAccount(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`);
  const client = createGenClient({
    chain: bradbury,
    transport: RPC_URL,
    account
  });

  const balance = await client.getBalance({ address: account.address });
  console.log('Account Balance:', balance.toString(), 'wei');

  console.log('Sending transaction from:', account.address);
  
  try {
    const hash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ORACLE_DUEL_ABI,
      functionName: 'create_duel',
      args: ["The first Oracle Duel is live on GenLayer!"],
      value: parseEther('1'),
    });

    console.log('Transaction Hash:', hash);
    console.log('Waiting for receipt...');
    
    // In GenLayer, we might need a specific receipt fetching logic if waitForTransactionReceipt is not standard
    // But genlayer-js should handle it.
  } catch (error) {
    console.error('Error sending transaction:', error);
  }
}

main();
