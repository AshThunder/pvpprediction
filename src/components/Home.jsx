import React from 'react';

const Home = ({ onEnterArena, onNavigate }) => {
  return (
    <div className="bg-surface font-body text-on-surface selection:bg-orange-500 selection:text-white overflow-x-hidden min-h-screen">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-950 flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50 border-b-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_#1E293B]">
        <div className="text-2xl font-black text-slate-900 dark:text-white italic font-['Space_Grotesk'] uppercase tracking-tighter">
          PVP PREDICTION ARENA
        </div>
        
        <div className="hidden md:flex gap-8 items-center h-full">
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
        <section className="relative min-h-[870px] flex items-center overflow-hidden border-b-2 border-slate-900 bg-white">
          <div className="absolute inset-0 grid-pattern pointer-events-none"></div>
          <div className="absolute inset-0 scanline pointer-events-none opacity-20"></div>
          <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="max-w-3xl">
              <div className="inline-block bg-slate-900 text-white px-3 py-1 font-label text-xs tracking-widest mb-6 uppercase">
                STATUS: ONLINE
              </div>
              <h1 className="font-headline font-black text-6xl md:text-8xl leading-none tracking-tighter text-slate-900 mb-8 uppercase italic">
                PREDICT.<br/>PLAY.<br/><span className="text-orange-600">WIN.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 font-medium mb-10 max-w-lg leading-tight border-l-4 border-orange-600 pl-6">
                Challenge others and win tokens with your predictions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onEnterArena}
                  className="bg-[#EA580C] text-white border-2 border-slate-900 font-headline font-black text-xl px-10 py-5 shadow-[6px_6px_0px_0px_#1E293B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-tight"
                >
                  START PLAYING
                </button>
              </div>
            </div>
            
            <div className="hidden md:block relative">
              <div className="border-4 border-slate-900 bg-white p-2 shadow-[12px_12px_0px_0px_#EA580C]">
                <img alt="PVP Prediction Arena" className="w-full h-auto border-2 border-slate-900" src="/hero.png"/>
                <div className="mt-4 flex justify-between font-label text-[10px] text-slate-500 tracking-widest uppercase">
                  <span>UI_PROTOCOL_v.2.0</span>
                  <span>LATENCY: 12ms</span>
                  <span>NODE: ETH_MAIN</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white border-2 border-slate-900 p-4 shadow-[4px_4px_0px_0px_#1E293B]">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-orange-600 animate-pulse"></span>
                  <span className="font-headline font-bold text-slate-900 uppercase">ARENA LIVE</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Stats Ticker */}
        <section className="bg-slate-900 text-white border-b-2 border-slate-900 py-4 overflow-hidden whitespace-nowrap">
          <div className="flex animate-marquee gap-24 items-center">
            <div className="flex gap-24 items-center shrink-0">
              <span className="font-headline font-bold text-xl uppercase flex items-center gap-4 italic tracking-widest">
                <span className="text-orange-500 material-symbols-outlined">bolt</span>
                ON-CHAIN SPEED
              </span>
              <span className="font-headline font-bold text-xl uppercase flex items-center gap-4 italic tracking-widest">
                <span className="text-orange-500 material-symbols-outlined">swords</span>
                REAL-TIME GAMES
              </span>
              <span className="font-headline font-bold text-xl uppercase flex items-center gap-4 italic tracking-widest">
                <span className="text-orange-500 material-symbols-outlined">target</span>
                AI VALIDATED
              </span>
            </div>
            <div className="flex gap-24 items-center shrink-0">
              <span className="font-headline font-bold text-xl uppercase flex items-center gap-4 italic tracking-widest">
                <span className="text-orange-500 material-symbols-outlined">bolt</span>
                ON-CHAIN SPEED
              </span>
              <span className="font-headline font-bold text-xl uppercase flex items-center gap-4 italic tracking-widest">
                <span className="text-orange-500 material-symbols-outlined">swords</span>
                REAL-TIME GAMES
              </span>
              <span className="font-headline font-bold text-xl uppercase flex items-center gap-4 italic tracking-widest">
                <span className="text-orange-500 material-symbols-outlined">target</span>
                AI VALIDATED
              </span>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section className="py-24 px-6 bg-[#eeeeee]">
          <div className="container mx-auto">
            <div className="mb-16">
              <h2 className="font-headline font-black text-4xl uppercase italic tracking-tighter text-slate-900">HOW IT WORKS</h2>
              <div className="w-24 h-2 bg-orange-600 mt-2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Large Card */}
              <div className="md:col-span-8 bg-white border-2 border-slate-900 p-8 shadow-[4px_4px_0px_0px_#1E293B]">
                <span className="font-label text-orange-600 font-bold tracking-widest text-xs uppercase">STEP_01</span>
                <h3 className="font-headline font-black text-3xl mt-4 mb-4 uppercase">SECURE GAMES</h3>
                <p className="text-slate-600 max-w-lg mb-8 leading-relaxed">
                  Every game is handled by code. Our AI network checks the facts to decide the winner fairly.
                </p>
                <div className="flex gap-4">
                  <div className="flex-1 bg-[#f3f3f4] border border-slate-900 p-4">
                    <span className="font-label text-[10px] text-slate-400 block mb-1 uppercase">NETWORK</span>
                    <span className="font-headline font-bold text-slate-900 uppercase">GENLAYER</span>
                  </div>
                  <div className="flex-1 bg-[#f3f3f4] border border-slate-900 p-4">
                    <span className="font-label text-[10px] text-slate-400 block mb-1 uppercase">CHECKER</span>
                    <span className="font-headline font-bold text-slate-900 uppercase">AI PROCTOR</span>
                  </div>
                </div>
              </div>
              
              {/* Side Card */}
              <div className="md:col-span-4 bg-orange-600 border-2 border-slate-900 p-8 shadow-[4px_4px_0px_0px_#1E293B] text-white">
                <span className="font-label text-white/70 font-bold tracking-widest text-xs uppercase">STEP_02</span>
                <h3 className="font-headline font-black text-3xl mt-4 mb-4 uppercase">ALWAYS FAIR</h3>
                <p className="text-white/80 leading-relaxed mb-6">
                  We double-check every result. Multiple AI models agree before a winner is picked.
                </p>
                <div className="aspect-square w-full border-2 border-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              </div>
              
              {/* Small Bottom Card */}
              <div className="md:col-span-4 bg-white border-2 border-slate-900 p-8 shadow-[4px_4px_0px_0px_#1E293B]">
                <h3 className="font-headline font-black text-xl mb-2 uppercase">REWARDS</h3>
                <p className="text-sm text-slate-500 uppercase">Earn points for being right.</p>
              </div>
              
              {/* Wide Bottom Card */}
              <div className="md:col-span-8 bg-slate-900 text-white border-2 border-slate-900 p-8 shadow-[4px_4px_0px_0px_#EA580C] flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="font-headline font-black text-2xl uppercase">READY TO PLAY?</h3>
                  <p className="text-slate-400 uppercase">Click below to start your first game.</p>
                </div>
                <button 
                  onClick={onEnterArena}
                  className="bg-white text-slate-900 border-2 border-white px-8 py-3 font-headline font-black uppercase tracking-tight hover:bg-orange-600 hover:text-white transition-colors duration-150"
                >
                  START
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard Section - Hidden until real data is available */}
        <section className="py-24 px-6 bg-white border-y-2 border-slate-900">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <span className="font-label text-orange-600 font-bold tracking-[0.3em] text-sm mb-4 block uppercase">RANKINGS</span>
              <h2 className="font-headline font-black text-5xl uppercase tracking-tighter text-slate-900 italic">ARENA LEADERS</h2>
              <p className="mt-4 text-slate-500 uppercase font-bold text-sm tracking-widest">[ SYNCING WITH BLOCKCHAIN... ]</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 bg-[#eeeeee] relative">
          <div className="absolute inset-0 grid-pattern pointer-events-none opacity-10"></div>
          <div className="container mx-auto relative z-10">
            <div className="bg-white border-4 border-slate-900 p-12 md:p-20 shadow-[16px_16px_0px_0px_#EA580C] text-center max-w-4xl mx-auto">
              <h2 className="font-headline font-black text-5xl md:text-7xl uppercase italic tracking-tighter mb-8 text-slate-900">
                START<br/>WINNING
              </h2>
              <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-tight uppercase font-medium">
                Make your predictions, bet your tokens, and win the game.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <button 
                  onClick={onEnterArena}
                  className="bg-[#EA580C] text-white border-2 border-slate-900 font-headline font-black text-xl px-12 py-5 shadow-[6px_6px_0px_0px_#1E293B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-tight"
                >
                  START NOW
                </button>
                <button className="bg-white text-slate-900 border-2 border-slate-900 font-headline font-black text-xl px-12 py-5 shadow-[6px_6px_0px_0px_#1E293B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-tight hover:bg-slate-900 hover:text-white">
                  LEARN MORE
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t-2 border-slate-900 dark:border-slate-100 w-full px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start text-slate-900 uppercase">
          <div className="text-lg font-bold font-headline">PVP PREDICTION ARENA</div>
          <p className="font-['Space_Grotesk'] text-xs text-slate-500 mt-1">©2026 PVP PREDICTION ARENA. SYSTEM STATUS: OPERATIONAL.</p>
        </div>
        <div className="flex gap-8">
          <a className="font-['Space_Grotesk'] text-xs uppercase text-slate-500 hover:underline hover:text-orange-600 transition-all duration-150" href="#">TERMINAL</a>
          <a className="font-['Space_Grotesk'] text-xs uppercase text-slate-500 hover:underline hover:text-orange-600 transition-all duration-150" href="#">GOVERNANCE</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
