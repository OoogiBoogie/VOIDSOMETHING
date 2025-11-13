/**
 * NET PROTOCOL TYPES - V4.7 Production
 * 
 * Types matching NetProtocolProfiles.sol contract for on-chain profile storage.
 * Aligned with Solidity struct for gas-efficient storage.
 */

// ================================
// ON-CHAIN CORE PROFILE
// ================================

/**
 * Core profile data stored on-chain
 * Maps directly to ProfileCore struct in NetProtocolProfiles.sol
 * 
 * Solidity:
 *   uint64 createdAt, updatedAt
 *   int32 zoneX, zoneY, posX, posY, posZ
 *   uint32 sceneId, level
 *   uint64 xp
 *   bytes32 dataHash
 */
export interface NetProfileCore {
  wallet: `0x${string}`;
  createdAt: number;       // uint64 (seconds since epoch)
  updatedAt: number;       // uint64 (seconds since epoch)
  zoneX: number;           // int32 (grid zone X)
  zoneY: number;           // int32 (grid zone Y)
  posX: number;            // int32 (world position X)
  posY: number;            // int32 (world position Y)
  posZ: number;            // int32 (world position Z)
  sceneId: number;         // uint32 (scene/district ID)
  level: number;           // uint32 (player level)
  xp: bigint;              // uint64 (stored as bigint, convert to number for UI)
  dataHash?: `0x${string}`; // bytes32 (IPFS/Arweave hash)
}

// ================================
// OFF-CHAIN RICH PROFILE
// ================================

/**
 * Rich profile data stored off-chain (IPFS/Arweave)
 * Referenced by dataHash in on-chain profile
 */
export interface NetProfileRich {
  version: number;
  wallet: `0x${string}`;
  agentId?: string;
  displayName?: string;
  
  avatar?: {
    pfpUrl?: string;
    frameStyle?: string;
  };
  
  progress?: {
    xp?: string;
    level?: number;
    badges?: string[];
    lastLoginAt?: number;
  };
  
  world?: {
    currentSceneId?: number;
    zone?: { x: number; y: number };
    position?: { x: number; y: number; z: number };
    cameraPreset?: string;
  };
  
  unlocks?: {
    districts?: string[];
    features?: string[];
  };
  
  inventory?: {
    nfts?: string[];
    currencies?: Record<string, string>;
  };
  
  settings?: {
    hudMode?: 'LITE' | 'ROAM' | 'PC';
    preferredPlatform?: 'mobile' | 'desktop';
    muteProximityChat?: boolean;
  };
}

// ================================
// HYBRID PROFILE (App Layer)
// ================================

/**
 * Combined profile type used in app layer
 * Merges on-chain core with decoded off-chain rich data
 */
export interface NetProfile extends NetProfileCore {
  // Extended from rich data
  agentId?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  
  preferences?: {
    theme?: string;
    notifications?: boolean;
    graphics?: 'low' | 'medium' | 'high';
    hudMode?: 'LITE' | 'ROAM' | 'PC';
  };
  
  // Legacy fields for backward compatibility
  lastSceneId?: string;
  lastPosition?: {
    x: number;
    y: number;
    z: number;
  };
}

// ================================
// UPDATE TYPES
// ================================

export interface NetProfileUpdate {
  // Position updates
  zoneX?: number;
  zoneY?: number;
  posX?: number;
  posY?: number;
  posZ?: number;
  sceneId?: number;
  
  // Progress updates
  xp?: bigint;
  level?: number;
  
  // Rich data updates (will be hashed to dataHash)
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  preferences?: Partial<NetProfile['preferences']>;
}

// ================================
// CONTRACT ABI TYPES
// ================================

export const NET_PROTOCOL_PROFILES_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getProfile',
    outputs: [{
      components: [
        { internalType: 'uint64', name: 'createdAt', type: 'uint64' },
        { internalType: 'uint64', name: 'updatedAt', type: 'uint64' },
        { internalType: 'int32', name: 'zoneX', type: 'int32' },
        { internalType: 'int32', name: 'zoneY', type: 'int32' },
        { internalType: 'int32', name: 'posX', type: 'int32' },
        { internalType: 'int32', name: 'posY', type: 'int32' },
        { internalType: 'int32', name: 'posZ', type: 'int32' },
        { internalType: 'uint32', name: 'sceneId', type: 'uint32' },
        { internalType: 'uint32', name: 'level', type: 'uint32' },
        { internalType: 'uint64', name: 'xp', type: 'uint64' },
        { internalType: 'bytes32', name: 'dataHash', type: 'bytes32' },
      ],
      internalType: 'struct NetProtocolProfiles.ProfileCore',
      name: '',
      type: 'tuple',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'hasProfile',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{
      components: [
        { internalType: 'uint64', name: 'createdAt', type: 'uint64' },
        { internalType: 'uint64', name: 'updatedAt', type: 'uint64' },
        { internalType: 'int32', name: 'zoneX', type: 'int32' },
        { internalType: 'int32', name: 'zoneY', type: 'int32' },
        { internalType: 'int32', name: 'posX', type: 'int32' },
        { internalType: 'int32', name: 'posY', type: 'int32' },
        { internalType: 'int32', name: 'posZ', type: 'int32' },
        { internalType: 'uint32', name: 'sceneId', type: 'uint32' },
        { internalType: 'uint32', name: 'level', type: 'uint32' },
        { internalType: 'uint64', name: 'xp', type: 'uint64' },
        { internalType: 'bytes32', name: 'dataHash', type: 'bytes32' },
      ],
      internalType: 'struct NetProtocolProfiles.ProfileCore',
      name: 'core',
      type: 'tuple',
    }],
    name: 'upsertProfile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
