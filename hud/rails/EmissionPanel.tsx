'use client';

/**
 * EMISSION PANEL - SIGNAL epoch countdown + multiplier
 */

import React from 'react';
import type { HubTheme } from '@/hud/theme';
import type { WindowType } from '@/hud/windowTypes';
import type { EconomySnapshot } from '@/hud/types/economySnapshot';

interface EmissionPanelProps {
  snapshot: EconomySnapshot;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
}

export default function EmissionPanel({
  snapshot,
  onOpenWindow,
  theme
}: EmissionPanelProps) {
  // Use DeFi state from snapshot
  const signalBalance = snapshot.defi?.myPositions?.reduce((acc, pos) => acc + (pos.rewards || 0), 0) || 0;
  const signalEpoch = snapshot.defi?.signalEpoch || 0;
  const multiplier = snapshot.defi?.emissionMultiplier || 1.0;
  const timeRemaining = '4h 23m'; // Mock countdown - would calculate from snapshot.defi.nextEmissionIn
  const nextEpochReward = '1,250 SIGNAL'; // Mock

  return (
    <div className={`
      rounded-2xl bg-black/75 backdrop-blur-2xl border border-bio-silver/30
      p-4 relative overflow-hidden
      transition-all duration-500
    `}>
      {/* chrome corner glow */}
      <div className={`
        pointer-events-none absolute -top-4 -right-4 w-24 h-24 blur-2xl opacity-50
        bg-[radial-gradient(circle,${theme.chromeGlow},transparent_70%)]
      `} />

      <div className="relative">
        <button
          onClick={() => onOpenWindow('DEFI_OVERVIEW')}
          className="w-full text-left group mb-3"
        >
          <h3 className="text-xs font-bold tracking-widest text-bio-silver/70 group-hover:text-bio-silver transition-colors flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
            EMISSION STATUS
          </h3>
        </button>

        {/* Epoch countdown */}
        <div className="mb-3 p-3 rounded-xl bg-bio-dark-bone/30 border border-bio-silver/20">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] text-bio-silver/60 tracking-wide">NEXT EPOCH</div>
            <div className="text-xs font-bold text-signal-green">{timeRemaining}</div>
          </div>
          <div className="text-[11px] text-bio-silver/80">
            Est. reward: <span className="font-bold text-white">{nextEpochReward}</span>
          </div>
        </div>

        {/* Multiplier */}
        <div className="mb-3 p-3 rounded-xl bg-bio-dark-bone/30 border border-bio-silver/20">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] text-bio-silver/60 tracking-wide">MULTIPLIER</div>
            <div className="text-2xl font-bold" style={{ color: theme.borderColor }}>
              {multiplier}×
            </div>
          </div>
          <div className="text-[10px] text-bio-silver/60">
            Epoch #{signalEpoch}
          </div>
        </div>

        {/* SIGNAL balance */}
        <button
          onClick={() => onOpenWindow('DEFI_OVERVIEW')}
          className={`
            w-full p-3 rounded-xl bg-bio-dark-bone/30 border border-bio-silver/20
            hover:bg-bio-dark-bone/50 hover:border-bio-silver/40
            transition-all duration-300
            group
          `}
        >
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-bio-silver/60 tracking-wide">SIGNAL BALANCE</div>
            <div className="text-sm font-bold text-white group-hover:text-signal-green transition-colors">
              {signalBalance.toLocaleString()}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
