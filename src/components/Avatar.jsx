import React from 'react';

const Avatar = ({ address, size = "w-6 h-6", textSize = "text-[10px]" }) => {
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return (
      <div className={`${size} rounded-full flex items-center justify-center bg-slate-200 border-2 border-slate-300 text-slate-400 font-bold ${textSize}`}>
        ?
      </div>
    );
  }

  const colors = [
    'bg-red-500 text-white', 
    'bg-orange-500 text-white', 
    'bg-amber-400 text-black', 
    'bg-green-500 text-white', 
    'bg-emerald-400 text-black',
    'bg-teal-500 text-white',
    'bg-cyan-400 text-black',
    'bg-blue-500 text-white',
    'bg-indigo-500 text-white',
    'bg-violet-500 text-white',
    'bg-fuchsia-500 text-white',
    'bg-pink-500 text-white',
    'bg-rose-400 text-black'
  ];

  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  const colorClass = colors[index];
  
  const short = address.slice(-2).toUpperCase();

  return (
    <div className={`${size} rounded-full flex items-center justify-center font-black ${textSize} ${colorClass} border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]`}>
      {short}
    </div>
  );
};

export default Avatar;
