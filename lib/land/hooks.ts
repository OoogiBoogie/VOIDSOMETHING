/**
 * Land System React Hooks
 * Wagmi hooks for interacting with LandRegistry contract
 */

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { Address, parseEther } from 'viem';
import { CONTRACTS, LAND_REGISTRY_ABI } from './contracts';
import { Parcel, LicenseType, ParcelStatus } from './types';
import { landRegistryAPI } from './registry-api';
import { useMemo, useCallback, useState } from 'react';

/**
 * Get details for a single parcel
 */
export function useParcelDetails(parcelId: number | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.LAND_REGISTRY as Address,
    abi: LAND_REGISTRY_ABI,
    functionName: 'getParcelDetails',
    args: parcelId !== undefined ? [BigInt(parcelId)] : undefined,
    query: {
      enabled: parcelId !== undefined
    }
  });

  const parcel = useMemo(() => {
    if (!data || parcelId === undefined) return null;
    return landRegistryAPI.parseParcelData(parcelId, data as any);
  }, [data, parcelId]);

  return {
    parcel,
    isLoading,
    error,
    refetch
  };
}

/**
 * Get all parcels owned by an address
 */
export function useOwnerParcels(owner: Address | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.LAND_REGISTRY as Address,
    abi: LAND_REGISTRY_ABI,
    functionName: 'getOwnerParcels',
    args: owner ? [owner] : undefined,
    query: {
      enabled: !!owner
    }
  });

  const parcelIds = useMemo(() => {
    if (!data) return [];
    return (data as bigint[]).map(id => Number(id));
  }, [data]);

  return {
    parcelIds,
    isLoading,
    error,
    refetch
  };
}

/**
 * Get all parcels in a specific zone
 */
export function useParcelsByZone(zone: number | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.LAND_REGISTRY as Address,
    abi: LAND_REGISTRY_ABI,
    functionName: 'getParcelsByZone',
    args: zone !== undefined ? [zone] : undefined,
    query: {
      enabled: zone !== undefined
    }
  });

  const parcelIds = useMemo(() => {
    if (!data) return [];
    return (data as bigint[]).map(id => Number(id));
  }, [data]);

  return {
    parcelIds,
    isLoading,
    error,
    refetch
  };
}

/**
 * Get current user's parcels
 */
export function useMyParcels() {
  const { address } = useAccount();
  return useOwnerParcels(address);
}

/**
 * Batch fetch parcel details
 */
export function useBatchParcelDetails(parcelIds: number[]) {
  const contracts = useMemo(() => {
    return parcelIds.map(id => ({
      address: CONTRACTS.LAND_REGISTRY as Address,
      abi: LAND_REGISTRY_ABI,
      functionName: 'getParcelDetails' as const,
      args: [BigInt(id)]
    }));
  }, [parcelIds]);

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: parcelIds.length > 0
    }
  });

  const parcels = useMemo(() => {
    if (!data) return [];
    return data.map((result, index) => {
      if (result.status === 'success' && result.result) {
        return landRegistryAPI.parseParcelData(parcelIds[index], result.result as any);
      }
      return null;
    }).filter((p): p is Parcel => p !== null);
  }, [data, parcelIds]);

  return {
    parcels,
    isLoading,
    error,
    refetch
  };
}

/**
 * Get all parcels (10,000 parcels - use with caution)
 */
export function useAllParcels() {
  const parcelIds = useMemo(() => {
    return Array.from({ length: 10000 }, (_, i) => i);
  }, []);

  return useBatchParcelDetails(parcelIds);
}

/**
 * Paginated parcels reader to avoid loading 10k at once
 */
export function useParcelsPage(page: number, pageSize: number) {
  const { data: gridSizeData } = useReadContract({
    address: CONTRACTS.LAND_REGISTRY as Address,
    abi: LAND_REGISTRY_ABI,
    functionName: 'TOTAL_PARCELS'
  });

  const totalParcels = gridSizeData ? Number(gridSizeData) : 10000;
  const clampedPageSize = Math.max(1, Math.min(pageSize, 1000));
  const maxPage = Math.max(1, Math.ceil(totalParcels / clampedPageSize));
  const safePage = Math.max(1, Math.min(page, maxPage));
  const start = (safePage - 1) * clampedPageSize;
  const end = Math.min(start + clampedPageSize, totalParcels);

  const parcelIds = useMemo(() => {
    return Array.from({ length: end - start }, (_, i) => start + i);
  }, [start, end]);

  const batch = useBatchParcelDetails(parcelIds);

  return {
    ...batch,
    page: safePage,
    pageSize: clampedPageSize,
    totalParcels,
    totalPages: maxPage
  };
}

/**
 * Purchase a parcel
 */
export function usePurchaseParcel() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  });

  const purchaseParcel = useCallback((parcelId: number, priceInVoid: bigint) => {
    writeContract({
      address: CONTRACTS.LAND_REGISTRY as Address,
      abi: LAND_REGISTRY_ABI,
      functionName: 'purchaseParcel',
      args: [BigInt(parcelId)],
      value: priceInVoid
    });
  }, [writeContract]);

  return {
    purchaseParcel,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash
  };
}

/**
 * Purchase a business license
 */
export function usePurchaseLicense() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  });

  const purchaseLicense = useCallback((parcelId: number, licenseType: LicenseType) => {
    const price = landRegistryAPI.getLicensePrice(licenseType);
    writeContract({
      address: CONTRACTS.LAND_REGISTRY as Address,
      abi: LAND_REGISTRY_ABI,
      functionName: 'purchaseLicense',
      args: [BigInt(parcelId), licenseType],
      value: price
    });
  }, [writeContract]);

  return {
    purchaseLicense,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash
  };
}

/**
 * Build a house on a parcel
 */
export function useBuildHouse() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  });

  const buildHouse = useCallback((parcelId: number) => {
    writeContract({
      address: CONTRACTS.LAND_REGISTRY as Address,
      abi: LAND_REGISTRY_ABI,
      functionName: 'buildHouse',
      args: [BigInt(parcelId)]
    });
  }, [writeContract]);

  return {
    buildHouse,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash
  };
}

/**
 * Record business revenue
 */
export function useRecordBusinessRevenue() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  });

  const recordRevenue = useCallback((parcelId: number, amount: bigint) => {
    writeContract({
      address: CONTRACTS.LAND_REGISTRY as Address,
      abi: LAND_REGISTRY_ABI,
      functionName: 'recordBusinessRevenue',
      args: [BigInt(parcelId), amount]
    });
  }, [writeContract]);

  return {
    recordRevenue,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash
  };
}

/**
 * Check if user can access Glizzy World
 */
export function useCanAccessGlizzyWorld(address: Address | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.LAND_REGISTRY as Address,
    abi: LAND_REGISTRY_ABI,
    functionName: 'canAccessGlizzyWorld',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address
    }
  });

  return {
    canAccess: data as boolean | undefined,
    isLoading,
    error,
    refetch
  };
}

/**
 * Get contract constants
 */
export function useLandConstants() {
  const { data: gridSize } = useReadContract({
    address: CONTRACTS.LAND_REGISTRY as Address,
    abi: LAND_REGISTRY_ABI,
    functionName: 'GRID_SIZE'
  });

  const { data: totalParcels } = useReadContract({
    address: CONTRACTS.LAND_REGISTRY as Address,
    abi: LAND_REGISTRY_ABI,
    functionName: 'TOTAL_PARCELS'
  });

  return {
    gridSize: gridSize ? Number(gridSize) : 100,
    totalParcels: totalParcels ? Number(totalParcels) : 10000
  };
}

/**
 * Hook to filter and search parcels
 */
export function useParcelFilters(parcels: Parcel[]) {
  const [filters, setFilters] = useState({
    zone: null as number | null,
    status: null as ParcelStatus | null,
    owner: null as Address | null,
    searchId: null as number | null,
    hasHouse: null as boolean | null,
    hasLicense: null as boolean | null
  });

  const filteredParcels = useMemo(() => {
    let result = [...parcels];

    if (filters.zone !== null) {
      result = landRegistryAPI.filterByZone(result, filters.zone);
    }

    if (filters.status !== null) {
      result = landRegistryAPI.filterByStatus(result, filters.status);
    }

    if (filters.owner) {
      result = landRegistryAPI.filterByOwner(result, filters.owner);
    }

    if (filters.searchId !== null) {
      const parcel = landRegistryAPI.searchByParcelId(result, filters.searchId);
      result = parcel ? [parcel] : [];
    }

    if (filters.hasHouse !== null) {
      result = result.filter(p => p.hasHouse === filters.hasHouse);
    }

    if (filters.hasLicense !== null) {
      result = result.filter(p => 
        filters.hasLicense 
          ? p.businessLicense !== LicenseType.NONE 
          : p.businessLicense === LicenseType.NONE
      );
    }

    return result;
  }, [parcels, filters]);

  return {
    filters,
    setFilters,
    filteredParcels,
    statistics: landRegistryAPI.getStatistics(filteredParcels)
  };
}
