/**
 * @title Phase 2 Cosmetic Data Types
 * @notice Core TypeScript interfaces for cosmetics system
 * @dev TEMPLATE - DO NOT USE UNTIL PHASE 2 UNLOCK (Day 1)
 * 
 * Status: LOCKED 🔒
 * Unlock: After Phase 1 validated stable (24h)
 */

// ============================================================================
// COSMETIC SLOTS
// ============================================================================

/**
 * Cosmetic slot identifiers
 * Each slot can hold one cosmetic item at a time
 */
export enum CosmeticSlot {
  // Avatar Cosmetics (Tier 1 - High Priority)
  AVATAR_FRAME = 'avatar_frame',
  LEVEL_RING = 'level_ring',
  NAMEPLATE = 'nameplate',
  TITLE_BADGE = 'title_badge',
  PROFILE_BACKGROUND = 'profile_background',
  
  // HUD Cosmetics (Tier 1 - High Priority)
  HUD_THEME = 'hud_theme',
  MISSION_CARD_SKIN = 'mission_card_skin',
  WINDOW_FRAME = 'window_frame',
  ICON_PACK = 'icon_pack',
  CHAT_BUBBLE = 'chat_bubble',
  
  // World Cosmetics (Tier 2 - Medium Priority)
  ZONE_MAP_SKIN = 'zone_map_skin',
  MINIMAP_OVERLAY = 'minimap_overlay',
  TRAIL_EFFECT = 'trail_effect',
  SPAWN_ANIMATION = 'spawn_animation',
  
  // Social Cosmetics (Tier 2 - Medium Priority)
  PROFILE_BANNER = 'profile_banner',
  SQUAD_BANNER = 'squad_banner',
  EMOTE_PACK = 'emote_pack',
  
  // Audio Cosmetics (Tier 3 - Low Priority)
  SOUND_PACK = 'sound_pack',
  MUSIC_THEME = 'music_theme'
}

// ============================================================================
// COSMETIC CATEGORIES
// ============================================================================

export type CosmeticCategory = 
  | 'avatar_cosmetic'
  | 'hud_cosmetic'
  | 'world_cosmetic'
  | 'social_cosmetic'
  | 'audio_cosmetic';

export type CosmeticSubcategory = 
  // Avatar
  | 'frame'
  | 'ring'
  | 'nameplate'
  | 'title'
  | 'background'
  // HUD
  | 'theme'
  | 'mission_card'
  | 'window_frame'
  | 'icon_pack'
  | 'chat_bubble'
  // World
  | 'map_skin'
  | 'minimap_overlay'
  | 'trail'
  | 'spawn_anim'
  // Social
  | 'profile_banner'
  | 'squad_banner'
  | 'emote'
  // Audio
  | 'sound'
  | 'music';

// ============================================================================
// COSMETIC ASSETS
// ============================================================================

/**
 * CSS variables for HUD themes
 */
export interface CSSVariables {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  glowIntensity?: number;
  borderRadius?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
  backgroundImage?: string;
  boxShadow?: string;
  textColor?: string;
  textShadow?: string;
  [key: string]: string | number | undefined;
}

/**
 * Icon pack assets (SVG or image URLs)
 */
export interface IconPackAssets {
  map: string;
  chat: string;
  social: string;
  inventory: string;
  missions: string;
  defi: string;
  creator: string;
  aiops: string;
  settings: string;
  [key: string]: string;
}

/**
 * Audio pack assets
 */
export interface AudioAssets {
  click?: string; // IPFS URL
  hover?: string;
  success?: string;
  error?: string;
  notification?: string;
  ambient?: string;
  [key: string]: string | undefined;
}

/**
 * Cosmetic asset bundle
 */
export interface CosmeticAssets {
  thumbnail: string; // Preview image (IPFS)
  preview: string; // Full preview (IPFS)
  styles?: CSSVariables; // For HUD themes
  iconPack?: IconPackAssets; // For icon packs
  audioFiles?: AudioAssets; // For sound packs
}

// ============================================================================
// COSMETIC METADATA (MATCHES SKU METADATA)
// ============================================================================

/**
 * Full cosmetic SKU metadata
 * Matches on-chain SKUFactory metadata structure
 */
export interface CosmeticSKUMetadata {
  // Standard SKU fields
  name: string;
  description: string;
  creator: string; // Ethereum address
  
  // Cosmetic-specific
  category: CosmeticCategory;
  subcategory: CosmeticSubcategory;
  
  // Visual/Audio Assets
  assets: CosmeticAssets;
  
  // Constraints
  minRank?: number; // vXP rank requirement (0=Bronze, 1=Silver, 2=Gold, etc.)
  exclusive?: boolean; // Limited edition
  seasonalStart?: number; // Unix timestamp
  seasonalEnd?: number; // Unix timestamp
  
  // Creator Marketing
  tags: string[]; // ["neon", "cyberpunk", "animated"]
  featured?: boolean; // MissionAI/GovernanceAI can feature
  
  // Economic
  price?: string; // USD/USDC price (as string to avoid precision loss)
  royaltyPercent?: number; // Creator royalty % (default 40)
}

// ============================================================================
// COSMETIC ITEM (OWNED)
// ============================================================================

/**
 * Cosmetic item owned by user
 */
export interface CosmeticItem {
  skuId: number; // ERC-1155 SKU ID from SKUFactory
  name: string;
  category: CosmeticCategory;
  subcategory: CosmeticSubcategory;
  metadata: CosmeticSKUMetadata;
  ownedQuantity: number; // From SKUFactory.balanceOf(user, skuId)
  equippedAt?: number; // Unix timestamp when equipped
}

// ============================================================================
// COSMETIC LOADOUT
// ============================================================================

/**
 * User's cosmetic loadout (equipped items)
 */
export interface CosmeticLoadout {
  userId: string; // Ethereum address
  slots: Partial<Record<CosmeticSlot, CosmeticItem | null>>;
  lastUpdated: number; // Unix timestamp
  version: number; // Loadout version (for conflict resolution)
}

// ============================================================================
// COSMETIC OWNERSHIP
// ============================================================================

/**
 * Cosmetic ownership check result
 */
export interface CosmeticOwnership {
  skuId: number;
  owned: boolean;
  balance: number;
  meetsRankRequirement: boolean;
  userRank: number;
  requiredRank: number;
  canEquip: boolean;
  reason?: string; // If cannot equip, explain why
}

// ============================================================================
// COSMETIC CONTEXT STATE
// ============================================================================

/**
 * Global cosmetics context state
 * Used by <CosmeticContext.Provider>
 */
export interface CosmeticContextState {
  // Lock status
  isLocked: boolean; // MUST be true until Phase 2 unlock
  
  // User loadout
  loadout: CosmeticLoadout | null;
  
  // Owned cosmetics
  ownedCosmetics: CosmeticItem[];
  
  // Equipped cosmetics (quick access)
  equippedCosmetics: Partial<Record<CosmeticSlot, CosmeticItem>>;
  
  // Actions
  equipCosmetic: (slot: CosmeticSlot, skuId: number) => Promise<void>;
  unequipCosmetic: (slot: CosmeticSlot) => Promise<void>;
  checkOwnership: (skuId: number) => Promise<CosmeticOwnership>;
  refreshLoadout: () => Promise<void>;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Cosmetic validation result
 */
export interface CosmeticValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * UI safety validation
 */
export interface UISafetyCheck {
  passesOpacity: boolean; // ≥70%
  passesContrast: boolean; // WCAG AA (4.5:1)
  passesFileSize: boolean; // ≤5MB
  reservedSlotConflict: boolean; // Cannot modify critical UI
}

// ============================================================================
// RANK DEFINITIONS
// ============================================================================

/**
 * vXP rank tiers
 */
export enum Rank {
  BRONZE = 0,    // 0-499 vXP
  SILVER = 1,    // 500-999 vXP
  GOLD = 2,      // 1000-2499 vXP
  PLATINUM = 3,  // 2500-4999 vXP
  DIAMOND = 4    // 5000+ vXP
}

/**
 * Rank display names
 */
export const RANK_NAMES: Record<Rank, string> = {
  [Rank.BRONZE]: 'Bronze',
  [Rank.SILVER]: 'Silver',
  [Rank.GOLD]: 'Gold',
  [Rank.PLATINUM]: 'Platinum',
  [Rank.DIAMOND]: 'Diamond'
};

/**
 * Rank XP thresholds
 */
export const RANK_THRESHOLDS: Record<Rank, number> = {
  [Rank.BRONZE]: 0,
  [Rank.SILVER]: 500,
  [Rank.GOLD]: 1000,
  [Rank.PLATINUM]: 2500,
  [Rank.DIAMOND]: 5000
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get rank from vXP
 */
export function getRankFromVXP(vxp: number): Rank {
  if (vxp >= RANK_THRESHOLDS[Rank.DIAMOND]) return Rank.DIAMOND;
  if (vxp >= RANK_THRESHOLDS[Rank.PLATINUM]) return Rank.PLATINUM;
  if (vxp >= RANK_THRESHOLDS[Rank.GOLD]) return Rank.GOLD;
  if (vxp >= RANK_THRESHOLDS[Rank.SILVER]) return Rank.SILVER;
  return Rank.BRONZE;
}

/**
 * Get rank display name
 */
export function getRankName(rank: Rank): string {
  return RANK_NAMES[rank] || 'Unknown';
}

/**
 * Check if user meets rank requirement
 */
export function meetsRankRequirement(userVXP: number, requiredRank: number): boolean {
  const userRank = getRankFromVXP(userVXP);
  return userRank >= requiredRank;
}

// ============================================================================
// Types and enums are already exported inline above
// ============================================================================
