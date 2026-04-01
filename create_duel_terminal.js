
const { createClient } = require('genlayer-js');
const { testnetBradbury } = require('genlayer-js/chains');
const { privateKeyToAccount } = require('viem/accounts');
require('dotenv').config();

const client = createClient({
  chain: testnetBradbury,
  transport: 'http://127.0.0.1:5173/rpc'
});

const CONTRACT_ADDRESS = '0x0D4eb9E4b25e83E001aDA22E3D4415CB813f9D7B';
// Using the funded account B
const PRIVATE_KEY = '0xe5d597df85687d25c1497d0ccd109076c230a3154655781039d88df46fd7126c';

const abi = [{
    "name": "create_duel",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [{ "name": "claim", "type": "string" }],
    "outputs": [{ "name": "", "type": "uint256" }]
}];

async function run() {
  console.log('Creating second duel from terminal...');
  const account = privateKeyToAccount(PRIVATE_KEY);
  
  try {
    const hash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      account: account,
      abi: abi,
      functionName: 'create_duel',
      args: ['Will Bitcoin reach 100k by tomorrow?'],
      value: 5000000000000000000n, // 5 GEN
      gas: 1000000n,
      gasPrice: 1000000000n
    });
    console.log('Transaction hash:', hash);
    console.log('Check explorer/frontend now.');
  } catch (err) {
    console.error('Error in writeContract:', err);
  }
}

run().catch(console.error);
