'use client';

/**
 * PLAYER CHIP - Multi-Hub Identity Widget
 * Clickable wallet, level, agency, balances
 * OPTIMIZED: Memoized to prevent unnecessary re-renders
 */

import React, { useState, memo } from 'react';
import { User, Wallet, Zap, MapPin } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import type { WindowType } from '@/hud/windowTypes';
import type { HubTheme } from '@/hud/theme';
import type { EconomySnapshot, PlayerState } from '@/hud/types/economySnapshot';

interface PlayerChipProps {
  snapshot: EconomySnapshot;
  playerState: PlayerState;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
}

function PlayerChipV2Component({ snapshot, playerState, onOpenWindow, theme }: PlayerChipProps) {
  const [expanded, setExpanded] = useState(false);
  const { authenticated, login } = usePrivy();

  const agencyRole = snapshot.agency?.myRole || 'None';
  const zone = snapshot.world?.zone || 'Unknown';
  const coords = snapshot.world?.coordinates || { x: 0, y: 0, z: 0 };

  // Safe playerState with defaults
  const safePlayerState = {
    username: playerState?.username || 'Guest',
    walletAddress: playerState?.walletAddress || null,
    chain: playerState?.chain || 'N/A',
    level: playerState?.level || 1,
    xpProgress: playerState?.xpProgress || (playerState as any)?.xpPct || 0,
  };

  // If not connected, show connect wallet button
  if (!authenticated || !safePlayerState.walletAddress) {
    return (
      <div className="relative">
        <button
          onClick={() => login()}
          className={`
            relative rounded-2xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40
            hover:border-signal-green/60 transition-all duration-300
            px-4 py-2 flex items-center gap-3
          `}
        >
          <Wallet className="w-5 h-5 text-signal-green" />
          <span className="text-sm font-medium text-bio-silver">Connect Wallet</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`
        relative rounded-2xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40
        overflow-hidden transition-all duration-300
        ${expanded ? 'pb-2' : ''}
      `}>
        {/* chrome glow corner */}
        <div className={`pointer-events-none absolute -left-4 -top-4 w-20 h-20 ${theme.spineColor}/20 blur-xl`} />

        <div className="relative px-3 py-2 flex items-center gap-3">
          {/* avatar */}
          <button
            type="button"
            onClick={() => onOpenWindow("WALLET", { playerState })}
            className="relative group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bio-silver via-slate-400 to-slate-600 flex items-center justify-center border border-bio-silver/40 group-hover:border-signal-green/60 transition-colors">
              <User className="w-5 h-5 text-void-black" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${theme.spineColor} border border-black`} />
          </button>

          {/* identity */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[0.8rem] text-bio-silver font-medium truncate">
                {safePlayerState.username}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-signal-green/15 border border-signal-green/60 text-[0.5rem] text-signal-green font-mono">
                ONLINE
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => onOpenWindow("WALLET", { playerState })}
              className="text-[0.6rem] text-bio-silver/60 font-mono hover:text-cyber-cyan transition-colors"
            >
              {safePlayerState.walletAddress ? `${safePlayerState.walletAddress.slice(0, 6)}...${safePlayerState.walletAddress.slice(-4)}` : 'Not connected'} · {safePlayerState.chain}
            </button>
          </div>

          {/* level + XP */}
          <button
            type="button"
            onClick={() => onOpenWindow("ACHIEVEMENTS", { playerState })}
            className="flex items-center gap-2 px-2 py-1 rounded-xl bg-black/60 border border-bio-silver/30 hover:border-signal-green/60 transition-colors group"
          >
            <Zap className="w-3.5 h-3.5 text-signal-green" />
            <div className="text-left">
              <div className={`text-[0.7rem] font-mono ${theme.accent}`}>
                LVL {safePlayerState.level}
              </div>
              <div className="text-[0.55rem] text-bio-silver/60">
                {safePlayerState.xpProgress}% XP
              </div>
            </div>
          </button>

          {/* expand toggle */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-bio-silver/60 hover:text-bio-silver transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* expanded info */}
        {expanded && (
          <div className="px-3 pb-1 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* location */}
            <button
              type="button"
              onClick={() => onOpenWindow("WORLD_MAP", { world: snapshot.world })}
              className="w-full flex items-center gap-2 px-2 py-1 rounded-lg bg-black/40 hover:bg-black/60 transition-colors text-left"
            >
              <MapPin className="w-3 h-3 text-signal-green" />
              <div>
                <div className="text-[0.6rem] text-bio-silver/60 uppercase tracking-wide">Location</div>
                <div className="text-[0.7rem] text-bio-silver">{zone} · ({coords.x}, {coords.z})</div>
              </div>
            </button>

            {/* balances row */}
            <div className="grid grid-cols-4 gap-1 text-[0.6rem] font-mono">
              <button
                type="button"
                onClick={() => onOpenWindow("DEFI_OVERVIEW", { defi: snapshot.defi })}
                className="px-1.5 py-1 rounded bg-void-purple/10 border border-void-purple/40 hover:border-void-purple/70 transition-colors"
              >
                <div className="text-void-purple">VOID</div>
                <div className="text-bio-silver/80">{playerState.voidBalance.toFixed(0)}</div>
              </button>
              <button
                type="button"
                onClick={() => onOpenWindow("DAO_CONSOLE", { dao: snapshot.dao })}
                className="px-1.5 py-1 rounded bg-psx-blue/10 border border-psx-blue/40 hover:border-psx-blue/70 transition-colors"
              >
                <div className="text-psx-blue">PSX</div>
                <div className="text-bio-silver/80">{(playerState.psxBalance / 1000).toFixed(1)}k</div>
              </button>
              <button
                type="button"
                onClick={() => onOpenWindow("CREATOR_HUB", { creator: snapshot.creator })}
                className="px-1.5 py-1 rounded bg-cyber-cyan/10 border border-cyber-cyan/40 hover:border-cyber-cyan/70 transition-colors"
              >
                <div className="text-cyber-cyan">CREATE</div>
                <div className="text-bio-silver/80">{playerState.createBalance.toFixed(0)}</div>
              </button>
              <button
                type="button"
                onClick={() => onOpenWindow("DEFI_OVERVIEW", { defi: snapshot.defi })}
                className="px-1.5 py-1 rounded bg-signal-green/10 border border-signal-green/40 hover:border-signal-green/70 transition-colors"
              >
                <div className="text-signal-green">SIGNAL</div>
                <div className="text-bio-silver/80">{playerState.signalBalance}</div>
              </button>
            </div>

            {/* agency role */}
            <button
              type="button"
              onClick={() => onOpenWindow("AGENCY_BOARD", { agency: snapshot.agency })}
              className="w-full px-2 py-1 rounded-lg bg-red-400/10 border border-red-400/40 hover:border-red-400/70 transition-colors text-left"
            >
              <div className="text-[0.6rem] text-bio-silver/60 uppercase tracking-wide">Agency Role</div>
              <div className="text-[0.7rem] text-red-400">{agencyRole}</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// OPTIMIZATION: Memoize to prevent re-renders when props haven't changed
export default memo(PlayerChipV2Component, (prevProps, nextProps) => {
  // Only re-render if these specific values change
  return (
    prevProps.playerState.walletAddress === nextProps.playerState.walletAddress &&
    prevProps.playerState.level === nextProps.playerState.level &&
    prevProps.playerState.xpProgress === nextProps.playerState.xpProgress &&
    prevProps.playerState.voidBalance === nextProps.playerState.voidBalance &&
    prevProps.theme.spineColor === nextProps.theme.spineColor
  );
});
