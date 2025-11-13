/**
 * VOID SDK - FUTURE-PROOF EXPORTS
 * Clean, stable API for Unity WebGL integration
 * No React-specific dependencies in core functions
 */

// ================================
// CORE PROFILE
// ================================

export { getTierForScore, getProgressToNextTier, getTierMultiplier } from './score/tierRules';
export { getXPReward, getEventDescription } from './score/scoreEvents';

// ================================
// QUESTS
// ================================

export {
  getQuestsByFrequency,
  getQuestById,
  DAILY_QUESTS,
  WEEKLY_QUESTS,
  MILESTONE_QUESTS,
} from './quests/questDefinitions';

export type { Quest, QuestObjective, QuestReward } from './quests/types';

// ================================
// LEADERBOARDS
// ================================

export type { LeaderboardEntry, Leaderboard } from '@/hooks/useVoidLeaderboards';

// ================================
// AIRDROPS
// ================================

export {
  getAirdropWeight,
  getAirdropBreakdown,
  getAirdropPreview,
  getEstimatedAllocation,
} from './airdrop/airdropMath';

export type { AirdropInput, AirdropBreakdown } from './airdrop/airdropMath';

// ================================
// WORLD UNLOCKS
// ================================

export {
  canAccessZone,
  getUnlockedZones,
  getLockedZones,
  getNextZoneToUnlock,
  getUnlockProgress,
  ZONE_REQUIREMENTS,
} from './world/unlockRules';

export type { ZoneId, ZoneRequirement } from './world/unlockRules';

// ================================
// CREATOR ECONOMY
// ================================

export {
  CREATOR_ACTIONS,
  calculateCreatorTrust,
  canAccessCreatorZone,
} from './creator/creatorEconomy';

export type { CreatorAction, CreatorTrustScore } from './creator/creatorEconomy';

// ================================
// EVENTS
// ================================

export { emitVoidEvent, onVoidEvent, voidEventEmitter } from './events/voidEvents';
export type { VoidEvent, VoidEventType } from './events/voidEvents';

// ================================
// CONFIG
// ================================

export { shouldUseMockData, VOID_CONFIG } from '@/config/voidConfig';

/**
 * Unity-friendly helper: Get full user profile
 * @param address - User address
 * @returns Profile data (tier, score, quests, airdrop, unlocks)
 * 
 * NOTE: This is a placeholder for Unity integration
 * In Unity, you would call this via WebGL bridge:
 * 
 * ```javascript
 * window.getVoidProfile = async (address) => {
 *   return await import('@/lib/voidSDK').then(m => m.getProfile(address));
 * };
 * ```
 */
export async function getProfile(address: string) {
  // This would call hooks internally and return plain object
  // For now, return placeholder
  console.warn('[voidSDK] getProfile() is a placeholder for Unity integration');
  return {
    address,
    tier: 'BRONZE',
    currentScore: 150,
    lifetimeScore: 150,
    quests: [],
    airdropWeight: 0,
    unlockedZones: [],
  };
}
