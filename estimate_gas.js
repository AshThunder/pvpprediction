import { readFileSync } from 'fs';
import { createClient } from 'genlayer-js';
import { privateKeyToAccount } from 'viem/accounts';
import { testnetBradbury as bradbury } from 'genlayer-js/chains';

const RPC_URL = 'https://zksync-os-testnet-genlayer.zksync.dev/';
const PRIVATE_KEY = '0x7d8fcfb7d83c869cd0bb3097062b1e798ea1a4c18a500e6bff5de4d56c1163db'; 
const account = privateKeyToAccount(PRIVATE_KEY);

async function main() {
  const client = createClient({
    chain: bradbury,
    transport: RPC_URL,
    account
  });

  const code = readFileSync('./Counter.py', 'utf8');
  console.log('Estimating Gas for Counter.py deployment...');
  
  try {
    // We have to simulate the encoding to call estimateGas
    // For deployment, genlayer-js uses eth_estimateGas with data = encoded code
    const gas = await client.estimateContractGas({
        code,
        args: [],
    });
    console.log('Estimated Gas:', gas.toString());
  } catch (err) {
    console.error('GAS ESTIMATION FAILED:', err);
    // If it fails, let's try to get more info from the provider
  }
}

main();
