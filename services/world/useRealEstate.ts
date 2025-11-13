/**
 * VOID WORLD - Real Estate Hooks
 * 
 * React hooks for querying property registry with parcel/district awareness
 */

"use client";

import { useMemo } from "react";
import { propertyRegistry } from "@/lib/real-estate-system";
import type { PropertyListing } from "@/lib/real-estate-system";
import type { District } from "@/world/WorldCoords";

/**
 * Get all property listings
 */
export function useAllPropertyListings(): PropertyListing[] {
  // in-memory, so safe to call directly; memo for React
  return useMemo(() => propertyRegistry.getAllListings(), []);
}

/**
 * Get all properties on a specific parcel
 */
export function useParcelProperties(parcelId: number): PropertyListing[] {
  return useMemo(
    () => propertyRegistry.getPropertiesOnParcel(parcelId),
    [parcelId]
  );
}

/**
 * Get all properties in a specific district
 */
export function useDistrictProperties(district: District): PropertyListing[] {
  return useMemo(
    () => propertyRegistry.getPropertiesInDistrict(district),
    [district]
  );
}

/**
 * Get available properties (for sale)
 */
export function useAvailableProperties(): PropertyListing[] {
  return useMemo(() => propertyRegistry.getAvailableProperties(), []);
}

/**
 * Get owned properties for a wallet
 */
export function useOwnedProperties(walletAddress?: string): PropertyListing[] {
  return useMemo(
    () => (walletAddress ? propertyRegistry.getOwnedProperties(walletAddress) : []),
    [walletAddress]
  );
}

/**
 * Get portfolio stats for a wallet
 */
export function usePortfolioStats(walletAddress?: string) {
  return useMemo(
    () => (walletAddress ? propertyRegistry.getPortfolioStats(walletAddress) : null),
    [walletAddress]
  );
}

/**
 * Get property details by ID
 */
export function usePropertyDetails(propertyId: string): PropertyListing | null {
  return useMemo(
    () => propertyRegistry.getPropertyDetails(propertyId),
    [propertyId]
  );
}
