/**
 * HOOK: useVoidScore
 * Reads on-chain tier, XP, and message limits from VoidScore contract
 * Replaces all mock tier/XP data across HUD
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { VoidScoreABI } from '@/lib/contracts/abis/VoidScore';
import { VOID_CONFIG, TIER_THRESHOLDS, shouldUseMockData } from '@/config/voidConfig';

export type Tier = 'BRONZE' | 'SILVER' | 'GOLD' | 'S_TIER';

export interface VoidScoreData {
  tier: Tier;
  currentScore: number;
  lifetimeScore: number;
  accountAge: number; // in days
  progress: number; // 0-100, progress to next tier
  nextTierThreshold: number;
  globalMessagesRemaining: number;
  zoneMessagesRemaining: number;
  dmMessagesRemaining: number;
}

/**
 * Convert numeric tier (0-3) to tier name
 */
function getTierName(tierNum: number): Tier {
  if (tierNum >= 3) return 'S_TIER';
  if (tierNum >= 2) return 'GOLD';
  if (tierNum >= 1) return 'SILVER';
  return 'BRONZE';
}

/**
 * Calculate progress to next tier (0-100)
 */
function calculateProgress(currentScore: number, tier: Tier): { progress: number; nextThreshold: number } {
  let currentThreshold = 0;
  let nextThreshold = TIER_THRESHOLDS.SILVER;

  switch (tier) {
    case 'BRONZE':
      currentThreshold = 0;
      nextThreshold = TIER_THRESHOLDS.SILVER;
      break;
    case 'SILVER':
      currentThreshold = TIER_THRESHOLDS.SILVER;
      nextThreshold = TIER_THRESHOLDS.GOLD;
      break;
    case 'GOLD':
      currentThreshold = TIER_THRESHOLDS.GOLD;
      nextThreshold = TIER_THRESHOLDS.S_TIER;
      break;
    case 'S_TIER':
      // Max tier, no next
      return { progress: 100, nextThreshold: TIER_THRESHOLDS.S_TIER };
  }

  const range = nextThreshold - currentThreshold;
  const progressInRange = currentScore - currentThreshold;
  const progress = Math.min(100, Math.max(0, (progressInRange / range) * 100));

  return { progress, nextThreshold };
}

/**
 * Main hook
 */
export function useVoidScore(targetAddress?: string) {
  const { address: connectedAddress } = useAccount();
  const address = targetAddress || connectedAddress;

  // ================================
  // READ CONTRACT DATA
  // ================================

  const { data: tierData, refetch: refetchTier } = useReadContract({
    address: VOID_CONFIG.contracts.VoidScore as `0x${string}`,
    abi: VoidScoreABI,
    functionName: 'getTier',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !shouldUseMockData(),
    },
  });

  const { data: currentScoreData, refetch: refetchCurrentScore } = useReadContract({
    address: VOID_CONFIG.contracts.VoidScore as `0x${string}`,
    abi: VoidScoreABI,
    functionName: 'getCurrentScore',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !shouldUseMockData(),
    },
  });

  const { data: lifetimeScoreData, refetch: refetchLifetimeScore } = useReadContract({
    address: VOID_CONFIG.contracts.VoidScore as `0x${string}`,
    abi: VoidScoreABI,
    functionName: 'getLifetimeScore',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !shouldUseMockData(),
    },
  });

  const { data: accountAgeData, refetch: refetchAccountAge } = useReadContract({
    address: VOID_CONFIG.contracts.VoidScore as `0x${string}`,
    abi: VoidScoreABI,
    functionName: 'getAccountAge',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !shouldUseMockData(),
    },
  });

  const { data: globalMessagesData } = useReadContract({
    address: VOID_CONFIG.contracts.VoidScore as `0x${string}`,
    abi: VoidScoreABI,
    functionName: 'getDailyMessagesRemaining',
    args: address ? [address as `0x${string}`, 0] : undefined, // 0 = GLOBAL
    query: {
      enabled: !!address && !shouldUseMockData(),
    },
  });

  const { data: zoneMessagesData } = useReadContract({
    address: VOID_CONFIG.contracts.VoidScore as `0x${string}`,
    abi: VoidScoreABI,
    functionName: 'getDailyMessagesRemaining',
    args: address ? [address as `0x${string}`, 1] : undefined, // 1 = ZONE
    query: {
      enabled: !!address && !shouldUseMockData(),
    },
  });

  const { data: dmMessagesData } = useReadContract({
    address: VOID_CONFIG.contracts.VoidScore as `0x${string}`,
    abi: VoidScoreABI,
    functionName: 'getDailyMessagesRemaining',
    args: address ? [address as `0x${string}`, 2] : undefined, // 2 = DM
    query: {
      enabled: !!address && !shouldUseMockData(),
    },
  });

  // ================================
  // WATCH FOR SCORE UPDATES
  // ================================

  useWatchContractEvent({
    address: VOID_CONFIG.contracts.VoidScore as `0x${string}`,
    abi: VoidScoreABI,
    eventName: 'ScoreUpdated',
    onLogs: (logs) => {
      // Refetch all data when score updates
      refetchTier();
      refetchCurrentScore();
      refetchLifetimeScore();
      refetchAccountAge();
    },
    enabled: !!address && !shouldUseMockData(),
  });

  // ================================
  // COMPUTE FINAL DATA
  // ================================

  const [voidScore, setVoidScore] = useState<VoidScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setVoidScore(null);
      setIsLoading(false);
      return;
    }

    if (shouldUseMockData()) {
      // Mock data for testing
      const mockScore: VoidScoreData = {
        tier: 'SILVER',
        currentScore: 320,
        lifetimeScore: 450,
        accountAge: 15,
        progress: 28, // 28% to GOLD (320/600)
        nextTierThreshold: TIER_THRESHOLDS.GOLD,
        globalMessagesRemaining: 60, // 50 base * 1.2 Silver boost
        zoneMessagesRemaining: 48,
        dmMessagesRemaining: 24,
      };
      setVoidScore(mockScore);
      setIsLoading(false);
      return;
    }

    // Real data from contract
    if (
      tierData !== undefined &&
      currentScoreData !== undefined &&
      lifetimeScoreData !== undefined &&
      accountAgeData !== undefined
    ) {
      const tierNum = Number(tierData);
      const tier = getTierName(tierNum);
      const currentScore = Number(currentScoreData);
      const lifetimeScore = Number(lifetimeScoreData);
      const accountAge = Number(accountAgeData) / 86400; // Convert seconds to days

      const { progress, nextThreshold } = calculateProgress(currentScore, tier);

      const score: VoidScoreData = {
        tier,
        currentScore,
        lifetimeScore,
        accountAge,
        progress,
        nextTierThreshold: nextThreshold,
        globalMessagesRemaining: Number(globalMessagesData || 0),
        zoneMessagesRemaining: Number(zoneMessagesData || 0),
        dmMessagesRemaining: Number(dmMessagesData || 0),
      };

      setVoidScore(score);
      setIsLoading(false);
    }
  }, [
    address,
    tierData,
    currentScoreData,
    lifetimeScoreData,
    accountAgeData,
    globalMessagesData,
    zoneMessagesData,
    dmMessagesData,
  ]);

  // ================================
  // REFRESH FUNCTION
  // ================================

  const refresh = useCallback(() => {
    refetchTier();
    refetchCurrentScore();
    refetchLifetimeScore();
    refetchAccountAge();
  }, [refetchTier, refetchCurrentScore, refetchLifetimeScore, refetchAccountAge]);

  return {
    voidScore,
    isLoading,
    refresh,
  };
}
