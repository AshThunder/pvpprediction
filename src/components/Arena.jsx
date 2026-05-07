import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, usePublicClient, useSwitchChain } from 'wagmi';
import { Swords, Info, Trophy, AlertCircle, PlusCircle, TerminalSquare, XCircle, DollarSign, Lock, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseEther, formatEther } from 'viem';
import { CONTRACT_ADDRESSES, getGenClient, CONTRACT_SUPPORTS_BALANCE } from '../services/genlayer';
import Avatar from './Avatar';
import { useToast } from './Toast';
import ActivityFeed from './ActivityFeed';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor(targetDate - Date.now() / 1000)));

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor(targetDate - Date.now() / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, timeLeft]);

  if (timeLeft <= 0) {
    return <span className="text-green-600 font-black animate-pulse flex items-center gap-1 min-w-[140px]"><Info size={12} /> READY FOR RESOLUTION</span>;
  }

  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  return (
    <span className="text-orange-600 font-bold flex items-center gap-1 font-mono min-w-[140px]">
      <Clock size={12} /> {h > 0 ? `${h}h ` : ''}{m}m {s}s
    </span>
  );
};

const Arena = ({ onBackToHome, onNavigate }) => {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();
  const isWrongNetwork = isConnected && chainId !== 4221;
  const [duels, setDuels] = useState([]);
  const [balance, setBalance] = useState('0.00');
  const [virtualBalance, setVirtualBalance] = useState('0');
  const [activeTab, setActiveTab] = useState('AVAILABLE');
  const [matchingDuelId, setMatchingDuelId] = useState(null);
  const [matchingEvidence, setMatchingEvidence] = useState('');
  const [rpcStatus, setRpcStatus] = useState('Checking...');
  const [loading, setLoading] = useState(false);
  const [nextDuelId, setNextDuelId] = useState(0n);
  const [pendingActionIds, setPendingActionIds] = useState(new Set());
  const [viewingDuelId, setViewingDuelId] = useState(null);
  const { addToast } = useToast();

  const currentContractAddress = chainId && CONTRACT_ADDRESSES[chainId] ? CONTRACT_ADDRESSES[chainId] : CONTRACT_ADDRESSES[4221];

  // Fetch duels from contract via genlayer-js
  const fetchAllData = async () => {
    if (!currentContractAddress) return;
    setLoading(true);
    try {
      const client = getGenClient(chainId || 4221, address);
      const countBig = await client.readContract({
        address: currentContractAddress,
        functionName: 'get_next_duel_id',
        leaderOnly: true,
      });
      
      const count = Number(countBig || 0n);
      setNextDuelId(countBig);

      // Virtual balance: only if deployment exposes get_balance (default Bradbury 0x6421… does not; redeploy + verify sets CONTRACT_SUPPORTS_BALANCE in contract_address.js)
      const player = typeof address === 'string' && address.length === 42 && address.startsWith('0x') ? address : null;
      if (CONTRACT_SUPPORTS_BALANCE && player) {
        try {
          const vBalance = await client.readContract({
            address: currentContractAddress,
            functionName: 'get_balance',
            args: [player],
          });
          setVirtualBalance(vBalance?.toString() || '0');
        } catch (e) {
          console.warn('Could not fetch virtual balance:', e);
        }
      } else {
        setVirtualBalance('0');
      }

      const fetchedDuels = [];
      // IDs start at 1. Fetch backwards to prioritize newer duels and add throttle.
      for (let i = count - 1; i >= 1; i--) {
        try {
          const duel = await client.readContract({
            address: currentContractAddress,
            functionName: 'get_duel',
            args: [BigInt(i)],
            leaderOnly: true,
          });
          if (duel && duel.challenger !== '0x0000000000000000000000000000000000000000') {
            fetchedDuels.push({ id: Number(i), ...duel });
          }
          // 200ms throttle to prevent GenLayer RPC LimitExceededRpcError
          await new Promise(r => setTimeout(r, 200));
        } catch (e) {
          console.error(`Error fetching duel ${i}:`, e);
          if (e.name === 'LimitExceededRpcError' || e.message?.includes('exceeds defined limit') || e.message?.includes('Failed to fetch')) {
            console.warn("Rate limit or network error hit, stopping fetch for older duels.");
            break;
          }
        }
      }
      setDuels(fetchedDuels);
    } catch (err) {
      console.error("Critical fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    const checkRpc = async () => {
      try {
        const res = await fetch('https://studio.genlayer.com/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 })
        });
        if (res.ok) setRpcStatus('ONLINE');
        else setRpcStatus('OFFLINE');
      } catch (e) {
        setRpcStatus('ERR_NOCORS');
      }
    };
    checkRpc();

    const interval = setInterval(() => {
      fetchAllData();
      checkRpc();
    }, 15000); 
    return () => clearInterval(interval);
  }, [currentContractAddress, chainId, address]);

  const [newClaim, setNewClaim] = useState('');
  const [newStake, setNewStake] = useState('10');
  const [newTargetOpponent, setNewTargetOpponent] = useState('');
  const [newDeadline, setNewDeadline] = useState('1h'); // Default 1 hour
  const [newCustomDate, setNewCustomDate] = useState('');
  const [txStatus, setTxStatus] = useState(null); 
  const [txHash, setTxHash] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [txJourney, setTxJourney] = useState(null);

  const TransactionJourney = ({ journey, hash }) => {
    if (!journey) return null;
    
    const steps = [
      { id: 'submission', label: '1. Transaction submission', value: journey.submission },
      { id: 'activation', label: '2. Activation', value: journey.activation },
      { id: 'proposal', label: '3. Leader proposal', value: journey.proposal },
      { id: 'voting', label: '4. Consensus Voting', value: journey.voting },
      { id: 'accepted', label: '5. Finalized / Accepted', value: journey.accepted }
    ];

    return (
      <div className="mt-4 pt-4 border-t-2 border-blue-900/10 space-y-4">
        <div className="text-[10px] font-black tracking-[0.2em] mb-4 text-blue-800/60 uppercase flex justify-between items-center">
          <span>Transaction Journey</span>
          {hash && <span className="font-mono opacity-40 lowercase tracking-normal">id: {hash.slice(0, 10)}...</span>}
        </div>
        <div className="relative pl-8 space-y-6">
          {/* Vertical Line */}
          <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-blue-200 dark:bg-blue-900/30"></div>
          
          {steps.map((step, idx) => {
            const isActive = step.value !== null;
            // The step is "Latest" if it's active AND the next step is NOT active
            const isLatest = isActive && (idx === steps.length - 1 || steps[idx + 1].value === null);
            
            return (
              <div key={step.id} className="relative flex items-center justify-between group">
                {/* Circle Indicator */}
                <div className={`absolute -left-8 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 ${
                  isActive 
                    ? 'bg-blue-600 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-white border-blue-200'
                }`}>
                  {isActive ? (
                    <div className="text-white"><Trophy size={12} /></div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-100 group-hover:bg-blue-200"></div>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className={`text-[11px] font-black uppercase tracking-wider transition-opacity ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                  {isActive && typeof step.value === 'string' && (
                    <span className="text-[9px] font-bold text-blue-600 font-mono mt-0.5">
                      BLOCK: {step.value}
                    </span>
                  )}
                  {isActive && step.value === true && (
                    <span className="text-[9px] font-bold text-blue-600 uppercase mt-0.5">
                      {step.id === 'submission' ? 'SENT TO MEMPOOL' : 'VERIFIED'}
                    </span>
                  )}
                </div>

                {isActive && isLatest && step.id !== 'accepted' && (
                  <motion.div 
                    animate={{ opacity: [1, 0.4, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="flex items-center gap-1.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-ping"></div>
                    <span className="text-[9px] font-black text-orange-600 uppercase italic">
                      {step.id === 'submission' ? 'Awaiting Activation...' : 
                       step.id === 'activation' ? 'Awaiting Proposal...' :
                       step.id === 'proposal' ? 'Awaiting Consensus...' :
                       'Awaiting Finalization...'}
                    </span>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const pollTransaction = async (client, hash) => {
    setTxJourney({ submission: true, activation: null, proposal: null, voting: null, accepted: null });
    
    // Polling loop
    for (let i = 0; i < 240; i++) {
      try {
        const tx = await client.getTransaction({ hash });
        console.log("TX Progress:", tx.statusName, tx.readStateBlockRange);
        
        const nextJourney = { submission: true, activation: null, proposal: null, voting: null, accepted: null };
        
        if (tx.readStateBlockRange?.activationBlock) {
          nextJourney.activation = tx.readStateBlockRange.activationBlock.toString();
        }
        
        if (tx.readStateBlockRange?.proposalBlock) {
          nextJourney.proposal = tx.readStateBlockRange.proposalBlock.toString();
        }

        if (['COMMITTING', 'REVEALING', 'UNDETERMINED'].includes(tx.statusName)) {
          nextJourney.voting = true;
        }

        if (tx.statusName === 'ACCEPTED' || tx.statusName === 'FINALIZED') {
          nextJourney.voting = true;
          nextJourney.accepted = true;
          // Backfill for UI consistency
          if (!nextJourney.activation) nextJourney.activation = "VERIFIED";
          if (!nextJourney.proposal) nextJourney.proposal = "VERIFIED";
          setTxJourney(nextJourney);
          return tx;
        }

        if (tx.statusName === 'LEADER_TIMEOUT' || tx.statusName === 'ERROR' || tx.statusName?.includes('ERROR')) {
          setTxJourney(null); // Stop journey
          throw new Error(`Transaction ${tx.statusName}`);
        }

        setTxJourney(nextJourney);
        await new Promise(r => setTimeout(r, 6000));
      } catch (e) {
        if (e.message?.includes('Transaction')) throw e; // Break loop on explicit timeout/error
        console.warn("Poll catchup:", e);
        await new Promise(r => setTimeout(r, 6000));
      }
    }
    throw new Error("Transaction Leader Timeout");
  };

  const handleCreateDuel = async () => {
    if (!newClaim || !newStake || !address) return;
    setIsCreating(false);
    setTxStatus('pending');
    setPendingActionIds(prev => new Set(prev).add('create'));

    try {
      const client = getGenClient(chainId || 4221, address);
      await client.connect("testnetBradbury");

      // Calculate deadline timestamp
      const now = Math.floor(Date.now() / 1000);
      let deadlineTs = now;
      if (newDeadline === '5m') deadlineTs += 5 * 60;
      else if (newDeadline === '1h') deadlineTs += 60 * 60;
      else if (newDeadline === '1d') deadlineTs += 24 * 60 * 60;
      else if (newDeadline === '1w') deadlineTs += 7 * 24 * 60 * 60;
      else if (newDeadline === 'instant') deadlineTs = now;
      else if (newDeadline === 'custom') {
        deadlineTs = Math.floor(new Date(newCustomDate).getTime() / 1000);
        if (isNaN(deadlineTs) || deadlineTs < now) deadlineTs = now;
      }

      const hash = await client.writeContract({
        address: currentContractAddress,
        functionName: 'create_duel',
        args: [newClaim, newTargetOpponent, BigInt(deadlineTs)],
        value: parseEther(newStake),
      });

      setTxHash(hash);
      await pollTransaction(client, hash);
      
      setTxStatus('success');
      addToast("Transaction Confirmed!", "success");
      setPendingActionIds(prev => {
        const next = new Set(prev);
        next.delete('create');
        return next;
      });
      setTimeout(() => {
        setTxStatus(null);
        setTxJourney(null);
      }, 5000);
      fetchAllData();
      setIsCreating(false);
      setNewClaim('');
      setNewTargetOpponent('');
    } catch (err) {
      console.error("Create duel error:", err);
      addToast("Failed to create duel. Leader Timeout or rejection.", "error");
      setTxStatus('error');
      setPendingActionIds(prev => {
        const next = new Set(prev);
        next.delete('create');
        return next;
      });
    }
  };

  const handleMatchStake = async (duelId, stake, evidence) => {
    if (!address) return;
    setMatchingDuelId(null);
    setTxStatus('pending');
    setPendingActionIds(prev => new Set(prev).add(Number(duelId)));
    
    try {
      const client = getGenClient(chainId || 4221, address);
      await client.connect("testnetBradbury");

      const hash = await client.writeContract({
        address: currentContractAddress,
        functionName: 'match_duel',
        args: [BigInt(duelId), evidence || ""],
        value: BigInt(stake),
      });

      setTxHash(hash);
      await pollTransaction(client, hash);
      
      setTxStatus('success');
      addToast("Transaction Confirmed!", "success");
      setPendingActionIds(prev => {
        const next = new Set(prev);
        next.delete(Number(duelId));
        return next;
      });
      setTimeout(() => {
        setTxStatus(null);
        setTxJourney(null);
      }, 5000);
      fetchAllData();
    } catch (err) {
      console.error("Match duel error:", err);
      addToast("Failed to match duel. Leader Timeout or rejection.", "error");
      setTxStatus('error');
      setPendingActionIds(prev => {
        const next = new Set(prev);
        next.delete(Number(duelId));
        return next;
      });
    }
  };

  const handleResolveAI = async (duelId) => {
    if (!address) return;
    setTxStatus('pending');
    setPendingActionIds(prev => new Set(prev).add(Number(duelId)));

    try {
      const client = getGenClient(chainId || 4221, address);
      await client.connect("testnetBradbury");

      const hash = await client.writeContract({
        address: currentContractAddress,
        functionName: 'resolve_duel',
        args: [BigInt(duelId)],
      });

      setTxHash(hash);
      await pollTransaction(client, hash);
      
      setTxStatus('success');
      addToast("Transaction Confirmed!", "success");
      setPendingActionIds(prev => {
        const next = new Set(prev);
        next.delete(Number(duelId));
        return next;
      });
      setTimeout(() => {
        setTxStatus(null);
        setTxJourney(null);
      }, 5000);
      fetchAllData();
    } catch (err) {
      console.error("Resolve error:", err);
      addToast("Failed to resolve duel.", "error");
      setTxStatus('error');
      setPendingActionIds(prev => {
        const next = new Set(prev);
        next.delete(Number(duelId));
        return next;
      });
    }
  };

  const handleCancelDuel = async (duelId) => {
    if (!address) return;
    setTxStatus('pending');
    setPendingActionIds(prev => new Set(prev).add(Number(duelId)));

    try {
      const client = getGenClient(chainId || 4221, address);
      await client.connect("testnetBradbury");

      const hash = await client.writeContract({
        address: currentContractAddress,
        functionName: 'cancel_duel',
        args: [BigInt(duelId)],
      });

      setTxHash(hash);
      await pollTransaction(client, hash);
      
      setTxStatus('success');
      addToast("Transaction Confirmed!", "success");
      setPendingActionIds(prev => {
        const next = new Set(prev);
        next.delete(Number(duelId));
        return next;
      });
      setTimeout(() => {
        setTxStatus(null);
        setTxJourney(null);
      }, 5000);
      fetchAllData();
    } catch (err) {
      console.error("Cancel error:", err);
      addToast("Failed to cancel duel.", "error");
      setTxStatus('error');
      setPendingActionIds(prev => {
        const next = new Set(prev);
        next.delete(Number(duelId));
        return next;
      });
    }
  };

  const handleClaimWinnings = async (duelId) => {
    if (!address) return;
    setTxStatus('pending');

    try {
      const client = getGenClient(chainId || 4221, address);
      await client.connect("testnetBradbury");

      const hash = await client.writeContract({
        address: currentContractAddress,
        functionName: 'claim_winnings',
        args: [BigInt(duelId)],
      });

      setTxHash(hash);
      await pollTransaction(client, hash);
      
      setTxStatus('success');
      addToast("Transaction Confirmed!", "success");
      setTimeout(() => {
        setTxStatus(null);
        setTxJourney(null);
      }, 5000);
      fetchAllData();
    } catch (err) {
      console.error("Claim error:", err);
      addToast("Failed to claim winnings.", "error");
      setTxStatus('error');
    }
  };

  const handleSyncNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xf21f',
          chainName: 'GenLayer Studio',
          nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
          rpcUrls: ['https://studio.genlayer.com/api'],
          blockExplorerUrls: ['https://explorer-studio.genlayer.com/'],
        }],
      });
    } catch (e) {
      console.error("Sync error:", e);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'OPEN': return { label: 'OPEN', color: 'bg-orange-600' };
      case 'MATCHED': return { label: 'IN PROGRESS', color: 'bg-blue-600' };
      case 'RESOLVED': return { label: 'READY TO CLAIM', color: 'bg-green-600' };
      case 'CLAIMED': return { label: 'FINALIZED', color: 'bg-slate-500' };
      case 'CANCELLED': return { label: 'CANCELLED', color: 'bg-red-600' };
      case 'EXPIRED': return { label: 'EXPIRED', color: 'bg-amber-600' };
      default: return { label: status, color: 'bg-slate-400' };
    }
  };



  const renderLeaderboard = () => {
    const stats = {};
    duels.forEach(duel => {
      if (duel.status !== 'RESOLVED' && duel.status !== 'CLAIMED') return;
      
      const winner = duel.winner?.toLowerCase();
      const challenger = duel.challenger?.toLowerCase();
      const opponent = duel.opponent?.toLowerCase();
      if (!winner || !challenger) return;
      
      const loser = (winner === challenger) ? opponent : challenger;
      
      if (!stats[winner]) stats[winner] = { wins: 0, losses: 0, earned: 0n };
      stats[winner].wins += 1;
      stats[winner].earned += BigInt(duel.stake) * 2n;

      if (loser && loser !== '0x0000000000000000000000000000000000000000') {
        if (!stats[loser]) stats[loser] = { wins: 0, losses: 0, earned: 0n };
        stats[loser].losses += 1;
      }
    });

    const sorted = Object.entries(stats).sort((a, b) => {
      if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
      return Number(b[1].earned - a[1].earned);
    });

    return (
      <div className="bg-white border-4 border-slate-900 p-8 shadow-[8px_8px_0px_0px_#EA580C]">
        <h2 className="text-3xl font-black uppercase mb-8 italic tracking-tighter">ARENA CHAMPIONS</h2>
        <div className="space-y-4">
          {sorted.length === 0 ? <p className="text-slate-500 font-bold uppercase">No ranked players yet.</p> : null}
          {sorted.map(([player, stat], idx) => (
            <div key={player} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-2 border-slate-200 hover:border-slate-900 transition-colors">
              <div className="flex items-center gap-4 mb-2 md:mb-0">
                <span className={`font-black text-2xl w-8 text-center ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-200'}`}>#{idx + 1}</span>
                <Avatar address={player} size="w-8 h-8" textSize="text-xs" />
                <span className="font-bold text-sm text-slate-600 font-mono">{player.slice(0, 6)}...{player.slice(-4)}</span>
              </div>
              <div className="flex gap-6 w-full md:w-auto justify-between md:justify-start mt-2 md:mt-0 px-12 md:px-0">
                <div className="text-center">
                  <div className="text-[10px] font-black uppercase text-slate-400">Wins</div>
                  <div className="font-black text-green-600">{stat.wins}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-black uppercase text-slate-400">Losses</div>
                  <div className="font-black text-red-600">{stat.losses}</div>
                </div>
                <div className="text-center min-w-[80px]">
                  <div className="text-[10px] font-black uppercase text-slate-400">Gen Won</div>
                  <div className="font-black text-orange-600">{formatEther(stat.earned)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-white font-['Inter']">
      <nav className="bg-white dark:bg-slate-950 flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50 border-b-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_#1E293B]">
        <div className="text-2xl font-black text-slate-900 dark:text-white italic font-['Space_Grotesk'] uppercase tracking-tighter cursor-pointer flex items-center gap-2" onClick={onBackToHome}>
          <Swords size={28} className="text-orange-600" />
          PVP PREDICTION ARENA
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-8 items-center mr-8">
            <button onClick={() => onNavigate('home')} className="font-headline uppercase tracking-tighter text-slate-900 hover:text-orange-600 font-bold">HOME</button>
            <button className="font-headline uppercase tracking-tighter text-orange-600 border-b-2 border-orange-600 font-bold">PLAY</button>
            <button onClick={() => onNavigate('about')} className="font-headline uppercase tracking-tighter text-slate-900 hover:text-orange-600 font-bold">ABOUT</button>
          </div>
          {isConnected && address && (
            <div
              className="flex items-center bg-[#1a1a1a] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold border-2 border-transparent hover:border-[#ffd60a] transition-all"
              title={
                CONTRACT_SUPPORTS_BALANCE
                  ? 'In-game virtual balance from winnings and cancelled duels'
                  : 'This deployment has no get_balance view on-chain; redeploy latest OracleDuel.py and run deploy to enable'
              }
            >
              <span className="text-[#ffd60a] mr-2">VIRTUAL:</span>
              <span className="font-mono text-sm tracking-tight">
                {CONTRACT_SUPPORTS_BALANCE ? `${Number(virtualBalance) / 1e18} GEN` : '—'}
              </span>
            </div>
          )}
          <ConnectButton />
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <section className="mb-12 border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_#EA580C] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-5xl font-black uppercase font-headline tracking-tighter mb-2 italic">BATTLE CENTER</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">FAIR. DECENTRALIZED. MACHINE-VERIFIED PREDICTIONS.</p>
          </div>
          <button 
            onClick={handleSyncNetwork}
            className="bg-orange-600 text-white px-6 py-2 font-black uppercase tracking-tighter border-2 border-slate-900 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-xs"
          >
            🔄 SYNC BRADBURY NET
          </button>
        </section>

        <ActivityFeed duels={duels} />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex bg-slate-100 p-1 border-2 border-slate-900 overflow-x-auto w-full md:w-auto">
            {['AVAILABLE', 'MY GAMES', 'HISTORY', 'LEADERBOARD'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 font-black uppercase tracking-tighter transition-all whitespace-nowrap ${activeTab === tab ? 'bg-orange-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-slate-900 text-white px-8 py-3 font-black uppercase tracking-tighter flex items-center gap-2 border-2 border-slate-900 shadow-[4px_4px_0px_0px_#EA580C] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            <PlusCircle size={20} />
            CREATE NEW DUEL
          </button>
        </div>





        <AnimatePresence>
          {txStatus && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`mb-8 p-4 flex flex-col gap-3 font-black uppercase tracking-widest ${txStatus === 'success' ? 'bg-green-100 text-green-900 border-2 border-green-900' : txStatus === 'pending' ? 'bg-blue-100 text-blue-900 border-2 border-blue-900' : 'bg-red-100 text-red-900 border-2 border-red-900'}`}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  {txStatus === 'pending' ? <TerminalSquare className="animate-pulse" /> : txStatus === 'success' ? <Trophy /> : <AlertCircle />}
                  <span>
                    {txStatus === 'pending' ? 'Processing on GenLayer... (Leader Consensus may take up to 12 mins)' : txStatus === 'success' ? 'Telemetry Verified. Action Complete.' : 'Transaction Leader Timeout or Error. Please try again later.'}
                  </span>
                </div>
                <button onClick={() => setTxStatus(null)} className="text-xs tracking-widest underline flex-shrink-0 ml-4 hover:opacity-70 transition-opacity">DISMISS</button>
              </div>
              
              {txHash && (
                <div className={`mt-1 pt-3 border-t-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs opacity-90 ${txStatus === 'success' ? 'border-green-900/20' : txStatus === 'pending' ? 'border-blue-900/20' : 'border-red-900/20'}`}>
                  <span className="font-mono break-all truncate mr-2" title={txHash}>TX: {txHash}</span>
                  <a href={`https://explorer-bradbury.genlayer.com/tx/${txHash}`} target="_blank" rel="noreferrer" className="underline whitespace-nowrap bg-black text-white px-3 py-1.5 hover:bg-slate-800 transition-colors flex-shrink-0 inline-flex items-center gap-2">
                    VIEW ON EXPLORER ↗
                  </a>
                </div>
              )}

              {txStatus === 'pending' && <TransactionJourney journey={txJourney} hash={txHash} />}
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'LEADERBOARD' ? renderLeaderboard() : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && duels.length === 0 ? (
            <div className="col-span-full py-20 text-center font-black uppercase tracking-widest text-slate-400">Syncing Bradbury Net...</div>
          ) : (
            duels.filter(d => {
              const addr = address?.toLowerCase();
              const challenger = d.challenger?.toLowerCase();
              const opponent = d.opponent?.toLowerCase();
              const isPending = pendingActionIds.has(Number(d.id));

              if (activeTab === 'AVAILABLE') {
                const isAvailable = d.status === 'OPEN' && challenger !== addr && !isPending;
                if (!isAvailable) return false;
                // Private duel filter
                const zero = '0x0000000000000000000000000000000000000000';
                if (d.target_opponent && d.target_opponent !== zero && d.target_opponent?.toLowerCase() !== addr) return false;
                return true;
              }
              if (activeTab === 'MY GAMES') {
                return challenger === addr || opponent === addr || isPending;
              }
              return true;
            }).map(duel => {
            const config = getStatusConfig(duel.status);
            return (
              <motion.div layout key={duel.id} className="bg-white border-2 border-slate-900 p-6 shadow-[8px_8px_0px_0px_#1E293B] flex flex-col hover:shadow-[12px_12px_0px_0px_#1E293B] transition-all">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-1 text-white uppercase ${config.color}`}>{config.label}</span>

                    {duel.target_opponent && duel.target_opponent !== '0x0000000000000000000000000000000000000000' && (
                      <span className="text-[9px] font-black px-2 py-0.5 bg-purple-100 text-purple-700 uppercase border border-purple-300 flex items-center gap-1">
                        <Lock size={9} /> PRIVATE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400">ID: {duel.id.toString().padStart(4, '0')}</span>
                    {duel.deadline > 0n && <CountdownTimer targetDate={Number(duel.deadline)} />}
                  </div>
                </div>
                
                <h3 className="text-xl font-black lowercase font-headline mb-6 line-clamp-3 leading-tight min-h-[4.5rem]">
                  "{duel.claim}"
                </h3>
                
                <div className="flex items-center justify-between mt-auto mb-4">
                  <div className="flex items-center gap-2" title="Challenger">
                    <Avatar address={duel.challenger} />
                    <span className="text-[10px] font-mono font-bold text-slate-500 truncate">{duel.challenger.slice(0, 5)}...{duel.challenger.slice(-3)}</span>
                  </div>
                  {duel.opponent && duel.opponent !== '0x0000000000000000000000000000000000000000' && (
                    <div className="flex items-center gap-2 border-l-2 pl-3 border-slate-200" title="Opponent">
                      <Avatar address={duel.opponent} />
                      <span className="text-[10px] font-mono font-bold text-slate-500 truncate">{duel.opponent.slice(0, 5)}...{duel.opponent.slice(-3)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t-2 border-slate-100">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Stake</div>
                      <div className="text-2xl font-black text-slate-900 font-headline italic">
                        {formatEther(duel.stake)} <span className="text-xs text-orange-600 not-italic ml-1">GEN</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                    <button onClick={() => setViewingDuelId(duel.id)} className="bg-white border-2 border-slate-900 text-slate-900 font-black px-4 py-2 text-xs uppercase hover:bg-slate-100 transition-all">DETAILS</button>
                    {duel.status === 'OPEN' && address?.toLowerCase() !== duel.challenger?.toLowerCase() && (
                      <button onClick={(e) => { e.stopPropagation(); setMatchingDuelId(duel.id); }} className="bg-orange-600 text-white font-black px-4 py-2 text-xs uppercase shadow-[2px_2px_0px_0px_#000] hover:shadow-none transition-all">MATCH</button>
                    )}
                    {duel.status === 'OPEN' && address?.toLowerCase() === duel.challenger?.toLowerCase() && (
                      <button onClick={(e) => { e.stopPropagation(); handleCancelDuel(duel.id); }} className="border-2 border-red-600 text-red-600 font-black px-4 py-2 text-xs uppercase flex items-center gap-2 hover:bg-red-50 transition-all">
                        <XCircle size={14} /> CANCEL
                      </button>
                    )}
                    {duel.status === 'MATCHED' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleResolveAI(duel.id); }} 
                        disabled={Number(duel.deadline) > Date.now() / 1000}
                        className={`bg-slate-900 text-white font-black px-4 py-2 text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] hover:shadow-none transition-all ${Number(duel.deadline) > Date.now() / 1000 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                      >
                        <TerminalSquare size={14} /> AI CHECK
                      </button>
                    )}
                    {duel.status === 'RESOLVED' && duel.winner?.toLowerCase() === address?.toLowerCase() && (
                      <button onClick={(e) => { e.stopPropagation(); handleClaimWinnings(duel.id); }} className="bg-green-600 text-white font-black px-4 py-2 text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] hover:shadow-none transition-all">
                        <Trophy size={14} /> CLAIM
                      </button>
                    )}

                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
      )}
      </main>

      {/* Modals for Create and Match */}
      <AnimatePresence>
        {(isCreating || matchingDuelId || viewingDuelId !== null) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white border-4 border-slate-900 p-10 max-w-xl w-full shadow-[16px_16px_0px_0px_#EA580C] max-h-[90vh] overflow-y-auto">
              {isCreating ? (
                <>
                  <h2 className="text-3xl font-black uppercase mb-8 italic tracking-tighter">NEW BATTLE PROPOSAL</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black uppercase mb-2">Claim to Verify</label>
                      <textarea 
                        value={newClaim}
                        onChange={(e) => setNewClaim(e.target.value)}
                        className="w-full border-2 border-slate-900 p-4 font-bold focus:outline-none focus:ring-2 ring-orange-600"
                        rows={3}
                        placeholder="e.g. BTC will hit 100k by tomorrow..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase mb-2">Stake (GEN)</label>
                      <input 
                        type="number"
                        value={newStake}
                        onChange={(e) => setNewStake(e.target.value)}
                        className="w-full border-2 border-slate-900 p-4 font-black text-2xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase mb-2 flex items-center gap-2">
                        <Lock size={12} /> Private Duel (Optional)
                      </label>
                      <input 
                        type="text"
                        value={newTargetOpponent}
                        onChange={(e) => setNewTargetOpponent(e.target.value)}
                        className="w-full border-2 border-slate-300 p-3 font-mono text-sm focus:outline-none focus:border-slate-900"
                        placeholder="0x... (leave blank for public)"
                      />
                      <p className="text-[10px] text-slate-400 mt-1 font-bold">If set, only this address can match your duel.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase mb-2 flex items-center gap-2">
                        <Clock size={12} /> Resolution Deadline
                      </label>
                      <select
                        value={newDeadline}
                        onChange={(e) => setNewDeadline(e.target.value)}
                        className="w-full border-2 border-slate-900 p-3 font-black text-sm uppercase focus:outline-none bg-white mb-2"
                      >
                        <option value="instant">⚡ Instant (No Wait)</option>
                        <option value="5m">⚡ 5 Minutes (Quick Test)</option>
                        <option value="1h">🕐 1 Hour</option>
                        <option value="1d">📅 1 Day</option>
                        <option value="1w">🗓️ 1 Week</option>
                        <option value="custom">⚙️ Custom Date & Time</option>
                      </select>
                      {newDeadline === 'custom' && (
                        <input
                          type="datetime-local"
                          value={newCustomDate}
                          onChange={(e) => setNewCustomDate(e.target.value)}
                          className="w-full border-2 border-slate-900 p-3 font-black text-sm uppercase focus:outline-none bg-white"
                        />
                      )}
                      <p className="text-[10px] text-slate-400 mt-1 font-bold">AI Resolution will be locked until this time passes.</p>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button onClick={handleCreateDuel} className="flex-[2] bg-orange-600 text-white font-black py-4 uppercase tracking-widest shadow-[4px_4px_0px_0px_#000]">LOCK STAKE</button>
                      <button onClick={() => setIsCreating(false)} className="flex-1 font-black uppercase underline">ABORT</button>
                    </div>
                  </div>
                </>
              ) : matchingDuelId ? (
                <>
                  <h2 className="text-3xl font-black uppercase mb-8 italic tracking-tighter">CHALLENGE ACCEPTED</h2>
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-6 border-2 border-dashed border-slate-300 italic font-bold">
                      "{duels.find(d => d.id === matchingDuelId)?.claim}"
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase mb-2">Counter-Evidence / Context</label>
                      <textarea 
                        value={matchingEvidence}
                        onChange={(e) => setMatchingEvidence(e.target.value)}
                        className="w-full border-2 border-slate-900 p-4 font-bold focus:outline-none"
                        rows={3}
                        placeholder="Why is Player 1 wrong? (Optional)"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button onClick={() => handleMatchStake(matchingDuelId, duels.find(d => d.id === matchingDuelId)?.stake, matchingEvidence)} className="flex-[2] bg-slate-900 text-white font-black py-4 uppercase tracking-widest shadow-[4px_4px_0px_0px_#EA580C]">MATCH & BET</button>
                      <button onClick={() => setMatchingDuelId(null)} className="flex-1 font-black uppercase underline">ABORT</button>
                    </div>
                  </div>
                </>
              ) : viewingDuelId !== null ? (
                (() => {
                  const duel = duels.find(d => d.id === viewingDuelId);
                  if (!duel) return null;
                  const config = getStatusConfig(duel.status);
                  return (
                    <>
                      <div className="flex justify-between items-start mb-6">
                        <span className={`text-[10px] font-black px-2 py-1 text-white uppercase ${config.color} border-2 border-slate-900 shadow-[2px_2px_0px_0px_#000]`}>{config.label}</span>
                        <span className="text-[10px] font-bold text-slate-400">ID: {duel.id.toString().padStart(4, '0')}</span>
                      </div>
                      <h2 className="text-3xl font-black uppercase mb-8 italic tracking-tighter">BATTLE REPORT</h2>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-orange-600 mb-1">Original Claim (Challenger)</label>
                          <div className="bg-slate-50 p-5 border-2 border-slate-900 font-bold italic text-lg shadow-[4px_4px_0px_0px_#1E293B]">
                            "{duel.claim}"
                          </div>
                          <div className="flex items-center gap-2 mt-4 ml-1">
                            <span className="text-xs font-black uppercase text-slate-400">By</span>
                            <Avatar address={duel.challenger} size="w-6 h-6" textSize="text-[10px]"/>
                            <span className="text-xs font-mono font-bold text-slate-600 truncate">{duel.challenger}</span>
                          </div>
                        </div>

                        {duel.opponent && duel.opponent !== '0x0000000000000000000000000000000000000000' && (
                          <div className="pt-2">
                            <label className="block text-[10px] font-black uppercase text-blue-600 mb-1">Counter-Context (Opponent)</label>
                            <div className="bg-white p-5 border-2 border-slate-900 font-medium shadow-[4px_4px_0px_0px_#2563EB]">
                              {duel.evidence_b || <span className="text-slate-400 italic">No additional context provided.</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-4 ml-1">
                              <span className="text-xs font-black uppercase text-slate-400">By</span>
                              <Avatar address={duel.opponent} size="w-6 h-6" textSize="text-[10px]"/>
                              <span className="text-xs font-mono font-bold text-slate-600 truncate">{duel.opponent}</span>
                            </div>
                          </div>
                        )}

                        {(duel.status === 'RESOLVED' || duel.status === 'CLAIMED') && (
                          <div className="mt-8 border-t-4 border-slate-900 pt-8">
                            <label className="block text-md font-black uppercase text-orange-600 mb-2 flex items-center gap-2 tracking-widest animate-pulse">
                              <TerminalSquare size={16} /> COLOR COMMENTATOR HUD
                            </label>
                            <div className="bg-slate-900 text-white p-6 border-4 border-orange-600 shadow-[8px_8px_0px_0px_#000] relative overflow-hidden">
                              <div className="absolute top-0 right-0 bg-orange-600 text-white px-3 py-1 text-[10px] font-black uppercase italic tracking-tighter">LIVE FEED</div>
                              <div className="font-black text-2xl mb-4 tracking-tighter flex items-center gap-3 border-b-2 border-slate-700 pb-4">
                                <Trophy className="text-yellow-400" size={32} /> 
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-400 leading-none mb-1">FINAL VERDICT</span>
                                  <span className="text-green-400 leading-none uppercase">{duel.winner?.toLowerCase() === duel.challenger?.toLowerCase() ? 'CHALLENGER TAKES IT!' : 'OPPONENT DENIES!'}</span>
                                </div>
                              </div>
                              <div className="relative">
                                <span className="absolute -left-2 top-0 text-orange-600/30 text-6xl font-black leading-none select-none">"</span>
                                <p className="text-md text-white/90 leading-relaxed font-bold italic pl-4 border-l-4 border-orange-600/50">
                                  {duel.reasoning || "Ladies and gentlemen, the AI has spoken but the transcript is missing! Check the tapes!"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="pt-8 flex gap-4">
                          <button onClick={() => setViewingDuelId(null)} className="w-full bg-slate-100 border-2 border-slate-900 text-slate-900 font-black py-4 uppercase tracking-widest shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">CLOSE</button>
                        </div>
                      </div>
                    </>
                  );
                })()
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Arena;
