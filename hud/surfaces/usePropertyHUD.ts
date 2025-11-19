/**
 * HUD Property Surface
 * Phase 6.6 - Property info display for HUD
 */

import { useCurrentProperty } from '../../world/property/propertyHooks';

/**
 * Hook for property display in HUD
 */
export function usePropertyHUD() {
  const { property, owner, isOwned, isLoading, valueEstimate } = useCurrentProperty();

  if (!property) {
    return {
      property: null,
      hasProperty: false,
      display: null,
    };
  }

  return {
    property,
    owner,
    isOwned,
    isLoading,
    valueEstimate,
    hasProperty: true,
    
    // Formatted display
    display: {
      name: property.name || `Parcel (${property.x}, ${property.z})`,
      type: property.type,
      district: property.districtId,
      value: valueEstimate.toLocaleString(),
      ownershipStatus: isOwned ? `Owned by ${owner?.slice(0, 6)}...` : 'Unclaimed',
    },
  };
}
