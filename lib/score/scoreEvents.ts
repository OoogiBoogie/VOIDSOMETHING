/**
 * SCORE EVENTS - XP Reward Model (OFFICIAL)
 * Central XP reward definitions for all user actions
 */

export type ScoreEventType =
  // Messaging
  | 'MESSAGE_GLOBAL'
  | 'MESSAGE_DM'
  | 'MESSAGE_FIRST_DAILY'
  // Social
  | 'GUILD_JOINED'
  | 'INVITE_ACCEPTED'
  // Agency
  | 'GIG_APPLIED'
  | 'GIG_COMPLETED'
  // Economy
  | 'STAKE_VOID'
  | 'XVOID_7DAY_HOLD'
  | 'STAKING_WEEKLY_BONUS'
  // Exploration
  | 'ZONE_VISITED'
  | 'DISTRICT_UNLOCKED'
  // Creator
  | 'CONTENT_POSTED'
  | 'CREATOR_QUEST_COMPLETED'
  // Identity
  | 'ONBOARDING_COMPLETED';

export interface ScoreEvent {
  type: ScoreEventType;
  xpReward: number;
  description: string;
  category: 'MESSAGING' | 'SOCIAL' | 'AGENCY' | 'ECONOMY' | 'EXPLORATION' | 'CREATOR' | 'IDENTITY';
}

// ================================
// XP REWARD TABLE (OFFICIAL)
// ================================

export const SCORE_EVENTS: Record<ScoreEventType, ScoreEvent> = {
  // MESSAGING (1-5 XP)
  MESSAGE_GLOBAL: {
    type: 'MESSAGE_GLOBAL',
    xpReward: 1,
    description: 'Sent global message',
    category: 'MESSAGING',
  },
  MESSAGE_DM: {
    type: 'MESSAGE_DM',
    xpReward: 2,
    description: 'Sent direct message',
    category: 'MESSAGING',
  },
  MESSAGE_FIRST_DAILY: {
    type: 'MESSAGE_FIRST_DAILY',
    xpReward: 5,
    description: 'First message of the day bonus',
    category: 'MESSAGING',
  },

  // SOCIAL (15-20 XP)
  GUILD_JOINED: {
    type: 'GUILD_JOINED',
    xpReward: 15,
    description: 'Joined a guild',
    category: 'SOCIAL',
  },
  INVITE_ACCEPTED: {
    type: 'INVITE_ACCEPTED',
    xpReward: 20,
    description: 'Someone accepted your invite',
    category: 'SOCIAL',
  },

  // AGENCY (10-50 XP)
  GIG_APPLIED: {
    type: 'GIG_APPLIED',
    xpReward: 10,
    description: 'Applied to a gig',
    category: 'AGENCY',
  },
  GIG_COMPLETED: {
    type: 'GIG_COMPLETED',
    xpReward: 50,
    description: 'Completed a gig',
    category: 'AGENCY',
  },

  // ECONOMY (10-20 XP)
  STAKE_VOID: {
    type: 'STAKE_VOID',
    xpReward: 10,
    description: 'Staked VOID',
    category: 'ECONOMY',
  },
  XVOID_7DAY_HOLD: {
    type: 'XVOID_7DAY_HOLD',
    xpReward: 20,
    description: 'Held xVOID for 7 days',
    category: 'ECONOMY',
  },
  STAKING_WEEKLY_BONUS: {
    type: 'STAKING_WEEKLY_BONUS',
    xpReward: 10,
    description: 'Weekly staking bonus',
    category: 'ECONOMY',
  },

  // EXPLORATION (5-30 XP)
  ZONE_VISITED: {
    type: 'ZONE_VISITED',
    xpReward: 5,
    description: 'Visited new zone',
    category: 'EXPLORATION',
  },
  DISTRICT_UNLOCKED: {
    type: 'DISTRICT_UNLOCKED',
    xpReward: 30,
    description: 'Unlocked new district',
    category: 'EXPLORATION',
  },

  // CREATOR (10-25 XP)
  CONTENT_POSTED: {
    type: 'CONTENT_POSTED',
    xpReward: 10,
    description: 'Posted content',
    category: 'CREATOR',
  },
  CREATOR_QUEST_COMPLETED: {
    type: 'CREATOR_QUEST_COMPLETED',
    xpReward: 25,
    description: 'Completed creator quest',
    category: 'CREATOR',
  },

  // IDENTITY (10 XP)
  ONBOARDING_COMPLETED: {
    type: 'ONBOARDING_COMPLETED',
    xpReward: 10,
    description: 'Completed profile setup',
    category: 'IDENTITY',
  },
};

/**
 * Get XP reward for event type
 */
export function getXPReward(eventType: ScoreEventType): number {
  return SCORE_EVENTS[eventType].xpReward;
}

/**
 * Get event description
 */
export function getEventDescription(eventType: ScoreEventType): string {
  return SCORE_EVENTS[eventType].description;
}

/**
 * Get events by category
 */
export function getEventsByCategory(
  category: ScoreEvent['category']
): ScoreEvent[] {
  return Object.values(SCORE_EVENTS).filter((event) => event.category === category);
}
