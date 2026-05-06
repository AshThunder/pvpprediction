import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatEther } from 'viem';
import { Swords, Shield, Trophy, DollarSign, XCircle } from 'lucide-react';

const EVENT_ICONS = {
  CREATED: { icon: Swords, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'created a duel' },
  MATCHED: { icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'accepted a challenge' },
  RESOLVED: { icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'won a battle' },
  CLAIMED: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'claimed winnings' },
  CANCELLED: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 border-red-200', label: 'cancelled a duel' },
};

const shortenAddress = (addr) => {
  if (!addr || addr === '0x0000000000000000000000000000000000000000') return 'Unknown';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

const ActivityFeed = ({ duels = [] }) => {
  const events = useMemo(() => {
    const items = [];
    
    duels.forEach(duel => {
      const stake = duel.stake ? formatEther(duel.stake) : '0';
      
      // Every duel was created
      items.push({
        type: 'CREATED',
        address: duel.challenger,
        detail: `${stake} GEN`,
        duelId: duel.id,
        priority: 1,
      });

      // If matched
      if (duel.opponent && duel.opponent !== '0x0000000000000000000000000000000000000000') {
        items.push({
          type: 'MATCHED',
          address: duel.opponent,
          detail: `${stake} GEN`,
          duelId: duel.id,
          priority: 2,
        });
      }

      // If resolved
      if (duel.status === 'RESOLVED' || duel.status === 'CLAIMED') {
        items.push({
          type: 'RESOLVED',
          address: duel.winner,
          detail: `${(parseFloat(stake) * 2 * 0.98).toFixed(2)} GEN`,
          duelId: duel.id,
          priority: 3,
        });
      }

      // If claimed
      if (duel.status === 'CLAIMED') {
        items.push({
          type: 'CLAIMED',
          address: duel.winner,
          detail: `${(parseFloat(stake) * 2 * 0.98).toFixed(2)} GEN`,
          duelId: duel.id,
          priority: 4,
        });
      }

      // If cancelled
      if (duel.status === 'CANCELLED') {
        items.push({
          type: 'CANCELLED',
          address: duel.challenger,
          detail: `${stake} GEN refunded`,
          duelId: duel.id,
          priority: 3,
        });
      }
    });

    // Sort by priority descending (most recent events first) then by duel ID descending
    return items
      .sort((a, b) => {
        if (b.duelId !== a.duelId) return Number(b.duelId) - Number(a.duelId);
        return b.priority - a.priority;
      })
      .slice(0, 20); // Max 20 events
  }, [duels]);

  if (events.length === 0) {
    return (
      <div className="mb-8 border-2 border-slate-900 bg-white overflow-hidden shadow-[4px_4px_0px_0px_#1E293B]">
        <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Arena Feed</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 uppercase">awaiting events</span>
        </div>
        <div className="py-4 px-4 text-center bg-gradient-to-r from-slate-50 to-orange-50/30">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            ⚡ Waiting for arena activity... Create the first duel!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 border-2 border-slate-900 bg-white overflow-hidden shadow-[4px_4px_0px_0px_#1E293B]">
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Arena Feed</span>
        </div>
        <span className="text-[9px] font-mono text-green-400 uppercase tracking-wider">{events.length} events</span>
      </div>
      <div className="overflow-x-auto bg-gradient-to-r from-slate-50 to-orange-50/20">
        <div className="flex gap-0 animate-marquee whitespace-nowrap py-2.5">
          <AnimatePresence>
            {events.map((evt, idx) => {
              const config = EVENT_ICONS[evt.type] || EVENT_ICONS.CREATED;
              const Icon = config.icon;
              return (
                <motion.div
                  key={`${evt.duelId}-${evt.type}-${idx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`inline-flex items-center gap-2 px-4 py-1.5 mx-1 border ${config.bg} shrink-0 rounded-sm`}
                >
                  <Icon size={12} className={config.color} />
                  <span className="text-[11px] font-bold text-slate-700">
                    <span className="font-black text-slate-900">{shortenAddress(evt.address)}</span>
                    {' '}{config.label}
                  </span>
                  <span className={`text-[10px] font-black ${config.color}`}>{evt.detail}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
