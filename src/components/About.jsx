import React from 'react';
import { Swords, Info, Shield, Layers, Cpu, Zap } from 'lucide-react';

const About = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* TopNavBar */}
      <header className="bg-white border-b-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] flex justify-between items-center w-full px-6 py-4 sticky top-0 z-50">
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
            className="font-headline uppercase tracking-tighter text-slate-900 hover:bg-orange-600 hover:text-white px-2 py-1 transition-all"
          >
            HOME
          </button>
          <button 
            onClick={() => onNavigate('arena')}
            className="font-headline uppercase tracking-tighter text-slate-900 hover:bg-orange-600 hover:text-white px-2 py-1 transition-all"
          >
            PLAY
          </button>
          <button 
            className="font-headline uppercase tracking-tighter text-orange-600 border-b-2 border-orange-600 px-2 py-1"
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
        <section className="mb-24 border-2 border-slate-900 p-8 md:p-16 bg-white shadow-[8px_8px_0px_0px_rgba(30,41,59,1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 font-label text-xs opacity-20 select-none">
            v2.0 // SYSTEM: ONLINE
          </div>
          <div className="relative z-10">
            <span className="inline-block bg-[#EA580C] text-white px-3 py-1 font-label text-xs font-bold uppercase tracking-widest mb-6 border border-slate-900">
              LEARN MORE
            </span>
            <h1 className="text-5xl md:text-8xl font-headline font-black uppercase tracking-tighter text-slate-900 leading-none mb-6">
              HOW THE <br/>GAMES WORK
            </h1>
            <p className="text-xl md:text-3xl font-headline font-medium text-slate-600 uppercase tracking-tight max-w-3xl border-l-4 border-[#EA580C] pl-6 py-2">
              Fair, Social, and Decided by AI
            </p>
          </div>
          <div className="mt-12 h-64 w-full border-2 border-slate-900 overflow-hidden bg-slate-100 flex items-center justify-center grayscale contrast-125 opacity-90">
             <div className="text-slate-300 transform rotate-[-5deg] font-black text-9xl opacity-20 select-none uppercase tracking-tighter">ARENA PRO</div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-headline font-black uppercase border-b-4 border-slate-900 inline-block pb-2">OUR VISION</h2>
            <div className="font-body text-lg leading-relaxed text-slate-800 space-y-4">
              <p>
                We are building the most honest way to play. The Prediction Arena isn't just about winning; it's about a fair system where results are based on real facts.
              </p>
              <p>
                By using AI to check every result, we make sure that every game is fair for everyone. No people in the middle, just pure code and real outcomes to power a better way to play.
              </p>
            </div>
          </div>
          <div className="border-2 border-slate-900 p-8 bg-[#eeeeee] shadow-[6px_6px_0px_0px_rgba(30,41,59,1)]">
            <div className="flex items-center gap-4 mb-4">
              <Shield size={40} className="text-[#EA580C]" />
              <span className="font-headline font-black text-xl uppercase tracking-widest">FAIR PLAY ONLY</span>
            </div>
            <div className="h-1 bg-slate-900 mb-6"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-900 p-4 bg-white">
                <div className="text-2xl font-headline font-black text-[#EA580C]">100%</div>
                <div className="text-[10px] font-label font-bold uppercase text-slate-500">FAIR RESULTS</div>
              </div>
              <div className="border border-slate-900 p-4 bg-white">
                <div className="text-2xl font-headline font-black text-[#EA580C]">LIVE</div>
                <div className="text-[10px] font-label font-bold uppercase text-slate-500">SYSTEM STATUS</div>
              </div>
            </div>
          </div>
        </section>

        {/* System Architecture (Bento Style) */}
        <section className="mb-24">
          <h2 className="text-3xl font-headline font-black uppercase mb-12 flex items-center gap-4">
            <Info size={32} /> HOW IT'S BUILT
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="border-2 border-slate-900 p-8 bg-white shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all group">
              <div className="mb-6 w-12 h-12 bg-slate-900 text-white flex items-center justify-center group-hover:bg-[#EA580C] transition-colors">
                <Layers size={24} />
              </div>
              <h3 className="text-2xl font-headline font-black uppercase mb-4 tracking-tighter">GENLAYER BLOCKCHAIN</h3>
              <p className="font-body text-sm text-slate-600 leading-relaxed">
                Everything runs on a high-speed network that keeps fees low and games fast.
              </p>
              <div className="mt-8 font-label text-[10px] font-bold text-slate-400 uppercase tracking-widest">TECH // SCALABILITY</div>
            </div>
            {/* Card 2 */}
            <div className="border-2 border-slate-900 p-8 bg-white shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all group">
              <div className="mb-6 w-12 h-12 bg-slate-900 text-white flex items-center justify-center group-hover:bg-[#EA580C] transition-colors">
                <Cpu size={24} />
              </div>
              <h3 className="text-2xl font-headline font-black uppercase mb-4 tracking-tighter">AI CHECKER</h3>
              <p className="font-body text-sm text-slate-600 leading-relaxed">
                Our smart AI checks multiple news sources to confirm who really won each game.
              </p>
              <div className="mt-8 font-label text-[10px] font-bold text-slate-400 uppercase tracking-widest">VALIDATION // AI</div>
            </div>
            {/* Card 3 */}
            <div className="border-2 border-slate-900 p-8 bg-white shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all group">
              <div className="mb-6 w-12 h-12 bg-slate-900 text-white flex items-center justify-center group-hover:bg-[#EA580C] transition-colors">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-headline font-black uppercase mb-4 tracking-tighter">SECURE PAYOUTS</h3>
              <p className="font-body text-sm text-slate-600 leading-relaxed">
                Once a game ends, tokens are sent automatically to the winner's wallet.
              </p>
              <div className="mt-8 font-label text-[10px] font-bold text-slate-400 uppercase tracking-widest">WINNINGS // SECURE</div>
            </div>
          </div>
        </section>

        {/* Core Principles */}
        <section className="mb-24">
          <div className="bg-slate-900 text-white p-12 relative shadow-[8px_8px_0px_0px_#EA580C]">
            <h2 className="text-4xl font-headline font-black uppercase mb-12 text-center italic tracking-tight">WHY PLAY HERE?</h2>
            <div className="space-y-0">
              {/* Principle 1 */}
              <div className="flex flex-col md:flex-row items-center border-t border-white/20 py-8 gap-8 group">
                <span className="text-7xl font-headline font-black text-[#EA580C] opacity-50 group-hover:opacity-100 transition-opacity">01.</span>
                <div>
                  <h4 className="text-2xl font-headline font-bold uppercase mb-2">100% CLEAR</h4>
                  <p className="text-slate-400 font-body max-w-2xl uppercase text-sm">Every game and every result is public. Use the block explorer to see everything happening live.</p>
                </div>
              </div>
              {/* Principle 2 */}
              <div className="flex flex-col md:flex-row items-center border-t border-white/20 py-8 gap-8 group">
                <span className="text-7xl font-headline font-black text-[#EA580C] opacity-50 group-hover:opacity-100 transition-opacity">02.</span>
                <div>
                  <h4 className="text-2xl font-headline font-bold uppercase mb-2">NO MIDDLEMEN</h4>
                  <p className="text-slate-400 font-body max-w-2xl uppercase text-sm">You play directly against others. There is no house taking your money. The code handles it all.</p>
                </div>
              </div>
              {/* Principle 3 */}
              <div className="flex flex-col md:flex-row items-center border-t border-y border-white/20 py-8 gap-8 group">
                <span className="text-7xl font-headline font-black text-[#EA580C] opacity-50 group-hover:opacity-100 transition-opacity">03.</span>
                <div>
                  <h4 className="text-2xl font-headline font-bold uppercase mb-2">RELIABLE DATA</h4>
                  <p className="text-slate-400 font-body max-w-2xl uppercase text-sm">We use the best data feeds to ensure every game has a clear, factual winner.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Terminal Status CTA */}
        <section className="border-4 border-slate-900 p-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-[#EA580C] text-white shadow-[8px_8px_0px_0px_#1E293B]">
          <div>
            <h3 className="text-4xl font-headline font-black uppercase tracking-tighter italic">READY TO START?</h3>
            <p className="font-body font-bold text-xl uppercase opacity-90">Enter the arena and make your first prediction.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => onNavigate('arena')}
              className="bg-white text-slate-900 border-2 border-slate-900 px-10 py-5 font-headline font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl"
            >
              LAUNCH ARENA
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-6 grid grid-cols-1 md:grid-cols-2 items-center gap-4 mt-auto bg-white border-t-2 border-slate-900">
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-black text-slate-900 uppercase font-headline tracking-tighter">
            PVP PREDICTION ARENA
          </div>
          <div className="font-headline text-xs font-bold uppercase text-slate-500">
            ©2026 PVP ARENA // STATUS: OPERATIONAL
          </div>
        </div>
        <div className="flex flex-wrap gap-8 md:justify-end">
          <a className="font-headline text-xs font-bold uppercase text-slate-500 hover:text-orange-600 underline underline-offset-4 transition-colors duration-150" href="#">NEWS</a>
          <a className="font-headline text-xs font-bold uppercase text-slate-500 hover:text-orange-600 underline underline-offset-4 transition-colors duration-150" href="#">HELP</a>
          <a className="font-headline text-xs font-bold uppercase text-slate-500 hover:text-orange-600 underline underline-offset-4 transition-colors duration-150" href="#">LEGAL</a>
        </div>
      </footer>
    </div>
  );
};

export default About;
