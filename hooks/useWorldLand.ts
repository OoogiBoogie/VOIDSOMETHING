/**
 * VOID WORLD - Land Purchase Hook
 * 
 * Handles buying land parcels on WorldLandTestnet
 */

import { useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { Address, parseUnits } from "viem";
import { toast } from "sonner"; // or your notification system

const LAND_ABI = [
  {
    name: "buyParcel",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "parcelId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "buyParcels",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "parcelIds", type: "uint256[]" }],
    outputs: [],
  },
  {
    name: "pricePerParcel",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "isAvailable",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "parcelId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const VOID_TOKEN_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export function useWorldLand() {
  const { address } = useAccount();
  const landContractAddress = process.env.NEXT_PUBLIC_WORLD_LAND_ADDRESS as Address;
  const voidTokenAddress = process.env.NEXT_PUBLIC_VOID_ADDRESS as Address;
  
  // Contract write hooks
  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: buyParcel, data: buyHash } = useWriteContract();
  
  // Transaction receipts
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  
  const { isLoading: isBuying } = useWaitForTransactionReceipt({
    hash: buyHash,
  });
  
  // Read price per parcel
  const { data: pricePerParcel } = useReadContract({
    address: landContractAddress,
    abi: LAND_ABI,
    functionName: "pricePerParcel",
  });
  
  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: voidTokenAddress,
    abi: VOID_TOKEN_ABI,
    functionName: "allowance",
    args: address && landContractAddress ? [address, landContractAddress] : undefined,
    query: {
      enabled: !!address && !!landContractAddress,
    },
  });
  
  /**
   * Buy a single land parcel
   */
  const buyParcelFn = useCallback(
    async (parcelId: number) => {
      if (!address) {
        toast.error("Please connect your wallet");
        return;
      }
      
      if (!landContractAddress || !voidTokenAddress || !pricePerParcel) {
        toast.error("Contract addresses not configured");
        return;
      }
      
      try {
        const price = pricePerParcel as bigint;
        const currentAllowance = (allowance as bigint) || BigInt(0);
        
        // Step 1: Approve VOID if needed
        if (currentAllowance < price) {
          toast.info("Approving VOID tokens...");
          
          approve(
            {
              address: voidTokenAddress,
              abi: VOID_TOKEN_ABI,
              functionName: "approve",
              args: [landContractAddress, price],
            },
            {
              onSuccess: async () => {
                toast.success("VOID approved!");
                await refetchAllowance();
                
                // Step 2: Buy parcel
                toast.info(`Purchasing parcel #${parcelId}...`);
                
                buyParcel(
                  {
                    address: landContractAddress,
                    abi: LAND_ABI,
                    functionName: "buyParcel",
                    args: [BigInt(parcelId)],
                  },
                  {
                    onSuccess: () => {
                      toast.success(`Parcel #${parcelId} purchased! 🎉`);
                    },
                    onError: (error) => {
                      console.error("Purchase error:", error);
                      toast.error("Purchase failed");
                    },
                  }
                );
              },
              onError: (error) => {
                console.error("Approval error:", error);
                toast.error("Approval failed");
              },
            }
          );
        } else {
          // Already approved, just buy
          toast.info(`Purchasing parcel #${parcelId}...`);
          
          buyParcel(
            {
              address: landContractAddress,
              abi: LAND_ABI,
              functionName: "buyParcel",
              args: [BigInt(parcelId)],
            },
            {
              onSuccess: () => {
                toast.success(`Parcel #${parcelId} purchased! 🎉`);
              },
              onError: (error) => {
                console.error("Purchase error:", error);
                toast.error("Purchase failed");
              },
            }
          );
        }
      } catch (error) {
        console.error("Buy parcel error:", error);
        toast.error("Transaction failed");
      }
    },
    [address, landContractAddress, voidTokenAddress, pricePerParcel, allowance, approve, buyParcel, refetchAllowance]
  );
  
  /**
   * Check if parcel is available
   */
  const checkAvailability = useCallback(
    async (parcelId: number): Promise<boolean> => {
      if (!landContractAddress) return false;
      
      try {
        // This would be a contract call
        // For now, return true (implement actual check)
        return true;
      } catch (error) {
        console.error("Error checking availability:", error);
        return false;
      }
    },
    [landContractAddress]
  );
  
  return {
    buyParcel: buyParcelFn,
    checkAvailability,
    pricePerParcel,
    isApproving,
    isBuying,
    isLoading: isApproving || isBuying,
  };
}
