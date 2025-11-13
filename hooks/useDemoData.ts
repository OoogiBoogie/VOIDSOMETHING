/**
 * DEMO DATA PROVIDER
 * 
 * Provides rich, realistic demo data when demo mode is enabled.
 * Seeds the world with convincing content for stakeholder presentations.
 */

import { useMemo } from 'react';
import { DEMO, isDemoMode, getDemoWallet } from '@/config/voidConfig';
import type { Tier } from '@/hooks/useVoidScore';

export interface DemoData {
  // Passport data
  passport: {
    tier: Tier;
    currentScore: number;
    lifetimeScore: number;
    accountAge: number;
    progress: number;
    nextTierThreshold: number;
    globalMessagesRemaining: number;
    zoneMessagesRemaining: number;
    dmMessagesRemaining: number;
  };
  
  // Token balances
  balances: {
    void: number;
    xVoid: number;
    psx: number;
    signals: number;
  };
  
  // Quest progress
  quests: {
    completed: string[];
    active: Array<{
      id: string;
      title: string;
      description: string;
      progress: number;
      reward: number;
    }>;
  };
  
  // Guild membership
  guild: {
    id: string;
    name: string;
    role: string;
    xpContributed: number;
  } | null;
  
  // Unlocked zones
  zones: string[];
  
  // Leaderboard position
  leaderboard: {
    rank: number;
    totalPlayers: number;
  };
  
  // Chat messages
  chatMessages: Array<{
    id: string;
    sender: string;
    senderAddress: string;
    message: string;
    timestamp: number;
    tier: Tier;
  }>;
  
  // Agency gigs
  gigs: Array<{
    id: string;
    title: string;
    description: string;
    reward: number;
    deadline: string;
    status: 'open' | 'claimed' | 'completed';
  }>;
  
  // Trending guilds
  trendingGuilds: Array<{
    id: string;
    name: string;
    members: number;
    totalXP: number;
    tier: Tier;
  }>;
}

export function useDemoData(): DemoData | null {
  return useMemo(() => {
    if (!isDemoMode()) return null;
    
    const demoState = DEMO.demoState;
    
    return {
      passport: {
        tier: demoState.tier,
        currentScore: demoState.currentScore,
        lifetimeScore: demoState.lifetimeScore,
        accountAge: demoState.accountAge,
        progress: demoState.progress,
        nextTierThreshold: 1500, // S_TIER threshold
        globalMessagesRemaining: 60, // GOLD tier boost
        zoneMessagesRemaining: 48,
        dmMessagesRemaining: 24,
      },
      
      balances: {
        void: demoState.voidBalance,
        xVoid: demoState.xVoidBalance,
        psx: demoState.psxBalance,
        signals: demoState.signalsHeld,
      },
      
      quests: {
        completed: demoState.completedQuests,
        active: [
          {
            id: 'explorer_adept',
            title: 'Explorer Adept',
            description: 'Visit all 4 districts in The VOID',
            progress: 75, // 3/4 districts
            reward: 200,
          },
          {
            id: 'social_butterfly',
            title: 'Social Butterfly',
            description: 'Send 100 messages in global chat',
            progress: 82,
            reward: 150,
          },
        ],
      },
      
      guild: demoState.guildId ? {
        id: demoState.guildId,
        name: demoState.guildName,
        role: 'MEMBER',
        xpContributed: 420,
      } : null,
      
      zones: demoState.unlockedZones,
      
      leaderboard: {
        rank: demoState.leaderboardRank,
        totalPlayers: 1247,
      },
      
      chatMessages: [
        {
          id: 'msg1',
          sender: 'VoidExplorer',
          senderAddress: '0x1234567890123456789012345678901234567890',
          message: 'Just unlocked District 3! The vibe here is incredible 🔥',
          timestamp: Date.now() - 120000,
          tier: 'GOLD',
        },
        {
          id: 'msg2',
          sender: 'CryptoArtist',
          senderAddress: '0x2345678901234567890123456789012345678901',
          message: 'Anyone want to join a squad for the Agency mission?',
          timestamp: Date.now() - 90000,
          tier: 'SILVER',
        },
        {
          id: 'msg3',
          sender: 'DAOenthusiast',
          senderAddress: '0x3456789012345678901234567890123456789012',
          message: 'New governance proposal just dropped. Vote is live!',
          timestamp: Date.now() - 60000,
          tier: 'S_TIER',
        },
        {
          id: 'msg4',
          sender: 'BuilderBob',
          senderAddress: '0x4567890123456789012345678901234567890123',
          message: 'Staking rewards are looking juicy today 💰',
          timestamp: Date.now() - 45000,
          tier: 'GOLD',
        },
        {
          id: 'msg5',
          sender: 'LandBaronLisa',
          senderAddress: '0x5678901234567890123456789012345678901234',
          message: 'Selling prime land parcel in District 2. DM me!',
          timestamp: Date.now() - 30000,
          tier: 'SILVER',
        },
        {
          id: 'msg6',
          sender: 'SignalMaster',
          senderAddress: '0x6789012345678901234567890123456789012345',
          message: 'Signal epoch 42 just started. Emission multiplier at 2.4x!',
          timestamp: Date.now() - 15000,
          tier: 'S_TIER',
        },
        {
          id: 'msg7',
          sender: 'QuestSeeker',
          senderAddress: '0x7890123456789012345678901234567890123456',
          message: 'Completed the Explorer Adept quest. 200 XP claimed!',
          timestamp: Date.now() - 10000,
          tier: 'BRONZE',
        },
        {
          id: 'msg8',
          sender: 'GuildLeaderAce',
          senderAddress: '0x8901234567890123456789012345678901234567',
          message: 'VOID Builders guild is recruiting! Looking for active members.',
          timestamp: Date.now() - 5000,
          tier: 'GOLD',
        },
      ],
      
      gigs: [
        {
          id: 'gig1',
          title: 'Create PSX Cosmetic NFT Collection',
          description: 'Design and mint 10 unique avatar cosmetics for The VOID marketplace.',
          reward: 5000,
          deadline: '2025-11-20',
          status: 'open',
        },
        {
          id: 'gig2',
          title: 'Deploy Community Event Smart Contract',
          description: 'Build and audit a custom event contract for DAO-organized gatherings.',
          reward: 8000,
          deadline: '2025-11-25',
          status: 'open',
        },
        {
          id: 'gig3',
          title: 'Write Technical Documentation',
          description: 'Create comprehensive docs for the VoidScore contract and integration guide.',
          reward: 3000,
          deadline: '2025-11-18',
          status: 'claimed',
        },
        {
          id: 'gig4',
          title: 'Design District 5 Zone Layout',
          description: 'Conceptualize the map, landmarks, and POIs for the new expansion district.',
          reward: 6000,
          deadline: '2025-11-30',
          status: 'open',
        },
        {
          id: 'gig5',
          title: 'Organize Guild PvP Tournament',
          description: 'Host and manage a competitive tournament with prize pool distribution.',
          reward: 4000,
          deadline: '2025-11-22',
          status: 'open',
        },
        {
          id: 'gig6',
          title: 'Develop Custom HUD Plugin',
          description: 'Create a creator tool plugin for the PSX HUD system with API integration.',
          reward: 7500,
          deadline: '2025-12-01',
          status: 'open',
        },
      ],
      
      trendingGuilds: [
        {
          id: 'void-builders',
          name: 'VOID Builders',
          members: 247,
          totalXP: 184500,
          tier: 'S_TIER',
        },
        {
          id: 'psx-dao',
          name: 'PSX DAO Collective',
          members: 312,
          totalXP: 156000,
          tier: 'GOLD',
        },
        {
          id: 'signal-hunters',
          name: 'Signal Hunters',
          members: 189,
          totalXP: 142800,
          tier: 'GOLD',
        },
        {
          id: 'creative-nexus',
          name: 'Creative Nexus',
          members: 156,
          totalXP: 98400,
          tier: 'SILVER',
        },
        {
          id: 'defi-wizards',
          name: 'DeFi Wizards',
          members: 203,
          totalXP: 87600,
          tier: 'SILVER',
        },
        {
          id: 'land-barons',
          name: 'Land Barons',
          members: 134,
          totalXP: 76200,
          tier: 'SILVER',
        },
      ],
    };
  }, []);
}
