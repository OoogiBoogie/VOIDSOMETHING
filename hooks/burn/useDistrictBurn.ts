/**
 * District Unlock Burn Hook
 * Follows modern wagmi v2 pattern
 */

"use client"

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { formatEther } from "viem"

// Contract addresses from env (update after deployment)
const DISTRICT_ACCESS_BURN = process.env.NEXT_PUBLIC_DISTRICT_ACCESS_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`;

// Simplified ABI (add full ABI after contract compilation)
const DISTRICT_ACCESS_BURN_ABI = [
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

export function useDistrictBurn() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Check if district is unlocked
  const useIsUnlocked = (districtId: number) => {
    const { data } = useReadContract({
      address: DISTRICT_ACCESS_BURN,
      abi: DISTRICT_ACCESS_BURN_ABI,
      functionName: "isDistrictUnlocked",
      args: address ? [address, districtId] : undefined,
      // @ts-ignore - wagmi types
      enabled: !!address,
    });
    return data as boolean | undefined;
  };

  // Get unlock price
  const useUnlockPrice = (districtId: number) => {
    const { data } = useReadContract({
      address: DISTRICT_ACCESS_BURN,
      abi: DISTRICT_ACCESS_BURN_ABI,
      functionName: "districtUnlockPrice",
      args: [districtId],
    });
    return data ? formatEther(data as bigint) : "0";
  };

  // Get unlocked count
  const { data: unlockedCount } = useReadContract({
    address: DISTRICT_ACCESS_BURN,
    abi: DISTRICT_ACCESS_BURN_ABI,
    functionName: "getUnlockedCount",
    args: address ? [address] : undefined,
    // @ts-ignore - wagmi types
    enabled: !!address,
  });

  // Unlock district (burn VOID)
  const unlockDistrict = (districtId: number) => {
    writeContract({
      address: DISTRICT_ACCESS_BURN,
      abi: DISTRICT_ACCESS_BURN_ABI,
      functionName: "unlockDistrict",
      args: [districtId],
    });
  };

  return {
    unlockDistrict,
    useIsUnlocked,
    useUnlockPrice,
    unlockedCount: unlockedCount as number | undefined,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}
