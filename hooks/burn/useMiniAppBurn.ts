/**
 * Mini-App Burn Access Hook
 * Follows modern wagmi v2 pattern
 */

"use client"

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { formatEther } from "viem"

const MINIAPP_BURN_ACCESS = process.env.NEXT_PUBLIC_MINIAPP_BURN_ACCESS as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`;

const MINIAPP_BURN_ACCESS_ABI = [
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

export function useMiniAppBurn() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Check if user has feature access
  const useHasAccess = (miniAppId: string, featureId: string) => {
    const { data } = useReadContract({
      address: MINIAPP_BURN_ACCESS,
      abi: MINIAPP_BURN_ACCESS_ABI,
      functionName: "hasAccess",
      args: address ? [address, miniAppId, featureId] : undefined,
      // @ts-ignore
      enabled: !!address && !!miniAppId && !!featureId,
    });
    return data as boolean | undefined;
  };

  // Get feature price
  const useFeaturePrice = (miniAppId: string, featureId: string) => {
    const { data } = useReadContract({
      address: MINIAPP_BURN_ACCESS,
      abi: MINIAPP_BURN_ACCESS_ABI,
      functionName: "getFeaturePrice",
      args: [miniAppId, featureId],
      // @ts-ignore
      enabled: !!miniAppId && !!featureId,
    });
    return data ? formatEther(data as bigint) : "0";
  };

  // Unlock feature (burn VOID)
  const unlockFeature = (miniAppId: string, featureId: string) => {
    writeContract({
      address: MINIAPP_BURN_ACCESS,
      abi: MINIAPP_BURN_ACCESS_ABI,
      functionName: "unlockFeature",
      args: [miniAppId, featureId],
    });
  };

  return {
    unlockFeature,
    useHasAccess,
    useFeaturePrice,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}
