'use client';

/**
 * MOBILE ROAM HUD - "Minimal Explorer HUD"
 * 
 * Minimal overlay for when players are actually moving around.
 * World camera takes most of the screen; HUD becomes thin overlays.
 * 
 * Layout:
 * TOP: Very thin band (player status + ticker nub)
 * RIGHT EDGE: Tiny vertical chat spine pill (latest GLOBAL message)
 * BOTTOM: Mini context strip + tiny dock
 */

import React, { useState } from 'react';
import type { EconomySnapshot, PlayerState } from '@/hud/types/economySnapshot';
import { Zap, Navigation, Target, MessageCircle } from 'lucide-react';

interface MobileRoamHUDProps {
  snapshot: EconomySnapshot;
  playerState: PlayerState;
  chatState: {
    messages: Array<{
      id: string;
      hub?: string;
      type?: 'system' | 'user';
      username?: string;
      text: string;
      timestamp: number;
      channel: 'global' | 'nearby' | 'party';
    }>;
    activeChannel: 'global' | 'nearby' | 'party';
  };
  fxState: {
    missionCompleted: boolean;
    tokenGain: boolean;
    chatIncoming: boolean;
    tickerEvent: boolean;
    mapPulse: boolean;
  };
  triggerFX: (type: string, data?: any) => void;
  onOpenLiteView: () => void;
  onDockAction: (actionId: string) => void;
}

export default function MobileRoamHUD({
  snapshot,
  playerState,
  chatState,
  fxState,
  triggerFX,
  onOpenLiteView,
  onDockAction,
}: MobileRoamHUDProps) {
  const [showFullChat, setShowFullChat] = useState(false);

  const world = snapshot?.world ?? {};
  const defi = snapshot?.defi ?? {};
  const nearbyCount = world.nearbyPlayers?.length ?? 0;
  
  // Get latest global message
  const latestGlobal = chatState.messages
    .filter(m => m.channel === 'global')
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  // Context action based on location/nearby
  const contextAction = nearbyCount > 0 
    ? { key: 'E', label: 'Talk to Player' }
    : world.zone?.includes('VAULT')
    ? { key: 'E', label: 'Open Vault Terminal' }
    : world.zone?.includes('DAO')
    ? { key: 'E', label: 'View Proposals' }
    : { key: 'E', label: 'Scan Area' };

  return (
    <div className="relative w-full h-full bg-void-gradient text-bio-silver overflow-hidden">
      {/* Chrome dreamcore background layer */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div 
          className="w-full h-full"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 30%, rgba(0,234,255,0.15), transparent 60%),
              radial-gradient(ellipse 70% 60% at 80% 70%, rgba(124,0,255,0.12), transparent 65%),
              linear-gradient(135deg, transparent 0%, rgba(0,255,157,0.05) 50%, transparent 100%)
            `
          }}
        />
      </div>

      {/* HUD overlays - minimal */}
      <div className="absolute inset-0 pointer-events-none">
        {/* TOP: Mini-Bar */}
        <div className="pointer-events-auto px-3 pt-3">
          <MiniTopBar
            playerState={playerState}
            defi={defi}
            nearbyCount={nearbyCount}
            onTap={onOpenLiteView}
          />
        </div>

        {/* RIGHT EDGE: Chat Pill */}
        <div className="pointer-events-auto absolute right-3 bottom-32">
          <ChatPillMobile
            lastMessage={latestGlobal}
            hasNearby={nearbyCount > 0}
            fxState={fxState}
            onOpenChat={() => setShowFullChat(true)}
          />
        </div>

        {/* BOTTOM: Mini Context + Dock */}
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 px-3 pb-4 flex flex-col gap-2">
          <MiniContextBar
            action={contextAction}
          />
          <MiniDockMobile
            onDockAction={onDockAction}
            onMoreTap={onOpenLiteView}
          />
        </div>
      </div>

      {/* Full chat overlay (slides up) */}
      {showFullChat && (
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
          onClick={() => setShowFullChat(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 h-[70vh] bg-void-gradient rounded-t-3xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold tracking-[0.18em] uppercase text-signal-green">
                GLOBAL CHAT
              </h3>
              <button
                type="button"
                onClick={() => setShowFullChat(false)}
                className="px-3 py-1 rounded-lg bg-black/60 border border-bio-silver/30 text-[0.65rem] text-bio-silver/80 uppercase tracking-wider"
              >
                Close
              </button>
            </div>
            {/* Chat messages would go here - reuse ChatPanelMobile */}
            <div className="text-[0.7rem] text-bio-silver/60 text-center mt-8">
              Full chat panel - tap LITE view for complete interface
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── Mini Top Bar ───────── */

interface MiniTopBarProps {
  playerState: PlayerState;
  defi: any;
  nearbyCount: number;
  onTap: () => void;
}

function MiniTopBar({ playerState, defi, nearbyCount, onTap }: MiniTopBarProps) {
  const level = playerState.level ?? 7;
  const xp = playerState.xp ?? 14820;
  const xpNext = 20000;
  const xpPct = Math.min(100, Math.round(((xp % 5000) / 5000) * 100));
  const streak = playerState.streak ?? 4;

  return (
    <button
      type="button"
      onClick={onTap}
      className="w-full rounded-2xl bg-black/75 backdrop-blur-xl border border-bio-silver/40 shadow-[0_0_18px_rgba(0,255,157,0.3)] px-3 py-2 flex items-center justify-between active:scale-98 transition-transform"
    >
      {/* Left: XP progress */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-signal-green/60 via-void-purple/60 to-cyber-cyan/60 flex items-center justify-center">
          <span className="text-[0.7rem] font-bold text-void-black">
            {level}
          </span>
        </div>
        <div className="flex flex-col items-start">
          <div className="text-[0.6rem] uppercase tracking-[0.2em] text-bio-silver/60">
            Level {level}
          </div>
          <div className="w-20 h-1 rounded-full bg-black/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-signal-green to-cyber-cyan"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Center: Streak */}
      <div className="flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-signal-green" />
        <span className="text-[0.7rem] font-mono text-signal-green">
          {streak}d
        </span>
      </div>

      {/* Right: Nearby indicator */}
      <div className="flex items-center gap-2">
        {nearbyCount > 0 ? (
          <>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[0.65rem] text-cyan-400 font-mono">
              {nearbyCount} nearby
            </span>
          </>
        ) : (
          <Navigation className="w-4 h-4 text-bio-silver/40" />
        )}
      </div>
    </button>
  );
}

/* ───────── Chat Pill (Right Edge) ───────── */

interface ChatPillMobileProps {
  lastMessage?: {
    id: string;
    hub?: string;
    type?: 'system' | 'user';
    username?: string;
    text: string;
    timestamp: number;
  };
  hasNearby: boolean;
  fxState: any;
  onOpenChat: () => void;
}

function ChatPillMobile({ 
  lastMessage, 
  hasNearby, 
  fxState,
  onOpenChat 
}: ChatPillMobileProps) {
  if (!lastMessage) return null;

  const getHubSpineClass = (hub?: string) => {
    switch (hub) {
      case 'DEFI': return 'bg-void-purple';
      case 'DAO': return 'bg-psx-blue';
      case 'CREATOR': return 'bg-cyber-cyan';
      case 'AGENCY': return 'bg-red-500';
      case 'AI_OPS': return 'bg-signal-green';
      case 'WORLD': return 'bg-signal-green';
      default: return 'bg-bio-silver/50';
    }
  };

  const spineClass = getHubSpineClass(lastMessage.hub);

  return (
    <button
      type="button"
      onClick={onOpenChat}
      className={`relative max-w-[200px] px-3 py-2 rounded-full bg-black/75 backdrop-blur-xl flex items-center gap-2 border shadow-[0_0_18px_rgba(0,255,157,0.45)] active:scale-95 transition-all ${
        fxState.chatIncoming 
          ? 'border-signal-green/70 animate-pulse' 
          : 'border-bio-silver/40'
      }`}
    >
      {/* Hub spine */}
      <span className={`w-[3px] h-6 rounded-full ${spineClass}`} />
      
      {/* Message preview */}
      <div className="flex-1 min-w-0 text-left">
        {lastMessage.type === 'system' ? (
          <span className="text-[0.65rem] text-bio-silver/70 italic truncate block">
            {lastMessage.hub && <span className="text-signal-green">[{lastMessage.hub}]</span>} {lastMessage.text}
          </span>
        ) : (
          <>
            <div className="text-[0.55rem] text-bio-silver/60 truncate">
              {lastMessage.username}
            </div>
            <div className="text-[0.7rem] text-bio-silver/85 truncate">
              {lastMessage.text}
            </div>
          </>
        )}
      </div>

      {/* Nearby badge */}
      {hasNearby && (
        <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-400 text-void-black text-[0.5rem] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(34,211,238,0.9)]">
          Nearby
        </div>
      )}

      {/* Message icon */}
      <MessageCircle className="w-4 h-4 text-signal-green/70" />
    </button>
  );
}

/* ───────── Mini Context Bar ───────── */

interface MiniContextBarProps {
  action: {
    key: string;
    label: string;
  };
}

function MiniContextBar({ action }: MiniContextBarProps) {
  return (
    <div className="w-full rounded-2xl bg-black/75 backdrop-blur-xl border border-signal-green/40 shadow-[0_0_18px_rgba(0,255,157,0.3)] px-4 py-2 flex items-center justify-center gap-2">
      <div className="px-2 py-1 rounded-lg bg-signal-green/20 border border-signal-green/50 text-signal-green text-[0.7rem] font-bold">
        {action.key}
      </div>
      <span className="text-[0.75rem] text-bio-silver/90 font-semibold uppercase tracking-wider">
        {action.label}
      </span>
    </div>
  );
}

/* ───────── Mini Dock Mobile ───────── */

interface MiniDockMobileProps {
  onDockAction: (actionId: string) => void;
  onMoreTap: () => void;
}

function MiniDockMobile({ onDockAction, onMoreTap }: MiniDockMobileProps) {
  const items = [
    { id: 'phone', label: 'Phone', hub: 'WORLD' },
    { id: 'map', label: 'Map', hub: 'WORLD' },
    { id: 'vault', label: 'Vault', hub: 'DEFI' },
    { id: 'agency', label: 'Agency', hub: 'AGENCY' },
    { id: 'more', label: 'More', hub: 'AI_OPS', isMore: true },
  ];

  const getHubGradient = (hub: string) => {
    switch (hub) {
      case 'WORLD': return 'from-signal-green/60 via-cyber-cyan/60 to-signal-green/60';
      case 'DEFI': return 'from-void-purple/60 via-void-purple/80 to-void-purple/60';
      case 'AGENCY': return 'from-red-500/60 via-red-600/80 to-red-500/60';
      case 'AI_OPS': return 'from-signal-green/60 via-emerald-500/80 to-signal-green/60';
      default: return 'from-bio-silver/60 via-bio-silver/80 to-bio-silver/60';
    }
  };

  return (
    <div className="w-full rounded-2xl bg-black/75 backdrop-blur-xl border border-bio-silver/40 shadow-[0_0_18px_rgba(0,255,157,0.3)] px-3 py-2 flex items-center justify-around">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => item.isMore ? onMoreTap() : onDockAction(item.id)}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getHubGradient(item.hub)} flex items-center justify-center text-[0.75rem] font-mono text-void-black shadow-[0_0_14px_rgba(0,255,198,0.7)]`}>
            {item.isMore ? '⋯' : item.label[0]}
          </div>
          <span className="text-[0.55rem] text-bio-silver/60">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
