/**
 * PARCEL OWNERSHIP & LISTING TYPES
 * 
 * V1 sandbox model for simulated real estate transactions.
 * This is off-chain, in-memory data (persisted to localStorage).
 * 
 * Future: Replace with on-chain registry calls (smart contracts).
 */

/**
 * Represents ownership of a single parcel
 */
export interface ParcelOwnership {
  /** Parcel ID (from world/map/parcels.ts) */
  parcelId: number;
  
  /** Wallet address of owner (null = unowned/available) */
  ownerAddress: string | null;
  
  /** Purchase price in VOID units */
  acquisitionCost: number;
  
  /** Timestamp when acquired (Date.now()) */
  acquiredAt: number;
}

/**
 * Represents a parcel listing on the market
 */
export interface ParcelListing {
  /** Parcel ID being sold */
  parcelId: number;
  
  /** Wallet address of seller (must match ownership) */
  ownerAddress: string;
  
  /** Asking price in VOID units */
  price: number;
  
  /** Timestamp when listed (Date.now()) */
  createdAt: number;
  
  /** Listing status */
  status: 'ACTIVE' | 'FULFILLED' | 'CANCELED';
}

/**
 * Extended portfolio data including ownership & listings
 */
export interface PlayerPortfolioExtended {
  /** All parcels owned by player */
  ownedParcels: ParcelOwnership[];
  
  /** Parcels currently listed for sale */
  listedParcels: ParcelListing[];
  
  /** Owned parcels not currently listed */
  unlistedOwnedParcels: ParcelOwnership[];
  
  /** Total number of active listings */
  totalListerCount: number;
  
  /** Combined value of all active listings */
  totalListedValue: number;
  
  /** Total number of parcels owned */
  totalParcelsOwned: number;
  
  /** Total acquisition cost of all owned parcels */
  totalInvested: number;
}

/**
 * Real estate event types for transaction history
 */
export type RealEstateEventType =
  | 'CLAIMED'
  | 'LISTED'
  | 'CANCELED'
  | 'SOLD';

/**
 * Real estate event for transaction history
 * Canonical log of all ownership/listing changes
 */
export interface RealEstateEvent {
  /** Unique event ID (timestamp-based or UUID) */
  id: string;
  
  /** Parcel ID this event relates to */
  parcelId: number;
  
  /** District ID (if known) */
  districtId: string | null;
  
  /** Type of event */
  type: RealEstateEventType;
  
  /** Primary actor (claimer, lister, seller, buyer) */
  actorAddress: string;
  
  /** Secondary actor (buyer in SOLD events) */
  counterpartyAddress?: string;
  
  /** Price (for LISTED, SOLD events) */
  price?: number;
  
  /** Event timestamp */
  timestamp: number;
}
