/**
 * AIRDROP ENGINE v2 - SCORING FORMULA
 * Official airdrop weight calculation for VOID token distribution
 * Formula: (lifetimeScore * 0.40) + (tierMultiplier * 0.30) + (questCount * 0.20) + (guildScore * 0.10)
 */

import { getTierMultiplier } from '@/lib/score/tierRules';
import type { Tier } from '@/lib/score/tierRules';

export interface AirdropInput {
  lifetimeScore: number; // Total XP earned
  tier: Tier; // Current tier
  questsCompleted: number; // Total quests completed
  guildContributions: number; // Guild activity score
}

export interface AirdropBreakdown {
  xpComponent: number; // 40% weight
  tierComponent: number; // 30% weight
  questComponent: number; // 20% weight
  guildComponent: number; // 10% weight
  totalWeight: number; // Final airdrop weight
  estimatedAllocation?: number; // Estimated tokens (if supply known)
}

/**
 * Calculate airdrop weight (official formula)
 */
export function getAirdropWeight(input: AirdropInput): number {
  // Component 1: Lifetime Score (40% weight)
  const xpComponent = input.lifetimeScore * 0.4;

  // Component 2: Tier Multiplier (30% weight)
  const tierMultiplier = getTierMultiplier(input.tier);
  const tierComponent = tierMultiplier * 1000 * 0.3; // Scaled to ~3000 max

  // Component 3: Quest Count (20% weight)
  const questComponent = input.questsCompleted * 50 * 0.2; // 50 XP per quest

  // Component 4: Guild Score (10% weight)
  const guildComponent = input.guildContributions * 0.1;

  // Total weight
  const totalWeight = xpComponent + tierComponent + questComponent + guildComponent;

  return Math.floor(totalWeight);
}

/**
 * Get airdrop breakdown (detailed view)
 */
export function getAirdropBreakdown(input: AirdropInput): AirdropBreakdown {
  const xpComponent = Math.floor(input.lifetimeScore * 0.4);
  
  const tierMultiplier = getTierMultiplier(input.tier);
  const tierComponent = Math.floor(tierMultiplier * 1000 * 0.3);
  
  const questComponent = Math.floor(input.questsCompleted * 50 * 0.2);
  
  const guildComponent = Math.floor(input.guildContributions * 0.1);

  const totalWeight = xpComponent + tierComponent + questComponent + guildComponent;

  return {
    xpComponent,
    tierComponent,
    questComponent,
    guildComponent,
    totalWeight,
  };
}

/**
 * Calculate estimated token allocation
 * @param weight - User's airdrop weight
 * @param totalSupply - Total airdrop supply (e.g., 1,000,000 VOID)
 * @param totalWeight - Sum of all users' weights
 */
export function getEstimatedAllocation(
  weight: number,
  totalSupply: number,
  totalWeight: number
): number {
  if (totalWeight === 0) return 0;
  return Math.floor((weight / totalWeight) * totalSupply);
}

/**
 * Get airdrop preview with estimated allocation
 */
export function getAirdropPreview(
  input: AirdropInput,
  totalSupply?: number,
  totalWeight?: number
): AirdropBreakdown {
  const breakdown = getAirdropBreakdown(input);

  if (totalSupply && totalWeight) {
    breakdown.estimatedAllocation = getEstimatedAllocation(
      breakdown.totalWeight,
      totalSupply,
      totalWeight
    );
  }

  return breakdown;
}

/**
 * Get minimum score needed for target airdrop weight
 */
export function getScoreForTargetWeight(targetWeight: number): number {
  // Simplified calculation assuming:
  // - All weight comes from XP (40% component)
  // - Ignoring tier/quest/guild bonuses
  return Math.ceil(targetWeight / 0.4);
}

/**
 * Get tier impact on airdrop (compared to no tier)
 */
export function getTierImpact(tier: Tier): number {
  const noTierMultiplier = getTierMultiplier('NONE');
  const currentTierMultiplier = getTierMultiplier(tier);
  
  const noTierComponent = noTierMultiplier * 1000 * 0.3;
  const currentTierComponent = currentTierMultiplier * 1000 * 0.3;
  
  return Math.floor(currentTierComponent - noTierComponent);
}
