'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Activity, Radio, Zap, Vote, Palette, Brain } from 'lucide-react';

// Hub-tagged ticker items
type TickerItem = {
  id: string;
  hub: 'DEFI' | 'DAO' | 'CREATOR' | 'AI_OPS' | 'AGENCY';
  message: string;
  icon?: React.ElementType;
  color: string;
};

interface TopTickerProps {
  // DEFI - Token prices
  voidPrice: number;
  voidChange: number;
  psxPrice: number;
  psxChange: number;
  signalEpoch: number;
  emissionMultiplier: number;
  
  // Hub-tagged announcements
  tickerItems: TickerItem[];
  
  // Network status
  networkStatus: 'online' | 'syncing' | 'offline';
}

export default function TopTicker({
  voidPrice,
  voidChange,
  psxPrice,
  psxChange,
  signalEpoch,
  emissionMultiplier,
  tickerItems,
  networkStatus,
}: TopTickerProps) {
  const [currentItem, setCurrentItem] = React.useState(0);

  React.useEffect(() => {
    if (tickerItems.length > 0) {
      const interval = setInterval(() => {
        setCurrentItem((prev) => (prev + 1) % tickerItems.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [tickerItems]);

  const currentTicker = tickerItems[currentItem];

  return (
    <div className="relative">
      {/* Chrome rail - multi-hub gradient */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-void-purple via-psx-blue to-signal-green opacity-40 blur-sm rounded-full" />
      
      <div className="relative bg-black/80 backdrop-blur-2xl border border-bio-silver/40 rounded-full px-6 py-2.5 shadow-[0_0_30px_rgba(124,0,255,0.25)]">
        <div className="flex items-center justify-center gap-6">
          {/* DEFI - VOID Token */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-void-purple shadow-[0_0_10px_rgba(124,0,255,0.8)]" />
            <span className="text-xs font-display text-void-purple uppercase tracking-[0.2em]">VOID</span>
            <span className="text-sm font-mono text-white">${voidPrice.toFixed(4)}</span>
            <div className={`flex items-center gap-1 text-xs ${voidChange >= 0 ? 'text-signal-green' : 'text-red-400'}`}>
              {voidChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(voidChange).toFixed(2)}%</span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-bio-silver/40 to-transparent" />

          {/* DAO - PSX Token */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-psx-blue shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
            <span className="text-xs font-display text-psx-blue uppercase tracking-[0.2em]">PSX</span>
            <span className="text-sm font-mono text-white">${psxPrice.toFixed(6)}</span>
            <div className={`flex items-center gap-1 text-xs ${psxChange >= 0 ? 'text-signal-green' : 'text-red-400'}`}>
              {psxChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(psxChange).toFixed(2)}%</span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-bio-silver/40 to-transparent" />

          {/* DEFI - Emission Status */}
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-signal-green" />
            <span className="text-xs text-bio-silver">EPOCH {signalEpoch}</span>
            <span className="text-xs font-mono text-signal-green">{emissionMultiplier.toFixed(2)}×</span>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-bio-silver/40 to-transparent" />

          {/* Hub-tagged announcements */}
          <div className="flex items-center gap-2 min-w-[280px]">
            {currentTicker ? (
              <>
                {currentTicker.icon && <currentTicker.icon className={`w-3.5 h-3.5 ${currentTicker.color}`} />}
                <span className={`text-[0.6rem] uppercase tracking-wider ${currentTicker.color}`}>
                  {currentTicker.hub}:
                </span>
                <p className="text-xs text-bio-silver truncate animate-pulse">
                  {currentTicker.message}
                </p>
              </>
            ) : (
              <p className="text-xs text-bio-silver/60">No announcements</p>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-bio-silver/40 to-transparent" />

          {/* Network Status */}
          <div className="flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 ${
              networkStatus === 'online' ? 'text-signal-green' : 
              networkStatus === 'syncing' ? 'text-yellow-400' : 
              'text-red-400'
            }`} />
            <span className="text-xs text-bio-silver uppercase tracking-wider">{networkStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
