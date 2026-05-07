import { createClient } from 'genlayer-js';
import { testnetBradbury, studionet } from 'genlayer-js/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { createPublicClient, http, parseEventLogs } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import fs from 'fs';
import dotenv from 'dotenv';
import {
  getTransactionReceipt,
  GENLAYER_STATUS_FINALIZED,
} from './scripts/genlayer_rpc_helpers.mjs';
import { writeContractAddressFile } from './scripts/finalize_deploy_core.mjs';

dotenv.config();

const NETWORK_CONFIGS = {
  bradbury: { chain: testnetBradbury, rpc: 'https://rpc-bradbury.genlayer.com' },
  studionet: { chain: studionet, rpc: 'https://studio.genlayer.com/api' },
};

const networkName = process.argv.includes('--network')
  ? process.argv[process.argv.indexOf('--network') + 1]
  : 'bradbury';
const networkConfig = NETWORK_CONFIGS[networkName] || NETWORK_CONFIGS.bradbury;

const RPC_URL = process.argv.includes('--rpc')
  ? process.argv[process.argv.indexOf('--rpc') + 1]
  : networkConfig.rpc;
/** Default true (Bradbury). If deploys get txExecutionResult=2 and no callable contract, try `node deploy_pvp.mjs --no-leader-only`. */
const DEPLOY_LEADER_ONLY = !process.argv.includes('--no-leader-only');

const chain = {
  ...networkConfig.chain,
  rpcUrls: {
    default: { http: [RPC_URL] },
    public: { http: [RPC_URL] },
  },
};

const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

const client = createClient({
  chain,
  transport: RPC_URL,
});

const viemPublic = createPublicClient({
  chain,
  transport: http(RPC_URL),
});

/** Recover GenLayer txId when deployContract() times out waiting for the EVM wrapper receipt. */
async function recoverTxIdFromEvmHash(evmHash) {
  const receipt = await waitForTransactionReceipt(viemPublic, {
    hash: evmHash,
    timeout: 1_200_000,
    pollingInterval: 10_000,
  });
  if (receipt.status === 'reverted') {
    throw new Error('EVM transaction reverted');
  }
  const abi = client.chain.consensusMainContract?.abi;
  if (!abi) {
    throw new Error('consensusMainContract ABI missing on chain config');
  }
  const newTxEvents = parseEventLogs({
    abi,
    eventName: 'NewTransaction',
    logs: receipt.logs,
  });
  if (newTxEvents.length === 0) {
    throw new Error('NewTransaction event not found on EVM receipt');
  }
  return newTxEvents[0].args.txId;
}

function extractEvmHash(err) {
  const text = [err?.shortMessage, err?.message, String(err?.cause ?? '')].filter(Boolean).join(' ');
  const m = text.match(/0x[0-9a-fA-F]{64}/);
  return m ? m[0] : null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll until FINALIZED. Prefer gen_getTransactionReceipt via fetch (stable) because
 * client.getTransaction uses eth_call and often flakes with "fetch failed".
 */
async function waitForFinalizedTx(client, txId, rpcUrl) {
  const deadline = Date.now() + 55 * 60 * 1000;
  while (Date.now() < deadline) {
    try {
      const r = await getTransactionReceipt(rpcUrl, txId);
      if (r && typeof r.status === 'number') {
        if (r.status === GENLAYER_STATUS_FINALIZED) {
          if (r.txExecutionResult === 2) {
            console.warn(
              'Note: txExecutionResult=2 — if read fails below, GenVM may not have deployed bytecode; check explorer / genvm-lint.'
            );
          }
          return {
            statusName: 'FINALIZED',
            resultName: r.result != null ? String(r.result) : '',
            recipient: r.recipient,
            txExecutionResult: r.txExecutionResult,
          };
        }
      }
    } catch (_) {
      /* network blip — fall through to SDK path */
    }
    try {
      const tx = await client.getTransaction({ hash: txId });
      const st = tx.statusName;
      if (st === 'FINALIZED') {
        return {
          statusName: tx.statusName,
          resultName: tx.resultName != null ? String(tx.resultName) : '',
          recipient: tx.recipient,
          txExecutionResult: tx.txExecutionResult,
        };
      }
      if (st === 'CANCELED') {
        throw new Error(`Deploy transaction CANCELED (tx ${txId})`);
      }
    } catch (e) {
      const msg = `${e?.shortMessage || ''} ${e?.message || ''} ${e?.details || ''}`;
      const transient = /fetch failed|unknown rpc|timeout|etimedout|econnreset/i.test(msg);
      if (!transient) {
        throw e;
      }
    }
    await sleep(5000);
  }
  throw new Error(`Timed out waiting for FINALIZED (tx ${txId})`);
}

async function deploy() {
  console.log(`Deploying to ${RPC_URL}...`);
  console.log(`Deployer: ${account.address}`);
  console.log(`leaderOnly (deploy): ${DEPLOY_LEADER_ONLY}`);

  const contractCode = fs.readFileSync('contracts/OracleDuel.py', 'utf8');

  try {
    let txId;
    try {
      txId = await client.deployContract({
        account,
        code: contractCode,
        args: [],
        // Bradbury: leader-only deploy is usually required; if you get txExecutionResult=2 and no contract, try --no-leader-only.
        leaderOnly: DEPLOY_LEADER_ONLY,
      });
    } catch (err) {
      const evmHash = extractEvmHash(err);
      const isTimeout =
        err?.name === 'WaitForTransactionReceiptTimeoutError' ||
        /timed out/i.test(err?.shortMessage || err?.message || '');
      if (!isTimeout || !evmHash) {
        throw err;
      }
      console.warn(`Default EVM receipt wait timed out; continuing with hash ${evmHash}...`);
      txId = await recoverTxIdFromEvmHash(evmHash);
    }

    console.log(`Deploy tx submitted (GenLayer id): ${txId}`);
    console.log(`Waiting for FINALIZED (retries on RPC errors)...`);

    const tx = await waitForFinalizedTx(client, txId, RPC_URL);
    console.log(`Finalized with result: ${tx.resultName} (txExecutionResult=${tx.txExecutionResult ?? 'n/a'})`);

    const contractAddress = tx.recipient;
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Could not read deployed contract address from transaction recipient');
    }

    // Consensus can finalize a tx while deploy execution still fails — then no contract exists at `recipient`.
    if (tx.txExecutionResult === 2) {
      throw new Error(
        `Deploy execution failed (txExecutionResult=2). The tx is FINALIZED but GenVM did not register bytecode at ${contractAddress}.\n` +
          `Inspect: node scripts/inspect_genlayer_tx.mjs ${txId}\n` +
          `Validate on localnet: npx genlayer up  →  npm run deploy:local  →  fix contract until txExecutionResult=0, then npm run deploy (Bradbury).\n` +
          (DEPLOY_LEADER_ONLY
            ? 'You can also try: npm run deploy:no-leader'
            : 'You already used --no-leader-only; retry Bradbury later or check genvm-lint / GenLayer Discord.')
      );
    }

    const maxVerify = 40;
    for (let a = 0; a < maxVerify; a++) {
      try {
        await client.readContract({
          address: contractAddress,
          functionName: 'get_next_duel_id',
        });
        break;
      } catch (e) {
        const msg = `${e?.shortMessage || ''} ${e?.message || ''}`;
        const transient =
          /fetch failed|unknown rpc|timeout|resource not found|not found at address/i.test(msg);
        if (!transient || a === maxVerify - 1) {
          throw new Error(
            `FINALIZED tx ${txId} but contract not callable at ${contractAddress}: ${msg.trim()}\n` +
              `Inspect: node scripts/inspect_genlayer_tx.mjs ${txId}\n` +
              `If this persists, try: node scripts/complete_deploy.mjs ${txId}`
          );
        }
        await sleep(5000);
      }
    }

    console.log(`\nContract deployed at: ${contractAddress}`);

    await writeContractAddressFile(client, contractAddress, './src/services/contract_address.js');
  } catch (err) {
    const details = err?.details || err?.cause?.message || '';
    if (String(details).includes('insufficient gas price to replace')) {
      const h = extractEvmHash(err);
      console.error('Deployment failed: a transaction with the same nonce is already pending.');
      if (h) {
        console.error(`Wait for it to confirm, then run: node recover_deploy.mjs ${h}`);
      }
    } else {
      console.error('Deployment failed:', err);
    }
    process.exitCode = 1;
  }
}

deploy();
