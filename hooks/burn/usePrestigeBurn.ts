/**
 * Prestige Burn Hook
 * Follows modern wagmi v2 pattern
 */

"use client"

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { formatEther } from "viem"

const PRESTIGE_BURN = process.env.NEXT_PUBLIC_PRESTIGE_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`;

const PRESTIGE_BURN_ABI = [
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

export function usePrestigeBurn() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Get current prestige rank
  const { data: prestigeRank } = useReadContract({
    address: PRESTIGE_BURN,
    abi: PRESTIGE_BURN_ABI,
    functionName: "getPrestigeRank",
    args: address ? [address] : undefined,
    // @ts-ignore
    enabled: !!address,
  });

  // Get cost for next rank
  const useRankCost = (rank: number) => {
    const { data } = useReadContract({
      address: PRESTIGE_BURN,
      abi: PRESTIGE_BURN_ABI,
      functionName: "getRankCost",
      args: [rank],
    });
    return data ? formatEther(data as bigint) : "0";
  };

  // Get cosmetics for rank
  const useCosmeticsForRank = (rank: number) => {
    const { data } = useReadContract({
      address: PRESTIGE_BURN,
      abi: PRESTIGE_BURN_ABI,
      functionName: "getCosmeticsForRank",
      args: [rank],
    });
    return data as string[] | undefined;
  };

  // Unlock next prestige rank (burn VOID)
  const unlockNextRank = () => {
    writeContract({
      address: PRESTIGE_BURN,
      abi: PRESTIGE_BURN_ABI,
      functionName: "unlockNextRank",
      args: [],
    });
  };

  return {
    unlockNextRank,
    prestigeRank: prestigeRank as number | undefined,
    useRankCost,
    useCosmeticsForRank,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}
