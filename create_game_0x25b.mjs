import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { createWalletClient, http, parseEther, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { testnetBradbury } from 'genlayer-js/chains';

const PRIVATE_KEY = '0x7d8fcfb7d83c869cd0bb3097062b1e798ea1a4c18a500e6bff5de4d56c1163db'; 
const account = privateKeyToAccount(PRIVATE_KEY);
const CONTRACT_ADDRESS = '0x0D4eb9E4b25e83E001aDA22E3D4415CB813f9D7B';

const client = createWalletClient({
  account,
  chain: testnetBradbury,
  transport: http('https://rpc-bradbury.genlayer.com/')
});

const abi = [{
    "name": "create_duel",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [{ "name": "claim", "type": "string" }],
    "outputs": [{ "name": "", "type": "uint256" }]
}];

async function main() {
  console.log(`Creating Duel from ${account.address}...`);
  try {
    const calldata = encodeFunctionData({
      abi: abi,
      functionName: 'create_duel',
      args: ['Will we see AGI by 2027?']
    });

    const hash = await client.sendTransaction({
      to: CONTRACT_ADDRESS,
      data: calldata,
      value: parseEther('5'),
      gas: 1000000n,
      gasPrice: 1000000000n
    });
    console.log('Duel Created!');
    console.log('Transaction Hash:', hash);
  } catch (error) {
    console.error('Error sending transaction:', error);
  }
}

main().catch(console.error);
