/**
 * BYOT (Bring Your Own Token) & Inventory Types
 * Defines tokens, items, and their world uses
 */

export type TokenStandard = 'erc20' | 'erc721' | 'erc1155';

/**
 * InventoryToken - Represents any token/item a user holds
 * Can be native (VOID, PSX, FRAME) or BYOT (external partner tokens)
 */
export interface InventoryToken {
  id: string;                    // Internal ID, e.g. "erc20:0x..." or "erc1155:0x...:tokenId"
  standard: TokenStandard;
  chainId: number;
  contractAddress: string;
  tokenId?: string;              // For ERC721/1155
  symbol?: string;               // For ERC20
  name: string;
  amount: string;                // String to avoid float issues; in "human" units for UI
  iconUrl?: string;
  isBYOT: boolean;               // true = external/imported, false = native
  linkedCreatorId?: string;      // Optional association with creator
}

/**
 * WorldUseType - What a token enables in the world
 */
export type WorldUseType =
  | 'access_area'        // Unlock district/parcel/room
  | 'cosmetic_skin'      // Avatar skins
  | 'emote'              // Custom emotes
  | 'xp_boost'           // XP multiplier
  | 'frame_boost'        // Frame earning multiplier
  | 'discount'           // Price discounts
  | 'tool_permission'    // Creator tools access
  | 'land_discount'      // Land purchase discount
  | 'special_role';      // Special in-world role

/**
 * WorldUse - Specific perk/utility enabled by holding a token
 */
export interface WorldUse {
  id: string;
  tokenId: string;               // Links to InventoryToken.id
  type: WorldUseType;
  label: string;                 // e.g. "VIP Club Access", "Neon Avatar Skin"
  description?: string;
  
  // For access_area:
  areaId?: string;               // District/parcel/room id
  
  // For discounts:
  discountPercent?: number;      // e.g. 10 = 10%
  appliesTo?: 'land' | 'skus' | 'fees' | 'jobs' | 'everything';
  
  // For boosts:
  boostMultiplier?: number;      // e.g. 1.2 = +20% XP
  
  // For cosmetics:
  cosmeticId?: string;           // Skin/emote identifier
  
  // For roles:
  roleKey?: string;              // "mod", "vip", "creator-helper", etc.
}

/**
 * BYOTProjectConfig - Partner/external token project configuration
 */
export interface BYOTProjectConfig {
  id: string;                    // Partner/project id
  name: string;
  description?: string;
  iconUrl?: string;
  tokenContracts: {
    contractAddress: string;
    chainId: number;
    standard: TokenStandard;
    defaultSymbol?: string;
  }[];
  worldUseIds: string[];         // Links to WorldUse definitions
}
