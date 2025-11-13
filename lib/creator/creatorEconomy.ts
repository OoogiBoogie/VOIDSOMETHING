/**
 * CREATOR ECONOMY v4
 * Creator-specific actions, quests, and rewards
 */

import type { Tier } from '@/lib/score/tierRules';

export type CreatorActionType =
  | 'CONTENT_POSTED'
  | 'QUEST_COMPLETED'
  | 'FOLLOWER_GAINED'
  | 'CONTENT_LIKED'
  | 'CONTENT_SHARED';

export interface CreatorAction {
  type: CreatorActionType;
  xpReward: number;
  description: string;
}

// ================================
// CREATOR ACTIONS & XP REWARDS
// ================================

export const CREATOR_ACTIONS: Record<CreatorActionType, CreatorAction> = {
  CONTENT_POSTED: {
    type: 'CONTENT_POSTED',
    xpReward: 10,
    description: 'Posted new content',
  },
  QUEST_COMPLETED: {
    type: 'QUEST_COMPLETED',
    xpReward: 25,
    description: 'Completed creator quest',
  },
  FOLLOWER_GAINED: {
    type: 'FOLLOWER_GAINED',
    xpReward: 5,
    description: 'Gained a follower',
  },
  CONTENT_LIKED: {
    type: 'CONTENT_LIKED',
    xpReward: 2,
    description: 'Content received a like',
  },
  CONTENT_SHARED: {
    type: 'CONTENT_SHARED',
    xpReward: 8,
    description: 'Content was shared',
  },
};

// ================================
// CREATOR TRUST SCORE
// ================================

export interface CreatorTrustScore {
  score: number; // 0-100
  level: 'NOVICE' | 'TRUSTED' | 'VERIFIED' | 'ELITE';
  contentCount: number;
  followerCount: number;
  engagementRate: number; // 0-1
}

export function getCreatorTrustLevel(score: number): CreatorTrustScore['level'] {
  if (score >= 80) return 'ELITE';
  if (score >= 60) return 'VERIFIED';
  if (score >= 30) return 'TRUSTED';
  return 'NOVICE';
}

/**
 * Calculate creator trust score
 */
export function calculateCreatorTrust(
  contentCount: number,
  followerCount: number,
  totalLikes: number,
  totalShares: number
): CreatorTrustScore {
  // Score factors:
  // - Content volume (25%)
  // - Follower count (25%)
  // - Engagement rate (50%)
  
  const contentScore = Math.min((contentCount / 100) * 25, 25);
  const followerScore = Math.min((followerCount / 500) * 25, 25);
  
  const totalEngagement = totalLikes + totalShares * 2; // Shares worth 2x
  const engagementRate = contentCount > 0 ? totalEngagement / contentCount : 0;
  const engagementScore = Math.min((engagementRate / 10) * 50, 50);
  
  const score = Math.floor(contentScore + followerScore + engagementScore);
  const level = getCreatorTrustLevel(score);
  
  return {
    score,
    level,
    contentCount,
    followerCount,
    engagementRate,
  };
}

// ================================
// CREATOR ZONE UNLOCKS
// ================================

export interface CreatorZoneRequirement {
  zoneId: string;
  displayName: string;
  requiredTrustLevel: CreatorTrustScore['level'];
  requiredTier: Tier;
}

export const CREATOR_ZONE_REQUIREMENTS: CreatorZoneRequirement[] = [
  {
    zoneId: 'creator_lounge',
    displayName: 'Creator Lounge',
    requiredTrustLevel: 'TRUSTED',
    requiredTier: 'BRONZE',
  },
  {
    zoneId: 'creator_studio',
    displayName: 'Creator Studio',
    requiredTrustLevel: 'VERIFIED',
    requiredTier: 'SILVER',
  },
  {
    zoneId: 'elite_creator_hub',
    displayName: 'Elite Creator Hub',
    requiredTrustLevel: 'ELITE',
    requiredTier: 'GOLD',
  },
];

/**
 * Check if creator can access zone
 */
export function canAccessCreatorZone(
  trustLevel: CreatorTrustScore['level'],
  userTier: Tier,
  zoneId: string
): boolean {
  const requirement = CREATOR_ZONE_REQUIREMENTS.find((z) => z.zoneId === zoneId);
  if (!requirement) return false;

  const trustLevels: CreatorTrustScore['level'][] = ['NOVICE', 'TRUSTED', 'VERIFIED', 'ELITE'];
  const userTrustIndex = trustLevels.indexOf(trustLevel);
  const requiredTrustIndex = trustLevels.indexOf(requirement.requiredTrustLevel);

  const tiers: Tier[] = ['NONE', 'BRONZE', 'SILVER', 'GOLD', 'S_TIER'];
  const userTierIndex = tiers.indexOf(userTier);
  const requiredTierIndex = tiers.indexOf(requirement.requiredTier);

  return userTrustIndex >= requiredTrustIndex && userTierIndex >= requiredTierIndex;
}
