import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { testnetBradbury } from 'genlayer-js/chains';

const PRIVATE_KEY = '0x7d8fcfb7d83c869cd0bb3097062b1e798ea1a4c18a500e6bff5de4d56c1163db'; // 0x25b7a7...
const account = privateKeyToAccount(PRIVATE_KEY);
const TO_ADDRESS = '0x0D4eb9E4b25e83E001aDA22E3D4415CB813f9D7B'; // Contract

const client = createWalletClient({
  account,
  chain: testnetBradbury,
  transport: http('https://rpc-bradbury.genlayer.com/')
});

async function main() {
  console.log(`Sending 5 GEN from ${account.address} to ${TO_ADDRESS}...`);
  try {
    const hash = await client.sendTransaction({
      to: TO_ADDRESS,
      value: parseEther('5'),
      gas: 1000000n,
      gasPrice: 1000000000n,
    });
    console.log('Transaction Hash:', hash);
  } catch (error) {
    console.error('Error sending transaction:', error);
  }
}

main().catch(console.error);
