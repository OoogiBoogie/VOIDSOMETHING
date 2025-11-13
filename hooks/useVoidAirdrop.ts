/**
 * HOOK: useVoidAirdrop
 * Airdrop preview system - calculate user's airdrop weight and estimated allocation
 */

import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useVoidScore } from '@/hooks/useVoidScore';
import { useVoidQuests } from '@/hooks/useVoidQuests';
import {
  getAirdropWeight,
  getAirdropBreakdown,
  getAirdropPreview,
  type AirdropInput,
  type AirdropBreakdown,
} from '@/lib/airdrop/airdropMath';

export interface AirdropData {
  weight: number;
  breakdown: AirdropBreakdown;
  rank?: number; // User's rank among all airdrop participants
  percentile?: number; // Top X% (e.g., "Top 5%")
}

export function useVoidAirdrop() {
  const { address } = useAccount();
  const { voidScore, isLoading: isLoadingScore } = useVoidScore();
  const { quests, isLoading: isLoadingQuests } = useVoidQuests();

  /**
   * Calculate airdrop input
   */
  const airdropInput: AirdropInput | null = useMemo(() => {
    if (!voidScore) return null;

    // Count completed quests
    const questsCompleted = quests.filter((q) => q.isCompleted).length;

    // TODO: Get real guild contributions from useVoidGuilds
    const guildContributions = 0;

    return {
      lifetimeScore: voidScore.lifetimeScore,
      tier: voidScore.tier,
      questsCompleted,
      guildContributions,
    };
  }, [voidScore, quests]);

  /**
   * Calculate airdrop data
   */
  const airdropData: AirdropData | null = useMemo(() => {
    if (!airdropInput) return null;

    const weight = getAirdropWeight(airdropInput);
    const breakdown = getAirdropBreakdown(airdropInput);

    // TODO: Get rank/percentile from indexer
    // For now, estimate based on weight
    const rank = undefined;
    const percentile = undefined;

    return {
      weight,
      breakdown,
      rank,
      percentile,
    };
  }, [airdropInput]);

  /**
   * Get estimated allocation
   * @param totalSupply - Total airdrop supply
   * @param totalWeight - Sum of all users' weights (from indexer)
   */
  const getEstimatedAllocation = (totalSupply: number, totalWeight: number): number => {
    if (!airdropData) return 0;
    return Math.floor((airdropData.weight / totalWeight) * totalSupply);
  };

  const isLoading = isLoadingScore || isLoadingQuests;

  return {
    airdropData,
    isLoading,
    getEstimatedAllocation,
  };
}
