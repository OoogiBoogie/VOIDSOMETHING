/**
 * PARCEL OWNERSHIP & LISTING HOOKS
 * 
 * High-level hooks for real estate features.
 * Wraps useParcelMarketState with convenient interfaces.
 */

import { useMemo, useCallback } from 'react';
import { useParcelMarketState } from '@/state/parcelMarket/useParcelMarketState';
import { usePlayerState } from '@/state/player/usePlayerState';
import type { ParcelOwnership, ParcelListing, PlayerPortfolioExtended } from './ownershipTypes';

/**
 * Get ownership data for a specific parcel
 * 
 * @param parcelId - Parcel ID to check (null = no parcel selected)
 * @returns Ownership data + helper flags
 */
export function useParcelOwnership(parcelId: number | null) {
  const { getOwnership } = useParcelMarketState();
  const playerAddress = usePlayerState((s: any) => s.walletAddress);
  
  const ownership = useMemo(() => {
    if (parcelId === null) return null;
    return getOwnership(parcelId);
  }, [parcelId, getOwnership]);
  
  const isOwnedByCurrentPlayer = useMemo(() => {
    if (!ownership || !playerAddress) return false;
    return ownership.ownerAddress?.toLowerCase() === playerAddress.toLowerCase();
  }, [ownership, playerAddress]);
  
  return {
    ownership,
    ownerAddress: ownership?.ownerAddress || null,
    isOwnedByCurrentPlayer,
    acquisitionCost: ownership?.acquisitionCost || 0,
    acquiredAt: ownership?.acquiredAt || 0,
    isUnowned: !ownership || !ownership.ownerAddress,
  };
}

/**
 * Get listing data + actions for a specific parcel
 * 
 * @param parcelId - Parcel ID to check (null = no parcel selected)
 * @returns Listing data + action helpers
 */
export function useParcelListing(parcelId: number | null) {
  const { getListing, listParcelForSale, cancelListing, simulatePurchase } = useParcelMarketState();
  const playerAddress = usePlayerState((s: any) => s.walletAddress);
  const { isOwnedByCurrentPlayer } = useParcelOwnership(parcelId);
  
  const activeListing = useMemo(() => {
    if (parcelId === null) return null;
    return getListing(parcelId);
  }, [parcelId, getListing]);
  
  const listParcel = useCallback((price: number) => {
    if (parcelId === null || !playerAddress) {
      console.warn('[useParcelListing] Cannot list: no parcel or wallet');
      return;
    }
    listParcelForSale(parcelId, playerAddress, price);
  }, [parcelId, playerAddress, listParcelForSale]);
  
  const cancelList = useCallback(() => {
    if (parcelId === null || !playerAddress) {
      console.warn('[useParcelListing] Cannot cancel: no parcel or wallet');
      return;
    }
    cancelListing(parcelId, playerAddress);
  }, [parcelId, playerAddress, cancelListing]);
  
  const simulateBuy = useCallback((price: number) => {
    if (parcelId === null || !playerAddress) {
      console.warn('[useParcelListing] Cannot buy: no parcel or wallet');
      return;
    }
    simulatePurchase(parcelId, playerAddress, price);
  }, [parcelId, playerAddress, simulatePurchase]);
  
  return {
    activeListing,
    isListed: activeListing !== null,
    listPrice: activeListing?.price || 0,
    canList: isOwnedByCurrentPlayer && !activeListing,
    canCancelList: isOwnedByCurrentPlayer && activeListing !== null,
    canBuy: !isOwnedByCurrentPlayer && activeListing !== null,
    listParcel,
    cancelList,
    simulateBuy,
  };
}

/**
 * Get extended portfolio data for a player
 * Includes ownership, listings, and aggregate stats
 * 
 * @param address - Wallet address (defaults to current player)
 * @returns Extended portfolio data
 */
export function usePlayerPortfolioExtended(address?: string): PlayerPortfolioExtended {
  const { getOwnedParcels, getActiveListings } = useParcelMarketState();
  const playerAddress = usePlayerState((s: any) => s.walletAddress);
  
  const targetAddress = address || playerAddress || '';
  
  return useMemo(() => {
    const ownedParcels = getOwnedParcels(targetAddress);
    const listedParcels = getActiveListings(targetAddress);
    
    const listedParcelIds = new Set(listedParcels.map((l: ParcelListing) => l.parcelId));
    const unlistedOwnedParcels = ownedParcels.filter((p: ParcelOwnership) => !listedParcelIds.has(p.parcelId));
    
    const totalListedValue = listedParcels.reduce((sum: number, listing: ParcelListing) => sum + listing.price, 0);
    const totalInvested = ownedParcels.reduce((sum: number, ownership: ParcelOwnership) => sum + ownership.acquisitionCost, 0);
    
    return {
      ownedParcels,
      listedParcels,
      unlistedOwnedParcels,
      totalListerCount: listedParcels.length,
      totalListedValue,
      totalParcelsOwned: ownedParcels.length,
      totalInvested,
    };
  }, [targetAddress, getOwnedParcels, getActiveListings]);
}
