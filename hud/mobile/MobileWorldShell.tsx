'use client';

/**
 * MOBILE WORLD SHELL - Unified Mobile HUD System
 * 
 * Manages two mobile view modes:
 * - LITE: Info-dense dashboard for "managing" (portrait)
 * - ROAM: Minimal overlay for "exploring" (full-screen 3D)
 * 
 * Principles:
 * - No HUD over character core (vertical safe lane)
 * - Stacked bands instead of gutters
 * - GLOBAL chat = default + always mounted
 * - Same hub ideology across both modes
 */

import React, { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { 
  useVoidEmitter, 
  useVoidVault, 
  useCreatorRoyalties,
  useVotingPower 
} from '@/hooks/useVoidEngine';
import { useWorldState } from '@/hooks/useWorldState';
import { useLandMap } from '@/hooks/useLandData';
import { useGamification } from '@/hooks/useGamification';
import type { EconomySnapshot, PlayerState as PlayerStateType } from '@/hud/types/economySnapshot';
import MobileLiteHUD from './MobileLiteHUD_v2';
import MobileRoamHUD from './MobileRoamHUD_v2';

type MobileViewMode = 'lite' | 'roam';

export default function MobileWorldShell() {
  const { address } = useAccount();
  const [viewMode, setViewMode] = useState<MobileViewMode>('roam');
  const [fxState, setFxState] = useState({
    missionCompleted: false,
    tokenGain: false,
    chatIncoming: false,
    tickerEvent: false,
    mapPulse: false
  });

  // Real data hooks
  const { vxp } = useVoidEmitter(address || '');
  const { positions } = useVoidVault(address || '');
  const { royalties } = useCreatorRoyalties(address || '');
  const { votingPower } = useVotingPower(address || '');
  const { position, friends, nearbyEvents } = useWorldState(address);
  const { districts } = useLandMap();
  const gamification = useGamification(address || '');

  // Calculated values
  const level = vxp ? Math.floor(vxp.total / 5000) + 1 : 7;
  const currentXP = vxp?.total || 14820;
  const xpNext = level * 5000;
  const xpProgress = Math.round(((currentXP % 5000) / 5000) * 100);

  const voidBalance = positions?.reduce((sum, p) => sum + parseFloat(p.stakedAmount), 0) || 1250;
  const signalBalance = 0; // TODO: Get from SIGNAL token contract
  const psxBalance = typeof votingPower?.psxHeld === 'string' ? parseFloat(votingPower.psxHeld) : (votingPower?.psxHeld || 50000);
  const createBalance = royalties ? parseFloat(royalties.totalEarned || '0') : 0;

  // Build EconomySnapshot
  const economySnapshot = useMemo<EconomySnapshot>(() => ({
    world: {
      zone: districts[0]?.name || 'VOID_CORE',
      coordinates: position || { x: 0, z: 0 },
      onlineFriends: friends?.length || 0,
      nearbyPlayers: nearbyEvents?.map(e => ({
        x: 0,
        z: 0,
        username: 'Player'
      })) || [],
      nearbyProjects: [],
      districts: districts.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description || '',
        color: d.color || '#00FF9D',
        bounds: { x: [0, 100] as [number, number], z: [0, 100] as [number, number] },
        playerCount: 0
      }))
    },
    creator: {
      royaltiesEarned: parseFloat(royalties?.totalEarned || '0'),
      trendingDrops: [],
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
      myVotingPower: votingPower?.totalPower || 1.0,
      psxBalance: typeof votingPower?.psxHeld === 'string' ? parseFloat(votingPower.psxHeld) : (votingPower?.psxHeld || 50000),
      reputationPoints: level * 100,
      lastVoted: undefined
    },
    agency: {
      myRole: 'FREELANCE',
      myAgency: undefined,
      pledgeStatus: 'NONE',
      psxPledged: 0,
      openGigs: [],
      squadsOnline: 0,
      recruiting: 0,
      recruitingMode: false
    },
    aiOps: {
      logs: [
        { id: '1', agent: 'VaultAI', action: 'detected anomaly in Gaming District', timestamp: Date.now() - 120000, hub: 'DEFI' },
        { id: '2', agent: 'MissionAI', action: 'indexed new art piece in Gallery', timestamp: Date.now() - 300000, hub: 'WORLD' }
      ],
      hotspots: [],
      suggestions: [],
      riskFlags: []
    },
    missions: [
      { id: '1', title: 'Explore Gaming District', description: 'Visit the new Gaming District', hub: 'WORLD', reward: '+35 vXP', progress: 60, onClick: () => console.log('Navigate to Gaming District') },
      { id: '2', title: 'Visit DeFi Tower', description: 'Check out the DeFi vault', hub: 'DEFI', reward: '+50 vXP', progress: 0, onClick: () => console.log('Navigate to DeFi Tower') },
      { id: '3', title: 'Check Creator Hub', description: 'Support a creator drop', hub: 'CREATOR', reward: '+25 vXP', progress: 100, onClick: () => console.log('Navigate to Creator Hub') }
    ],
    recentRewards: [],
    tickerItems: [
      { id: '1', hub: 'DAO', message: 'Proposal #27 ends in 2h', priority: 1 },
      { id: '2', hub: 'CREATOR', message: 'Lattice Dreams #01 mint 23%', priority: 2 },
      { id: '3', hub: 'DEFI', message: 'SIGNAL epoch 132 · 1.32× multiplier', priority: 1 }
    ],
    pois: [
      { id: 'p1', hub: 'DEFI', type: 'vault', position: { x: 10, z: 20 }, label: 'DeFi Tower', active: true },
      { id: 'p2', hub: 'DAO', type: 'proposal', position: { x: -15, z: 30 }, label: 'DAO Hub', active: true },
      { id: 'p3', hub: 'CREATOR', type: 'drop', position: { x: 25, z: -10 }, label: 'Creator Gallery', active: false }
    ],
    chatMessages: []
  }), [position, districts, friends, nearbyEvents, positions, royalties, votingPower, level]);

  // Build PlayerState
  const playerState = useMemo<PlayerStateType>(() => ({
    username: 'Operator',
    walletAddress: address || '0x0000000000000000000000000000000000000000',
    avatarUrl: '',
    level,
    xp: currentXP,
    xpProgress,
    streak: 4, // TODO: Get from gamification
    achievements: 12, // TODO: Get from gamification
    voidBalance,
    signalBalance,
    psxBalance,
    createBalance,
    chain: 'Base'
  }), [address, level, currentXP, xpProgress, voidBalance, signalBalance, psxBalance, createBalance]);

  // Chat state (mock for now)
  const [chatState] = useState({
    messages: [
      { 
        id: '1', 
        hub: 'WORLD', 
        type: 'user' as const,
        username: 'void_walker',
        text: 'Anyone exploring the new district?',
        timestamp: Date.now() - 120000,
        channel: 'global' as const
      },
      { 
        id: '2', 
        hub: 'DEFI', 
        type: 'system' as const,
        text: 'New vault opened in Gaming District',
        timestamp: Date.now() - 60000,
        channel: 'global' as const
      },
      { 
        id: '3', 
        type: 'user' as const,
        username: 'creator_xyz',
        text: 'Check out my new drop!',
        timestamp: Date.now() - 30000,
        channel: 'global' as const
      }
    ],
    activeChannel: 'global' as const
  });

  // Dopamine FX trigger
  const triggerFX = (type: string, data?: any) => {
    console.log('🎮 Mobile FX:', type, data);
    
    // Update FX state
    if (type === 'chatPing') {
      setFxState(prev => ({ ...prev, chatIncoming: true }));
      setTimeout(() => setFxState(prev => ({ ...prev, chatIncoming: false })), 2000);
    } else if (type === 'tokenGain') {
      setFxState(prev => ({ ...prev, tokenGain: true }));
      setTimeout(() => setFxState(prev => ({ ...prev, tokenGain: false })), 2000);
    }
    
    // TODO: wire to audio/visual FX system
    // - Haptic feedback on mobile
    // - Sound effects
    // - Visual particles
  };

  // Message handler
  const handleSendMessage = (text: string, channel: 'global' | 'nearby' | 'party') => {
    console.log('📤 Send message:', { text, channel });
    // TODO: wire to chat service
    triggerFX('chatSend', { channel });
  };

  // Dock action handler
  const handleDockAction = (actionId: string) => {
    console.log('🎯 Dock action:', actionId);
    
    switch (actionId) {
      case 'phone':
        // TODO: Open phone interface
        break;
      case 'friends':
        // TODO: Open friends list
        break;
      case 'map':
        // TODO: Open full map
        break;
      case 'vault':
        // TODO: Open vault interface
        break;
      case 'dao':
        // TODO: Open DAO interface
        break;
      case 'agency':
        // TODO: Open agency interface
        break;
      case 'games':
        // TODO: Open games/casino
        break;
      case 'more':
        // Switch to LITE view
        setViewMode('lite');
        break;
      default:
        console.log('Unknown action:', actionId);
    }
  };

  return (
    <div className="relative w-full h-full bg-void-gradient text-bio-silver overflow-hidden">
      {/* 3D World Viewport would go here */}
      {/* <WorldViewportMobile /> */}

      {/* HUD overlay - switches between LITE and ROAM */}
      {viewMode === 'lite' ? (
        <MobileLiteHUD
          snapshot={economySnapshot}
          playerState={playerState}
          chatState={chatState}
          fxState={fxState}
          triggerFX={triggerFX}
          onSendMessage={handleSendMessage}
          onDockAction={handleDockAction}
        />
      ) : (
        <MobileRoamHUD
          snapshot={economySnapshot}
          playerState={playerState}
          chatState={chatState}
          fxState={fxState}
          triggerFX={triggerFX}
          onOpenLiteView={() => setViewMode('lite')}
          onDockAction={handleDockAction}
        />
      )}

      {/* Mode toggle (dev only - remove in production) */}
      <button
        type="button"
        onClick={() => setViewMode(prev => prev === 'lite' ? 'roam' : 'lite')}
        className="absolute top-4 left-4 z-[100] px-3 py-1 rounded-lg bg-signal-green/20 border border-signal-green/50 text-signal-green text-[0.65rem] uppercase tracking-wider font-semibold pointer-events-auto"
      >
        {viewMode === 'lite' ? 'Switch to ROAM' : 'Switch to LITE'}
      </button>
    </div>
  );
}
