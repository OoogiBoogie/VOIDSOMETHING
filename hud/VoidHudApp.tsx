'use client';

/**
 * VOID HUD APP - Chrome Dreamcore Hub System
 * 
 * OPTIMIZED FOR PC RENDERING:
 * - Memoized expensive computations
 * - Callback stability with useCallback
 * - Conditional hook execution
 * - Minimal re-renders
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { 
  useVoidEmitter, 
  useVoidVault, 
  useCreatorRoyalties,
  useClaimableRewards,
  useVotingPower 
} from '@/hooks/useVoidEngine';
import { useWorldState } from '@/hooks/useWorldState';
import { useLandMap } from '@/hooks/useLandData';
import { useGamification } from '@/hooks/useGamification';
import { useDemoData } from '@/hooks/useDemoData';
import { VOID_CONFIG, isDemoMode } from '@/config/voidConfig';
import { HUB_THEME, type HubMode } from '@/hud/theme';
import { type WindowType, type ActiveWindow, getWindowLabel } from '@/hud/windowTypes';
import type { EconomySnapshot, PlayerState } from '@/hud/types/economySnapshot';
import VoidHudLayout from '@/hud/VoidHudLayout';
import VoidWindowShell from '@/hud/VoidWindowShell';
import { CyberpunkCityMap } from '@/components/cyberpunk-city-map';
import { PropertyMarketplace } from '@/components/PropertyMarketplace';
import { GlobalLandInventory } from '@/components/land/global-inventory';
import MultiTabWindow, { type TabType } from '@/hud/tabs/MultiTabWindow';
import { MusicJukebox } from '@/components/music-jukebox';
import { AgencyBoardWindow } from '@/hud/world/windows/AgencyBoardWindow';
import { GuildsWindow } from '@/hud/world/windows/GuildsWindow';
import { ProfilePassportWindow } from '@/hud/world/windows/ProfilePassportWindow';
import { GlobalChatWindow } from '@/hud/world/windows/GlobalChatWindow';
import { PhoneWindow } from '@/hud/world/windows/PhoneWindow';
import { JobDetailWindow } from '@/hud/world/windows/JobDetailWindow';
import { LeaderboardsWindow } from '@/hud/world/windows/LeaderboardsWindow';
import { VoidToastContainer } from '@/components/VoidToastContainer';

export default function VoidHudApp() {
  const { address, isConnected } = useAccount();
  const { authenticated } = usePrivy();
  
  // Demo data (only if demo mode enabled)
  const demoData = useDemoData();
  
  // Token balances (live mode)
  const { data: voidBalance } = useBalance({
    address: address,
    token: VOID_CONFIG.contracts.VOID,
    query: { enabled: !!address && !isDemoMode() }
  });
  
  const { data: xVoidBalance } = useBalance({
    address: address,
    token: VOID_CONFIG.contracts.xVOIDVault,
    query: { enabled: !!address && !isDemoMode() }
  });
  
  // Hub mode state
  const [hubMode, setHubMode] = useState<HubMode>('WORLD');
  const [activeWindow, setActiveWindow] = useState<ActiveWindow | null>(null);

  // FX state for dopamine system
  const [fxState, setFxState] = useState<{
    missionCompleted?: boolean;
    tokenGain?: { token: string; amount: number; hub: string };
    chatIncoming?: { channel: string; hub?: string };
    tickerEvent?: { hub: string };
    mapPulse?: { hub: string; x: number; y: number };
    hubSwitch?: { from: HubMode; to: HubMode };
  }>({});

  // All data hooks with fallbacks
  const vxp = useVoidEmitter(address || '');
  const { positions = [] } = useVoidVault(address || '') || {};
  const { royalties } = useCreatorRoyalties(address || '');
  const { rewards } = useClaimableRewards(address || '');
  const { votingPower } = useVotingPower(address || '');
  const gamification = useGamification(address || '');
  const { position, nearbyEvents = [], friends = [] } = useWorldState(address) || {};
  const { districts = [], parcels = [] } = useLandMap() || {};

  // FX trigger system (MUST be defined before other callbacks that use it)
  const triggerFX = useCallback((fx: string, payload?: any) => {
    setFxState(prev => ({ ...prev, [fx]: payload }));
    
    // Clear FX after animation
    setTimeout(() => {
      setFxState(prev => {
        const next = { ...prev } as any;
        delete next[fx];
        return next;
      });
    }, 1000);
  }, []);

  // Window management
  const openWindow = useCallback((type: WindowType, props: any = {}) => {
    setActiveWindow({ type, props });
    triggerFX('windowOpen', { type });
  }, [triggerFX]);

  const closeWindow = useCallback(() => {
    setActiveWindow(null);
    triggerFX('windowClose', {});
  }, [triggerFX]);

  // Hub mode switching with FX
  const switchHub = useCallback((newMode: HubMode) => {
    const oldMode = hubMode;
    setHubMode(newMode);
    triggerFX('hubSwitch', { from: oldMode, to: newMode });
  }, [hubMode, triggerFX]);

  // Build economy snapshot (same as WorldHubV2)
  const vxpData = vxp.vxp;
  const level = vxpData ? Math.floor(vxpData.total / 5000) + 1 : 7;
  const currentXP = vxpData?.total || 14820;
  const xpNext = level * 5000;
  const xpProgress = Math.round(((currentXP % 5000) / 5000) * 100);

  // OPTIMIZATION: Memoize expensive economy snapshot to prevent re-renders
  const economySnapshot: EconomySnapshot = useMemo(() => {
    // Determine data source: demo mode or live mode
    const voidPrice = isDemoMode() ? 0.0024 : 0.0024; // TODO: Live oracle when available
    const voidChange24h = isDemoMode() ? 12.5 : 12.5; // TODO: Live oracle when available
    const psxPrice = isDemoMode() ? 0.0018 : 0.0018; // TODO: Live oracle when available
    const psxChange24h = isDemoMode() ? -3.2 : -3.2; // TODO: Live oracle when available
    const signalEpoch = isDemoMode() ? 42 : 42; // TODO: Live signal data when available
    const emissionMultiplier = isDemoMode() ? 2.4 : 2.4; // TODO: Live signal data when available
    
    return {
      world: {
        zone: districts[0]?.name || 'VOID_CORE',
        coordinates: position || { x: 0, z: 0 },
        onlineFriends: friends?.length || 0,
        nearbyPlayers: [],
        nearbyProjects: [],
        districts: (districts || []).map(d => ({
          id: d.id,
          name: d.name,
          color: d.color || 'var(--void-neon-teal)',
          bounds: { x: [0, 100], z: [0, 100] }
        }))
      },
      creator: {
        royaltiesEarned: royalties ? parseFloat(royalties.totalEarned || '0') : 0,
        trendingDrops: [],
        activeLaunches: [],
        myCreatorToken: undefined
      },
      defi: {
        voidPrice,
        voidChange24h,
        psxPrice,
        psxChange24h,
        signalEpoch,
        emissionMultiplier,
        nextEmissionIn: 7200,
        vaults: [],
        myPositions: []
      },
      dao: {
        activeProposals: [],
        myVotingPower: votingPower?.totalPower || 1.0,
        psxBalance: isDemoMode() && demoData 
          ? demoData.balances.psx 
          : (typeof votingPower?.psxHeld === 'string' ? parseFloat(votingPower.psxHeld) : (votingPower?.psxHeld || 50000)),
        reputationPoints: level * 100,
        lastVoted: undefined
      },
      agency: {
        myRole: 'FREELANCE',
        myAgency: undefined,
        pledgeStatus: 'NONE',
        psxPledged: 0,
        openGigs: isDemoMode() && demoData ? demoData.gigs : [],
        squadsOnline: 0,
        recruiting: 0
      },
      aiOps: {
        logs: [],
        hotspots: [],
        suggestions: [],
        riskFlags: []
      },
      missions: [],
      recentRewards: [],
      pois: [],
      tickerItems: [],
      chatMessages: isDemoMode() && demoData ? demoData.chatMessages : []
    };
  }, [districts, position, friends, royalties, votingPower, level, demoData]);

  // OPTIMIZATION: Memoize player state
  const playerState: PlayerState = useMemo(() => ({
    username: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Guest',
    walletAddress: address || '',
    avatarUrl: '',
    level,
    xp: currentXP,
    xpProgress,
    streak: 4,
    achievements: 0,
    voidBalance: (positions || []).reduce((sum, p) => sum + parseFloat(p.stakedAmount || '0'), 0) || 1250,
    signalBalance: 0,
    psxBalance: typeof votingPower?.psxHeld === 'string' ? parseFloat(votingPower.psxHeld) : (votingPower?.psxHeld || 50000),
    createBalance: royalties ? parseFloat(royalties.totalEarned || '0') : 0,
    chain: 'Base'
  }), [address, level, currentXP, xpProgress, positions, votingPower, royalties]);

  const theme = HUB_THEME[hubMode];

  return (
    <div
      className="relative w-full h-screen overflow-hidden text-bio-silver transition-colors duration-700"
    >
      {/* 3D world viewport shows through - no background on HUD */}

      {/* HUD shell (no page scrolling) */}
      <VoidHudLayout
        snapshot={economySnapshot}
        playerState={playerState}
        hubMode={hubMode}
        setHubMode={switchHub}
        onOpenWindow={openWindow}
        triggerFX={triggerFX}
        theme={theme}
        fxState={fxState}
      />

      {/* Center pop-out bay: between header & footer, within safe play column */}
      <div className="pointer-events-auto absolute inset-x-0 top-[90px] bottom-[90px] flex justify-center items-center z-[60]">
        {activeWindow && (
          <VoidWindowShell
            windowType={activeWindow.type}
            theme={theme}
            onClose={closeWindow}
          >
            {activeWindow.type === 'WORLD_MAP' && (
              <CyberpunkCityMap 
                playerPosition={position || { x: 0, z: 0 }} 
                onTeleport={(x, z) => console.log('Teleport to:', x, z)}
                onClose={closeWindow} 
              />
            )}
            {(activeWindow.type === 'PROPERTY_MARKET' || activeWindow.type === 'ZONES') && (
              <div className="h-full">
                <PropertyMarketplace 
                  isOpen={true}
                  onClose={closeWindow}
                  walletAddress={address || ''}
                  voidBalance={playerState.voidBalance}
                  onPurchase={(property) => console.log('Purchase:', property)}
                />
              </div>
            )}
            {(activeWindow.type === 'LAND_REGISTRY' || activeWindow.type === 'DEFI_OVERVIEW' || activeWindow.type === 'VAULT_DETAIL') && (
              <div className="h-full">
                <GlobalLandInventory />
              </div>
            )}
            {/* Multi-Tab Window */}
            {activeWindow.type === 'MULTI_TAB' && (
              <MultiTabWindow 
                defaultTab={activeWindow.props?.defaultTab || 'wallet'}
                onClose={closeWindow}
              />
            )}
            {/* Music Jukebox Window */}
            {activeWindow.type === 'MUSIC' && (
              <MusicJukebox
                isOpen={true}
                onClose={closeWindow}
                voidBalance={playerState.voidBalance}
                onVote={(trackId: string, cost: number) => {
                  console.log('🎵 Voted for track:', trackId, 'Cost:', cost);
                  triggerFX('tokenSpend', { amount: cost, reason: 'jukebox_vote' });
                }}
              />
            )}

            {/* BASE • WALLET Window - Full wallet UI with balances, staking */}
            {activeWindow.type === 'WALLET' && (
              <MultiTabWindow
                defaultTab={'wallet' as TabType}
                onClose={closeWindow}
              />
            )}

            {/* AGENCY • GIG BOARD Window - Jobs, squads, gigs */}
            {activeWindow.type === 'AGENCY_BOARD' && (
              <AgencyBoardWindow
                agency={economySnapshot.agency}
                onOpenWindow={openWindow}
                onClose={closeWindow}
              />
            )}

            {/* SOCIAL • GUILDS Window - Community, guilds, social */}
            {activeWindow.type === 'GUILDS' && (
              <GuildsWindow
                onOpenWindow={openWindow}
                onClose={closeWindow}
              />
            )}

            {/* SOCIAL • PROFILE - Profile Passport (Identity Card) */}
            {activeWindow.type === 'PLAYER_PROFILE' && (
              <ProfilePassportWindow
                address={activeWindow.props?.address}
                onOpenWindow={openWindow}
                onClose={closeWindow}
              />
            )}

            {/* COMMS • GLOBAL CHAT - Public chat room */}
            {activeWindow.type === 'GLOBAL_CHAT' && (
              <GlobalChatWindow onClose={closeWindow} />
            )}

            {/* COMMS • PHONE - Direct messages (1:1 DMs) */}
            {activeWindow.type === 'PHONE' && (
              <PhoneWindow onClose={closeWindow} />
            )}

            {/* AGENCY • GIG DETAIL - Full gig information and application */}
            {activeWindow.type === 'JOB_DETAIL' && (
              <JobDetailWindow
                jobId={activeWindow.props?.jobId ?? 'default'}
                onClose={closeWindow}
              />
            )}

            {/* SOCIAL • LEADERBOARDS - Global rankings */}
            {activeWindow.type === 'LEADERBOARDS' && (
              <LeaderboardsWindow onClose={closeWindow} />
            )}

            {/* Fallback for windows without specific content yet */}
            {!['WORLD_MAP', 'LAND_REGISTRY', 'PROPERTY_MARKET', 'ZONES', 'DEFI_OVERVIEW', 'VAULT_DETAIL', 'MULTI_TAB', 'MUSIC', 'WALLET', 'AGENCY_BOARD', 'GUILDS', 'PLAYER_PROFILE', 'GLOBAL_CHAT', 'PHONE', 'JOB_DETAIL', 'LEADERBOARDS'].includes(activeWindow.type) && (
              <div className="text-bio-silver p-6 text-center">
                <h3 className="text-lg font-bold mb-2">{getWindowLabel(activeWindow.type)}</h3>
                <p className="text-sm text-bio-silver/60">Window content coming soon...</p>
              </div>
            )}
          </VoidWindowShell>
        )}
      </div>

      {/* Hub switch FX overlay */}
      {fxState.hubSwitch && (
        <div className="pointer-events-none absolute inset-0 z-[100]">
          <div className={`absolute inset-0 ${theme.chromeGlow} opacity-0 animate-pulse`} />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-bio-silver to-transparent animate-[sweep_0.8s_ease-out]" />
        </div>
      )}

      {/* Toast Notification Container */}
      <VoidToastContainer />
    </div>
  );
}
