/**
 * Land Upgrade Burn Hook
 * Follows modern wagmi v2 pattern
 */

"use client"

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { formatEther } from "viem"

const LAND_UPGRADE_BURN = process.env.NEXT_PUBLIC_LAND_UPGRADE_BURN as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`;

const LAND_UPGRADE_BURN_ABI = [
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

export function useLandBurn() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Get parcel upgrade level
  const useUpgradeLevel = (parcelId: bigint) => {
    const { data } = useReadContract({
      address: LAND_UPGRADE_BURN,
      abi: LAND_UPGRADE_BURN_ABI,
      functionName: "getUpgradeLevel",
      args: address && parcelId ? [address, parcelId] : undefined,
      // @ts-ignore
      enabled: !!address && parcelId !== undefined,
    });
    return data as number | undefined;
  };

  // Get upgrade cost for next level
  const useUpgradeCost = (level: number) => {
    const { data } = useReadContract({
      address: LAND_UPGRADE_BURN,
      abi: LAND_UPGRADE_BURN_ABI,
      functionName: "getUpgradeCost",
      args: [level],
    });
    return data ? formatEther(data as bigint) : "0";
  };

  // Upgrade parcel (burn VOID)
  const upgradeParcel = (parcelId: bigint) => {
    writeContract({
      address: LAND_UPGRADE_BURN,
      abi: LAND_UPGRADE_BURN_ABI,
      functionName: "upgradeParcel",
      args: [parcelId],
    });
  };

  return {
    upgradeParcel,
    useUpgradeLevel,
    useUpgradeCost,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}
