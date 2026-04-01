import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, usePublicClient, useSwitchChain } from 'wagmi';
import { Swords, Info, Trophy, AlertCircle, PlusCircle, TerminalSquare } from 'lucide-react';
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

  const currentContractAddress = chainId && CONTRACT_ADDRESSES[chainId] ? CONTRACT_ADDRESSES[chainId] : CONTRACT_ADDRESSES[4221];

  const [nextDuelId, setNextDuelId] = useState(0n);
  const [loading, setLoading] = useState(false);

  // Fetch duels from contract via genlayer-js
  useEffect(() => {
    const fetchAllData = async () => {
      if (!currentContractAddress) {
        console.warn("No contract address found for chain:", chainId);
        return;
      }
      setLoading(true);
      try {
        console.log("Fetching from contract:", currentContractAddress, "on chain:", chainId || 'default');
        const client = getGenClient(chainId);
        
        const countBig = await client.readContract({
          address: currentContractAddress,
          abi: ORACLE_DUEL_ABI,
          functionName: 'get_duel_count',
        });
        
        const count = Number(countBig || 0n);
        setNextDuelId(countBig);
        console.log("Total duels found:", count);

        const fetchedDuels = [];
        for (let i = 0; i < count; i++) {
          try {
            const duel = await client.readContract({
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
        setRpcStatus('ERR_CORS');
      }
    };
    checkRpc();

    const interval = setInterval(() => {
      fetchAllData();
      checkRpc();
    }, 10000); 
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
    } else if (isWriteError) setTxStatus('error');
  }, [isWritePending, isTxLoading, isTxSuccess, isWriteError]);

  const handleSyncNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x107d',
          chainName: 'GenLayer Bradbury',
          nativeCurrency: { name: 'GEN Token', symbol: 'GEN', decimals: 18 },
          rpcUrls: ['https://rpc-bradbury.genlayer.com/'],
          blockExplorerUrls: ['https://explorer-bradbury.genlayer.com/'],
        }],
      });
    } catch (e) {
      console.error("Sync error:", e);
    }
  };

  const handleCreateDuel = () => {
    if (!newClaim || !newStake || !currentContractAddress) return;
    
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
    if (!currentContractAddress) return;
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
    setMatchingEvidence('');
  };

  const handleResolveAI = (duelId) => {
    if (!currentContractAddress) return;
    writeContract({
      address: currentContractAddress,
      abi: ORACLE_DUEL_ABI,
      functionName: 'resolve_duel',
      args: [BigInt(duelId)],
      gas: 500_000n,
      gasPrice: 1_000_000_000n,
    });
  };

  return (
    <div className="app-container">
      <header className="flex justify-between items-center my-8 p-6 border-2 border-slate-900 bg-white shadow-[4px_4px_0px_0px_#1E293B]">
        <div 
          onClick={onBackToHome}
          className="flex items-center gap-4 cursor-pointer"
        >
          <Swords size={32} color="#EA580C" />
          <h2 className="text-2xl font-black font-headline uppercase italic tracking-tighter text-slate-900">PVP PREDICTION ARENA</h2>
        </div>
        <nav className="hidden md:flex gap-8 items-center h-full">
          <button 
            onClick={() => onNavigate('home')}
            className="font-headline uppercase tracking-tighter transition-colors duration-75 text-slate-900 hover:bg-orange-600 hover:text-white px-2 py-1"
          >
            HOME
          </button>
          <button 
            className="font-headline uppercase tracking-tighter transition-colors duration-75 text-orange-600 border-b-2 border-orange-600 py-1"
          >
            PLAY
          </button>
          <button 
            onClick={() => onNavigate('about')}
            className="font-headline uppercase tracking-tighter transition-colors duration-75 text-slate-900 hover:bg-orange-600 hover:text-white px-2 py-1"
          >
            ABOUT
          </button>
        </nav>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSyncNetwork}
            className="btn py-2 px-4 text-sm"
          >
            SYNC RPC
          </button>
          <div className={`text-xs font-headline font-bold p-2 border-2 border-slate-900 ${rpcStatus === 'ONLINE' ? 'bg-[#16A34A]' : 'bg-[#DC2626]'} text-white uppercase`}>
            SYS: {rpcStatus}
          </div>
          <div className="border-2 border-slate-900 p-[2px] bg-slate-900">
            <ConnectButton />
          </div>
        </div>
      </header>

      {isWrongNetwork && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card mb-8 flex items-center justify-between border-[#EA580C] shadow-[4px_4px_0px_0px_#EA580C]"
        >
          <span className="font-headline font-bold uppercase flex items-center">
            <AlertCircle size={20} color="#EA580C" className="mr-2" />
            CRITICAL: WRONG NETWORK DETECTED. SWITCH TO BRADBURY (4221).
          </span>
          <button
            onClick={handleSyncNetwork}
            className="btn btn-primary"
          >
            INITIATE SWITCH
          </button>
        </motion.div>
      )}

      {/* Arena Title Section */}
      <section className="bg-white border-2 border-slate-900 p-8 mb-12 shadow-[4px_4px_0px_0px_#1E293B] text-center">
        <h1 className="font-headline font-black text-5xl uppercase italic tracking-tighter text-slate-900 mb-2">BATTLE CENTER</h1>
        <p className="font-headline font-bold text-slate-500 uppercase tracking-widest text-sm">PICK A WINNER. BET TOKENS. WIN BIG.</p>
      </section>

      <main>
        <AnimatePresence>
          {txStatus === 'pending' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="cyber-card mb-8 border-[#2563EB] shadow-[4px_4px_0px_0px_#2563EB]">
              <strong className="font-headline">[ TX_PENDING ]</strong> Awaiting on-chain confirmation...
            </motion.div>
          )}
          {txStatus === 'success' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="cyber-card mb-8 border-[#16A34A] shadow-[4px_4px_0px_0px_#16A34A]">
              <strong className="font-headline">[ TX_SUCCESS ]</strong> Telemetry verified. Transaction complete.
            </motion.div>
          )}
          {txStatus === 'error' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="cyber-card mb-8 border-[#DC2626] shadow-[4px_4px_0px_0px_#DC2626]">
              <strong className="font-headline">[ TX_ERROR ]</strong> {writeError?.shortMessage || "Reverted by node."}
              <button onClick={() => setTxStatus(null)} className="ml-4 bg-transparent border-none text-slate-900 cursor-pointer font-headline font-bold underline">DISMISS</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            {['GAMES', 'MY GAMES', 'HISTORY'].map(tab => (
              <button 
                key={tab}
                className={`btn ${activeTab === tab ? 'btn-primary' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="btn btn-primary flex items-center gap-2" onClick={() => setIsCreating(true)}>
            <PlusCircle size={20} />
            NEW GAME
          </button>
        </div>

        <div className="duel-grid">
          {loading && duels.length === 0 && (
            <div className="cyber-card col-span-full text-center py-12 font-headline font-bold">
              [ LOADING GAMES... ]
            </div>
          )}
          {!loading && duels.length === 0 && (
            <div className="cyber-card col-span-full text-center py-12 font-headline font-bold">
              [ NO GAMES FOUND ]
            </div>
          )}
          
          {duels.filter(d => {
            if (activeTab === 'AVAILABLE') {
              return d.status === 'OPEN' && d.challenger !== address;
            } else if (activeTab === 'MY DUELS') {
              return d.challenger === address || d.opponent === address;
            } else if (activeTab === 'GLOBAL HISTORY') {
              return true;
            }
            return false;
          }).map((duel) => (
            <div key={duel.id} className="cyber-card duel-card flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className={`status-badge status-${duel.status.toLowerCase()}`}>
                  {duel.status}
                </div>
                <div className="font-headline text-xs text-slate-500">ID: {duel.id}</div>
              </div>
              
              <p className="text-xl font-bold mb-8 min-h-[4rem] text-slate-900 leading-tight">
                "{duel.claim}"
              </p>
              
              <div className="mb-6">
                <div className="data-row">
                  <span className="data-label">PLAYER 1:</span>
                  <span className="font-mono">{duel.challenger.slice(0, 8)}...{duel.challenger.slice(-4)}</span>
                </div>
                {duel.opponent && (
                  <div className="data-row">
                    <span className="data-label">PLAYER 2:</span>
                    <span className="font-mono">{duel.opponent.slice(0, 8)}...{duel.opponent.slice(-4)}</span>
                  </div>
                )}
              </div>

              <div className="stake-info">
                <div>
                  <h2 className="text-xl font-headline font-black uppercase text-slate-900">PVP PREDICTION ARENA</h2>
                  <span className="text-3xl font-black font-headline text-slate-900">
                    {formatEther(duel.stake)}
                  </span>
                  <span className="text-xs font-black text-orange-600 ml-1">GEN</span>
                </div>
                
                {duel.status === 'OPEN' && address !== duel.challenger && (
                  <button className="btn btn-primary py-2 px-4" onClick={() => setMatchingDuelId(duel.id)}>PLAY</button>
                )}
                {duel.status === 'MATCHED' && (
                  <button className="btn btn-primary py-2 px-4 bg-slate-900" onClick={() => handleResolveAI(duel.id)}>GET RESULT</button>
                )}
                {(duel.status === 'RESOLVED' || duel.status === 'CLAIMED') && (
                  <div className="py-2 px-4 border-2 border-slate-900 bg-[#FAFAFA] font-headline font-bold text-sm">
                    WINNER: <span className="text-orange-600">{duel.winner === duel.challenger ? 'PLAYER 1' : 'PLAYER 2'}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 bg-white/90 flex items-center justify-center z-[100] backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="cyber-card w-full max-w-[600px] p-12 bg-white shadow-[12px_12px_0px_0px_#EA580C]" 
            >
              <h3 className="mb-8 text-2xl font-black font-headline border-b-2 border-slate-900 pb-4 uppercase italic italic tracking-tighter">START A GAME</h3>
              
              <div className="flex flex-col gap-8">
                <div>
                  <label className="form-label">YOUR PREDICTION</label>
                  <textarea 
                    className="cyber-input" 
                    placeholder="Example: The price of BTC will stay high"
                    rows={4}
                    value={newClaim}
                    onChange={(e) => setNewClaim(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="form-label">BET AMOUNT (GEN)</label>
                  <input 
                    type="number" 
                    className="cyber-input text-2xl font-headline font-black h-[60px]"
                    value={newStake}
                    onChange={(e) => setNewStake(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-4 mt-4">
                  <button className="btn btn-primary flex-[2] p-4" onClick={handleCreateDuel}>SUBMIT GAME</button>
                  <button className="btn flex-1" onClick={() => setIsCreating(false)}>CANCEL</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        
        {matchingDuelId && (
          <div className="fixed inset-0 bg-white/90 flex items-center justify-center z-[100] backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="cyber-card w-full max-w-[600px] p-12 bg-white shadow-[12px_12px_0px_0px_#EA580C]" 
            >
              <h3 className="mb-8 text-2xl font-black font-headline border-b-2 border-slate-900 pb-4 uppercase italic tracking-tighter">JOIN GAME</h3>
              
              <div className="flex flex-col gap-8">
                <div>
                  <label className="form-label">YOUR EVIDENCE (OPTIONAL)</label>
                  <textarea 
                    className="cyber-input" 
                    placeholder="Why are they wrong?"
                    rows={4}
                    value={matchingEvidence}
                    onChange={(e) => setMatchingEvidence(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-4 mt-4">
                  <button className="btn btn-primary flex-[2] p-4" onClick={() => handleMatchStake(matchingDuelId, duels.find(d => d.id === matchingDuelId)?.stake, matchingEvidence)}>JOIN & BET</button>
                  <button className="btn flex-1" onClick={() => { setMatchingDuelId(null); setMatchingEvidence(''); }}>CANCEL</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Arena;
