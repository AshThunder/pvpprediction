import React, { useState, useEffect } from 'react';
import { Swords, Zap, Shield, Trophy, ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count}{suffix}</span>;
};

const Home = ({ onEnterArena, onNavigate }) => {
  return (
    <div className="bg-white font-body text-on-surface selection:bg-orange-500 selection:text-white overflow-x-hidden min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50 border-b-2 border-slate-900 shadow-[4px_4px_0px_0px_#1E293B]">
        <div className="text-2xl font-black text-slate-900 italic font-['Space_Grotesk'] uppercase tracking-tighter flex items-center gap-2">
          <Swords size={28} className="text-orange-600" />
          PVP PREDICTION ARENA
        </div>
        
        <div className="hidden md:flex gap-8 items-center h-full">
          <button 
            className="font-headline uppercase tracking-tighter transition-colors duration-75 text-orange-600 border-b-2 border-orange-600 py-1 font-bold"
          >
            HOME
          </button>
          <button 
            onClick={onEnterArena}
            className="font-headline uppercase tracking-tighter transition-colors duration-75 text-slate-900 hover:text-orange-600 py-1 font-bold"
          >
            PLAY
          </button>
          <button 
            onClick={() => onNavigate('about')}
            className="font-headline uppercase tracking-tighter transition-colors duration-75 text-slate-900 hover:text-orange-600 py-1 font-bold"
          >
            ABOUT
          </button>
        </div>
        
        <button 
          onClick={onEnterArena}
          className="bg-[#EA580C] text-white border-2 border-slate-900 font-['Space_Grotesk'] font-bold px-6 py-2 shadow-[4px_4px_0px_0px_#1E293B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-75"
        >
          START NOW
        </button>
      </nav>

      <main className="mt-[74px]">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b-2 border-slate-900 bg-white">
          <div className="absolute inset-0 grid-pattern pointer-events-none"></div>
          <div className="absolute inset-0 scanline pointer-events-none opacity-20"></div>
          
          {/* Animated background accents */}
          <motion.div 
            animate={{ rotate: [0, 360] }} 
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="absolute -right-64 -top-64 w-[600px] h-[600px] border-2 border-orange-200/20 rounded-full pointer-events-none"
          />
          <motion.div 
            animate={{ rotate: [360, 0] }} 
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            className="absolute -left-32 -bottom-32 w-[400px] h-[400px] border-2 border-slate-200/30 rounded-full pointer-events-none"
          />

          <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 font-label text-xs tracking-widest mb-6 uppercase">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                STATUS: ONLINE — BRADBURY TESTNET
              </div>
              <h1 className="font-headline font-black text-6xl md:text-8xl leading-[0.9] tracking-tighter text-slate-900 mb-8 uppercase italic">
                PREDICT.<br/>STAKE.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-500">WIN.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 font-medium mb-10 max-w-lg leading-tight border-l-4 border-orange-600 pl-6">
                Challenge anyone. Stake tokens. Let AI decide who's right.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onEnterArena}
                  className="bg-[#EA580C] text-white border-2 border-slate-900 font-headline font-black text-xl px-10 py-5 shadow-[6px_6px_0px_0px_#1E293B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-tight flex items-center gap-3 justify-center group"
                >
                  ENTER ARENA
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('about')}
                  className="bg-white text-slate-900 border-2 border-slate-900 font-headline font-black text-xl px-10 py-5 shadow-[6px_6px_0px_0px_#1E293B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-tight hover:bg-slate-50"
                >
                  HOW IT WORKS
                </motion.button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:block relative"
            >
              <div className="border-4 border-slate-900 bg-white p-2 shadow-[12px_12px_0px_0px_#EA580C] hover:shadow-[16px_16px_0px_0px_#EA580C] transition-all duration-300">
                <img alt="PVP Prediction Arena" className="w-full h-auto border-2 border-slate-900" src="/hero.png"/>
                <div className="mt-4 flex justify-between font-label text-[10px] text-slate-500 tracking-widest uppercase">
                  <span>UI_PROTOCOL_v.3.0</span>
                  <span>LATENCY: 12ms</span>
                  <span>NET: BRADBURY</span>
                </div>
              </div>
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-white border-2 border-slate-900 p-4 shadow-[4px_4px_0px_0px_#1E293B]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-green-500 animate-pulse rounded-sm"></span>
                  <span className="font-headline font-bold text-slate-900 uppercase">ARENA LIVE</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Live Stats Ticker */}
        <section className="bg-slate-900 text-white border-b-2 border-slate-900 py-4 overflow-hidden whitespace-nowrap">
          <div className="flex animate-marquee gap-24 items-center">
            <div className="flex gap-24 items-center shrink-0">
              <span className="font-headline font-bold text-xl uppercase flex items-center gap-4 italic tracking-widest">
                <Zap size={20} className="text-orange-500" />
                ON-CHAIN SPEED
              </span>
              <span className="font-headline font-bold text-xl uppercase flex items-center gap-4 italic tracking-widest">
                <Swords size={20} className="text-orange-500" />
                PVP PREDICTIONS
              </span>
              <span className="font-headline font-bold text-xl uppercase flex items-center gap-4 italic tracking-widest">
                <Shield size={20} className="text-orange-500" />
                AI VALIDATED
              </span>
              <span className="font-headline font-bold text-xl uppercase flex items-center gap-4 italic tracking-widest">
                <Trophy size={20} className="text-orange-500" />
                WIN TOKENS
              </span>
            </div>
            <div className="flex gap-24 items-center shrink-0">
              <span className="font-headline font-bold text-xl uppercase flex items-center gap-4 italic tracking-widest">
                <Zap size={20} className="text-orange-500" />
                ON-CHAIN SPEED
              </span>
              <span className="font-headline font-bold text-xl uppercase flex items-center gap-4 italic tracking-widest">
                <Swords size={20} className="text-orange-500" />
                PVP PREDICTIONS
              </span>
              <span className="font-headline font-bold text-xl uppercase flex items-center gap-4 italic tracking-widest">
                <Shield size={20} className="text-orange-500" />
                AI VALIDATED
              </span>
              <span className="font-headline font-bold text-xl uppercase flex items-center gap-4 italic tracking-widest">
                <Trophy size={20} className="text-orange-500" />
                WIN TOKENS
              </span>
            </div>
          </div>
        </section>

        {/* How It Works — Numbered Steps */}
        <section className="py-24 px-6 bg-[#fafafa]">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <span className="font-label text-orange-600 font-bold tracking-[0.3em] text-xs mb-3 block uppercase">THE PROCESS</span>
              <h2 className="font-headline font-black text-4xl md:text-5xl uppercase italic tracking-tighter text-slate-900">HOW IT WORKS</h2>
              <div className="w-24 h-1.5 bg-orange-600 mt-4"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'MAKE A CLAIM', desc: 'Post a verifiable prediction and stake GEN tokens. Challenge anyone or target a specific opponent.', icon: Swords, accent: 'bg-orange-600' },
                { step: '02', title: 'GET MATCHED', desc: 'An opponent stakes the same amount against your claim. Both sides lock tokens into the smart contract.', icon: Shield, accent: 'bg-blue-600' },
                { step: '03', title: 'AI DECIDES', desc: 'GenLayer\'s decentralized AI network evaluates the claim using real-world data. Winner takes the pot.', icon: Trophy, accent: 'bg-emerald-600' },
              ].map((item, idx) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="bg-white border-2 border-slate-900 p-8 shadow-[6px_6px_0px_0px_#1E293B] hover:shadow-[8px_8px_0px_0px_#EA580C] transition-all duration-200 group relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 ${item.accent} text-white w-14 h-14 flex items-center justify-center font-headline font-black text-lg border-l-2 border-b-2 border-slate-900`}>
                    {item.step}
                  </div>
                  <div className="w-14 h-14 bg-slate-900 text-white flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
                    <item.icon size={28} />
                  </div>
                  <h3 className="font-headline font-black text-2xl mb-3 uppercase tracking-tighter">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6 bg-slate-900 text-white border-y-2 border-slate-900">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Network', value: 'GenLayer', sub: 'BRADBURY TESTNET' },
                { label: 'Resolution', value: 'AI', sub: 'MULTI-NODE CONSENSUS' },
                { label: 'Settlement', value: 'Instant', sub: 'ON-CHAIN PAYOUTS' },
                { label: 'Fees', value: '2%', sub: 'PLATFORM FEE' },
              ].map((stat, idx) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center p-6 border border-slate-700 hover:border-orange-600 transition-colors"
                >
                  <div className="font-headline font-black text-3xl md:text-4xl text-orange-500 mb-1">{stat.value}</div>
                  <div className="font-headline font-bold text-sm uppercase tracking-wider mb-1">{stat.label}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest">{stat.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 bg-[#fafafa] relative">
          <div className="absolute inset-0 grid-pattern pointer-events-none opacity-5"></div>
          <div className="container mx-auto relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white border-4 border-slate-900 p-12 md:p-20 shadow-[16px_16px_0px_0px_#EA580C] text-center max-w-4xl mx-auto relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 font-label text-[10px] text-slate-300 uppercase tracking-widest">READY_STATE:TRUE</div>
              <h2 className="font-headline font-black text-5xl md:text-7xl uppercase italic tracking-tighter mb-4 text-slate-900">
                ENTER THE<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-500">ARENA</span>
              </h2>
              <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed uppercase font-medium">
                Your predictions. Your stakes. Verified by AI.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onEnterArena}
                  className="bg-[#EA580C] text-white border-2 border-slate-900 font-headline font-black text-xl px-12 py-5 shadow-[6px_6px_0px_0px_#1E293B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-tight flex items-center gap-3 justify-center group"
                >
                  START NOW
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigate('about')}
                  className="bg-white text-slate-900 border-2 border-slate-900 font-headline font-black text-xl px-12 py-5 shadow-[6px_6px_0px_0px_#1E293B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-tight hover:bg-slate-900 hover:text-white"
                >
                  LEARN MORE
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t-2 border-slate-900 w-full px-6 py-12">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-xl font-black font-headline uppercase tracking-tighter flex items-center gap-2">
              <Swords size={20} className="text-orange-600" />
              PVP PREDICTION ARENA
            </div>
            <p className="font-['Space_Grotesk'] text-xs text-slate-500 mt-2">©2026 PVP PREDICTION ARENA. POWERED BY GENLAYER.</p>
          </div>
          <div className="flex gap-8">
            <a onClick={() => onNavigate('arena')} className="font-['Space_Grotesk'] text-xs uppercase text-slate-400 hover:text-orange-500 transition-all duration-150 cursor-pointer font-bold">ARENA</a>
            <a onClick={() => onNavigate('about')} className="font-['Space_Grotesk'] text-xs uppercase text-slate-400 hover:text-orange-500 transition-all duration-150 cursor-pointer font-bold">ABOUT</a>
            <a href="https://explorer-bradbury.genlayer.com" target="_blank" rel="noreferrer" className="font-['Space_Grotesk'] text-xs uppercase text-slate-400 hover:text-orange-500 transition-all duration-150 font-bold">EXPLORER ↗</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
