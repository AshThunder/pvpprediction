import { createClient } from 'genlayer-js';
import { testnetBradbury as bradbury } from 'genlayer-js/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { readFileSync } from 'fs';

const RPC_URL = 'https://rpc-bradbury.genlayer.com/';
const PRIVATE_KEY = '0xe5d597df85687d25c1497d0ccd109076c230a3154655781039d88df46fd7126c'; // Account B (0x69Dc...)
const account = privateKeyToAccount(PRIVATE_KEY);
const contractCode = readFileSync('./OracleDuel_Final.py', 'utf8');

async function main() {
  console.log('Deploying OracleDuel_Final with Account:', account.address);
  const client = createClient({
    chain: bradbury,
    transport: RPC_URL,
    account: account
  });

  try {
    const deployHash = await client.deployContract({
      code: contractCode,
      args: [],
    });
    console.log('Deploy Hash:', deployHash);

    // Manual polling for receipt instead of viem's waitForTransactionReceipt, to avoid aggressive timeouts
    let receipt = null;
    console.log('Waiting for receipt...');
    for (let i = 0; i < 20; i++) {
      try {
        receipt = await client.getTransactionReceipt({ hash: deployHash });
        if (receipt) break;
      } catch (e) {
        // ignore errors
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (receipt) {
        console.log('Receipt:', receipt);
        console.log('Deployed at:', receipt.contractAddress);
    } else {
        console.log('Receipt not found after 100 seconds.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
