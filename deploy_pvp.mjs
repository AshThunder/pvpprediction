import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';
import { privateKeyToAccount } from 'viem/accounts';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const RPC_URL = process.argv.includes('--rpc') 
  ? process.argv[process.argv.indexOf('--rpc') + 1] 
  : 'https://zksync-os-testnet-genlayer.zksync.dev';

const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

const client = createClient({
  chain: {
    ...testnetBradbury,
    rpcUrls: {
      default: { http: [RPC_URL] },
      public: { http: [RPC_URL] },
    },
  },
  transport: RPC_URL,
});

async function deploy() {
  console.log(`🚀 Deploying to ${RPC_URL}...`);
  console.log(`👤 Deployer: ${account.address}`);

  const contractCode = fs.readFileSync('./contracts/OracleDuel.py', 'utf8');

  try {
    const hash = await client.deployContract({
      account,
      code: contractCode,
      args: [],
      leaderOnly: true,
      gas: 5_000_000n,
      gasPrice: 1_000_000_000n,
    });

    console.log(`✅ Deployment initiated! Hash: ${hash}`);
    console.log(`⏳ Waiting for confirmation...`);

    const receipt = await client.waitForTransactionReceipt({ hash });
    console.log(`✨ Contract deployed at: ${receipt.contractAddress}`);
    
    // Save to a file for the frontend
    const config = `export const CONTRACT_ADDRESS = '${receipt.contractAddress}';\n`;
    fs.writeFileSync('./src/services/contract_address.js', config);
    console.log(`📝 Saved address to src/services/contract_address.js`);

  } catch (err) {
    console.error('❌ Deployment failed:', err);
  }
}

deploy();
