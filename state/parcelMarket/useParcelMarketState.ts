/**
 * PARCEL MARKET STATE
 * 
 * Zustand store for simulated parcel ownership & listings.
 * V1: Off-chain, persisted to localStorage
 * V2: Will integrate with on-chain smart contracts
 * 
 * Usage:
 *   const { ownership, listings, listParcelForSale, simulatePurchase } = useParcelMarketState();
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ParcelOwnership, ParcelListing, RealEstateEvent } from '@/world/economy/ownershipTypes';
import { getClaimCost } from '@/world/economy/realEstateEconomyConfig';

interface ParcelMarketState {
  /** Map of parcelId → ownership data */
  ownership: Map<number, ParcelOwnership>;
  
  /** Map of parcelId → active listing */
  listings: Map<number, ParcelListing>;
  
  /** Event log (most recent first, capped at 500) */
  events: RealEstateEvent[];
  
  /** List a parcel for sale */
  listParcelForSale: (parcelId: number, ownerAddress: string, price: number, districtId?: string) => void;
  
  /** Cancel an active listing */
  cancelListing: (parcelId: number, ownerAddress: string, districtId?: string) => void;
  
  /** Simulate a purchase (V1 sandbox - no actual token transfer) */
  simulatePurchase: (parcelId: number, buyerAddress: string, price: number, districtId?: string) => void;
  
  /** Claim an unowned parcel (testnet feature) */
  claimParcel: (parcelId: number, claimerAddress: string, districtId?: string) => void;
  
  /** Record an event in the log */
  recordEvent: (event: Omit<RealEstateEvent, 'id' | 'timestamp'>) => void;
  
  /** Get ownership for a specific parcel */
  getOwnership: (parcelId: number) => ParcelOwnership | null;
  
  /** Get listing for a specific parcel */
  getListing: (parcelId: number) => ParcelListing | null;
  
  /** Get all parcels owned by an address */
  getOwnedParcels: (ownerAddress: string) => ParcelOwnership[];
  
  /** Get all active listings by an address */
  getActiveListings: (ownerAddress: string) => ParcelListing[];
  
  /** Get all active listings (marketplace view) */
  getAllActiveListings: () => ParcelListing[];
  
  /** Get recent events (history view) */
  getRecentEvents: (limit?: number) => RealEstateEvent[];
}

export const useParcelMarketState = create<ParcelMarketState>()(
  persist(
    (set, get) => ({
      ownership: new Map(),
      listings: new Map(),
      events: [],
      
      recordEvent: (eventData) => {
        const event: RealEstateEvent = {
          ...eventData,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          timestamp: Date.now(),
        };
        
        set((state) => {
          const newEvents = [event, ...state.events].slice(0, 500); // Keep last 500 events
          return { events: newEvents };
        });
        
        console.log(`[ParcelMarket] 📝 Event recorded:`, event.type, `Parcel #${event.parcelId}`);
      },
      
      listParcelForSale: (parcelId, ownerAddress, price, districtId) => {
        const ownership = get().getOwnership(parcelId);
        
        // Validation: must own the parcel
        if (!ownership || ownership.ownerAddress !== ownerAddress) {
          console.warn(`[ParcelMarket] Cannot list parcel ${parcelId}: not owned by ${ownerAddress}`);
          return;
        }
        
        // Validation: price must be positive
        if (price <= 0) {
          console.warn(`[ParcelMarket] Invalid price: ${price}`);
          return;
        }
        
        const listing: ParcelListing = {
          parcelId,
          ownerAddress,
          price,
          createdAt: Date.now(),
          status: 'ACTIVE',
        };
        
        set((state) => {
          const newListings = new Map(state.listings);
          newListings.set(parcelId, listing);
          return { listings: newListings };
        });
        
        // Record event
        get().recordEvent({
          parcelId,
          districtId: districtId || null,
          type: 'LISTED',
          actorAddress: ownerAddress,
          price,
        });
        
        console.log(`[ParcelMarket] ✅ Listed parcel ${parcelId} for ${price} VOID`);
      },
      
      cancelListing: (parcelId, ownerAddress, districtId) => {
        const listing = get().getListing(parcelId);
        
        // Validation: must have active listing by this owner
        if (!listing || listing.ownerAddress !== ownerAddress || listing.status !== 'ACTIVE') {
          console.warn(`[ParcelMarket] Cannot cancel listing for parcel ${parcelId}: no active listing by ${ownerAddress}`);
          return;
        }
        
        set((state) => {
          const newListings = new Map(state.listings);
          newListings.set(parcelId, { ...listing, status: 'CANCELED' });
          return { listings: newListings };
        });
        
        // Record event
        get().recordEvent({
          parcelId,
          districtId: districtId || null,
          type: 'CANCELED',
          actorAddress: ownerAddress,
        });
        
        console.log(`[ParcelMarket] ❌ Canceled listing for parcel ${parcelId}`);
      },
      
      simulatePurchase: (parcelId, buyerAddress, price, districtId) => {
        const listing = get().getListing(parcelId);
        const ownership = get().getOwnership(parcelId);
        const sellerAddress = listing?.ownerAddress || 'unknown';
        
        // Validation: must have active listing
        if (!listing || listing.status !== 'ACTIVE') {
          console.warn(`[ParcelMarket] Cannot purchase parcel ${parcelId}: no active listing`);
          return;
        }
        
        // Validation: price must match
        if (price !== listing.price) {
          console.warn(`[ParcelMarket] Price mismatch: expected ${listing.price}, got ${price}`);
          return;
        }
        
        // Validation: buyer cannot be seller
        if (buyerAddress === listing.ownerAddress) {
          console.warn(`[ParcelMarket] Cannot buy your own parcel`);
          return;
        }
        
        // Transfer ownership
        const newOwnership: ParcelOwnership = {
          parcelId,
          ownerAddress: buyerAddress,
          acquisitionCost: price,
          acquiredAt: Date.now(),
        };
        
        set((state) => {
          const newOwnershipMap = new Map(state.ownership);
          const newListings = new Map(state.listings);
          
          newOwnershipMap.set(parcelId, newOwnership);
          newListings.set(parcelId, { ...listing, status: 'FULFILLED' });
          
          return { ownership: newOwnershipMap, listings: newListings };
        });
        
        // Record event
        get().recordEvent({
          parcelId,
          districtId: districtId || null,
          type: 'SOLD',
          actorAddress: sellerAddress,
          counterpartyAddress: buyerAddress,
          price,
        });
        
        console.log(`[ParcelMarket] 🏢 Parcel ${parcelId} sold to ${buyerAddress} for ${price} VOID`);
      },
      
      claimParcel: (parcelId, claimerAddress, districtId) => {
        const ownership = get().getOwnership(parcelId);
        
        // Validation: parcel must be unowned
        if (ownership && ownership.ownerAddress) {
          console.warn(`[ParcelMarket] Cannot claim parcel ${parcelId}: already owned by ${ownership.ownerAddress}`);
          return;
        }
        
        // Calculate cost using config
        const cost = getClaimCost(String(parcelId), districtId);
        
        const newOwnership: ParcelOwnership = {
          parcelId,
          ownerAddress: claimerAddress,
          acquisitionCost: cost,
          acquiredAt: Date.now(),
        };
        
        set((state) => {
          const newOwnershipMap = new Map(state.ownership);
          newOwnershipMap.set(parcelId, newOwnership);
          return { ownership: newOwnershipMap };
        });
        
        // Record event
        get().recordEvent({
          parcelId,
          districtId: districtId || null,
          type: 'CLAIMED',
          actorAddress: claimerAddress,
          price: cost,
        });
        
        console.log(`[ParcelMarket] 🎉 Parcel ${parcelId} claimed by ${claimerAddress} for ${cost} VOID (district: ${districtId || 'unknown'})`);
      },
      
      getOwnership: (parcelId) => {
        return get().ownership.get(parcelId) || null;
      },
      
      getListing: (parcelId) => {
        const listing = get().listings.get(parcelId);
        return listing && listing.status === 'ACTIVE' ? listing : null;
      },
      
      getOwnedParcels: (ownerAddress) => {
        const owned: ParcelOwnership[] = [];
        get().ownership.forEach((ownership) => {
          if (ownership.ownerAddress === ownerAddress) {
            owned.push(ownership);
          }
        });
        return owned;
      },
      
      getActiveListings: (ownerAddress) => {
        const listings: ParcelListing[] = [];
        get().listings.forEach((listing) => {
          if (listing.ownerAddress === ownerAddress && listing.status === 'ACTIVE') {
            listings.push(listing);
          }
        });
        return listings;
      },
      
      getAllActiveListings: () => {
        const allListings: ParcelListing[] = [];
        get().listings.forEach((listing) => {
          if (listing.status === 'ACTIVE') {
            allListings.push(listing);
          }
        });
        // Sort by most recent first
        return allListings.sort((a, b) => b.createdAt - a.createdAt);
      },
      
      getRecentEvents: (limit = 50) => {
        return get().events.slice(0, limit);
      },
    }),
    {
      name: 'parcel-market-storage',
      // Custom serialization to handle Map types
      partialize: (state) => ({
        ownership: Array.from(state.ownership.entries()),
        listings: Array.from(state.listings.entries()),
        events: state.events,
      }),
      // Custom deserialization to convert arrays back to Maps
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ownership: new Map(persistedState?.ownership || []),
        listings: new Map(persistedState?.listings || []),
        events: persistedState?.events || [],
      }),
    }
  )
);
