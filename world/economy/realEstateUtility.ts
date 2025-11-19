/**
 * REAL ESTATE UTILITY LAYER (PHASE 5)
 * 
 * High-level abstraction over ownership + airdrop scoring.
 * Provides player perks, tiers, and utility flags based on land holdings.
 * 
 * This is a read-only layer - does NOT modify ownership or scores.
 */

import { useParcelMarketState } from '@/state/parcelMarket/useParcelMarketState';
import { useRealEstateAirdropScoreState } from '@/world/economy/realEstateAirdropScoring';
import {
  REAL_ESTATE_TIER_THRESHOLDS,
  REAL_ESTATE_UTILITY_MULTIPLIERS,
  REAL_ESTATE_HUB_PERMISSIONS,
} from '@/world/economy/realEstateEconomyConfig';

// ============================================================================
// TYPES
// ============================================================================

export type RealEstateTier = 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export interface RealEstatePerks {
  wallet: string;
  
  // Ownership-derived
  totalParcelsOwned: number;
  districtsOwned: string[];        // districtIds
  hqParcelsOwned: number;
  defiParcelsOwned: number;
  creatorParcelsOwned: number;
  aiParcelsOwned: number;
  
  // Score-derived (from RealEstateScore)
  score: number;
  tier: RealEstateTier;
  
  // Utility flags (computed)
  canSetCustomSpawn: boolean;
  hasCreatorPadAccess: boolean;
  hasDefiBoost: boolean;
  hasHqPriorityAccess: boolean;
  hasMarketFeeDiscount: boolean;   // for future on-chain use
  
  // Numerical multipliers for other systems to query
  xpGlobalMultiplier: number;
  airdropGlobalMultiplier: number;
}

export interface HubAccessInfo {
  allowed: boolean;
  reason: 'OK' | 'INSUFFICIENT_TIER' | 'NO_PARCELS_IN_DISTRICT';
  tier: RealEstateTier;
  requiredTier: RealEstateTier | null;
  parcelsInDistrict: number;
  minParcelsRequired: number;
}

// ============================================================================
// TIER LOGIC
// ============================================================================

/**
 * Calculate tier from airdrop score
 */
export function getTierFromScore(score: number): RealEstateTier {
  if (score >= REAL_ESTATE_TIER_THRESHOLDS.DIAMOND) return 'DIAMOND';
  if (score >= REAL_ESTATE_TIER_THRESHOLDS.GOLD) return 'GOLD';
  if (score >= REAL_ESTATE_TIER_THRESHOLDS.SILVER) return 'SILVER';
  if (score >= REAL_ESTATE_TIER_THRESHOLDS.BRONZE) return 'BRONZE';
  return 'NONE';
}

/**
 * Get next tier and points needed
 */
export function getNextTierInfo(currentScore: number): {
  nextTier: RealEstateTier | null;
  pointsNeeded: number;
} {
  const tier = getTierFromScore(currentScore);
  
  if (tier === 'DIAMOND') {
    return { nextTier: null, pointsNeeded: 0 };
  }
  
  const thresholds = REAL_ESTATE_TIER_THRESHOLDS;
  
  if (tier === 'GOLD') {
    return { nextTier: 'DIAMOND', pointsNeeded: thresholds.DIAMOND - currentScore };
  }
  if (tier === 'SILVER') {
    return { nextTier: 'GOLD', pointsNeeded: thresholds.GOLD - currentScore };
  }
  if (tier === 'BRONZE') {
    return { nextTier: 'SILVER', pointsNeeded: thresholds.SILVER - currentScore };
  }
  // NONE
  return { nextTier: 'BRONZE', pointsNeeded: thresholds.BRONZE - currentScore };
}

// ============================================================================
// PERKS COMPUTATION
// ============================================================================

/**
 * Compute all real estate perks for a wallet
 * Read-only - does not mutate state
 */
export function computeRealEstatePerks(wallet: string): RealEstatePerks {
  // Get ownership data
  const { ownership } = useParcelMarketState.getState();
  const ownedParcels = Array.from(ownership.values()).filter(
    (o) => o.ownerAddress === wallet
  );
  
  // Get airdrop score
  const { getScoreForWallet } = useRealEstateAirdropScoreState.getState();
  const scoreData = getScoreForWallet(wallet);
  const score = scoreData?.score || 0;
  
  // Calculate tier
  const tier = getTierFromScore(score);
  
  // Count parcels by district
  // NOTE: ParcelOwnership doesn't have districtId yet
  // For now, use placeholder logic - will be enhanced when district mapping is available
  const districtCounts = new Map<string, number>();
  ownedParcels.forEach((parcel) => {
    // TODO: Map parcelId to districtId using WorldCoords + districts
    // For now, just count total parcels
    const district = 'UNKNOWN';
    districtCounts.set(district, (districtCounts.get(district) || 0) + 1);
  });
  
  const districtsOwned = Array.from(districtCounts.keys()).filter(d => d !== 'UNKNOWN');
  const totalParcelsOwned = ownedParcels.length;
  const hqParcelsOwned = districtCounts.get('HQ') || 0;
  const defiParcelsOwned = districtCounts.get('DEFI') || 0;
  const creatorParcelsOwned = districtCounts.get('CREATOR') || 0;
  const aiParcelsOwned = districtCounts.get('AI') || 0;
  
  // Compute utility flags
  const canSetCustomSpawn = totalParcelsOwned >= 1;
  
  const hasCreatorPadAccess =
    (creatorParcelsOwned >= 1 || hqParcelsOwned >= 1) &&
    (tier === 'BRONZE' || tier === 'SILVER' || tier === 'GOLD' || tier === 'DIAMOND');
  
  const hasDefiBoost = defiParcelsOwned >= 1;
  
  const hasHqPriorityAccess =
    (tier === 'GOLD' || tier === 'DIAMOND') ||
    hqParcelsOwned >= 2;
  
  const hasMarketFeeDiscount = tier !== 'NONE';
  
  // Get multipliers
  const xpGlobalMultiplier = REAL_ESTATE_UTILITY_MULTIPLIERS.xpGlobalByTier[tier];
  const airdropGlobalMultiplier = REAL_ESTATE_UTILITY_MULTIPLIERS.airdropGlobalByTier[tier];
  
  return {
    wallet,
    totalParcelsOwned,
    districtsOwned,
    hqParcelsOwned,
    defiParcelsOwned,
    creatorParcelsOwned,
    aiParcelsOwned,
    score,
    tier,
    canSetCustomSpawn,
    hasCreatorPadAccess,
    hasDefiBoost,
    hasHqPriorityAccess,
    hasMarketFeeDiscount,
    xpGlobalMultiplier,
    airdropGlobalMultiplier,
  };
}

// ============================================================================
// HUB PERMISSIONS
// ============================================================================

/**
 * Check if a wallet has access to a specific hub
 */
export function getHubAccessInfo(
  perks: RealEstatePerks,
  hubDistrictId: string
): HubAccessInfo {
  const permissionConfig = REAL_ESTATE_HUB_PERMISSIONS[hubDistrictId as keyof typeof REAL_ESTATE_HUB_PERMISSIONS];
  
  if (!permissionConfig) {
    // No restrictions for unlisted hubs
    return {
      allowed: true,
      reason: 'OK',
      tier: perks.tier,
      requiredTier: null,
      parcelsInDistrict: 0,
      minParcelsRequired: 0,
    };
  }
  
  const { minTier, altRequirement } = permissionConfig;
  
  // Check tier requirement
  const tierOrder: RealEstateTier[] = ['NONE', 'BRONZE', 'SILVER', 'GOLD', 'DIAMOND'];
  const currentTierIndex = tierOrder.indexOf(perks.tier);
  const requiredTierIndex = tierOrder.indexOf(minTier);
  const tierMet = currentTierIndex >= requiredTierIndex;
  
  // Check parcel ownership in district
  const parcelsInDistrict = perks.districtsOwned.includes(hubDistrictId)
    ? (hubDistrictId === 'HQ' ? perks.hqParcelsOwned :
       hubDistrictId === 'DEFI' ? perks.defiParcelsOwned :
       hubDistrictId === 'CREATOR' ? perks.creatorParcelsOwned :
       hubDistrictId === 'AI' ? perks.aiParcelsOwned : 0)
    : 0;
  
  const parcelsMet = parcelsInDistrict >= altRequirement.minParcelsInDistrict;
  
  // Access granted if EITHER condition is met
  const allowed = tierMet || parcelsMet;
  
  let reason: HubAccessInfo['reason'] = 'OK';
  if (!allowed) {
    reason = !tierMet ? 'INSUFFICIENT_TIER' : 'NO_PARCELS_IN_DISTRICT';
  }
  
  return {
    allowed,
    reason,
    tier: perks.tier,
    requiredTier: minTier as RealEstateTier,
    parcelsInDistrict,
    minParcelsRequired: altRequirement.minParcelsInDistrict,
  };
}

// ============================================================================
// AIRDROP MULTIPLIER HELPERS (PHASE 5.1)
// ============================================================================

/**
 * Apply real estate multiplier to airdrop score
 * 
 * PHASE 5.1: Opt-in multiplier system for airdrop rewards
 * 
 * @param wallet - Wallet address
 * @param baseScore - Base airdrop score before multipliers
 * @param enabled - Whether to apply multiplier (default: true, can be disabled via config)
 * @returns Adjusted score with multiplier applied
 */
export function getAirdropAdjustedScore(
  wallet: string, 
  baseScore: number, 
  enabled: boolean = true
): number {
  if (!enabled) return baseScore;
  
  const perks = computeRealEstatePerks(wallet);
  if (!perks) return baseScore;
  
  const multiplier = perks.airdropGlobalMultiplier ?? 1.0;
  return Math.round(baseScore * multiplier);
}

// ============================================================================
// REACT HOOKS
// ============================================================================

/**
 * Hook to get real estate perks for a wallet
 */
export function useRealEstatePerks(wallet?: string): RealEstatePerks | null {
  const ownership = useParcelMarketState((state) => state.ownership);
  const scores = useRealEstateAirdropScoreState((state) => state.scores);
  
  if (!wallet) return null;
  
  // Recompute on ownership or scores change
  return computeRealEstatePerks(wallet);
}
