/**
 * Creator Tools Burn Hook
 * Follows modern wagmi v2 pattern
 */

"use client"

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { formatEther } from "viem"

const CREATOR_TOOLS_BURN = process.env.NEXT_PUBLIC_CREATOR_TOOLS_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`;

const CREATOR_TOOLS_BURN_ABI = [
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

export function useCreatorBurn() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Get current creator tier
  const { data: creatorTier } = useReadContract({
    address: CREATOR_TOOLS_BURN,
    abi: CREATOR_TOOLS_BURN_ABI,
    functionName: "getCreatorTier",
    args: address ? [address] : undefined,
    // @ts-ignore
    enabled: !!address,
  });

  // Get tier cost
  const useTierCost = (tier: number) => {
    const { data } = useReadContract({
      address: CREATOR_TOOLS_BURN,
      abi: CREATOR_TOOLS_BURN_ABI,
      functionName: "getTierCost",
      args: [tier],
    });
    return data ? formatEther(data as bigint) : "0";
  };

  // Get tools for tier
  const useToolsForTier = (tier: number) => {
    const { data } = useReadContract({
      address: CREATOR_TOOLS_BURN,
      abi: CREATOR_TOOLS_BURN_ABI,
      functionName: "getToolsForTier",
      args: [tier],
    });
    return data as string[] | undefined;
  };

  // Unlock creator tier (burn VOID)
  const unlockTier = (tier: number) => {
    writeContract({
      address: CREATOR_TOOLS_BURN,
      abi: CREATOR_TOOLS_BURN_ABI,
      functionName: "unlockCreatorTier",
      args: [tier],
    });
  };

  return {
    unlockTier,
    creatorTier: creatorTier as number | undefined,
    useTierCost,
    useToolsForTier,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}
