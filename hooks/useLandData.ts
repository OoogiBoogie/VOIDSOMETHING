/**
 * useLandData Hook
 * Manages land parcels, marketplace, districts, and ownership
 * Integrates with existing lib/land system (lib/land/hooks.ts)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParcelDetails, useOwnerParcels, useParcelsPage } from '@/lib/land/hooks';
import { landRegistryAPI } from '@/lib/land/registry-api';
import { Parcel, DistrictType, ParcelStatus } from '@/lib/land/types';
import { useAccount } from 'wagmi';

// ========== DISTRICT INFO ==========
// Enrich district data with UI metadata
export interface DistrictInfo {
  id: DistrictType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const DISTRICT_INFO: Record<DistrictType, DistrictInfo> = {
  [DistrictType.GAMING]: {
    id: DistrictType.GAMING,
    name: 'Gaming District',
    description: 'Arcades, tournaments, and competitive gaming venues',
    icon: '🎮',
    color: '#FF00AA',
  },
  [DistrictType.BUSINESS]: {
    id: DistrictType.BUSINESS,
    name: 'Business District',
    description: 'Corporate towers, startups, and commercial spaces',
    icon: '🏢',
    color: '#00D4FF',
  },
  [DistrictType.SOCIAL]: {
    id: DistrictType.SOCIAL,
    name: 'Social District',
    description: 'Nightlife, clubs, and social venues',
    icon: '🎭',
    color: '#FF0099',
  },
  [DistrictType.DEFI]: {
    id: DistrictType.DEFI,
    name: 'DeFi District',
    description: 'Data centers, exchanges, and financial hubs',
    icon: '💹',
    color: '#FFD700',
  },
  [DistrictType.RESIDENTIAL]: {
    id: DistrictType.RESIDENTIAL,
    name: 'Residential District',
    description: 'Housing hives and living spaces',
    icon: '🏘️',
    color: '#9945FF',
  },
  [DistrictType.DAO]: {
    id: DistrictType.DAO,
    name: 'DAO Plaza',
    description: 'Governance headquarters and community spaces',
    icon: '🏛️',
    color: '#6B5CE7',
  },
  [DistrictType.PUBLIC]: {
    id: DistrictType.PUBLIC,
    name: 'Public Spaces',
    description: 'Parks, streets, and shared amenities',
    icon: '🌳',
    color: '#00FFA6',
  },
};

// ========== useLandMap: Get all parcels + districts ==========
export interface UseLandMapReturn {
  parcels: Parcel[];
  districts: DistrictInfo[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useLandMap(): UseLandMapReturn {
  // Load all parcels (paginated to avoid loading 10k at once)
  const { parcels, isLoading, error, refetch } = useParcelsPage(1, 1600);

  const districts = useMemo(() => {
    return Object.values(DISTRICT_INFO);
  }, []);

  return {
    parcels: parcels || [],
    districts,
    loading: isLoading,
    error: error || null,
    refresh: refetch,
  };
}

// ========== useParcel: Get single parcel details ==========
export interface UseParcelReturn {
  parcel: Parcel | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  // Actions (currently stubs for Phase 1)
  updateLease: (leaseConfig: any) => Promise<void>;
  listForSale: (price: number, tokenAddress: string) => Promise<void>;
}

export function useParcel(parcelId: string | null): UseParcelReturn {
  // Convert parcelId to tokenId (e.g., "VOID-GENESIS-42" → 42)
  const tokenId = useMemo(() => {
    if (!parcelId) return undefined;
    const parts = parcelId.split('-');
    return parseInt(parts[parts.length - 1], 10);
  }, [parcelId]);

  const { parcel, isLoading, error, refetch } = useParcelDetails(tokenId);

  const updateLease = useCallback(async (leaseConfig: any) => {
    console.log('[useParcel] updateLease - TODO: implement', { parcelId, leaseConfig });
    // TODO: Wire to landService or blockchain
  }, [parcelId]);

  const listForSale = useCallback(async (price: number, tokenAddress: string) => {
    console.log('[useParcel] listForSale - TODO: implement', { parcelId, price, tokenAddress });
    // TODO: Wire to landService or blockchain
  }, [parcelId]);

  return {
    parcel: parcel || null,
    loading: isLoading,
    error: error || null,
    refresh: refetch,
    updateLease,
    listForSale,
  };
}

// ========== useMyParcels: Get user's owned parcels ==========
export interface UseMyParcelsReturn {
  parcels: Parcel[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useMyParcels(): UseMyParcelsReturn {
  const { address } = useAccount();
  const { parcelIds, isLoading, error, refetch } = useOwnerParcels(address);

  // Fetch full parcel details for each owned parcel
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (!parcelIds || parcelIds.length === 0) {
      setParcels([]);
      return;
    }

    setDetailsLoading(true);
    // Convert parcelId strings to tokenIds
    const tokenIds = parcelIds.map(id => {
      const parts = id.split('-');
      return parseInt(parts[parts.length - 1], 10);
    });

    // Load each parcel (for Phase 1, using mock data, this is instant)
    // TODO: Batch load for efficiency
    Promise.all(
      tokenIds.map(async (tokenId) => {
        // Use landRegistryAPI to get mock parcel
        const mockParcels = landRegistryAPI.generateMockParcels(1600);
        return mockParcels[tokenId];
      })
    ).then(results => {
      setParcels(results.filter(Boolean));
      setDetailsLoading(false);
    });
  }, [parcelIds]);

  return {
    parcels,
    loading: isLoading || detailsLoading,
    error: error || null,
    refresh: refetch,
  };
}

// ========== useLandMarket: Get marketplace listings ==========
export interface LandListing {
  id: string;
  parcelId: string;
  parcel: Parcel;
  price: number;
  currency: string;
  sellerAddress: string;
  sellerName?: string;
  listedAt: Date;
}

export interface UseLandMarketReturn {
  listings: LandListing[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  purchaseLand: (listingId: string) => Promise<void>;
}

export function useLandMarket(): UseLandMarketReturn {
  const { parcels, isLoading, error, refetch } = useParcelsPage(1, 1600);

  // Filter to only parcels listed for sale
  const listings = useMemo<LandListing[]>(() => {
    if (!parcels) return [];

    return parcels
      .filter(p => p.status === ParcelStatus.FOR_SALE && p.salePrice)
      .map((parcel, idx) => ({
        id: `listing-${parcel.parcelId}`,
        parcelId: parcel.parcelId,
        parcel,
        price: Number(parcel.salePrice) / 1e18, // Convert from bigint wei to float
        currency: 'VOID',
        sellerAddress: parcel.owner || '0x0000000000000000000000000000000000000000',
        sellerName: `User ${idx + 1}`,
        listedAt: parcel.listedAt || new Date(),
      }));
  }, [parcels]);

  const purchaseLand = useCallback(async (listingId: string) => {
    console.log('[useLandMarket] purchaseLand - TODO: implement', { listingId });
    // TODO: Wire to DeFi module / blockchain
  }, []);

  return {
    listings,
    loading: isLoading,
    error: error || null,
    refresh: refetch,
    purchaseLand,
  };
}

// ========== useDistrictStats: Calculate district-level analytics ==========
export interface DistrictStats extends DistrictInfo {
  totalParcels: number;
  ownedParcels: number;
  availableParcels: number;
  occupancyRate: number;
  floorPrice: number;
  avgPrice: number;
  traffic7d: number;
}

export interface UseDistrictStatsReturn {
  districts: DistrictStats[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  getDistrictById: (districtId: DistrictType) => DistrictStats | undefined;
}

export function useDistrictStats(): UseDistrictStatsReturn {
  const { parcels, isLoading, error, refetch } = useParcelsPage(1, 1600);

  const districts = useMemo<DistrictStats[]>(() => {
    if (!parcels || parcels.length === 0) return [];

    // Group parcels by district
    const districtGroups = parcels.reduce((acc, parcel) => {
      if (!acc[parcel.district]) {
        acc[parcel.district] = [];
      }
      acc[parcel.district].push(parcel);
      return acc;
    }, {} as Record<DistrictType, Parcel[]>);

    // Calculate stats for each district
    return Object.entries(districtGroups).map(([districtId, districtParcels]) => {
      const districtInfo = DISTRICT_INFO[districtId as DistrictType];
      const totalParcels = districtParcels.length;
      const ownedParcels = districtParcels.filter(p => p.owner && p.status !== ParcelStatus.FOR_SALE).length;
      const availableParcels = totalParcels - ownedParcels;
      const occupancyRate = totalParcels > 0 ? (ownedParcels / totalParcels) * 100 : 0;

      // Calculate pricing (from listings)
      const forSaleParcels = districtParcels.filter(p => p.salePrice && p.salePrice > 0n);
      const prices = forSaleParcels.map(p => Number(p.salePrice) / 1e18);
      const floorPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

      // Mock traffic data (TODO: wire to analytics)
      const traffic7d = Math.floor(Math.random() * 10000) + 1000;

      return {
        ...districtInfo,
        totalParcels,
        ownedParcels,
        availableParcels,
        occupancyRate,
        floorPrice,
        avgPrice,
        traffic7d,
      };
    });
  }, [parcels]);

  const getDistrictById = useCallback(
    (districtId: DistrictType) => {
      return districts.find(d => d.id === districtId);
    },
    [districts]
  );

  return {
    districts,
    loading: isLoading,
    error: error || null,
    refresh: refetch,
    getDistrictById,
  };
}
