/**
 * Achievement Definitions
 * Phase 6.1 - All achievements with unlock conditions
 */

export enum AchievementCategory {
  EXPLORATION = 'EXPLORATION',
  SESSION = 'SESSION',
  INTERACTION = 'INTERACTION',
  SOCIAL = 'SOCIAL',
  SPECIAL = 'SPECIAL',
}

export enum AchievementId {
  // Exploration
  PIONEER_I = 'PIONEER_I',
  PIONEER_II = 'PIONEER_II',
  CARTOGRAPHER = 'CARTOGRAPHER',
  FIRST_DISTRICT = 'FIRST_DISTRICT',
  LANDMARK_DISCOVERY = 'LANDMARK_DISCOVERY',
  
  // Session
  FIRST_SESSION = 'FIRST_SESSION',
  HOUR_IN_THE_VOID = 'HOUR_IN_THE_VOID',
  MARATHONER = 'MARATHONER',
  
  // Interaction
  FIRST_INTERACTION = 'FIRST_INTERACTION',
  SOCIAL_CREATOR = 'SOCIAL_CREATOR',
  HYPERACTIVE = 'HYPERACTIVE',
  
  // Social (mainnet-only)
  PROFILE_ONCHAIN = 'PROFILE_ONCHAIN',
  FIRST_MESSAGE = 'FIRST_MESSAGE',
}

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  category: AchievementCategory;
  xpBonus: number;
  icon?: string;
  
  // Unlock conditions
  condition: AchievementCondition;
  
  // Requirements
  mainnetOnly?: boolean;
  hidden?: boolean;
}

export type AchievementCondition = {
  type: 'parcel_count';
  count: number;
} | {
  type: 'district_count';
  count: number;
} | {
  type: 'all_districts';
} | {
  type: 'landmark_visit';
} | {
  type: 'session_time';
  minutes: number;
} | {
  type: 'first_session';
} | {
  type: 'interaction_count';
  count: number;
} | {
  type: 'interaction_type';
  interactionType: string;
} | {
  type: 'profile_exists';
} | {
  type: 'message_sent';
};

/**
 * All achievement definitions
 */
export const ACHIEVEMENTS: Record<AchievementId, AchievementDefinition> = {
  // EXPLORATION
  [AchievementId.PIONEER_I]: {
    id: AchievementId.PIONEER_I,
    title: 'Pioneer I',
    description: 'Visit 10 unique parcels',
    category: AchievementCategory.EXPLORATION,
    xpBonus: 10,
    condition: { type: 'parcel_count', count: 10 },
  },
  
  [AchievementId.PIONEER_II]: {
    id: AchievementId.PIONEER_II,
    title: 'Pioneer II',
    description: 'Visit 50 unique parcels',
    category: AchievementCategory.EXPLORATION,
    xpBonus: 50,
    condition: { type: 'parcel_count', count: 50 },
  },
  
  [AchievementId.CARTOGRAPHER]: {
    id: AchievementId.CARTOGRAPHER,
    title: 'Cartographer',
    description: 'Visit all districts in The Void',
    category: AchievementCategory.EXPLORATION,
    xpBonus: 100,
    condition: { type: 'all_districts' },
  },
  
  [AchievementId.FIRST_DISTRICT]: {
    id: AchievementId.FIRST_DISTRICT,
    title: 'First Steps',
    description: 'Enter your first district',
    category: AchievementCategory.EXPLORATION,
    xpBonus: 5,
    condition: { type: 'district_count', count: 1 },
  },
  
  [AchievementId.LANDMARK_DISCOVERY]: {
    id: AchievementId.LANDMARK_DISCOVERY,
    title: 'Landmark Discovery',
    description: 'Discover a landmark district',
    category: AchievementCategory.EXPLORATION,
    xpBonus: 15,
    condition: { type: 'landmark_visit' },
  },
  
  // SESSION
  [AchievementId.FIRST_SESSION]: {
    id: AchievementId.FIRST_SESSION,
    title: 'Welcome to The Void',
    description: 'Complete your first session',
    category: AchievementCategory.SESSION,
    xpBonus: 5,
    condition: { type: 'first_session' },
  },
  
  [AchievementId.HOUR_IN_THE_VOID]: {
    id: AchievementId.HOUR_IN_THE_VOID,
    title: 'Hour in The Void',
    description: 'Accumulate 60 minutes of playtime',
    category: AchievementCategory.SESSION,
    xpBonus: 25,
    condition: { type: 'session_time', minutes: 60 },
  },
  
  [AchievementId.MARATHONER]: {
    id: AchievementId.MARATHONER,
    title: 'Marathoner',
    description: 'Accumulate 5 hours of playtime',
    category: AchievementCategory.SESSION,
    xpBonus: 100,
    condition: { type: 'session_time', minutes: 300 },
  },
  
  // INTERACTION
  [AchievementId.FIRST_INTERACTION]: {
    id: AchievementId.FIRST_INTERACTION,
    title: 'Curious Explorer',
    description: 'Trigger your first interaction',
    category: AchievementCategory.INTERACTION,
    xpBonus: 5,
    condition: { type: 'interaction_count', count: 1 },
  },
  
  [AchievementId.SOCIAL_CREATOR]: {
    id: AchievementId.SOCIAL_CREATOR,
    title: 'Social Creator',
    description: 'Use a Creator Terminal',
    category: AchievementCategory.INTERACTION,
    xpBonus: 10,
    condition: { type: 'interaction_type', interactionType: 'CREATOR_TERMINAL' },
  },
  
  [AchievementId.HYPERACTIVE]: {
    id: AchievementId.HYPERACTIVE,
    title: 'Hyperactive',
    description: 'Complete 20 interactions',
    category: AchievementCategory.INTERACTION,
    xpBonus: 30,
    condition: { type: 'interaction_count', count: 20 },
  },
  
  // SOCIAL (Mainnet-only)
  [AchievementId.PROFILE_ONCHAIN]: {
    id: AchievementId.PROFILE_ONCHAIN,
    title: 'On-Chain Identity',
    description: 'Connect with an on-chain profile',
    category: AchievementCategory.SOCIAL,
    xpBonus: 20,
    mainnetOnly: true,
    condition: { type: 'profile_exists' },
  },
  
  [AchievementId.FIRST_MESSAGE]: {
    id: AchievementId.FIRST_MESSAGE,
    title: 'First Contact',
    description: 'Send your first message',
    category: AchievementCategory.SOCIAL,
    xpBonus: 10,
    mainnetOnly: true,
    condition: { type: 'message_sent' },
  },
};

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return Object.values(ACHIEVEMENTS).filter(a => a.category === category);
}

/**
 * Get mainnet-only achievements
 */
export function getMainnetAchievements(): AchievementDefinition[] {
  return Object.values(ACHIEVEMENTS).filter(a => a.mainnetOnly);
}

/**
 * Get total possible XP from achievements
 */
export function getTotalAchievementXP(): number {
  return Object.values(ACHIEVEMENTS).reduce((sum, a) => sum + a.xpBonus, 0);
}
