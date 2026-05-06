import React from 'react';
import { Swords, Shield, Layers, Cpu, Zap, ArrowRight, CheckCircle2, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const About = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* TopNavBar */}
      <header className="bg-white/95 backdrop-blur-sm border-b-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] flex justify-between items-center w-full px-6 py-4 sticky top-0 z-50">
        <div 
          onClick={() => onNavigate('home')}
          className="text-2xl font-black text-slate-900 uppercase font-headline tracking-tighter cursor-pointer flex items-center gap-2"
        >
          <Swords size={28} className="text-orange-600" />
          PVP PREDICTION ARENA
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <button 
            onClick={() => onNavigate('home')}
            className="font-headline uppercase tracking-tighter text-slate-900 hover:text-orange-600 px-2 py-1 transition-all font-bold"
          >
            HOME
          </button>
          <button 
            onClick={() => onNavigate('arena')}
            className="font-headline uppercase tracking-tighter text-slate-900 hover:text-orange-600 px-2 py-1 transition-all font-bold"
          >
            PLAY
          </button>
          <button 
            className="font-headline uppercase tracking-tighter text-orange-600 border-b-2 border-orange-600 px-2 py-1 font-bold"
          >
            ABOUT
          </button>
        </nav>
        <button 
          onClick={() => onNavigate('arena')}
          className="bg-[#EA580C] text-white border-2 border-slate-900 px-6 py-2 font-headline font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
        >
          START NOW
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24 border-2 border-slate-900 p-8 md:p-16 bg-white shadow-[8px_8px_0px_0px_rgba(30,41,59,1)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 font-label text-xs opacity-20 select-none">
            v3.0 // SYSTEM: ONLINE
          </div>
          <div className="relative z-10">
            <span className="inline-block bg-[#EA580C] text-white px-3 py-1 font-label text-xs font-bold uppercase tracking-widest mb-6 border border-slate-900">
              LEARN MORE
            </span>
            <h1 className="text-5xl md:text-8xl font-headline font-black uppercase tracking-tighter text-slate-900 leading-none mb-6">
              HOW THE <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-500">ARENA</span> WORKS
            </h1>
            <p className="text-xl md:text-2xl font-headline font-medium text-slate-600 uppercase tracking-tight max-w-3xl border-l-4 border-[#EA580C] pl-6 py-2">
              Fair, Transparent, and Decided by Decentralized AI
            </p>
          </div>
          
          {/* Visual diagram replacing the empty placeholder */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { label: 'CHALLENGER', sub: 'Stakes GEN', color: 'bg-orange-600' },
              { label: 'SMART CONTRACT', sub: 'Holds & Routes', color: 'bg-slate-900' },
              { label: 'AI CONSENSUS', sub: 'Decides Winner', color: 'bg-emerald-600' },
            ].map((item, idx) => (
              <motion.div 
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.15 }}
                className={`${item.color} text-white p-6 border-2 border-slate-900 flex flex-col items-center justify-center text-center`}
              >
                <div className="font-headline font-black text-lg mb-1 uppercase">{item.label}</div>
                <div className="text-xs opacity-80 font-bold uppercase tracking-wider">{item.sub}</div>
                {idx < 2 && (
                  <ArrowRight size={20} className="absolute right-[-14px] text-slate-900 hidden md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Vision Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-headline font-black uppercase border-b-4 border-slate-900 inline-block pb-2">OUR VISION</h2>
            <div className="font-body text-lg leading-relaxed text-slate-800 space-y-4">
              <p>
                We are building the most honest way to play. The Prediction Arena isn't just about winning; it's about a fair system where results are based on real facts.
              </p>
              <p>
                By using decentralized AI consensus to verify every result, we ensure that every duel is fair for everyone. No middlemen, no manipulation — just pure code and real-world outcomes.
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="border-2 border-slate-900 p-8 bg-[#fafafa] shadow-[6px_6px_0px_0px_rgba(30,41,59,1)]"
          >
            <div className="flex items-center gap-4 mb-4">
              <Shield size={40} className="text-[#EA580C]" />
              <span className="font-headline font-black text-xl uppercase tracking-widest">FAIR PLAY GUARANTEE</span>
            </div>
            <div className="h-1 bg-slate-900 mb-6"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-900 p-4 bg-white">
                <div className="text-2xl font-headline font-black text-[#EA580C]">100%</div>
                <div className="text-[10px] font-label font-bold uppercase text-slate-500">ON-CHAIN</div>
              </div>
              <div className="border border-slate-900 p-4 bg-white">
                <div className="text-2xl font-headline font-black text-green-600 flex items-center gap-1">
                  <CheckCircle2 size={20} /> LIVE
                </div>
                <div className="text-[10px] font-label font-bold uppercase text-slate-500">SYSTEM STATUS</div>
              </div>
              <div className="border border-slate-900 p-4 bg-white">
                <div className="text-2xl font-headline font-black text-blue-600 flex items-center gap-1">
                  <Globe size={14} /> OPEN
                </div>
                <div className="text-[10px] font-label font-bold uppercase text-slate-500">ACCESS</div>
              </div>
              <div className="border border-slate-900 p-4 bg-white">
                <div className="text-2xl font-headline font-black text-slate-900 flex items-center gap-1">
                  <Lock size={14} /> SECURE
                </div>
                <div className="text-[10px] font-label font-bold uppercase text-slate-500">SMART CONTRACT</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* System Architecture */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="font-label text-orange-600 font-bold tracking-[0.3em] text-xs mb-3 block uppercase">ARCHITECTURE</span>
            <h2 className="text-3xl font-headline font-black uppercase mb-12 tracking-tighter">HOW IT'S BUILT</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Layers, title: 'GENLAYER BLOCKCHAIN', desc: 'A purpose-built L1 that natively supports AI-powered smart contracts with multi-node consensus validation.', tag: 'INFRASTRUCTURE' },
              { icon: Cpu, title: 'AI ORACLE NETWORK', desc: 'Multiple independent AI nodes evaluate claims using real-world data sources, then reach consensus on the outcome.', tag: 'VALIDATION' },
              { icon: Zap, title: 'INSTANT SETTLEMENT', desc: 'Once AI consensus is reached, tokens are automatically routed to the winner\'s wallet in the same transaction.', tag: 'PAYOUTS' },
            ].map((card, idx) => (
              <motion.div 
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="border-2 border-slate-900 p-8 bg-white shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] hover:shadow-[6px_6px_0px_0px_#EA580C] transition-all duration-200 group"
              >
                <div className="mb-6 w-12 h-12 bg-slate-900 text-white flex items-center justify-center group-hover:bg-[#EA580C] transition-colors">
                  <card.icon size={24} />
                </div>
                <h3 className="text-2xl font-headline font-black uppercase mb-4 tracking-tighter">{card.title}</h3>
                <p className="font-body text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                <div className="mt-8 font-label text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.tag}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Core Principles */}
        <section className="mb-24">
          <div className="bg-slate-900 text-white p-12 relative shadow-[8px_8px_0px_0px_#EA580C] overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <h2 className="text-4xl font-headline font-black uppercase mb-12 text-center italic tracking-tight">WHY PLAY HERE?</h2>
            <div className="space-y-0 max-w-4xl mx-auto">
              {[
                { num: '01', title: 'FULLY TRANSPARENT', desc: 'Every duel, every stake, every resolution is recorded on-chain. Verify anything on the block explorer.' },
                { num: '02', title: 'NO MIDDLEMEN', desc: 'You play directly against others. The smart contract holds funds and AI determines the winner. No house edge.' },
                { num: '03', title: 'AI CONSENSUS', desc: 'Multiple independent AI nodes must agree on the outcome. No single point of failure or manipulation.' },
              ].map((item, idx) => (
                <motion.div 
                  key={item.num}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col md:flex-row items-center border-t border-white/20 py-8 gap-8 group"
                >
                  <span className="text-7xl font-headline font-black text-[#EA580C] opacity-40 group-hover:opacity-100 transition-opacity select-none">{item.num}.</span>
                  <div>
                    <h4 className="text-2xl font-headline font-bold uppercase mb-2">{item.title}</h4>
                    <p className="text-slate-400 font-body max-w-2xl text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-4 border-slate-900 p-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-[#EA580C] text-white shadow-[8px_8px_0px_0px_#1E293B] mb-12"
        >
          <div>
            <h3 className="text-4xl font-headline font-black uppercase tracking-tighter italic">READY TO START?</h3>
            <p className="font-body font-medium text-lg uppercase opacity-90 mt-2">Enter the arena and make your first prediction.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('arena')}
            className="bg-white text-slate-900 border-2 border-slate-900 px-10 py-5 font-headline font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl flex items-center gap-3 group"
          >
            LAUNCH ARENA
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white w-full py-12 px-6 border-t-2 border-slate-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-xl font-black uppercase font-headline tracking-tighter flex items-center gap-2">
              <Swords size={20} className="text-orange-600" />
              PVP PREDICTION ARENA
            </div>
            <div className="font-headline text-xs font-bold uppercase text-slate-500 mt-2">
              ©2026 PVP ARENA // POWERED BY GENLAYER
            </div>
          </div>
          <div className="flex flex-wrap gap-8 md:justify-end">
            <a onClick={() => onNavigate('arena')} className="font-headline text-xs font-bold uppercase text-slate-400 hover:text-orange-500 cursor-pointer transition-colors">PLAY</a>
            <a onClick={() => onNavigate('home')} className="font-headline text-xs font-bold uppercase text-slate-400 hover:text-orange-500 cursor-pointer transition-colors">HOME</a>
            <a href="https://explorer-bradbury.genlayer.com" target="_blank" rel="noreferrer" className="font-headline text-xs font-bold uppercase text-slate-400 hover:text-orange-500 transition-colors">EXPLORER ↗</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
