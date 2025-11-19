/**
 * Property System Types
 * Phase 6.3 - Property/parcel metadata and ownership
 */

export interface PropertyMetadata {
  parcelId: string;
  x: number;
  z: number;
  districtId: string;
  name?: string;
  type: PropertyType;
  category: PropertyCategory;
  baseValue: number;
  owner?: string; // Wallet address
  isOwned: boolean;
  landmarks?: string[];
}

export enum PropertyType {
  LAND = 'LAND',
  BUILDING = 'BUILDING',
  LANDMARK = 'LANDMARK',
  PLAZA = 'PLAZA',
  VOID_SPACE = 'VOID_SPACE',
}

export enum PropertyCategory {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  CREATOR_HUB = 'CREATOR_HUB',
  PUBLIC_SPACE = 'PUBLIC_SPACE',
  SPECIAL = 'SPECIAL',
}

export interface PropertyOwnership {
  parcelId: string;
  owner: string;
  acquiredAt: number;
  price?: number;
  metadata?: Record<string, unknown>;
}
