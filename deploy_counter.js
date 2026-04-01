import { readFileSync } from 'fs';
import { createClient } from 'genlayer-js';
import { privateKeyToAccount } from 'viem/accounts';
import { testnetBradbury as bradbury } from 'genlayer-js/chains';

const RPC_URL = 'https://zksync-os-testnet-genlayer.zksync.dev/';
const PRIVATE_KEY = '0x7d8fcfb7d83c869cd0bb3097062b1e798ea1a4c18a500e6bff5de4d56c1163db'; // Funded Account
const account = privateKeyToAccount(PRIVATE_KEY);

async function main() {
  const client = createClient({
    chain: bradbury,
    transport: RPC_URL,
    account
  });

  const code = "print('hello')"; // No runner comment
  console.log('Deploying BROKEN code...');
  
  try {
    const hash = await client.deployContract({
      code,
      args: [],
    });
    console.log('Deploy Hash:', hash);
    const receipt = await client.waitForTransactionReceipt({ hash });
    console.log('Full Receipt:', JSON.stringify(receipt, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
    console.log('Receipt Status:', receipt.status);
    console.log('Contract Address:', receipt.contractAddress);
  } catch (err) {
    console.error('FAILED:', err);
  }
}

main();
