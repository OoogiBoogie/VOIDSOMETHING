/**
 * REAL ESTATE ECONOMY CONFIG
 * 
 * Single source of truth for all real estate economy parameters.
 * Centralized tuning knobs for claim costs, XP rewards, and airdrop weights.
 * 
 * NO HARD-CODED NUMBERS IN ACTIONS OR REWARDS.
 * All economy changes must go through this config file.
 */

// ============================================================================
// CLAIM ECONOMICS
// ============================================================================

export const CLAIM_COST_CONFIG = {
  baseCost: 100, // Base VOID cost to claim any parcel
  
  // District-based multipliers (applied to baseCost)
  districtMultipliers: {
    HQ: 2.0,
    DEFI: 1.8,
    CREATOR: 1.5,
    AI: 1.3,
    SOCIAL: 1.2,
    IDENTITY: 1.0,
    CENTRAL_EAST: 1.6,
    CENTRAL_SOUTH: 1.6,
    DEFAULT: 1.0,
  } as Record<string, number>,
};

/**
 * Calculate claim cost for a parcel based on district
 */
export function getClaimCost(parcelId: string, districtId?: string): number {
  const multiplier = districtId
    ? CLAIM_COST_CONFIG.districtMultipliers[districtId] ?? CLAIM_COST_CONFIG.districtMultipliers.DEFAULT
    : CLAIM_COST_CONFIG.districtMultipliers.DEFAULT;
  
  return CLAIM_COST_CONFIG.baseCost * multiplier;
}

// ============================================================================
// XP REWARDS
// ============================================================================

export const REAL_ESTATE_XP_REWARDS = {
  CLAIM_PARCEL: 10,
  LIST_PARCEL: 5,
  CANCEL_LISTING: 2,
  SELL_PARCEL_SELLER: 25,
  SELL_PARCEL_BUYER: 25,
} as const;

// ============================================================================
// AIRDROP SCORING WEIGHTS
// ============================================================================

export const REAL_ESTATE_AIRDROP_CONFIG = {
  // Base weights per action type
  baseWeightPerClaim: 1,
  baseWeightPerListing: 0.25,
  baseWeightPerSale: 3,
  
  // Volume-based thresholds and multipliers
  highValueThreshold: 1000,        // Sales above this get bonus
  veryHighValueThreshold: 5000,    // Sales above this get even bigger bonus
  highValueMultiplier: 1.5,
  veryHighValueMultiplier: 2.0,
} as const;

/**
 * Per-district airdrop multipliers
 * Applied on top of base weights to reward activity in strategic districts
 */
export const DISTRICT_AIRDROP_MULTIPLIERS: Record<string, number> = {
  HQ: 2.0,
  DEFI: 1.5,
  CREATOR: 1.3,
  AI: 1.2,
  SOCIAL: 1.1,
  IDENTITY: 1.0,
  CENTRAL_EAST: 1.4,
  CENTRAL_SOUTH: 1.4,
  DEFAULT: 1.0,
};

/**
 * Get district multiplier for airdrop scoring
 */
export function getDistrictAirdropMultiplier(districtId?: string): number {
  if (!districtId) return DISTRICT_AIRDROP_MULTIPLIERS.DEFAULT;
  return DISTRICT_AIRDROP_MULTIPLIERS[districtId] ?? DISTRICT_AIRDROP_MULTIPLIERS.DEFAULT;
}

// ============================================================================
// TUNING HELPERS
// ============================================================================

/**
 * Calculate expected XP for an action
 */
export function getExpectedXP(actionType: keyof typeof REAL_ESTATE_XP_REWARDS): number {
  return REAL_ESTATE_XP_REWARDS[actionType];
}

/**
 * Calculate base airdrop score for a claim
 */
export function calculateClaimScore(districtId?: string): number {
  const baseWeight = REAL_ESTATE_AIRDROP_CONFIG.baseWeightPerClaim;
  const districtMultiplier = getDistrictAirdropMultiplier(districtId);
  return baseWeight * districtMultiplier;
}

/**
 * Calculate base airdrop score for a listing
 */
export function calculateListingScore(districtId?: string): number {
  const baseWeight = REAL_ESTATE_AIRDROP_CONFIG.baseWeightPerListing;
  const districtMultiplier = getDistrictAirdropMultiplier(districtId);
  return baseWeight * districtMultiplier;
}

/**
 * Calculate airdrop score for a sale (seller side)
 */
export function calculateSaleScore(price: number, districtId?: string): number {
  const baseWeight = REAL_ESTATE_AIRDROP_CONFIG.baseWeightPerSale;
  const districtMultiplier = getDistrictAirdropMultiplier(districtId);
  
  // Volume-based multiplier
  let volumeMultiplier = 1.0;
  if (price >= REAL_ESTATE_AIRDROP_CONFIG.veryHighValueThreshold) {
    volumeMultiplier = REAL_ESTATE_AIRDROP_CONFIG.veryHighValueMultiplier;
  } else if (price >= REAL_ESTATE_AIRDROP_CONFIG.highValueThreshold) {
    volumeMultiplier = REAL_ESTATE_AIRDROP_CONFIG.highValueMultiplier;
  }
  
  return baseWeight * districtMultiplier * volumeMultiplier;
}

/**
 * Calculate airdrop score for a purchase (buyer side)
 * Buyers get a fraction of the seller's score
 */
export function calculatePurchaseScore(price: number, districtId?: string): number {
  // Buyers get 40% of seller's score
  return calculateSaleScore(price, districtId) * 0.4;
}

// ============================================================================
// TIER SYSTEM (PHASE 5)
// ============================================================================

export const REAL_ESTATE_TIER_THRESHOLDS = {
  BRONZE: 5,     // score >= 5
  SILVER: 20,    // score >= 20
  GOLD: 75,      // score >= 75
  DIAMOND: 200,  // score >= 200
} as const;

export const REAL_ESTATE_UTILITY_MULTIPLIERS = {
  xpGlobalByTier: {
    NONE: 1.0,
    BRONZE: 1.02,
    SILVER: 1.05,
    GOLD: 1.1,
    DIAMOND: 1.15,
  },
  airdropGlobalByTier: {
    NONE: 1.0,
    BRONZE: 1.02,
    SILVER: 1.05,
    GOLD: 1.1,
    DIAMOND: 1.2,
  },
} as const;

// ============================================================================
// HUB PERMISSIONS (PHASE 5)
// ============================================================================

export const REAL_ESTATE_HUB_PERMISSIONS = {
  HQ: {
    minTier: 'SILVER' as const,
    altRequirement: {
      minParcelsInDistrict: 1,
    },
  },
  DEFI: {
    minTier: 'BRONZE' as const,
    altRequirement: {
      minParcelsInDistrict: 1,
    },
  },
  CREATOR: {
    minTier: 'BRONZE' as const,
    altRequirement: {
      minParcelsInDistrict: 1,
    },
  },
  AI: {
    minTier: 'BRONZE' as const,
    altRequirement: {
      minParcelsInDistrict: 1,
    },
  },
  SOCIAL: {
    minTier: 'NONE' as const,
    altRequirement: {
      minParcelsInDistrict: 0,
    },
  },
  IDENTITY: {
    minTier: 'NONE' as const,
    altRequirement: {
      minParcelsInDistrict: 0,
    },
  },
} as const;

// ============================================================================
// FEATURE FLAGS (PHASE 5.1)
// ============================================================================

/**
 * Enable/disable real estate airdrop multiplier
 * 
 * When true: airdrop scores are multiplied by player's airdropGlobalMultiplier from tier
 * When false: airdrop scores are not affected by real estate holdings
 * 
 * Default: true (multiplier active)
 */
export const ENABLE_REAL_ESTATE_AIRDROP_MULTIPLIER = true;
