/**
 * Property React Hooks
 * Phase 6.3 - Property state and UI helpers
 */

import { useState, useEffect } from 'react';
import { propertyRegistry } from './propertyRegistry';
import type { PropertyMetadata } from './propertyTypes';

// TODO: Import when contracts are fully deployed
// import { getContracts, areContractsDeployed } from '@/contracts/deployment/contracts.config';

/**
 * Hook to get property metadata and ownership
 */
export function useProperty(parcelId: string | null) {
  const [property, setProperty] = useState<PropertyMetadata | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!parcelId) {
      setProperty(null);
      setOwner(null);
      return;
    }

    // Get metadata from registry
    const metadata = propertyRegistry.getByParcelId(parcelId);
    setProperty(metadata || null);

    // Fetch ownership (mainnet only)
    const fetchOwnership = async () => {
      if (!metadata) return;
      // if (!areContractsDeployed()) return; // No contracts deployed yet
      
      setIsLoading(true);
      try {
        // const contracts = getContracts();
        // TODO: Call ParcelOwnership contract when available
        // const ownerAddress = await contracts.parcelOwnership.getOwner(parcelId);
        // setOwner(ownerAddress);
        setOwner(null); // Placeholder
      } catch (error) {
        console.error('[useProperty] Failed to fetch ownership:', error);
        setOwner(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwnership();
  }, [parcelId]);

  return {
    property,
    owner,
    isOwned: !!owner,
    isLoading,
    valueEstimate: property?.baseValue || 0,
  };
}

/**
 * Hook to get current parcel property info
 */
export function useCurrentProperty() {
  const [currentParcel, setCurrentParcel] = useState<{ x: number; z: number } | null>(null);

  useEffect(() => {
    // TODO: Subscribe to player state for current parcel
    // const unsubscribe = usePlayerState.subscribe(
    //   (state) => state.currentParcel,
    //   (parcel) => setCurrentParcel(parcel)
    // );
    // return unsubscribe;
  }, []);

  const parcelId = currentParcel ? `${currentParcel.x},${currentParcel.z}` : null;
  return useProperty(parcelId);
}
