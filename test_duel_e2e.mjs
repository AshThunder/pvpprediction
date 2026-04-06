import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { parseEther } from 'viem';
import dotenv from 'dotenv';

dotenv.config();

const RPC_URL = 'https://rpc-bradbury.genlayer.com';
const CONTRACT = '0x275371844972BF7CcA2c17E40E320b098b881a0C';

// We will use the same wallet for both roles since the SDK's sendTransaction 
// (for raw GEN transfers) currently fails with eth_fillTransaction on the Bradbury node.
// OracleDuel allows the challenger to match their own duel for testing purposes.
const walletA = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

function makeClient(account) {
  return createClient({
    chain: {
      ...testnetBradbury,
      rpcUrls: {
        default: { http: [RPC_URL] },
        public: { http: [RPC_URL] },
      },
    },
    transport: RPC_URL,
    account: account.address,
  });
}

// Manual polling
async function waitForReceipt(client, hash, maxRetries = 60, intervalMs = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const receipt = await client.getTransactionReceipt({ hash });
      if (receipt && (receipt.status === 'ACCEPTED' || receipt.status === 'FINALIZED')) {
        return receipt;
      }
      process.stdout.write('.');
    } catch (e) {
      process.stdout.write('.');
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  console.log();
  throw new Error(`Transaction ${hash} did not finalize after ${maxRetries * intervalMs / 1000}s`);
}

async function main() {
  const clientA = makeClient(walletA);

  console.log('═══════════════════════════════════════════════════');
  console.log('   PVP PREDICTION ARENA — TERMINAL E2E TEST (1 GEN)');
  console.log('═══════════════════════════════════════════════════');
  console.log(`👤  Test Wallet: ${walletA.address}`);
  console.log(`📜 Contract:     ${CONTRACT}`);
  console.log('═══════════════════════════════════════════════════\n');

  const STAKE = parseEther('1');
  const CLAIM = '2 times 2 is 4';

  // ── Step 1: Create Duel ──
  console.log(`⚔️  STEP 1: Wallet creates duel — "${CLAIM}" with 1 GEN stake...`);
  let createHash;
  try {
    createHash = await clientA.writeContract({
      account: walletA,
      address: CONTRACT,
      functionName: 'create_duel',
      args: [CLAIM],
      value: STAKE,
      leaderOnly: true,
    });
    console.log(`   ✅ TX submitted: ${createHash}`);
    process.stdout.write('   ⏳ Polling ');
    const receipt = await waitForReceipt(clientA, createHash);
    console.log(`\n   🎉 Duel created! Status: ${receipt.status}\n`);
  } catch (err) {
    console.error('\n   ❌ Create failed:', err.message);
    return;
  }

  // ── Step 2: Read duel state ──
  console.log('📖 STEP 2: Reading contract state to find Duel ID...');
  let duelId;
  try {
    const nextId = await clientA.readContract({
      address: CONTRACT, functionName: 'get_next_duel_id', args: []
    });
    duelId = Number(nextId) - 1;
    const duel = await clientA.readContract({
      address: CONTRACT, functionName: 'get_duel', args: [BigInt(duelId)],
    });
    console.log(`   Duel #${duelId}: "${duel.claim}" | Status: ${duel.status} | Stake: ${duel.stake}\n`);
  } catch (err) {
    console.error('   ❌ Read failed:', err.message, '\n');
    return;
  }

  // ── Step 3: Match Duel ──
  console.log('🎯 STEP 3: Matching duel with 1 GEN counter-stake...');
  try {
    const matchHash = await clientA.writeContract({
      account: walletA,
      address: CONTRACT,
      functionName: 'match_duel',
      args: [BigInt(duelId), 'I disagree, 2 times 2 is actually 5'],
      value: STAKE, // 1 GEN
      leaderOnly: true,
    });
    console.log(`   ✅ TX submitted: ${matchHash}`);
    process.stdout.write('   ⏳ Polling ');
    const receipt = await waitForReceipt(clientA, matchHash);
    console.log(`\n   🎉 Matched! Status: ${receipt.status}\n`);
  } catch (err) {
    console.error('\n   ❌ Match failed:', err.message, '\n');
    return;
  }

  // ── Step 4: Final state ──
  console.log('📖 STEP 4: Final duel state...');
  try {
    const duel = await clientA.readContract({
      address: CONTRACT, functionName: 'get_duel', args: [BigInt(duelId)],
    });
    console.log(`   Duel #${duelId}:`);
    console.log(`     Claim:      "${duel.claim}"`);
    console.log(`     Status:     ${duel.status}`);
    console.log(`     Challenger: ${duel.challenger}`);
    console.log(`     Opponent:   ${duel.opponent}`);
    console.log(`     Winner:     ${duel.winner}\n`);
  } catch (err) {
    console.error('   ❌ Final read failed:', err.message);
  }

  // ── Step 5: Resolve Duel ──
  console.log('🤖 STEP 5: Resolving duel using AI Oracle...');
  try {
    const resolveHash = await clientA.writeContract({
      account: walletA,
      address: CONTRACT,
      functionName: 'resolve_duel',
      args: [BigInt(duelId)],
      leaderOnly: true,
    });
    console.log(`   ✅ TX submitted: ${resolveHash}`);
    process.stdout.write('   ⏳ Polling ');
    const receipt = await waitForReceipt(clientA, resolveHash);
    console.log(`\n   🎉 Resolved! Status: ${receipt.status}\n`);
    
    // Read final state
    const duel = await clientA.readContract({
      address: CONTRACT, functionName: 'get_duel', args: [BigInt(duelId)],
    });
    console.log(`     Final Winner:     ${duel.winner}\n`);
  } catch (err) {
    console.error('\n   ❌ Resolve failed:', err.message);
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('   TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════');
}
main().catch(console.error);
