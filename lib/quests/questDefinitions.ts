/**
 * QUEST DEFINITIONS - v1.5
 * Official quest catalog (daily, weekly, milestone)
 */

import type { Quest } from './types';

// ================================
// DAILY QUESTS (Reset every 24h)
// ================================

export const DAILY_QUESTS: Quest[] = [
  {
    id: 'daily_messaging',
    title: 'Daily Chatter',
    description: 'Send 10 messages in global chat',
    category: 'MESSAGING',
    frequency: 'DAILY',
    objectives: [
      {
        type: 'SEND_MESSAGES',
        target: 10,
        current: 0,
        description: 'Send 10 global messages',
      },
    ],
    reward: {
      xp: 25,
    },
    isActive: true,
    isCompleted: false,
  },
  {
    id: 'daily_social',
    title: 'Direct Connect',
    description: 'Send 5 direct messages',
    category: 'SOCIAL',
    frequency: 'DAILY',
    objectives: [
      {
        type: 'SEND_DMS',
        target: 5,
        current: 0,
        description: 'Send 5 DMs',
      },
    ],
    reward: {
      xp: 20,
    },
    isActive: true,
    isCompleted: false,
  },
  {
    id: 'daily_exploration',
    title: 'Explorer',
    description: 'Visit 3 different zones',
    category: 'EXPLORATION',
    frequency: 'DAILY',
    objectives: [
      {
        type: 'VISIT_ZONES',
        target: 3,
        current: 0,
        description: 'Visit 3 zones',
      },
    ],
    reward: {
      xp: 30,
    },
    isActive: true,
    isCompleted: false,
  },
];

// ================================
// WEEKLY QUESTS (Reset every 7 days)
// ================================

export const WEEKLY_QUESTS: Quest[] = [
  {
    id: 'weekly_agency',
    title: 'Job Hunter',
    description: 'Apply to 5 gigs',
    category: 'AGENCY',
    frequency: 'WEEKLY',
    objectives: [
      {
        type: 'APPLY_GIGS',
        target: 5,
        current: 0,
        description: 'Apply to 5 gigs',
      },
    ],
    reward: {
      xp: 100,
    },
    isActive: true,
    isCompleted: false,
  },
  {
    id: 'weekly_economy',
    title: 'Staking Pioneer',
    description: 'Stake VOID tokens',
    category: 'ECONOMY',
    frequency: 'WEEKLY',
    objectives: [
      {
        type: 'STAKE_VOID',
        target: 1,
        current: 0,
        description: 'Stake any amount of VOID',
      },
    ],
    reward: {
      xp: 150,
    },
    isActive: true,
    isCompleted: false,
  },
  {
    id: 'weekly_creator',
    title: 'Content Creator',
    description: 'Post 3 pieces of content',
    category: 'CREATOR',
    frequency: 'WEEKLY',
    objectives: [
      {
        type: 'POST_CONTENT',
        target: 3,
        current: 0,
        description: 'Post 3 content pieces',
      },
    ],
    reward: {
      xp: 120,
      badge: 'creator_week_1',
    },
    isActive: true,
    isCompleted: false,
  },
];

// ================================
// MILESTONE QUESTS (One-time achievements)
// ================================

export const MILESTONE_QUESTS: Quest[] = [
  {
    id: 'milestone_first_guild',
    title: 'Guild Initiate',
    description: 'Join your first guild',
    category: 'SOCIAL',
    frequency: 'MILESTONE',
    objectives: [
      {
        type: 'JOIN_GUILD',
        target: 1,
        current: 0,
        description: 'Join a guild',
      },
    ],
    reward: {
      xp: 50,
      badge: 'first_guild',
    },
    isActive: true,
    isCompleted: false,
  },
  {
    id: 'milestone_first_gig',
    title: 'Freelancer',
    description: 'Complete your first gig',
    category: 'AGENCY',
    frequency: 'MILESTONE',
    objectives: [
      {
        type: 'COMPLETE_GIG',
        target: 1,
        current: 0,
        description: 'Complete a gig',
      },
    ],
    reward: {
      xp: 200,
      badge: 'first_gig',
      voidTokens: 100,
    },
    isActive: true,
    isCompleted: false,
  },
  {
    id: 'milestone_bronze',
    title: 'Bronze Ranked',
    description: 'Reach Bronze tier',
    category: 'ECONOMY',
    frequency: 'MILESTONE',
    objectives: [
      {
        type: 'REACH_TIER',
        target: 1, // BRONZE = tier 1
        current: 0,
        description: 'Reach Bronze tier',
      },
    ],
    reward: {
      xp: 100,
      badge: 'bronze_tier',
    },
    isActive: true,
    isCompleted: false,
  },
  {
    id: 'milestone_silver',
    title: 'Silver Ranked',
    description: 'Reach Silver tier',
    category: 'ECONOMY',
    frequency: 'MILESTONE',
    objectives: [
      {
        type: 'REACH_TIER',
        target: 2, // SILVER = tier 2
        current: 0,
        description: 'Reach Silver tier',
      },
    ],
    reward: {
      xp: 250,
      badge: 'silver_tier',
    },
    isActive: true,
    isCompleted: false,
  },
  {
    id: 'milestone_gold',
    title: 'Gold Ranked',
    description: 'Reach Gold tier',
    category: 'ECONOMY',
    frequency: 'MILESTONE',
    objectives: [
      {
        type: 'REACH_TIER',
        target: 3, // GOLD = tier 3
        current: 0,
        description: 'Reach Gold tier',
      },
    ],
    reward: {
      xp: 500,
      badge: 'gold_tier',
    },
    isActive: true,
    isCompleted: false,
  },
  {
    id: 'milestone_s_tier',
    title: 'S-Tier Elite',
    description: 'Reach S-Tier',
    category: 'ECONOMY',
    frequency: 'MILESTONE',
    objectives: [
      {
        type: 'REACH_TIER',
        target: 4, // S_TIER = tier 4
        current: 0,
        description: 'Reach S-Tier',
      },
    ],
    reward: {
      xp: 1000,
      badge: 's_tier',
      voidTokens: 500,
    },
    isActive: true,
    isCompleted: false,
  },
  {
    id: 'milestone_district_unlock',
    title: 'District Pioneer',
    description: 'Unlock a new district',
    category: 'EXPLORATION',
    frequency: 'MILESTONE',
    objectives: [
      {
        type: 'UNLOCK_DISTRICT',
        target: 1,
        current: 0,
        description: 'Unlock any district',
      },
    ],
    reward: {
      xp: 150,
      badge: 'district_pioneer',
    },
    isActive: true,
    isCompleted: false,
  },
];

/**
 * Get all quests for a frequency
 */
export function getQuestsByFrequency(frequency: 'DAILY' | 'WEEKLY' | 'MILESTONE'): Quest[] {
  switch (frequency) {
    case 'DAILY':
      return DAILY_QUESTS;
    case 'WEEKLY':
      return WEEKLY_QUESTS;
    case 'MILESTONE':
      return MILESTONE_QUESTS;
  }
}

/**
 * Get quest by ID
 */
export function getQuestById(questId: string): Quest | undefined {
  return [...DAILY_QUESTS, ...WEEKLY_QUESTS, ...MILESTONE_QUESTS].find(
    (q) => q.id === questId
  );
}
