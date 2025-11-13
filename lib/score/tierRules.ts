/**
 * TIER SYSTEM - CANONICAL RULESET
 * Official tier progression rules for The Void
 * Used by: useVoidScore, ProfilePassport, World unlocks, Airdrop engine
 */

// Export Tier type for use in other modules (matches useVoidScore)
export type Tier = 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'S_TIER';

// ================================
// TIER THRESHOLDS (OFFICIAL)
// ================================

export const TIER_THRESHOLDS = {
  NONE: 0,
  BRONZE: 100,
  SILVER: 250,
  GOLD: 600,
  S_TIER: 1500,
} as const;

export const TIER_LABELS = {
  NONE: 'Unranked',
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  S_TIER: 'S-Tier',
} as const;

// ================================
// TIER CALCULATIONS
// ================================

/**
 * Get tier for a given score
 */
export function getTierForScore(score: number): Tier {
  if (score >= TIER_THRESHOLDS.S_TIER) return 'S_TIER';
  if (score >= TIER_THRESHOLDS.GOLD) return 'GOLD';
  if (score >= TIER_THRESHOLDS.SILVER) return 'SILVER';
  if (score >= TIER_THRESHOLDS.BRONZE) return 'BRONZE';
  return 'BRONZE'; // Default to BRONZE instead of NONE for better UX
}

/**
 * Get progress to next tier (0-100%)
 */
export function getProgressToNextTier(score: number): {
  progress: number;
  currentTier: Tier;
  nextTier: Tier | null;
  nextThreshold: number;
  scoreNeeded: number;
} {
  const currentTier = getTierForScore(score);
  
  // S-Tier is max
  if (currentTier === 'S_TIER') {
    return {
      progress: 100,
      currentTier: 'S_TIER',
      nextTier: null,
      nextThreshold: TIER_THRESHOLDS.S_TIER,
      scoreNeeded: 0,
    };
  }

  let currentThreshold = 0;
  let nextThreshold = TIER_THRESHOLDS.SILVER;
  let nextTier: Tier = 'SILVER';

  switch (currentTier) {
    case 'BRONZE':
      currentThreshold = TIER_THRESHOLDS.BRONZE;
      nextThreshold = TIER_THRESHOLDS.SILVER;
      nextTier = 'SILVER';
      break;
    case 'SILVER':
      currentThreshold = TIER_THRESHOLDS.SILVER;
      nextThreshold = TIER_THRESHOLDS.GOLD;
      nextTier = 'GOLD';
      break;
    case 'GOLD':
      currentThreshold = TIER_THRESHOLDS.GOLD;
      nextThreshold = TIER_THRESHOLDS.S_TIER;
      nextTier = 'S_TIER';
      break;
  }

  const range = nextThreshold - currentThreshold;
  const progressInRange = score - currentThreshold;
  const progress = Math.min(100, Math.max(0, (progressInRange / range) * 100));
  const scoreNeeded = nextThreshold - score;

  return {
    progress,
    currentTier,
    nextTier,
    nextThreshold,
    scoreNeeded: Math.max(0, scoreNeeded),
  };
}

/**
 * Get next tier requirement
 */
export function getNextTierRequirement(currentScore: number): {
  nextTier: Tier | null;
  scoreNeeded: number;
} {
  const { nextTier, scoreNeeded } = getProgressToNextTier(currentScore);
  return { nextTier, scoreNeeded };
}

/**
 * Get tier multiplier (for APR, airdrops, etc.)
 */
export function getTierMultiplier(tier: Tier): number {
  switch (tier) {
    case 'S_TIER':
      return 3.0;
    case 'GOLD':
      return 2.0;
    case 'SILVER':
      return 1.5;
    case 'BRONZE':
      return 1.2;
    default:
      return 1.0;
  }
}

/**
 * Get tier APR bonus (for staking)
 */
export function getTierAPRBonus(tier: Tier): number {
  switch (tier) {
    case 'S_TIER':
      return 10; // +10%
    case 'GOLD':
      return 5; // +5%
    case 'SILVER':
      return 3; // +3%
    case 'BRONZE':
      return 1; // +1%
    default:
      return 0;
  }
}

/**
 * Get tier color/style
 */
export function getTierStyle(tier: Tier): {
  bg: string;
  border: string;
  text: string;
  gradient: string;
} {
  switch (tier) {
    case 'S_TIER':
      return {
        bg: 'bg-purple-500/20',
        border: 'border-purple-500/60',
        text: 'text-purple-400',
        gradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500',
      };
    case 'GOLD':
      return {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/60',
        text: 'text-yellow-500',
        gradient: 'bg-gradient-to-r from-yellow-600 to-yellow-400',
      };
    case 'SILVER':
      return {
        bg: 'bg-gray-300/20',
        border: 'border-gray-300/60',
        text: 'text-gray-300',
        gradient: 'bg-gradient-to-r from-gray-400 to-gray-200',
      };
    case 'BRONZE':
      return {
        bg: 'bg-orange-700/20',
        border: 'border-orange-700/60',
        text: 'text-orange-700',
        gradient: 'bg-gradient-to-r from-orange-600 to-orange-400',
      };
    default:
      return {
        bg: 'bg-bio-silver/20',
        border: 'border-bio-silver/60',
        text: 'text-bio-silver',
        gradient: 'bg-gradient-to-r from-bio-silver to-gray-500',
      };
  }
}

/**
 * Check if user meets tier requirement
 */
export function meetsTierRequirement(userTier: Tier, requiredTier: Tier): boolean {
  const tierOrder: Tier[] = ['BRONZE', 'SILVER', 'GOLD', 'S_TIER'];
  const userIndex = tierOrder.indexOf(userTier);
  const requiredIndex = tierOrder.indexOf(requiredTier);
  
  return userIndex >= requiredIndex;
}
