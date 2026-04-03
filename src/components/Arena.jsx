import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, usePublicClient, useSwitchChain } from 'wagmi';
import { Swords, Info, Trophy, AlertCircle, PlusCircle, TerminalSquare, XCircle, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseEther, formatEther } from 'viem';
import { CONTRACT_ADDRESSES, getGenClient } from '../services/genlayer';
import { ORACLE_DUEL_ABI } from '../services/abi';

const Arena = ({ onBackToHome, onNavigate }) => {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();
  const isWrongNetwork = isConnected && chainId !== 4221;
  const [duels, setDuels] = useState([]);
  const [activeTab, setActiveTab] = useState('AVAILABLE');
  const [matchingDuelId, setMatchingDuelId] = useState(null);
  const [matchingEvidence, setMatchingEvidence] = useState('');
  const [rpcStatus, setRpcStatus] = useState('Checking...');
  const [loading, setLoading] = useState(false);
  const [nextDuelId, setNextDuelId] = useState(0n);

  const currentContractAddress = chainId && CONTRACT_ADDRESSES[chainId] ? CONTRACT_ADDRESSES[chainId] : CONTRACT_ADDRESSES[4221];

  // Fetch duels from contract via genlayer-js
  const fetchAllData = async () => {
    if (!currentContractAddress || !publicClient) return;
    setLoading(true);
    try {
      const countBig = await publicClient.readContract({
        address: currentContractAddress,
        abi: ORACLE_DUEL_ABI,
        functionName: 'get_next_duel_id',
      });
      
      const count = Number(countBig || 0n);
      setNextDuelId(countBig);

      const fetchedDuels = [];
      // IDs are 1-based
      for (let i = 1; i < count; i++) {
        try {
          const duel = await publicClient.readContract({
            address: currentContractAddress,
            abi: ORACLE_DUEL_ABI,
            functionName: 'get_duel',
            args: [BigInt(i)],
          });
          if (duel && duel.challenger !== '0x0000000000000000000000000000000000000000') {
            fetchedDuels.push({ id: Number(i), ...duel });
          }
        } catch (e) {
          console.error(`Error fetching duel ${i}:`, e);
        }
      }
      setDuels(fetchedDuels.reverse());
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
        const res = await fetch('/rpc', {
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
  }, [currentContractAddress, chainId]);

  const [newClaim, setNewClaim] = useState('');
  const [newStake, setNewStake] = useState('10');
  const [isCreating, setIsCreating] = useState(false);
  const [txStatus, setTxStatus] = useState(null); 

  const { writeContract, data: hash, isError: isWriteError, error: writeError, isPending: isWritePending } = useWriteContract();

  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isWritePending || isTxLoading) setTxStatus('pending');
    else if (isTxSuccess) {
      setTxStatus('success');
      setTimeout(() => setTxStatus(null), 5000);
      fetchAllData();
    } else if (isWriteError) setTxStatus('error');
  }, [isWritePending, isTxLoading, isTxSuccess, isWriteError]);

  const handleCreateDuel = () => {
    if (!newClaim || !newStake) return;
    writeContract({
      address: currentContractAddress,
      abi: ORACLE_DUEL_ABI,
      functionName: 'create_duel',
      args: [newClaim],
      value: parseEther(newStake),
      gas: 1_000_000n,
      gasPrice: 1_000_000_000n,
    });
    setIsCreating(false);
  };

  const handleMatchStake = (duelId, stake, evidence) => {
    writeContract({
      address: currentContractAddress,
      abi: ORACLE_DUEL_ABI,
      functionName: 'match_duel',
      args: [BigInt(duelId), evidence || ""],
      value: BigInt(stake),
      gas: 1_000_000n,
      gasPrice: 1_000_000_000n,
    });
    setMatchingDuelId(null);
  };

  const handleResolveAI = (duelId) => {
    writeContract({
      address: currentContractAddress,
      abi: ORACLE_DUEL_ABI,
      functionName: 'resolve_duel',
      args: [BigInt(duelId)],
      gas: 1_000_000n,
      gasPrice: 1_000_000_000n,
    });
  };

  const handleCancelDuel = (duelId) => {
    writeContract({
      address: currentContractAddress,
      abi: ORACLE_DUEL_ABI,
      functionName: 'cancel_duel',
      args: [BigInt(duelId)],
      gas: 500_000n,
      gasPrice: 1_000_000_000n,
    });
  };

  const handleClaimWinnings = (duelId) => {
    writeContract({
      address: currentContractAddress,
      abi: ORACLE_DUEL_ABI,
      functionName: 'claim_winnings',
      args: [BigInt(duelId)],
      gas: 500_000n,
      gasPrice: 1_000_000_000n,
    });
  };

  const handleSyncNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x107d',
          chainName: 'GenLayer Testnet Chain',
          nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
          rpcUrls: ['https://zksync-os-testnet-genlayer.zksync.dev'],
          blockExplorerUrls: ['https://zksync-os-testnet-genlayer.explorer.zksync.dev/'],
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
      default: return { label: status, color: 'bg-slate-400' };
    }
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

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex bg-slate-100 p-1 border-2 border-slate-900">
            {['AVAILABLE', 'MY GAMES', 'HISTORY'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 font-black uppercase tracking-tighter transition-all ${activeTab === tab ? 'bg-orange-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}
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
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`mb-8 p-4 border-2 border-slate-900 font-black uppercase tracking-widest flex items-center justify-between ${txStatus === 'success' ? 'bg-green-100' : txStatus === 'pending' ? 'bg-blue-100' : 'bg-red-100'}`}>
              <div className="flex items-center gap-3">
                {txStatus === 'pending' ? <TerminalSquare className="animate-pulse" /> : txStatus === 'success' ? <Trophy /> : <AlertCircle />}
                {txStatus === 'pending' ? 'Awaiting Oracle Confirmation...' : txStatus === 'success' ? 'Telemetry Verified. Action Complete.' : 'Critical Error: Action Aborted.'}
              </div>
              <button onClick={() => setTxStatus(null)} className="text-xs underline">DISMISS</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && duels.length === 0 ? (
            <div className="col-span-full py-20 text-center font-black uppercase tracking-widest text-slate-400">Syncing Bradbury Net...</div>
          ) : duels.filter(d => {
            if (activeTab === 'AVAILABLE') return d.status === 'OPEN' && d.challenger !== address;
            if (activeTab === 'MY GAMES') return d.challenger === address || d.opponent === address;
            return true;
          }).map(duel => {
            const config = getStatusConfig(duel.status);
            return (
              <motion.div layout key={duel.id} className="bg-white border-2 border-slate-900 p-6 shadow-[8px_8px_0px_0px_#1E293B] flex flex-col hover:shadow-[12px_12px_0px_0px_#1E293B] transition-all">
                <div className="flex justify-between items-center mb-6">
                  <span className={`text-[10px] font-black px-2 py-1 text-white uppercase ${config.color}`}>{config.label}</span>
                  <span className="text-[10px] font-bold text-slate-400">ID: {duel.id.toString().padStart(4, '0')}</span>
                </div>
                
                <h3 className="text-xl font-black lowercase font-headline mb-8 line-clamp-3 leading-tight min-h-[4.5rem]">
                  "{duel.claim}"
                </h3>

                <div className="mt-auto pt-6 border-t-2 border-slate-100">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Stake</div>
                      <div className="text-2xl font-black text-slate-900 font-headline italic">
                        {formatEther(duel.stake)} <span className="text-xs text-orange-600 not-italic ml-1">GEN</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                    {duel.status === 'OPEN' && address !== duel.challenger && (
                      <button onClick={() => setMatchingDuelId(duel.id)} className="bg-orange-600 text-white font-black px-4 py-2 text-xs uppercase shadow-[2px_2px_0px_0px_#000] hover:shadow-none transition-all">MATCH</button>
                    )}
                    {duel.status === 'OPEN' && address === duel.challenger && (
                      <button onClick={() => handleCancelDuel(duel.id)} className="border-2 border-red-600 text-red-600 font-black px-4 py-2 text-xs uppercase flex items-center gap-2 hover:bg-red-50 transition-all">
                        <XCircle size={14} /> CANCEL
                      </button>
                    )}
                    {duel.status === 'MATCHED' && (
                      <button onClick={() => handleResolveAI(duel.id)} className="bg-slate-900 text-white font-black px-4 py-2 text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] hover:shadow-none transition-all">
                        <TerminalSquare size={14} /> AI CHECK
                      </button>
                    )}
                    {duel.status === 'RESOLVED' && duel.winner === address && (
                      <button onClick={() => handleClaimWinnings(duel.id)} className="bg-green-600 text-white font-black px-4 py-2 text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] hover:shadow-none transition-all">
                        <Trophy size={14} /> CLAIM
                      </button>
                    )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Modals for Create and Match */}
      <AnimatePresence>
        {(isCreating || matchingDuelId) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white border-4 border-slate-900 p-10 max-w-xl w-full shadow-[16px_16px_0px_0px_#EA580C]">
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
                    <div className="flex gap-4 pt-4">
                      <button onClick={handleCreateDuel} className="flex-[2] bg-orange-600 text-white font-black py-4 uppercase tracking-widest shadow-[4px_4px_0px_0px_#000]">LOCK STAKE</button>
                      <button onClick={() => setIsCreating(false)} className="flex-1 font-black uppercase underline">ABORT</button>
                    </div>
                  </div>
                </>
              ) : (
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
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Arena;
