'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { 
  useVoidEmitter, 
  useVoidVault, 
  useCreatorRoyalties,
  useClaimableRewards 
} from '@/hooks/useVoidEngine';
import { useWorldState } from '@/hooks/useWorldState';
import { useLandMap } from '@/hooks/useLandData';
import { useGamification } from '@/hooks/useGamification';
import PlayerChip from '@/hud/world/PlayerChip';
import TopTicker from '@/hud/world/TopTicker';
import MiniMap from '@/hud/world/MiniMap';
import LeftRail from '@/hud/world/LeftRail';
import RightRail from '@/hud/world/RightRail';
import ContextActionBar from '@/hud/world/ContextActionBar';
import BottomAppDock from '@/hud/world/BottomAppDock';
import WindowShell, { type WindowType } from '@/hud/world/WindowShell';
import type { EconomySnapshot, PlayerState as PlayerStateType } from '@/hud/types/economySnapshot';

export default function WorldHubV2() {
  const { address } = useAccount();
  
  // All data hooks
  const vxp = useVoidEmitter(address || '');
  const { positions } = useVoidVault(address || '');
  const { royalties } = useCreatorRoyalties(address || '');
  const { rewards } = useClaimableRewards(address || '');
  const gamification = useGamification(address || '');
  const { position, nearbyEvents, friends } = useWorldState(address);
  const { districts, parcels } = useLandMap();

  // Window management
  const [activeWindow, setActiveWindow] = useState<{ type: WindowType; props?: any } | null>(null);

  const openWindow = useCallback((type: WindowType, props: any = {}) => {
    setActiveWindow({ type, props });
  }, []);

  const closeWindow = useCallback(() => {
    setActiveWindow(null);
  }, []);

  // Context state
  const [contextAction, setContextAction] = useState<{
    type: 'talk' | 'open' | 'trade' | 'enter' | 'use' | 'scan';
    label: string;
    key: string;
  } | null>(null);

  // FX state for dopamine system
  const [fxState, setFxState] = useState<{
    missionCompleted?: boolean;
    tokenGain?: { token: string; amount: number; hub: string };
    chatIncoming?: { channel: string; hub?: string };
    tickerEvent?: { hub: string };
    mapPulse?: { hub: string; x: number; y: number };
  }>({});

  // Calculate derived values
  const level = vxp?.vxp ? Math.floor(vxp.vxp.total / 5000) + 1 : 1;
  const currentXP = vxp?.vxp?.total || 0;
  const xpProgress = ((currentXP % 5000) / 5000) * 100;
  const voidBalance = positions?.reduce((sum, p) => sum + parseFloat(p.stakedAmount), 0) || 0;
  const signalBalance = currentXP; // SIGNAL = vXP in this context
  const psxBalance = 50000; // TODO: wire real PSX balance
  const createBalance = parseFloat(royalties?.totalEarned || '0');
  const totalStaked = voidBalance;
  const claimableRewards = rewards?.reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;

  // Build EconomySnapshot from all hub data
  const economySnapshot: EconomySnapshot = useMemo(() => ({
    world: {
      zone: districts[0]?.name || 'VOID_CORE',
      coordinates: position || { x: 0, z: 0 },
      onlineFriends: friends?.length || 0,
      nearbyPlayers: [],
      nearbyProjects: [],
      districts: districts.map(d => ({
        id: d.id,
        name: d.name,
        color: d.color || '#00FF9D',
        bounds: { x: [0, 100] as [number, number], z: [0, 100] as [number, number] }
      }))
    },
    creator: {
      royaltiesEarned: createBalance,
      trendingDrops: [
        { id: '1', creator: 'ChromeArtist', name: 'Lattice Dreams #01', minted: 23, total: 100, location: { x: 10, z: 15 } }
      ],
      activeLaunches: [],
      myCreatorToken: undefined
    },
    defi: {
      voidPrice: 1.23,
      voidChange24h: 4.2,
      psxPrice: 0.45,
      psxChange24h: -1.3,
      signalEpoch: 132,
      emissionMultiplier: 1.32,
      nextEmissionIn: 86400,
      vaults: positions?.map((p, idx) => ({
        id: p.id || `vault-${idx}`,
        name: `Vault ${idx + 1}`,
        tvl: parseFloat(p.stakedAmount) * 1.23,
        apy: 12.5,
        location: { x: idx * 10, z: idx * 10 }
      })) || [],
      myPositions: positions?.map(p => ({
        vaultId: p.id || '',
        staked: parseFloat(p.stakedAmount),
        rewards: p.pendingRewards.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0)
      })) || []
    },
    dao: {
      activeProposals: [
        { id: '27', title: 'Increase creator emissions', endsAt: Date.now() + 7200000, status: 'ACTIVE', votesFor: 125000, votesAgainst: 45000 }
      ],
      myVotingPower: 1.0,
      psxBalance: psxBalance,
      reputationPoints: 0,
      lastVoted: undefined
    },
    agency: {
      myRole: 'EXPLORER',
      myAgency: undefined,
      pledgeStatus: 'NONE',
      psxPledged: 0,
      openGigs: [
        { id: '1', title: 'Level designer needed', reward: '500 VOID + 2000 PSX', hub: 'CREATOR', location: { x: 20, z: 30 } }
      ],
      squadsOnline: 3,
      recruiting: 2
    },
    aiOps: {
      logs: [
        { id: '1', agent: 'EmissionAI', action: 'tilting toward creator rewards this epoch', timestamp: Date.now(), hub: 'DEFI' },
        { id: '2', agent: 'VaultAI', action: 'rebalanced pools toward creator tokens', timestamp: Date.now() - 120000, hub: 'DEFI' }
      ],
      hotspots: [
        { x: 10, z: 15, reason: 'New creator drop: Lattice Dreams #01', hub: 'CREATOR' }
      ],
      suggestions: [],
      riskFlags: []
    },
    missions: [
      { id: '1', hub: 'WORLD', title: 'Explore Gaming District', description: 'Visit District 7', progress: 60, reward: '+35 SIGNAL', onClick: () => console.log('Navigate to District 7') },
      { id: '2', hub: 'DEFI', title: 'Stake into a vault', description: 'Stake 100 VOID', progress: 0, reward: '+50 VOID', onClick: () => console.log('Open DeFi Hub') },
      { id: '3', hub: 'CREATOR', title: 'Support a creator drop', description: 'Mint from any creator', progress: 100, reward: '+25 CREATE', onClick: () => console.log('Open Creator Hub') }
    ],
    recentRewards: [
      { id: '1', hub: 'WORLD', action: 'Mission complete', tokens: [{ symbol: 'SIGNAL', amount: 35 }], timestamp: Date.now() - 300000 }
    ],
    tickerItems: [
      { id: '1', hub: 'DEFI', message: `VOID $1.23 (+4.2%) · SIGNAL epoch 132 · 1.32×`, priority: 10 },
      { id: '2', hub: 'DAO', message: 'Proposal #27 ends in 2h', priority: 8 },
      { id: '3', hub: 'CREATOR', message: '"Lattice Dreams #01" mint 23% · District 7', priority: 7 },
      { id: '4', hub: 'AI_OPS', message: 'EmissionAI tilting toward creator rewards', priority: 6 }
    ],
    pois: [
      { id: '1', hub: 'CREATOR', type: 'drop', position: { x: 10, z: 15 }, label: 'Lattice Dreams', active: true },
      { id: '2', hub: 'DEFI', type: 'vault', position: { x: -20, z: 10 }, label: 'Vault #47', active: true },
      { id: '3', hub: 'AGENCY', type: 'gig', position: { x: 20, z: 30 }, label: 'Job Board', active: true }
    ],
    chatMessages: []
  }), [position, friends, districts, positions, createBalance, psxBalance, royalties]);

  // Build PlayerState
  const playerState: PlayerStateType = useMemo(() => ({
    username: 'Operator',
    avatarUrl: '',
    walletAddress: address || '0x0000000000000000000000000000000000000000',
    chain: 'BASE',
    level,
    xp: currentXP,
    xpProgress,
    streak: 4,
    achievements: 12,
    voidBalance,
    signalBalance,
    psxBalance,
    createBalance
  }), [address, level, currentXP, xpProgress, voidBalance, signalBalance, psxBalance, createBalance]);

  // Dopamine FX trigger
  const triggerFX = (type: string, data?: any) => {
    console.log('🎮 FX:', type, data);
    // TODO: wire to audio/visual FX system
  };

  const hasNearbyPlayers = (friends?.length || 0) > 0;

  // Helper to get hub accent colors
  const getHubColor = (hub: string): string => {
    switch (hub) {
      case 'DEFI': return '#7C00FF';
      case 'DAO': return '#00D4FF';
      case 'CREATOR': return '#00D4FF';
      case 'AGENCY': return '#FF0000';
      case 'AI_OPS': return '#00FF9D';
      default: return '#E5E7EB';
    }
  };

  return (
    <div className="relative w-full h-screen bg-void-gradient text-bio-silver overflow-hidden">
      {/* Chrome dreamcore background layer */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 50% at 20% 30%, rgba(0,234,255,0.15), transparent 60%),
              radial-gradient(ellipse 70% 60% at 80% 70%, rgba(124,0,255,0.12), transparent 65%),
              linear-gradient(135deg, transparent 0%, rgba(0,255,157,0.05) 50%, transparent 100%)
            `,
          }}
        />
      </div>

      {/* OVERLAY HUD - positioned in yellow gutters */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* TOP BAND: PlayerChip | Ticker | MiniMap */}
        <div className="pointer-events-auto px-4 pt-3">
          <div className="grid grid-cols-[minmax(0,22%)_minmax(0,56%)_minmax(0,22%)] items-start gap-4">
            <PlayerChip
              username={playerState.username}
              avatarUrl=""
              walletAddress={playerState.walletAddress}
              level={playerState.level}
              xp={playerState.xp}
              xpProgress={playerState.xpProgress}
              zone={economySnapshot.world.zone}
              coordinates={economySnapshot.world.coordinates}
              voidBalance={playerState.voidBalance}
              signalBalance={playerState.signalBalance}
              psxBalance={playerState.psxBalance}
              createBalance={playerState.createBalance}
              votingPower={economySnapshot.dao.myVotingPower}
              agencyRole={economySnapshot.agency.myRole}
              agencyName={economySnapshot.agency.myAgency?.name}
              pledgeStatus={economySnapshot.agency.pledgeStatus}
              chain="Base"
            />
            
            <TopTicker
              voidPrice={economySnapshot.defi.voidPrice}
              voidChange={economySnapshot.defi.voidChange24h}
              psxPrice={economySnapshot.defi.psxPrice}
              psxChange={economySnapshot.defi.psxChange24h}
              signalEpoch={economySnapshot.defi.signalEpoch}
              emissionMultiplier={economySnapshot.defi.emissionMultiplier}
              tickerItems={economySnapshot.tickerItems
                .filter((item): item is typeof item & { hub: 'DEFI' | 'DAO' | 'CREATOR' | 'AGENCY' | 'AI_OPS' } => 
                  item.hub !== 'WORLD'
                )
                .map(item => ({
                  ...item,
                  color: getHubColor(item.hub)
                }))}
              networkStatus="online"
            />
            
            <MiniMap
              playerPosition={economySnapshot.world.coordinates}
              districts={economySnapshot.world.districts}
              nearbyPlayers={economySnapshot.world.nearbyPlayers}
              pois={economySnapshot.pois.filter((p): p is typeof p & { hub: 'DEFI' | 'DAO' | 'CREATOR' | 'AGENCY' | 'AI_OPS' } => 
                p.hub !== 'WORLD'
              )}
              aiHotspots={economySnapshot.aiOps.hotspots}
              onMapClick={() => openWindow('worldMap', { world: economySnapshot.world })}
            />
          </div>
        </div>

        {/* MIDDLE: Left Rail | SAFE ZONE | Right Rail */}
        <div className="pointer-events-auto px-4 pt-3 pb-24">
          <div className="grid grid-cols-[minmax(0,22%)_minmax(0,56%)_minmax(0,22%)] gap-4 h-full">
            {/* LEFT GUTTER - Social & Missions */}
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-180px)]">
              <LeftRail
                level={playerState.level}
                streak={playerState.streak}
                missions={economySnapshot.missions}
                friendsOnline={economySnapshot.world.onlineFriends}
                nearbyPlayers={economySnapshot.world.nearbyPlayers.length}
                achievements={playerState.achievements}
              />
            </div>

            {/* CENTER SAFE AREA - NO HUD (blue zone) */}
            <div className="pointer-events-none relative">
              {/* Optional: subtle chrome grid overlay that doesn't block view */}
              <div className="absolute inset-0 opacity-5">
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: 'linear-gradient(0deg, rgba(0,255,157,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,157,0.3) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                  }}
                />
              </div>
            </div>

            {/* RIGHT GUTTER - System & Chat */}
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-180px)]">
              <RightRail
                hasNearbyPlayers={hasNearbyPlayers}
                claimableRewards={claimableRewards}
                totalStaked={totalStaked}
                emissionCountdown={economySnapshot.defi.nextEmissionIn}
                aiActivity={economySnapshot.aiOps.logs.map(log => ({
                  id: log.id,
                  message: `[${log.agent}] ${log.action}`,
                  timestamp: log.timestamp
                }))}
                onClaimRewards={() => console.log('Claim rewards')}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM BAND: Context Action + App Dock */}
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 pb-3">
          <div className="flex flex-col items-center gap-2">
            {contextAction && (
              <ContextActionBar
                type={contextAction.type}
                label={contextAction.label}
                keyBinding={contextAction.key}
              />
            )}
            
            <BottomAppDock
              onAppClick={(appId) => {
                const windowMap: Record<string, WindowType> = {
                  phone: 'friendsList',
                  friends: 'friendsList',
                  map: 'worldMap',
                  vault: 'defiOverview',
                  dao: 'daoConsole',
                  agency: 'agencyBoard',
                  games: 'games',
                  more: 'voidHub',
                };
                const windowType = windowMap[appId];
                if (windowType) {
                  const props: Record<string, any> = {};
                  if (windowType === 'worldMap') props.world = economySnapshot.world;
                  if (windowType === 'defiOverview') props.defi = economySnapshot.defi;
                  if (windowType === 'daoConsole') props.dao = economySnapshot.dao;
                  if (windowType === 'agencyBoard') props.agency = economySnapshot.agency;
                  openWindow(windowType, props);
                }
              }}
            />
          </div>
        </div>

        {/* CENTER WINDOW BAY - floats above center safe zone */}
        <div className="pointer-events-none absolute inset-x-0 top-[88px] bottom-[96px] flex justify-center items-center">
          {activeWindow && (
            <WindowShell activeWindow={activeWindow} onClose={closeWindow} />
          )}
        </div>
      </div>
    </div>
  );
}
