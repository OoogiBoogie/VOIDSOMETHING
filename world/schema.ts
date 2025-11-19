/**
 * VOID WORLD - Feature & POI Schema
 * 
 * Defines types for world landmarks, hubs, portals, and access points
 * Separates spatial (districts) from functional (hubs)
 */

import type { WorldPosition, ParcelCoords } from "./WorldCoords";
import type { DistrictId } from "./map/districts";

/**
 * Hub = functional vertical (what economic/social system owns this)
 */
export type WorldHub =
  | "WORLD"      // Global/system-level
  | "DEFI"       // Swaps, vaults, DEX, yield
  | "DAO"        // Proposals, governance, missions
  | "CREATOR"    // Content, games, drops, streaming
  | "AGENCY"     // Gigs, work-to-earn, agencies
  | "AI_OPS";    // AI hotspots, routing, assistant ops

/**
 * Feature type (what kind of interactive element)
 */
export type WorldFeatureType =
  | "landmark"   // PSX HQ, DeFi Tower, Creator Arena, etc.
  | "hub"        // DeFi hub, Creator hub, DAO hall, AI lab
  | "portal"     // teleporter/fast travel
  | "spawn"      // spawn points
  | "shop"       // item/skin shop
  | "quest"      // quest/mission start
  | "event";     // temporary event nodes

/**
 * World Feature - anchored in space (district) and function (hub)
 * 
 * IMPORTANT:
 * - district = spatial quadrant (where it is physically)
 * - hub = functional vertical (which economy it belongs to)
 */
export interface WorldFeature {
  id: string;
  label: string;
  type: WorldFeatureType;
  hub: WorldHub;           // Functional vertical
  district: DistrictId;    // Spatial quadrant
  worldPos: WorldPosition;
  parcel: ParcelCoords;
  accessibleFrom?: ("world" | "defi" | "dao" | "creator" | "ai" | "agency")[];
  icon?: string;           // Optional HUD icon id
  priority?: number;       // Rendering priority on map (higher = more prominent)
  description?: string;
}

/**
 * District metadata for world snapshot
 */
export interface DistrictMeta {
  id: DistrictId;
  name: string;
  color: string;
  parcelCount: number;      // How many parcels in this district
  buildingCount: number;    // How many buildings
  featureCount: number;     // How many features/landmarks
}

/**
 * Building binding (connects buildings to parcels)
 */
export interface BuildingBinding {
  building: any; // From city-assets Building type
  parcelId: number;
  parcelCoords: ParcelCoords;
  district: DistrictId;
}

/**
 * Complete world state snapshot
 * This is what gets fed to HUD, maps, and all UI
 */
export interface VoidWorldSnapshot {
  // Player position
  coordinates: WorldPosition;      // Player world position
  parcelCoords: ParcelCoords;      // Derived from coordinates
  parcelId: number;
  district: DistrictId;

  // World data
  districts: DistrictMeta[];       // All district summaries
  features: WorldFeature[];        // All landmarks, hubs, portals
  buildings: BuildingBinding[];    // All buildings mapped to parcels

  // Optional metadata
  onlineFriends?: number;
  landStats?: {
    totalParcels: number;
    totalSold: number;
    pricePerParcel: number;
  };
}

