/**
 * VOID WORLD - Core Features Dataset
 * 
 * Precomputed landmarks, hubs, and key access points for the world map
 * Each feature has BOTH:
 * - district (spatial quadrant - where it is)
 * - hub (functional vertical - what it belongs to)
 */

import { parcelToWorld } from "./WorldCoords";
import type { WorldFeature } from "./schema";

export const CORE_WORLD_FEATURES: WorldFeature[] = [
  {
    id: "psx-hq",
    label: "PSX HQ",
    type: "landmark",
    hub: "DAO",           // DAO governance headquarters
    district: "DAO",      // Near center edge in DAO quadrant
    parcel: { x: 19, z: 19 },
    worldPos: parcelToWorld({ x: 19, z: 19 }),
    accessibleFrom: ["world", "dao"],
    icon: "hq",
    priority: 10,
    description: "PSX Protocol headquarters and main governance hub",
  },
  {
    id: "defi-tower",
    label: "DeFi Tower",
    type: "hub",
    hub: "DEFI",          // DeFi economic vertical
    district: "DEFI",     // DeFi spatial quadrant
    parcel: { x: 8, z: 30 },
    worldPos: parcelToWorld({ x: 8, z: 30 }),
    accessibleFrom: ["world", "defi"],
    icon: "defi",
    priority: 9,
    description: "Main DEX terminal and swap hub",
  },
  {
    id: "creator-arena",
    label: "Creator Arena",
    type: "hub",
    hub: "CREATOR",       // Creator economic vertical
    district: "CREATOR",  // Creator spatial quadrant
    parcel: { x: 30, z: 30 },
    worldPos: parcelToWorld({ x: 30, z: 30 }),
    accessibleFrom: ["world", "creator"],
    icon: "creator",
    priority: 9,
    description: "Creator tools, cosmetics marketplace, and NFT studio",
  },
  {
    id: "ai-nexus-core",
    label: "AI Nexus",
    type: "hub",
    hub: "AI_OPS",        // AI operations vertical
    district: "AI",       // AI spatial quadrant
    parcel: { x: 30, z: 8 },
    worldPos: parcelToWorld({ x: 30, z: 8 }),
    accessibleFrom: ["world", "ai"],
    icon: "ai",
    priority: 9,
    description: "AI agent hub and task automation center",
  },
  {
    id: "dao-hall",
    label: "DAO Hall",
    type: "hub",
    hub: "DAO",           // DAO governance vertical
    district: "DAO",      // DAO spatial quadrant
    parcel: { x: 10, z: 10 },
    worldPos: parcelToWorld({ x: 10, z: 10 }),
    accessibleFrom: ["world", "dao"],
    icon: "dao",
    priority: 8,
    description: "Governance proposals and voting center",
  },
  {
    id: "agency-plaza",
    label: "Agency Plaza",
    type: "hub",
    hub: "AGENCY",        // Agency/gig economy vertical
    district: "CREATOR",  // Located in creator district spatially
    parcel: { x: 25, z: 35 },
    worldPos: parcelToWorld({ x: 25, z: 35 }),
    accessibleFrom: ["world", "agency"],
    icon: "agency",
    priority: 8,
    description: "Gig board, work-to-earn opportunities, and agency marketplace",
  },
  {
    id: "spawn-core",
    label: "Spawn Point",
    type: "spawn",
    hub: "WORLD",         // Global system spawn
    district: "HQ",       // Center of map
    parcel: { x: 20, z: 20 },
    worldPos: parcelToWorld({ x: 20, z: 20 }),
    accessibleFrom: ["world"],
    icon: "spawn",
    priority: 8,
    description: "Main spawn location for new players",
  },
  {
    id: "marketplace-central",
    label: "Central Marketplace",
    type: "shop",
    hub: "WORLD",         // Global marketplace
    district: "HQ",       // Center area
    parcel: { x: 20, z: 21 },
    worldPos: parcelToWorld({ x: 20, z: 21 }),
    accessibleFrom: ["world"],
    icon: "shop",
    priority: 7,
    description: "General goods and cosmetics shop",
  },
  {
    id: "quest-board",
    label: "Quest Board",
    type: "quest",
    hub: "DAO",           // Missions managed by DAO
    district: "HQ",       // Accessible to all
    parcel: { x: 19, z: 21 },
    worldPos: parcelToWorld({ x: 19, z: 21 }),
    accessibleFrom: ["world"],
    icon: "quest",
    priority: 7,
    description: "Mission and bounty board",
  },
  {
    id: "portal-defi",
    label: "DeFi Portal",
    type: "portal",
    hub: "DEFI",          // Fast travel for DeFi
    district: "DEFI",     // In DeFi district
    parcel: { x: 5, z: 35 },
    worldPos: parcelToWorld({ x: 5, z: 35 }),
    accessibleFrom: ["world", "defi"],
    icon: "portal",
    priority: 6,
    description: "Fast travel to DeFi district",
  },
  {
    id: "portal-creator",
    label: "Creator Portal",
    type: "portal",
    hub: "CREATOR",       // Fast travel for Creator
    district: "CREATOR",  // In Creator district
    parcel: { x: 35, z: 35 },
    worldPos: parcelToWorld({ x: 35, z: 35 }),
    accessibleFrom: ["world", "creator"],
    icon: "portal",
    priority: 6,
    description: "Fast travel to Creator district",
  },
  {
    id: "portal-dao",
    label: "DAO Portal",
    type: "portal",
    hub: "DAO",           // Fast travel for DAO
    district: "DAO",      // In DAO district
    parcel: { x: 5, z: 5 },
    worldPos: parcelToWorld({ x: 5, z: 5 }),
    accessibleFrom: ["world", "dao"],
    icon: "portal",
    priority: 6,
    description: "Fast travel to DAO district",
  },
  {
    id: "portal-ai",
    label: "AI Portal",
    type: "portal",
    hub: "AI_OPS",        // Fast travel for AI
    district: "AI",       // In AI district
    parcel: { x: 35, z: 5 },
    worldPos: parcelToWorld({ x: 35, z: 5 }),
    accessibleFrom: ["world", "ai"],
    icon: "portal",
    priority: 6,
    description: "Fast travel to AI district",
  },
];

/**
 * Get features by type
 */
export function getFeaturesByType(type: WorldFeature["type"]): WorldFeature[] {
  return CORE_WORLD_FEATURES.filter(f => f.type === type);
}

/**
 * Get features by district (spatial)
 */
export function getFeaturesByDistrict(district: WorldFeature["district"]): WorldFeature[] {
  return CORE_WORLD_FEATURES.filter(f => f.district === district);
}

/**
 * Get features by hub (functional)
 */
export function getFeaturesByHub(hub: WorldFeature["hub"]): WorldFeature[] {
  return CORE_WORLD_FEATURES.filter(f => f.hub === hub);
}

/**
 * Get feature by ID
 */
export function getFeatureById(id: string): WorldFeature | undefined {
  return CORE_WORLD_FEATURES.find(f => f.id === id);
}

