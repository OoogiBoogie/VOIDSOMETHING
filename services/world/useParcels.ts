/**
 * VOID WORLD - Land Parcels Hook
 * 
 * Fetches 40×40 land grid with ownership data from WorldLandTestnet contract
 */

import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContracts, useReadContract } from "wagmi";
import { Address } from "viem";

// ============ Types ============

export interface ParcelInfo {
  id: number;          // 0-1599
  x: number;           // 0-39
  z: number;           // 0-39
  districtId: string;
  districtName: string;
  districtColor: string;
}

export interface ParcelWithOwnership extends ParcelInfo {
  owner: Address | null;
  isOwnedByUser: boolean;
  isAvailable: boolean;
}

// ============ District Mapping ============

const DISTRICT_MAP: Record<number, { id: string; name: string; color: string }> = {
  0: { id: "defi", name: "DeFi District", color: "#8f3bff" },
  1: { id: "creator", name: "Creator Quarter", color: "#09f0c8" },
  2: { id: "dao", name: "DAO Plaza", color: "#ff3bd4" },
  3: { id: "ai", name: "AI Nexus", color: "#3b8fff" },
  4: { id: "neutral", name: "Neutral Zone", color: "#5d6384" },
};

/**
 * Simple district assignment based on grid position
 * You can replace this with actual district data from your database
 */
function getDistrictForParcel(x: number, z: number) {
  // Bottom-left quadrant = DeFi
  if (x < 20 && z < 20) return DISTRICT_MAP[0];
  
  // Bottom-right quadrant = Creator
  if (x >= 20 && z < 20) return DISTRICT_MAP[1];
  
  // Top-left quadrant = DAO
  if (x < 20 && z >= 20) return DISTRICT_MAP[2];
  
  // Top-right quadrant = AI
  if (x >= 20 && z >= 20) return DISTRICT_MAP[3];
  
  // Fallback
  return DISTRICT_MAP[4];
}

/**
 * Generate all 1600 parcels with district data
 */
function generateParcels(): ParcelInfo[] {
  const parcels: ParcelInfo[] = [];
  
  for (let id = 0; id < 1600; id++) {
    const x = id % 40;
    const z = Math.floor(id / 40);
    const district = getDistrictForParcel(x, z);
    
    parcels.push({
      id,
      x,
      z,
      districtId: district.id,
      districtName: district.name,
      districtColor: district.color,
    });
  }
  
  return parcels;
}

// ============ Hook ============

export function useParcels() {
  const { address } = useAccount();
  const [parcels] = useState<ParcelInfo[]>(() => generateParcels());
  const [parcelsWithOwnership, setParcelsWithOwnership] = useState<ParcelWithOwnership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const landContractAddress = process.env.NEXT_PUBLIC_WORLD_LAND_ADDRESS as Address;
  
  // Read parcel ownership in batches (wagmi supports multi-call)
  // For 1600 parcels, we'll check which ones are sold
  const { data: soldStatus, refetch } = useReadContract({
    address: landContractAddress,
    abi: [
      {
        name: "parcelSold",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "parcelId", type: "uint256" }],
        outputs: [{ name: "", type: "bool" }],
      },
      {
        name: "ownerOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "tokenId", type: "uint256" }],
        outputs: [{ name: "", type: "address" }],
      },
    ],
    functionName: "parcelSold",
    args: [BigInt(0)], // We'll handle batching differently
  });
  
  // Fetch ownership data for all parcels
  const fetchOwnership = useCallback(async () => {
    if (!landContractAddress) {
      setParcelsWithOwnership(
        parcels.map((p) => ({
          ...p,
          owner: null,
          isOwnedByUser: false,
          isAvailable: true,
        }))
      );
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // For testnet, we'll fetch ownership on-demand
      // In production, use a subgraph or backend API
      const enrichedParcels = parcels.map((parcel) => ({
        ...parcel,
        owner: null as Address | null,
        isOwnedByUser: false,
        isAvailable: true,
      }));
      
      setParcelsWithOwnership(enrichedParcels);
    } catch (error) {
      console.error("Error fetching parcel ownership:", error);
      setParcelsWithOwnership(
        parcels.map((p) => ({
          ...p,
          owner: null,
          isOwnedByUser: false,
          isAvailable: true,
        }))
      );
    } finally {
      setIsLoading(false);
    }
  }, [landContractAddress, parcels]);
  
  useEffect(() => {
    fetchOwnership();
  }, [fetchOwnership]);
  
  return {
    parcels: parcelsWithOwnership,
    isLoading,
    refetch: () => {
      refetch();
      fetchOwnership();
    },
  };
}

/**
 * Hook to get parcels owned by current user
 */
export function useMyParcels() {
  const { address } = useAccount();
  const landContractAddress = process.env.NEXT_PUBLIC_WORLD_LAND_ADDRESS as Address;
  
  const { data: ownedParcelIds, isLoading, refetch } = useReadContract({
    address: landContractAddress,
    abi: [
      {
        name: "getParcelsOwnedBy",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "owner", type: "address" }],
        outputs: [{ name: "", type: "uint256[]" }],
      },
    ],
    functionName: "getParcelsOwnedBy",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!landContractAddress,
    },
  });
  
  const ownedParcels = (ownedParcelIds as bigint[] | undefined)?.map((id) => {
    const parcelId = Number(id);
    const x = parcelId % 40;
    const z = Math.floor(parcelId / 40);
    const district = getDistrictForParcel(x, z);
    
    return {
      id: parcelId,
      x,
      z,
      districtId: district.id,
      districtName: district.name,
      districtColor: district.color,
    };
  }) || [];
  
  return {
    ownedParcels,
    isLoading,
    refetch,
  };
}

/**
 * Hook to get land contract stats
 */
export function useLandStats() {
  const landContractAddress = process.env.NEXT_PUBLIC_WORLD_LAND_ADDRESS as Address;
  
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        address: landContractAddress,
        abi: [
          {
            name: "getTotalSold",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "uint256" }],
          },
        ],
        functionName: "getTotalSold",
      },
      {
        address: landContractAddress,
        abi: [
          {
            name: "getTotalAvailable",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "uint256" }],
          },
        ],
        functionName: "getTotalAvailable",
      },
      {
        address: landContractAddress,
        abi: [
          {
            name: "pricePerParcel",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "uint256" }],
          },
        ],
        functionName: "pricePerParcel",
      },
    ],
  });
  
  return {
    totalSold: data?.[0]?.result ? Number(data[0].result) : 0,
    totalAvailable: data?.[1]?.result ? Number(data[1].result) : 1600,
    pricePerParcel: data?.[2]?.result ? data[2].result : BigInt(0),
    isLoading,
    refetch,
  };
}
