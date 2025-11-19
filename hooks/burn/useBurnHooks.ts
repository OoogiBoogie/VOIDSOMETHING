/**
 * VOID Burn Utility Hooks
 * 
 * TypeScript hooks for interacting with VOID burn system contracts
 * All burns are PERMANENT and IRREVERSIBLE
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useEffect, useState } from 'react';

// Contract addresses (update after deployment)
export const BURN_CONTRACTS = {
  VoidBurnUtility: process.env.NEXT_PUBLIC_VOID_BURN_UTILITY as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
  DistrictAccessBurn: process.env.NEXT_PUBLIC_DISTRICT_ACCESS_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
  LandUpgradeBurn: process.env.NEXT_PUBLIC_LAND_UPGRADE_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
  CreatorToolsBurn: process.env.NEXT_PUBLIC_CREATOR_TOOLS_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
  PrestigeBurn: process.env.NEXT_PUBLIC_PRESTIGE_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
  MiniAppBurnAccess: process.env.NEXT_PUBLIC_MINIAPP_BURN_ACCESS as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
};

// Burn categories (matches Solidity enum)
export enum BurnCategory {
  DISTRICT_UNLOCK = 0,
  LAND_UPGRADE = 1,
  CREATOR_TOOLS = 2,
  PRESTIGE = 3,
  MINIAPP_ACCESS = 4,
}

// ABIs (simplified - add full ABIs after contract compilation)
const VoidBurnUtilityABI = [
  {
    name: 'burnForUtility',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'category', type: 'uint8' },
      { name: 'metadata', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'getUserTotalBurned',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getCurrentDayBurned',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getUserCurrentDayBurned',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const DistrictAccessBurnABI = [
  {
    name: 'unlockDistrict',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'districtId', type: 'uint8' }],
    outputs: [],
  },
  {
    name: 'isDistrictUnlocked',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'districtId', type: 'uint8' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'districtUnlockPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'districtId', type: 'uint8' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getUnlockedCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

const LandUpgradeBurnABI = [
  {
    name: 'upgradeParcel',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'parcelId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getUpgradeLevel',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'parcelId', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'getUpgradeCost',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'level', type: 'uint8' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const CreatorToolsBurnABI = [
  {
    name: 'unlockCreatorTier',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tier', type: 'uint8' }],
    outputs: [],
  },
  {
    name: 'getCreatorTier',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'creator', type: 'address' }],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'getTierCost',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tier', type: 'uint8' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getToolsForTier',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tier', type: 'uint8' }],
    outputs: [{ name: '', type: 'string[]' }],
  },
] as const;

const PrestigeBurnABI = [
  {
    name: 'unlockNextRank',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'getPrestigeRank',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'getRankCost',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'rank', type: 'uint8' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getCosmeticsForRank',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'rank', type: 'uint8' }],
    outputs: [{ name: '', type: 'string[]' }],
  },
] as const;

const MiniAppBurnAccessABI = [
  {
    name: 'unlockFeature',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'miniAppId', type: 'string' },
      { name: 'featureId', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'hasAccess',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'miniAppId', type: 'string' },
      { name: 'featureId', type: 'string' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'getFeaturePrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'miniAppId', type: 'string' },
      { name: 'featureId', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

/**
 * Hook: Get user's total burned VOID
 */
export function useUserTotalBurned(userAddress?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: BURN_CONTRACTS.VoidBurnUtility,
    abi: VoidBurnUtilityABI,
    functionName: 'getUserTotalBurned',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    totalBurned: data ? formatEther(data as bigint) : '0',
    totalBurnedRaw: data as bigint | undefined,
    isLoading,
    refetch,
  };
}

/**
 * Hook: Get user's current day burned amount
 */
export function useUserDailyBurned(userAddress?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: BURN_CONTRACTS.VoidBurnUtility,
    abi: VoidBurnUtilityABI,
    functionName: 'getUserCurrentDayBurned',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    dailyBurned: data ? formatEther(data as bigint) : '0',
    dailyBurnedRaw: data as bigint | undefined,
    isLoading,
    refetch,
  };
}

/**
 * Hook: Check if district is unlocked
 */
export function useDistrictUnlockStatus(
  userAddress?: `0x${string}`,
  districtId?: number
) {
  const { data, isLoading, refetch } = useReadContract({
    address: BURN_CONTRACTS.DistrictAccessBurn,
    abi: DistrictAccessBurnABI,
    functionName: 'isDistrictUnlocked',
    args: userAddress && districtId ? [userAddress, districtId as number] : undefined,
    query: {
      enabled: !!userAddress && districtId !== undefined,
    },
  });

  return {
    isUnlocked: data as boolean | undefined,
    isLoading,
    refetch,
  };
}

/**
 * Hook: Get district unlock price
 */
export function useDistrictUnlockPrice(districtId?: number) {
  const { data, isLoading } = useReadContract({
    address: BURN_CONTRACTS.DistrictAccessBurn,
    abi: DistrictAccessBurnABI,
    functionName: 'districtUnlockPrice',
    args: districtId ? [districtId as number] : undefined,
    query: {
      enabled: districtId !== undefined,
    },
  });

  return {
    price: data ? formatEther(data as bigint) : '0',
    priceRaw: data as bigint | undefined,
    isLoading,
  };
}

/**
 * Hook: Unlock district (write operation)
 */
export function useUnlockDistrict(districtId: number) {
  const { config } = usePrepareContractWrite({
    address: BURN_CONTRACTS.DistrictAccessBurn,
    abi: DistrictAccessBurnABI,
    functionName: 'unlockDistrict',
    args: [districtId as number],
  });

  const { write, data, isLoading, isSuccess, error } = useContractWrite(config);

  return {
    unlockDistrict: write,
    transaction: data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook: Get parcel upgrade level
 */
export function useParcelUpgradeLevel(
  ownerAddress?: `0x${string}`,
  parcelId?: bigint
) {
  const { data, isLoading, refetch } = useContractRead({
    address: BURN_CONTRACTS.LandUpgradeBurn,
    abi: LandUpgradeBurnABI,
    functionName: 'getUpgradeLevel',
    args: ownerAddress && parcelId ? [ownerAddress, parcelId] : undefined,
    enabled: !!ownerAddress && parcelId !== undefined,
  });

  return {
    level: data as number | undefined,
    isLoading,
    refetch,
  };
}

/**
 * Hook: Get upgrade cost for level
 */
export function useUpgradeCost(level?: number) {
  const { data, isLoading } = useContractRead({
    address: BURN_CONTRACTS.LandUpgradeBurn,
    abi: LandUpgradeBurnABI,
    functionName: 'getUpgradeCost',
    args: level ? [level as number] : undefined,
    enabled: level !== undefined && level >= 1 && level <= 5,
  });

  return {
    cost: data ? formatEther(data as bigint) : '0',
    costRaw: data as bigint | undefined,
    isLoading,
  };
}

/**
 * Hook: Upgrade parcel (write operation)
 */
export function useUpgradeParcel(parcelId: bigint) {
  const { config } = usePrepareContractWrite({
    address: BURN_CONTRACTS.LandUpgradeBurn,
    abi: LandUpgradeBurnABI,
    functionName: 'upgradeParcel',
    args: [parcelId],
  });

  const { write, data, isLoading, isSuccess, error } = useContractWrite(config);

  return {
    upgradeParcel: write,
    transaction: data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook: Get creator tier
 */
export function useCreatorTier(creatorAddress?: `0x${string}`) {
  const { data, isLoading, refetch } = useContractRead({
    address: BURN_CONTRACTS.CreatorToolsBurn,
    abi: CreatorToolsBurnABI,
    functionName: 'getCreatorTier',
    args: creatorAddress ? [creatorAddress] : undefined,
    enabled: !!creatorAddress,
  });

  return {
    tier: data as number | undefined,
    isLoading,
    refetch,
  };
}

/**
 * Hook: Get creator tier cost
 */
export function useCreatorTierCost(tier?: number) {
  const { data, isLoading } = useContractRead({
    address: BURN_CONTRACTS.CreatorToolsBurn,
    abi: CreatorToolsBurnABI,
    functionName: 'getTierCost',
    args: tier ? [tier as number] : undefined,
    enabled: tier !== undefined && tier >= 1 && tier <= 3,
  });

  return {
    cost: data ? formatEther(data as bigint) : '0',
    costRaw: data as bigint | undefined,
    isLoading,
  };
}

/**
 * Hook: Get tools for tier
 */
export function useCreatorTools(tier?: number) {
  const { data, isLoading } = useContractRead({
    address: BURN_CONTRACTS.CreatorToolsBurn,
    abi: CreatorToolsBurnABI,
    functionName: 'getToolsForTier',
    args: tier ? [tier as number] : undefined,
    enabled: tier !== undefined && tier >= 1 && tier <= 3,
  });

  return {
    tools: data as string[] | undefined,
    isLoading,
  };
}

/**
 * Hook: Unlock creator tier (write operation)
 */
export function useUnlockCreatorTier(tier: number) {
  const { config } = usePrepareContractWrite({
    address: BURN_CONTRACTS.CreatorToolsBurn,
    abi: CreatorToolsBurnABI,
    functionName: 'unlockCreatorTier',
    args: [tier as number],
  });

  const { write, data, isLoading, isSuccess, error } = useContractWrite(config);

  return {
    unlockTier: write,
    transaction: data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook: Get prestige rank
 */
export function usePrestigeRank(userAddress?: `0x${string}`) {
  const { data, isLoading, refetch } = useContractRead({
    address: BURN_CONTRACTS.PrestigeBurn,
    abi: PrestigeBurnABI,
    functionName: 'getPrestigeRank',
    args: userAddress ? [userAddress] : undefined,
    enabled: !!userAddress,
  });

  return {
    rank: data as number | undefined,
    isLoading,
    refetch,
  };
}

/**
 * Hook: Get prestige rank cost
 */
export function usePrestigeRankCost(rank?: number) {
  const { data, isLoading } = useContractRead({
    address: BURN_CONTRACTS.PrestigeBurn,
    abi: PrestigeBurnABI,
    functionName: 'getRankCost',
    args: rank ? [rank as number] : undefined,
    enabled: rank !== undefined && rank >= 1 && rank <= 10,
  });

  return {
    cost: data ? formatEther(data as bigint) : '0',
    costRaw: data as bigint | undefined,
    isLoading,
  };
}

/**
 * Hook: Get cosmetics for rank
 */
export function usePrestigeCosmetics(rank?: number) {
  const { data, isLoading } = useContractRead({
    address: BURN_CONTRACTS.PrestigeBurn,
    abi: PrestigeBurnABI,
    functionName: 'getCosmeticsForRank',
    args: rank ? [rank as number] : undefined,
    enabled: rank !== undefined && rank >= 1 && rank <= 10,
  });

  return {
    cosmetics: data as string[] | undefined,
    isLoading,
  };
}

/**
 * Hook: Unlock next prestige rank (write operation)
 */
export function useUnlockPrestigeRank() {
  const { config } = usePrepareContractWrite({
    address: BURN_CONTRACTS.PrestigeBurn,
    abi: PrestigeBurnABI,
    functionName: 'unlockNextRank',
  });

  const { write, data, isLoading, isSuccess, error } = useContractWrite(config);

  return {
    unlockNextRank: write,
    transaction: data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook: Check mini-app feature access
 */
export function useMiniAppFeatureAccess(
  userAddress?: `0x${string}`,
  miniAppId?: string,
  featureId?: string
) {
  const { data, isLoading, refetch } = useContractRead({
    address: BURN_CONTRACTS.MiniAppBurnAccess,
    abi: MiniAppBurnAccessABI,
    functionName: 'hasAccess',
    args: userAddress && miniAppId && featureId 
      ? [userAddress, miniAppId, featureId] 
      : undefined,
    enabled: !!userAddress && !!miniAppId && !!featureId,
  });

  return {
    hasAccess: data as boolean | undefined,
    isLoading,
    refetch,
  };
}

/**
 * Hook: Get mini-app feature price
 */
export function useMiniAppFeaturePrice(
  miniAppId?: string,
  featureId?: string
) {
  const { data, isLoading } = useContractRead({
    address: BURN_CONTRACTS.MiniAppBurnAccess,
    abi: MiniAppBurnAccessABI,
    functionName: 'getFeaturePrice',
    args: miniAppId && featureId ? [miniAppId, featureId] : undefined,
    enabled: !!miniAppId && !!featureId,
  });

  return {
    price: data ? formatEther(data as bigint) : '0',
    priceRaw: data as bigint | undefined,
    isLoading,
  };
}

/**
 * Hook: Unlock mini-app feature (write operation)
 */
export function useUnlockMiniAppFeature(
  miniAppId: string,
  featureId: string
) {
  const { config } = usePrepareContractWrite({
    address: BURN_CONTRACTS.MiniAppBurnAccess,
    abi: MiniAppBurnAccessABI,
    functionName: 'unlockFeature',
    args: [miniAppId, featureId],
  });

  const { write, data, isLoading, isSuccess, error } = useContractWrite(config);

  return {
    unlockFeature: write,
    transaction: data,
    isLoading,
    isSuccess,
    error,
  };
}
