import { createClient } from 'genlayer-js';
import { parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { testnetBradbury as bradbury } from 'genlayer-js/chains';

const RPC_URL = 'https://rpc-bradbury.genlayer.com/';
const PRIVATE_KEY_A = '0x7d8fcfb7d83c869cd0bb3097062b1e798ea1a4c18a500e6bff5de4d56c1163db'; // Funded Account
const accountA = privateKeyToAccount(PRIVATE_KEY_A);
const PRIVATE_KEY_B = '0xe5d597df85687d25c1497d0ccd109076c230a3154655781039d88df46fd7126c'; // Player B
const accountB = privateKeyToAccount(PRIVATE_KEY_B);

import { readFileSync } from 'fs';
const contractCode = readFileSync('./OracleDuel.py', 'utf8');

const ORACLE_DUEL_ABI = [
    {
      "name": "create_duel",
      "type": "function",
      "stateMutability": "payable",
      "inputs": [{ "name": "claim", "type": "string" }],
      "outputs": []
    },
    {
      "name": "match_duel",
      "type": "function",
      "stateMutability": "payable",
      "inputs": [{ "name": "duel_id", "type": "uint256" }, { "name": "evidence", "type": "string" }],
      "outputs": []
    },
    {
      "name": "get_next_duel_id",
      "type": "function",
      "stateMutability": "view",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256" }]
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
  console.log('--- Oracle Duel E2E Test ---');
  console.log('Using Account A:', accountA.address);
  
  const clientA = createClient({
    chain: bradbury,
    transport: RPC_URL,
    account: accountB
  });

  // Deploy
  console.log('Deploying Contract...');
  const deployHash = await clientA.deployContract({
    code: contractCode,
    args: [],
    gasPrice: 1000000000n, // 1 Gwei
  });
  console.log('Deploy Hash:', deployHash);
  const receipt = await clientA.waitForTransactionReceipt({ hash: deployHash, status: 'ACCEPTED' });
  const address = receipt.contractAddress;
  console.log('Deployed at:', address);

  // Read Next Duel ID (Initial)
  const nextId1 = await clientA.readContract({
    address,
    abi: ORACLE_DUEL_ABI,
    functionName: 'get_next_duel_id'
  });
  console.log('Initial Next Duel ID:', nextId1);

  // Create Duel
  console.log('Creating Duel...');
  const createHash = await clientA.writeContract({
    address,
    abi: ORACLE_DUEL_ABI,
    functionName: 'create_duel',
    args: ['Test Claim'],
    value: parseEther('0.1')
  });
  await clientA.waitForTransactionReceipt({ hash: createHash, status: 'ACCEPTED' });
  console.log('Duel Created!');

  // Read Duel 1
  console.log('Reading Duel 1...');
  const duel = await clientA.readContract({
    address,
    abi: ORACLE_DUEL_ABI,
    functionName: 'get_duel',
    args: [1n]
  });
  console.log('Duel 1:', duel);

  console.log('\n--- TEST SUCCESSFUL ---');
  console.log('USE THIS ADDRESS IN App.jsx:', address);
}

main().catch(console.error);
