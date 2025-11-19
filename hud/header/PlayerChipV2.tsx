'use client';

/**
 * PLAYER CHIP - Multi-Hub Identity Widget
 * Clickable wallet, level, agency, balances
 * OPTIMIZED: Memoized to prevent unnecessary re-renders
 */

import React, { useState, memo } from 'react';
import { User, Wallet, Zap, MapPin, LogOut } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@/components/providers/simple-wallet-provider';
import { useVoidRuntime } from '@/src/runtime/VoidRuntimeProvider';
import { ENABLE_BURN_UI } from '@/config/voidConfig';
import type { WindowType } from '@/hud/windowTypes';
import type { HubTheme } from '@/hud/theme';
import type { EconomySnapshot, PlayerState } from '@/hud/types/economySnapshot';

// Conditional prestige hook import (only if burn UI enabled)
let usePrestigeBurn: any;
if (ENABLE_BURN_UI) {
  usePrestigeBurn = require('@/hooks/burn/usePrestigeBurn').usePrestigeBurn;
}

interface PlayerChipProps {
  snapshot: EconomySnapshot;
  playerState: PlayerState;
  onOpenWindow: (type: WindowType, props?: any) => void;
  theme: HubTheme;
}

function PlayerChipV2Component({ snapshot, playerState, onOpenWindow, theme }: PlayerChipProps) {
  const [expanded, setExpanded] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const runtime = useVoidRuntime();
  
  // Get prestige rank (Phase 9 - only if burn UI enabled)
  const prestigeRank = ENABLE_BURN_UI && usePrestigeBurn ? usePrestigeBurn().prestigeRank : 0;

  const zone = snapshot.world?.zone || 'Unknown';
  const coords = snapshot.world?.coordinates || { x: 0, y: 0, z: 0 };

  // Safe playerState with defaults - use wallet address from wagmi
  const safePlayerState = {
    username: playerState?.username || 'Guest',
    walletAddress: playerState?.walletAddress || address || null,
    chain: playerState?.chain || 'N/A',
    level: playerState?.level || 1,
    xpProgress: playerState?.xpProgress || (playerState as any)?.xpPct || 0,
  };

  // Show connect prompt if not connected
  const showConnectPrompt = !isConnected;

  return (
    <div className="relative">
      <div className={`
        relative rounded-2xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40
        transition-all duration-300
        ${expanded ? 'pb-2 overflow-visible' : 'overflow-hidden'}
      `}>
        {/* chrome glow corner */}
        <div className={`pointer-events-none absolute -left-4 -top-4 w-20 h-20 ${theme.spineColor}/20 blur-xl`} />

        <div className="relative px-3 py-2 flex items-center gap-3">
          {showConnectPrompt ? (
            // WALLET NOT CONNECTED - Show connect button
            <>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center border border-bio-silver/40">
                <Wallet className="w-5 h-5 text-bio-silver/60" />
              </div>
              <div className="flex-1">
                <ConnectButton />
              </div>
            </>
          ) : (
            // WALLET CONNECTED - Show player card
            <>
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
                  {/* PHASE 9: Prestige Badge (Feature Flag Protected) */}
                  {ENABLE_BURN_UI && prestigeRank && prestigeRank > 0 && (
                    <button
                      type="button"
                      onClick={() => onOpenWindow("PRESTIGE_SYSTEM")}
                      className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/60 hover:border-purple-500/100 transition-all group"
                      title={`Prestige Rank ${prestigeRank}`}
                    >
                      <span className="text-[0.55rem] text-purple-400 font-bold flex items-center gap-0.5">
                        <span className="group-hover:scale-110 transition-transform">⭐</span>
                        <span>{prestigeRank}</span>
                      </span>
                    </button>
                  )}
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
            </>
          )}
        </div>

        {/* expanded info - only show when connected */}
        {!showConnectPrompt && (
          <>
            {/* Always visible balances row */}
            <div className="px-3 pb-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[0.6rem] font-mono">
                <button
                  type="button"
                  onClick={() => onOpenWindow("DEFI_OVERVIEW", { defi: snapshot.defi })}
                  className="px-1.5 py-1.5 sm:py-1 h-12 sm:h-auto rounded bg-void-purple/10 border border-void-purple/40 hover:border-void-purple/70 transition-colors"
                >
                  <div className="text-void-purple">VOID</div>
                  <div className="text-bio-silver/80">{playerState.voidBalance.toFixed(0)}</div>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenWindow("DAO_CONSOLE", { dao: snapshot.dao })}
                  className="px-1.5 py-1.5 sm:py-1 h-12 sm:h-auto rounded bg-psx-blue/10 border border-psx-blue/40 hover:border-psx-blue/70 transition-colors"
                >
                  <div className="text-psx-blue">PSX</div>
                  <div className="text-bio-silver/80">{(playerState.psxBalance / 1000).toFixed(1)}k</div>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenWindow("CREATOR_HUB", { creator: snapshot.creator })}
                  className="px-1.5 py-1.5 sm:py-1 h-12 sm:h-auto rounded bg-cyber-cyan/10 border border-cyber-cyan/40 hover:border-cyber-cyan/70 transition-colors"
                >
                  <div className="text-cyber-cyan">CREATE</div>
                  <div className="text-bio-silver/80">{playerState.createBalance.toFixed(0)}</div>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenWindow("DEFI_OVERVIEW", { defi: snapshot.defi })}
                  className="px-1.5 py-1.5 sm:py-1 h-12 sm:h-auto rounded bg-signal-green/10 border border-signal-green/40 hover:border-signal-green/70 transition-colors"
                >
                  <div className="text-signal-green">SIGNAL</div>
                  <div className="text-bio-silver/80">{playerState.signalBalance}</div>
                </button>
              </div>
            </div>

            {/* Additional expandable section (location + logout) */}
            {expanded && (
              <div className="px-3 pb-2 space-y-1.5 border-t border-bio-silver/20 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* location */}
                <button
                  type="button"
                  onClick={() => onOpenWindow("WORLD_MAP", { world: snapshot.world })}
                  className="w-full flex items-center gap-2 px-2 py-1.5 sm:py-1 h-10 sm:h-auto rounded-lg bg-black/40 hover:bg-black/60 transition-colors text-left"
                >
                  <MapPin className="w-3 h-3 text-signal-green flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.6rem] text-bio-silver/60 uppercase tracking-wide">Location</div>
                    <div className="text-[0.7rem] text-bio-silver truncate">{zone} · ({coords.x}, {coords.z})</div>
                  </div>
                </button>

                {/* logout button */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      // Step 1: Clear all wallet caches
                      Object.keys(localStorage).forEach(key => {
                        if (
                          key.startsWith('wagmi.') || 
                          key.startsWith('rainbowkit.') ||
                          key.includes('walletconnect') ||
                          key.includes('recentConnector')
                        ) {
                          localStorage.removeItem(key);
                        }
                      });
                      console.log('[PlayerChip] ✓ Cleared wallet cache');
                      
                      // Step 2: Reset runtime state
                      runtime.reset();
                      
                      // Step 3: Disconnect wallet
                      disconnect();
                      
                      // Step 4: Clear ALL session storage (including cache cleared flag) and reload
                      sessionStorage.clear();
                      setTimeout(() => window.location.reload(), 200);
                    } catch (error) {
                      console.error('[PlayerChip] Disconnect error:', error);
                      // Force reload anyway
                      window.location.reload();
                    }
                  }}
                  className="w-full px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/40 hover:border-red-500/70 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-3 h-3 text-red-500" />
                  <span className="text-[0.7rem] text-red-500">Exit VOID & Clear Session</span>
                </button>
              </div>
            )}
          </>
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
