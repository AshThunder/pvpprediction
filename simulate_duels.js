/**
 * PvP Prediction Arena — Full E2E Simulation
 * Runs the complete duel lifecycle on both StudioNet and Bradbury:
 *   1. Fund Wallet B from Wallet A
 *   2. Wallet A creates a duel with a prediction claim
 *   3. Wallet B matches (opposes) the duel
 *   4. Anyone triggers resolve (AI judge decides)
 *   5. Winner claims winnings
 *   6. Verify final balances
 */
import { createClient } from "genlayer-js";
import { studionet, testnetBradbury } from "genlayer-js/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, createPublicClient, http, parseEther, formatEther } from "viem";

// ── Wallets ──
const WALLET_A_PK = "0x7d8fcfb7d83c869cd0bb3097062b1e798ea1a4c18a500e6bff5de4d56c1163db";
const WALLET_B_PK = "0xabababababababababababababababababababababababababababababababab";
const accountA = privateKeyToAccount(WALLET_A_PK);
const accountB = privateKeyToAccount(WALLET_B_PK);

// ── Contracts ──
const CONTRACTS = {
  studionet: "0xaa9a0916a0795ae7105c5577c458591811104424",
  bradbury:  "0xD6243C1b01826e6E3f05e03C00624f960F594868",
};

// ── Network configs ──
const NETWORKS = {
  studionet: { chain: studionet, rpc: "https://studio.genlayer.com/api" },
  bradbury:  { chain: testnetBradbury, rpc: "https://rpc-bradbury.genlayer.com" },
};

// ── Duels to simulate (3 per network = 6 total) ──
// StudioNet duels (indices 0-2)
const STUDIONET_DUELS = [
  {
    claim: "Ethereum processes more transactions per day than Visa",
    counter: "Visa handles about 150 million transactions per day while Ethereum handles around 1-1.5 million",
    category: "crypto",
  },
  {
    claim: "The Great Wall of China is visible from space with the naked eye",
    counter: "NASA has confirmed the Great Wall is not visible from low Earth orbit without aid",
    category: "science",
  },
  {
    claim: "Lionel Messi has won more Ballon d'Or awards than any other player in history",
    counter: "Messi has won 8 Ballon d'Or awards which is the record but Cristiano Ronaldo is close with 5",
    category: "sports",
  },
];

// Bradbury duels (indices 0-2)
const BRADBURY_DUELS = [
  {
    claim: "Linux was originally created by Linus Torvalds as a university project in 1991",
    counter: "Linux was a personal hobby project, not a university assignment, though Torvalds was a student at the time",
    category: "other",
  },
  {
    claim: "Water boils at 100 degrees Celsius at any altitude",
    counter: "Water boils at lower temperatures at higher altitudes due to decreased atmospheric pressure - at Everest summit it boils around 70C",
    category: "science",
  },
  {
    claim: "The United States has had exactly 46 presidents as of 2025",
    counter: "While Joe Biden is the 46th president, Grover Cleveland served two non-consecutive terms and is counted as both the 22nd and 24th president",
    category: "politics",
  },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function makeGenClient(networkName) {
  const { chain, rpc } = NETWORKS[networkName];
  return createClient({
    chain: { ...chain, rpcUrls: { default: { http: [rpc] }, public: { http: [rpc] } } },
    transport: rpc,
  });
}

function makeViemClient(networkName, account) {
  const { chain, rpc } = NETWORKS[networkName];
  const viemChain = {
    id: chain.id,
    name: chain.name || networkName,
    nativeCurrency: chain.nativeCurrency || { name: "GEN", symbol: "GEN", decimals: 18 },
    rpcUrls: { default: { http: [rpc] }, public: { http: [rpc] } },
  };
  return createWalletClient({ account, chain: viemChain, transport: http(rpc) });
}

function makePublicViemClient(networkName) {
  const { chain, rpc } = NETWORKS[networkName];
  const viemChain = {
    id: chain.id,
    name: chain.name || networkName,
    nativeCurrency: chain.nativeCurrency || { name: "GEN", symbol: "GEN", decimals: 18 },
    rpcUrls: { default: { http: [rpc] }, public: { http: [rpc] } },
  };
  return createPublicClient({ chain: viemChain, transport: http(rpc) });
}

async function getBalance(networkName, address) {
  const pub = makePublicViemClient(networkName);
  try {
    const bal = await pub.getBalance({ address });
    return bal;
  } catch { return 0n; }
}

async function waitForTx(client, txId, label, maxRetries = 100) {
  console.log(`    ⏳ Waiting for ${label} (${txId.slice(0, 14)}...)...`);
  for (let i = 0; i < maxRetries; i++) {
    try {
      const tx = await client.getTransaction({ hash: txId });
      if (tx.statusName === "FINALIZED" || tx.statusName === "ACCEPTED") {
        console.log(`    ✅ ${label}: ${tx.statusName}`);
        return tx;
      }
      if (tx.statusName === "CANCELED") {
        console.log(`    ❌ ${label}: CANCELED`);
        return tx;
      }
    } catch (e) {
      // transient RPC error, keep polling
    }
    await sleep(8000);
  }
  console.log(`    ⚠️  ${label}: timed out after ${maxRetries} retries, continuing...`);
  return null;
}

async function fundWalletB(networkName) {
  const balB = await getBalance(networkName, accountB.address);
  const needed = networkName === "studionet" ? parseEther("5") : parseEther("0.1");
  if (balB >= needed) {
    console.log(`  Wallet B already funded on ${networkName}: ${formatEther(balB)} GEN`);
    return;
  }

  console.log(`  Funding Wallet B on ${networkName}...`);
  const walletA = makeViemClient(networkName, accountA);

  // For StudioNet, use gen_send. For Bradbury, use standard eth_sendTransaction
  const amount = networkName === "studionet" ? parseEther("10") : parseEther("0.3");
  try {
    const hash = await walletA.sendTransaction({
      to: accountB.address,
      value: amount,
    });
    console.log(`    Transfer tx: ${hash}`);
    // Wait for confirmation
    const pub = makePublicViemClient(networkName);
    for (let i = 0; i < 30; i++) {
      await sleep(3000);
      try {
        const receipt = await pub.getTransactionReceipt({ hash });
        if (receipt.status === "success") {
          const newBal = await getBalance(networkName, accountB.address);
          console.log(`    ✅ Wallet B funded: ${formatEther(newBal)} GEN`);
          return;
        }
      } catch {}
    }
    // Even if we can't confirm, check balance
    const newBal = await getBalance(networkName, accountB.address);
    console.log(`    Wallet B balance after funding attempt: ${formatEther(newBal)} GEN`);
  } catch (e) {
    console.log(`    ⚠️  Standard transfer failed (${e.message?.slice(0, 80)}), trying GenLayer account send...`);
    // Fallback: use the genlayer CLI
    const { execSync } = await import("child_process");
    try {
      execSync(`echo "deploy123" | genlayer account send ${accountB.address} 10gen`, { timeout: 60000 });
      console.log(`    ✅ Funded via CLI`);
    } catch (e2) {
      console.log(`    ❌ CLI send also failed: ${e2.message?.slice(0, 80)}`);
    }
  }
}

async function runDuelSimulation(networkName, duel, duelIndex) {
  const client = makeGenClient(networkName);
  const contractAddress = CONTRACTS[networkName];

  console.log(`\n  ── Duel ${duelIndex + 1}: "${duel.claim.slice(0, 50)}..." ──`);

  // Step 1: Wallet A creates the duel
  console.log("  [1/5] Creating duel (Wallet A)...");
  let createTxId;
  try {
    createTxId = await client.writeContract({
      account: accountA,
      address: contractAddress,
      functionName: "create_duel",
      args: [duel.claim, "", 1],
      value: networkName === "studionet" ? parseEther("1") : parseEther("0.05"),
      gas: 5000000n,
      leaderOnly: networkName === "bradbury",
    });
    console.log(`    TX: ${createTxId}`);
  } catch (e) {
    console.error(`    ❌ Create failed: ${e.message?.slice(0, 100)}`);
    return;
  }

  const createResult = await waitForTx(client, createTxId, "create_duel");
  if (!createResult || createResult.statusName === "CANCELED") return;

  // Read the duel to confirm
  await sleep(3000);
  let nextId;
  try {
    nextId = await client.readContract({ address: contractAddress, functionName: "get_next_duel_id", args: [] });
    const duelId = Number(nextId) - 1;
    const duelData = await client.readContract({ address: contractAddress, functionName: "get_duel", args: [duelId] });
    console.log(`    Duel #${duelId} created: status=${duelData.status}, stake=${formatEther(duelData.stake)} GEN`);
  } catch (e) {
    console.log(`    (could not read duel state: ${e.message?.slice(0, 60)})`);
  }

  const duelId = Number(nextId || 1) - 1;

  // Step 2: Wallet B matches the duel
  console.log("  [2/5] Matching duel (Wallet B)...");
  let matchTxId;
  try {
    matchTxId = await client.writeContract({
      account: accountB,
      address: contractAddress,
      functionName: "match_duel",
      args: [duelId, duel.counter],
      value: networkName === "studionet" ? parseEther("1") : parseEther("0.05"),
      gas: 5000000n,
      leaderOnly: networkName === "bradbury",
    });
    console.log(`    TX: ${matchTxId}`);
  } catch (e) {
    console.error(`    ❌ Match failed: ${e.message?.slice(0, 100)}`);
    return;
  }

  const matchResult = await waitForTx(client, matchTxId, "match_duel");
  if (!matchResult || matchResult.statusName === "CANCELED") return;

  // Read duel state
  await sleep(3000);
  try {
    const duelData = await client.readContract({ address: contractAddress, functionName: "get_duel", args: [duelId] });
    console.log(`    Duel #${duelId}: status=${duelData.status}, opponent=${duelData.opponent?.slice(0, 12)}...`);
  } catch {}

  // Step 3: Resolve (triggers AI judge)
  console.log("  [3/5] Resolving duel (AI Judge)...");
  let resolveTxId;
  try {
    resolveTxId = await client.writeContract({
      account: accountA,
      address: contractAddress,
      functionName: "resolve_duel",
      args: [duelId],
      gas: 5000000n,
      leaderOnly: networkName === "bradbury",
    });
    console.log(`    TX: ${resolveTxId}`);
  } catch (e) {
    console.error(`    ❌ Resolve failed: ${e.message?.slice(0, 100)}`);
    return;
  }

  const resolveResult = await waitForTx(client, resolveTxId, "resolve_duel", 150);
  if (!resolveResult || resolveResult.statusName === "CANCELED") return;

  // Read result
  await sleep(3000);
  let winner = null;
  try {
    const duelData = await client.readContract({ address: contractAddress, functionName: "get_duel", args: [duelId] });
    console.log(`    Duel #${duelId}: status=${duelData.status}, winner=${duelData.winner}`);
    console.log(`    Reasoning: "${(duelData.reasoning || '').slice(0, 1000)}"`);
    winner = duelData.winner;
  } catch (e) {
    console.log(`    (could not read resolution: ${e.message?.slice(0, 60)})`);
  }

  // Step 4: Winner claims
  if (!winner || winner === "0x0000000000000000000000000000000000000000") {
    console.log("  [4/5] Skipping claim — no winner determined yet");
    return;
  }

  const winnerAccount = winner.toLowerCase() === accountA.address.toLowerCase() ? accountA : accountB;
  const winnerLabel = winnerAccount === accountA ? "Wallet A" : "Wallet B";
  console.log(`  [4/5] Claiming winnings (${winnerLabel})...`);

  let claimTxId;
  try {
    claimTxId = await client.writeContract({
      account: winnerAccount,
      address: contractAddress,
      functionName: "claim_winnings",
      args: [duelId],
      gas: 5000000n,
      leaderOnly: networkName === "bradbury",
    });
    console.log(`    TX: ${claimTxId}`);
  } catch (e) {
    console.error(`    ❌ Claim failed: ${e.message?.slice(0, 100)}`);
    return;
  }

  const claimResult = await waitForTx(client, claimTxId, "claim_winnings");
  if (!claimResult || claimResult.statusName === "CANCELED") return;

  // Step 5: Verify final state
  console.log("  [5/5] Verifying final state...");
  await sleep(3000);
  try {
    const duelData = await client.readContract({ address: contractAddress, functionName: "get_duel", args: [duelId] });
    const balA = await client.readContract({ address: contractAddress, functionName: "get_balance", args: [accountA.address] });
    const balB = await client.readContract({ address: contractAddress, functionName: "get_balance", args: [accountB.address] });
    console.log(`    Final: status=${duelData.status}, winner=${winnerLabel}`);
    console.log(`    Virtual balances — A: ${formatEther(balA)} GEN, B: ${formatEther(balB)} GEN`);
    console.log(`    🏆 Duel #${duelId} COMPLETE!`);
  } catch (e) {
    console.log(`    (could not read final state: ${e.message?.slice(0, 60)})`);
  }
}

async function simulateNetwork(networkName) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  🌐 ${networkName.toUpperCase()} SIMULATION`);
  console.log(`${"═".repeat(60)}`);
  console.log(`  Contract: ${CONTRACTS[networkName]}`);
  console.log(`  Wallet A: ${accountA.address}`);
  console.log(`  Wallet B: ${accountB.address}`);

  // Check balances
  const balA = await getBalance(networkName, accountA.address);
  const balB = await getBalance(networkName, accountB.address);
  console.log(`  Balance A: ${formatEther(balA)} GEN`);
  console.log(`  Balance B: ${formatEther(balB)} GEN`);

  // Fund wallet B if needed
  await fundWalletB(networkName);

  // Run 3 duels per network
  const duels = networkName === "studionet" ? STUDIONET_DUELS : BRADBURY_DUELS;
  for (let i = 0; i < duels.length; i++) {
    await runDuelSimulation(networkName, duels[i], i);
  }
}

async function main() {
  console.log("🎮 PvP Prediction Arena — E2E Simulation");
  console.log(`   Wallet A (Challenger): ${accountA.address}`);
  console.log(`   Wallet B (Opponent):   ${accountB.address}`);

  // Run on both networks (sequentially to avoid nonce conflicts)
  for (const network of ["studionet", "bradbury"]) {
    try {
      await simulateNetwork(network);
    } catch (e) {
      console.error(`\n❌ ${network} simulation crashed: ${e.message}`);
    }
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log("  🏁 SIMULATION COMPLETE");
  console.log(`${"═".repeat(60)}`);
}

main().catch(console.error);
