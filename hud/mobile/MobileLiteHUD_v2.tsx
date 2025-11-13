'use client';

/**
 * MOBILE LITE HUD V4.7 - "Pocket Control Room"
 * 
 * Info-dense dashboard for when players are "managing" the VOID.
 * Portrait-first layout with GLOBAL chat as default visible feed.
 * 
 * V4.7 Updates:
 * - Integrated with VoidRuntimeProvider (on-chain profile, XP, tier)
 * - Real-time wallet, zone, position from Net Protocol
 * - Stats grid 2x2: Online Friends, PSX balance, VOID balance, mini map
 * - Top profile card: avatar, wallet, zone, coords from runtime.netProfile
 * - Proximity chat list from chatState
 * - Bottom icon dock for MiniApps
 * 
 * Layout:
 * TOP: Player Summary (from VoidRuntime - wallet, zone, level, XP)
 * MIDDLE: Stats Grid 2x2 (Friends, PSX, VOID, Mini Map)
 * CHAT: Proximity Chat List (GLOBAL/NEARBY/PARTY tabs)
 * BOTTOM: Icon Dock (MiniApp launcher)
 */

import React from 'react';
import { useVoidRuntime } from '@/src/runtime/VoidRuntimeProvider';
import type { EconomySnapshot, PlayerState } from '@/hud/types/economySnapshot';
import { worldPosToPercent, getDistrict, worldToParcel, coordsToParcelId, DISTRICT_NAMES } from '@/world/WorldCoords';
import { useParcelProperties } from '@/services/world/useRealEstate';

interface MobileLiteHUDProps {
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
  onSendMessage: (text: string, channel: 'global' | 'nearby' | 'party') => void;
  onDockAction: (actionId: string) => void;
}

export default function MobileLiteHUD({
  snapshot,
  playerState,
  chatState,
  fxState,
  triggerFX,
  onSendMessage,
  onDockAction,
}: MobileLiteHUDProps) {
  // V4.7: Get runtime data from VoidRuntimeProvider
  const runtime = useVoidRuntime();
  
  const world = snapshot?.world ?? {};
  const defi = snapshot?.defi ?? {};
  const dao = snapshot?.dao ?? {};
  const creator = snapshot?.creator ?? {};
  const agency = snapshot?.agency ?? {};
  const aiOps = snapshot?.aiOps ?? {};

  const hasNearby =
    (world.nearbyPlayers?.length ?? 0) > 0 ||
    (agency.openGigs?.length ?? 0) > 0;

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

      {/* HUD overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col">
        {/* TOP: Player summary with VoidRuntime data */}
        <div className="pointer-events-auto px-3 pt-4">
          <PlayerSummaryCardMobile
            runtime={runtime}
            world={world}
            defi={defi}
            dao={dao}
            creator={creator}
            agency={agency}
            playerState={playerState}
          />
        </div>

        {/* MIDDLE: stats grid 2x2 + chat */}
        <div className="pointer-events-auto flex-1 flex flex-col gap-3 px-3 pt-3 pb-2">
          <StatsGrid2x2Mobile
            runtime={runtime}
            world={world}
            defi={defi}
            onCardTap={onDockAction}
          />

          {/* Chat spine – GLOBAL is main visible chat */}
          <div className="flex-1 min-h-[40vh]">
            <ChatPanelMobile
              hasNearby={hasNearby}
              chatState={chatState}
              triggerFX={triggerFX}
              onSendMessage={onSendMessage}
            />
          </div>
        </div>

        {/* BOTTOM: dock */}
        <div className="pointer-events-auto px-3 pb-4">
          <BottomDockMobile onDockAction={onDockAction} />
        </div>
      </div>
    </div>
  );
}

/* ───────── Player Summary Card (top) - V4.7 with VoidRuntime ───────── */

interface PlayerSummaryCardMobileProps {
  runtime: any; // VoidRuntimeState
  world: any;
  defi: any;
  dao: any;
  creator: any;
  agency: any;
  playerState: PlayerState;
}

function PlayerSummaryCardMobile({ 
  runtime,
  world, 
  defi, 
  dao, 
  creator, 
  agency,
  playerState 
}: PlayerSummaryCardMobileProps) {
  // V4.7: Use VoidRuntime for on-chain data
  const username = playerState.username || 'agent';
  const walletShort = runtime.wallet 
    ? `${runtime.wallet.slice(0, 6)}…${runtime.wallet.slice(-4)}`
    : '0x????…????';
  
  // Zone and coords from Net Protocol profile
  const zone = runtime.netProfile 
    ? `ZONE_${runtime.netProfile.zoneX}_${runtime.netProfile.zoneY}`
    : (world.zone ?? 'VOID_CORE');
  const coords = runtime.netProfile
    ? { x: Math.floor(runtime.netProfile.posX), z: Math.floor(runtime.netProfile.posZ) }
    : (world.coordinates ?? { x: -1, z: 9 });
  
  // Level and XP from VoidRuntime (on-chain)
  const level = runtime.level ?? playerState.level ?? 1;
  const xp = runtime.xp ?? playerState.xp ?? 0;
  const xpNext = level * 5000; // Simple formula for demo
  const xpPct = Math.min(100, Math.round((xp / xpNext) * 100));

  const voidBal = playerState.voidBalance ?? 10500;
  const signalBal = playerState.signalBalance ?? 0;
  const psxBal = playerState.psxBalance ?? 50000;
  const createBal = playerState.createBalance ?? 0;

  const agencyMode = agency.myRole ?? 'FREELANCER';
  const agencyName = agency.myAgency?.name;

  return (
    <div className="rounded-3xl bg-black/85 backdrop-blur-2xl border border-bio-silver/50 shadow-[0_0_35px_rgba(0,255,157,0.35)] relative overflow-hidden">
      {/* chrome / dreamcore bg */}
      <div className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen">
        <div className="w-full h-full bg-[radial-gradient(circle_at_0_0,rgba(0,255,157,0.28),transparent_55%),radial-gradient(circle_at_100%_0,rgba(0,212,255,0.25),transparent_55%),radial-gradient(circle_at_50%_100%,rgba(124,0,255,0.25),transparent_55%)]" />
      </div>

      <div className="relative z-10 px-4 py-3 flex flex-col gap-3">
        {/* row: avatar + id */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyber-cyan via-bio-silver to-void-purple shadow-[0_0_20px_rgba(0,255,198,0.65)] flex items-center justify-center">
              <span className="text-xl text-void-black font-bold">
                {username[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.75rem] font-semibold tracking-[0.18em] uppercase text-bio-silver/90">
                {username}
              </span>
              <span className="text-[0.65rem] text-bio-silver/60">
                {walletShort}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[0.6rem] uppercase tracking-[0.25em] text-bio-silver/50">
              Zone
            </div>
            <div className="text-[0.75rem] text-signal-green font-mono">
              {zone}
            </div>
            <div className="text-[0.6rem] text-bio-silver/60">
              ({coords.x ?? '-'}, {coords.z ?? '-'})
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-bio-silver/70">
              Operator · Level {level}
            </span>
            <span className="text-[0.6rem] text-bio-silver/60 font-mono">
              {xp.toLocaleString()} / {xpNext.toLocaleString()} XP
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-void-deep/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-signal-green via-cyber-cyan to-void-purple shadow-[0_0_12px_rgba(0,255,157,0.9)]"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>

        {/* token chips + agency */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2 flex-wrap">
            <TokenChip label="VOID" value={voidBal} accent="void" />
            {signalBal > 0 && <TokenChip label="SIGNAL" value={signalBal} accent="signal" />}
            <TokenChip label="PSX" value={psxBal} accent="psx" />
            {createBal > 0 && (
              <TokenChip label="CREATE" value={createBal} accent="creator" />
            )}
          </div>
          <div className="text-right">
            <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/50">
              Agency
            </div>
            <div className="text-[0.7rem] text-red-500 font-mono">
              {agencyMode}
            </div>
            {agencyName && (
              <div className="text-[0.6rem] text-bio-silver/60">
                {agencyName}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TokenChipProps {
  label: string;
  value: number;
  accent: 'void' | 'signal' | 'psx' | 'creator';
}

function TokenChip({ label, value, accent }: TokenChipProps) {
  const { border, text } = (() => {
    switch (accent) {
      case 'void':
        return { border: 'border-void-purple/70', text: 'text-void-purple' };
      case 'signal':
        return { border: 'border-signal-green/70', text: 'text-signal-green' };
      case 'psx':
        return { border: 'border-psx-blue/70', text: 'text-psx-blue' };
      case 'creator':
        return { border: 'border-cyber-cyan/70', text: 'text-cyber-cyan' };
      default:
        return { border: 'border-signal-green/70', text: 'text-signal-green' };
    }
  })();

  return (
    <div
      className={`px-2 py-1 rounded-xl border ${border} bg-black/70 backdrop-blur-xl flex flex-col min-w-[72px]`}
    >
      <span className="text-[0.55rem] uppercase tracking-[0.22em] text-bio-silver/60">
        {label}
      </span>
      <span className={`text-[0.8rem] font-mono ${text}`}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}

/* ───────── Stats Grid 2x2 (V4.7 Reference Design) ───────── */

interface StatsGrid2x2MobileProps {
  runtime: any; // VoidRuntimeState
  world: any;
  defi: any;
  onCardTap?: (actionId: string) => void;
}

function StatsGrid2x2Mobile({
  runtime,
  world,
  defi,
  onCardTap,
}: StatsGrid2x2MobileProps) {
  const onlineFriends = world.onlineFriends ?? 0;
  const psxBal = defi.psxBalance ?? 0;
  const voidBal = defi.voidBalance ?? 0;
  
  // Coords from Net Protocol
  const posX = runtime.netProfile?.posX ?? 2000;
  const posZ = runtime.netProfile?.posZ ?? 2000;
  
  // World coordinate system
  const playerWorldPos = { x: posX, z: posZ };
  const { xPct, zPct } = worldPosToPercent(playerWorldPos);
  const parcelCoords = worldToParcel(playerWorldPos);
  const district = getDistrict(parcelCoords);
  const parcelId = coordsToParcelId(parcelCoords);
  
  // Get properties on current parcel
  const parcelProperties = useParcelProperties(parcelId);
  const propertyCount = parcelProperties.length;

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Online Friends */}
      <button
        type="button"
        onClick={() => onCardTap?.('friends')}
        className="rounded-2xl bg-black/75 backdrop-blur-xl border border-signal-green/40 shadow-[0_0_18px_rgba(0,255,157,0.3)] px-3 py-3 flex flex-col items-start active:scale-95 transition-transform"
      >
        <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
          Online Friends
        </div>
        <div className="mt-2 text-2xl font-mono text-signal-green">
          {onlineFriends}
        </div>
        <div className="text-[0.55rem] text-bio-silver/50 mt-1">
          Active Now
        </div>
      </button>

      {/* PSX Balance */}
      <button
        type="button"
        onClick={() => onCardTap?.('wallet')}
        className="rounded-2xl bg-black/75 backdrop-blur-xl border border-psx-blue/40 shadow-[0_0_18px_rgba(0,212,255,0.3)] px-3 py-3 flex flex-col items-start active:scale-95 transition-transform"
      >
        <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
          PSX Balance
        </div>
        <div className="mt-2 text-xl font-mono text-psx-blue">
          {psxBal.toLocaleString()}
        </div>
        <div className="text-[0.55rem] text-bio-silver/50 mt-1">
          Tokens
        </div>
      </button>

      {/* VOID Balance */}
      <button
        type="button"
        onClick={() => onCardTap?.('wallet')}
        className="rounded-2xl bg-black/75 backdrop-blur-xl border border-void-purple/40 shadow-[0_0_18px_rgba(124,0,255,0.3)] px-3 py-3 flex flex-col items-start active:scale-95 transition-transform"
      >
        <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
          VOID Balance
        </div>
        <div className="mt-2 text-xl font-mono text-void-purple">
          {voidBal.toLocaleString()}
        </div>
        <div className="text-[0.55rem] text-bio-silver/50 mt-1">
          Tokens
        </div>
      </button>

      {/* Mini Map */}
      <button
        type="button"
        onClick={() => onCardTap?.('map')}
        className="rounded-2xl bg-black/75 backdrop-blur-xl border border-cyber-cyan/40 shadow-[0_0_18px_rgba(0,234,255,0.3)] px-3 py-3 flex flex-col items-start active:scale-95 transition-transform relative overflow-hidden"
      >
        {/* Mini radar grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,234,255,0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,234,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '12px 12px',
          }} />
        </div>
        
        <div className="relative z-10 w-full">
          <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
            {DISTRICT_NAMES[district]} Zone
          </div>
          <div className="mt-1 text-sm font-mono text-cyber-cyan">
            ({Math.floor(posX)}, {Math.floor(posZ)})
          </div>
          <div className="text-[0.55rem] text-bio-silver/50 mt-1">
            {propertyCount} {propertyCount === 1 ? 'Property' : 'Properties'}
          </div>
        </div>
        
        {/* Player blip positioned using worldPosToPercent */}
        <div 
          className="absolute w-2 h-2 rounded-full bg-signal-green shadow-[0_0_8px_rgba(0,255,157,0.9)] animate-pulse" 
          style={{
            left: `${xPct}%`,
            top: `${zPct}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      </button>
    </div>
  );
}

/* ───────── Middle row cards (OLD - kept for compatibility) ───────── */

interface EconomyCardsRowMobileProps {
  world: any;
  defi: any;
  dao: any;
  creator: any;
  aiOps: any;
  onCardTap?: (actionId: string) => void;
}

function EconomyCardsRowMobile({ 
  world, 
  defi, 
  dao, 
  creator,
  aiOps,
  onCardTap 
}: EconomyCardsRowMobileProps) {
  const online = world.onlineFriends ?? 0;
  const voidBal = defi.voidPrice ?? 1.23;
  const psxPrice = dao.psxPrice ?? 0.45;

  return (
    <div className="flex gap-2 w-full">
      {/* Friends / social */}
      <button
        type="button"
        onClick={() => onCardTap?.('friends')}
        className="flex-1 rounded-2xl bg-black/75 backdrop-blur-xl border border-bio-silver/40 shadow-[0_0_18px_rgba(0,255,157,0.35)] px-3 py-2 flex flex-col items-start justify-between active:scale-95 transition-transform"
      >
        <div className="text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
          Online Friends
        </div>
        <div className="mt-1 text-[0.85rem] font-mono text-signal-green">
          {online} online now
        </div>
      </button>

      {/* DeFi tokens */}
      <button
        type="button"
        onClick={() => onCardTap?.('defi')}
        className="flex-1 rounded-2xl bg-black/75 backdrop-blur-xl border border-void-purple/50 shadow-[0_0_18px_rgba(124,58,237,0.5)] px-3 py-2 flex flex-col justify-between active:scale-95 transition-transform"
      >
        <div className="flex justify-between items-center text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
          <span>VOID</span>
          <span>PSX</span>
        </div>
        <div className="mt-1 flex justify-between items-baseline font-mono">
          <span className="text-[0.8rem] text-void-purple">
            ${voidBal.toFixed(2)}
          </span>
          <span className="text-[0.8rem] text-psx-blue">
            ${psxPrice.toFixed(2)}
          </span>
        </div>
      </button>

      {/* Mini radar / map */}
      <button
        type="button"
        onClick={() => onCardTap?.('map')}
        className="flex-1 rounded-2xl bg-black/75 backdrop-blur-xl border border-cyber-cyan/50 shadow-[0_0_18px_rgba(56,189,248,0.5)] px-2 py-2 flex flex-col justify-between active:scale-95 transition-transform"
      >
        <div className="flex justify-between items-center text-[0.6rem] uppercase tracking-[0.22em] text-bio-silver/60">
          <span>Radar</span>
          <span className="text-cyber-cyan">▸</span>
        </div>
        <MiniRadar creator={creator} defi={defi} dao={dao} aiOps={aiOps} />
      </button>
    </div>
  );
}

interface MiniRadarProps {
  creator: any;
  defi: any;
  dao: any;
  aiOps: any;
}

function MiniRadar({ creator, defi, dao, aiOps }: MiniRadarProps) {
  // POI counts for mobile
  const creatorSpots = creator.activeDrop ? 1 : 0;
  const vaultSpots = defi.vaults?.filter((v: any) => v.nearby)?.length ?? 0;
  const daoSpots = dao.activeProposals?.length ?? 0;
  const aiSpots = aiOps.hotspots?.length ?? 0;

  return (
    <div className="mt-1 relative w-full h-10 rounded-xl bg-gradient-to-br from-void-deep via-black to-void-purple/40 overflow-hidden">
      <div className="absolute inset-1 rounded-lg border border-bio-silver/20" />
      {/* dots just reflect density, not exact positions */}
      {creatorSpots > 0 && (
        <span className="absolute left-2 top-2 w-2 h-2 rounded-full bg-cyber-cyan shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
      )}
      {vaultSpots > 0 && (
        <span className="absolute right-3 bottom-2 w-2 h-2 rounded-full bg-void-purple shadow-[0_0_8px_rgba(139,92,246,0.9)]" />
      )}
      {daoSpots > 0 && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-psx-blue shadow-[0_0_8px_rgba(59,130,246,0.9)]" />
      )}
      {aiSpots > 0 && (
        <span className="absolute right-2 top-3 w-2 h-2 rounded-full bg-signal-green shadow-[0_0_8px_rgba(0,255,157,0.9)]" />
      )}
    </div>
  );
}

/* ───────── Chat Panel Mobile ───────── */

interface ChatPanelMobileProps {
  hasNearby: boolean;
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
  triggerFX: (type: string, data?: any) => void;
  onSendMessage: (text: string, channel: 'global' | 'nearby' | 'party') => void;
}

function ChatPanelMobile({
  hasNearby,
  chatState,
  triggerFX,
  onSendMessage,
}: ChatPanelMobileProps) {
  const [activeTab, setActiveTab] = React.useState<'global' | 'nearby' | 'party'>('global');
  const [inputText, setInputText] = React.useState('');

  const filteredMessages = chatState.messages.filter(
    msg => activeTab === 'global' || msg.channel === activeTab
  );

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText, activeTab);
    setInputText('');
    triggerFX('chatSend', { channel: activeTab });
  };

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

  return (
    <div className="h-full rounded-3xl bg-black/85 backdrop-blur-2xl border border-bio-silver/40 shadow-[0_0_28px_rgba(0,255,157,0.3)] flex flex-col overflow-hidden">
      {/* Header with tabs */}
      <div className="px-4 py-3 border-b border-bio-silver/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold tracking-[0.18em] uppercase text-signal-green">
            GLOBAL CHAT
          </h3>
          {hasNearby && (
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <TabButton
            label="Global"
            active={activeTab === 'global'}
            onClick={() => setActiveTab('global')}
          />
          <TabButton
            label="Nearby"
            active={activeTab === 'nearby'}
            onClick={() => setActiveTab('nearby')}
            badge={hasNearby}
          />
          <TabButton
            label="Party"
            active={activeTab === 'party'}
            onClick={() => setActiveTab('party')}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {filteredMessages.map((msg) => (
          <div key={msg.id} className="flex gap-2">
            {/* Hub spine */}
            <div className={`w-[3px] rounded-full ${getHubSpineClass(msg.hub)}`} />
            
            <div className="flex-1 min-w-0">
              {msg.type === 'system' ? (
                <div className="text-[0.7rem] text-bio-silver/70 italic">
                  {msg.hub && <span className="text-signal-green">[{msg.hub}]</span>} {msg.text}
                </div>
              ) : (
                <>
                  <div className="text-[0.65rem] text-bio-silver/60">
                    {msg.username}
                  </div>
                  <div className="text-[0.75rem] text-bio-silver/90">
                    {msg.text}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-bio-silver/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Message ${activeTab}...`}
            className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-bio-silver/30 text-[0.75rem] text-bio-silver placeholder-bio-silver/40 focus:outline-none focus:border-signal-green/50"
          />
          <button
            type="button"
            onClick={handleSend}
            className="px-4 py-2 rounded-xl bg-signal-green/20 border border-signal-green/50 text-signal-green text-[0.7rem] font-semibold uppercase tracking-wider active:scale-95 transition-transform"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: boolean;
}

function TabButton({ label, active, onClick, badge }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-3 py-1 rounded-lg text-[0.65rem] uppercase tracking-wider font-semibold transition-all ${
        active
          ? 'bg-signal-green/20 border border-signal-green/50 text-signal-green'
          : 'bg-black/40 border border-bio-silver/20 text-bio-silver/60'
      }`}
    >
      {label}
      {badge && !active && (
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
      )}
    </button>
  );
}

/* ───────── Bottom dock ───────── */

interface BottomDockMobileProps {
  onDockAction?: (actionId: string) => void;
}

function BottomDockMobile({ onDockAction }: BottomDockMobileProps) {
  const items = [
    { id: 'phone', label: 'Phone', hub: 'WORLD' },
    { id: 'friends', label: 'Friends', hub: 'WORLD' },
    { id: 'map', label: 'Map', hub: 'WORLD' },
    { id: 'vault', label: 'Vault', hub: 'DEFI' },
    { id: 'dao', label: 'DAO', hub: 'DAO' },
    { id: 'agency', label: 'Agency', hub: 'AGENCY' },
    { id: 'games', label: 'Games', hub: 'CREATOR' },
    { id: 'more', label: 'More', hub: 'AI_OPS' },
  ];

  const getHubGradient = (hub: string) => {
    switch (hub) {
      case 'WORLD': return 'from-signal-green/60 via-cyber-cyan/60 to-signal-green/60';
      case 'DEFI': return 'from-void-purple/60 via-void-purple/80 to-void-purple/60';
      case 'DAO': return 'from-psx-blue/60 via-psx-blue/80 to-psx-blue/60';
      case 'CREATOR': return 'from-cyber-cyan/60 via-cyber-cyan/80 to-cyber-cyan/60';
      case 'AGENCY': return 'from-red-500/60 via-red-600/80 to-red-500/60';
      case 'AI_OPS': return 'from-signal-green/60 via-emerald-500/80 to-signal-green/60';
      default: return 'from-bio-silver/60 via-bio-silver/80 to-bio-silver/60';
    }
  };

  return (
    <div className="w-full rounded-3xl bg-black/80 backdrop-blur-2xl border border-bio-silver/40 shadow-[0_0_28px_rgba(0,255,157,0.3)] px-3 py-2 flex items-center justify-between">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onDockAction?.(item.id)}
          className="flex-1 flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
        >
          <div className={`w-7 h-7 rounded-2xl bg-gradient-to-br ${getHubGradient(item.hub)} flex items-center justify-center text-[0.7rem] font-mono text-void-black shadow-[0_0_14px_rgba(0,255,198,0.7)]`}>
            {/* simple letter icon; replace with proper icons */}
            {item.label[0]}
          </div>
          <span className="text-[0.6rem] text-bio-silver/60">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
