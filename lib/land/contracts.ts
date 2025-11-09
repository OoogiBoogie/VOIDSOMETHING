/**
 * Land Registry Contract ABI & Constants
 * 
 * Contract ABIs for interacting with LandRegistry.sol
 */

import { Address } from 'viem';

// ========== CONTRACT ADDRESSES ==========

export const CONTRACTS = {
  // Main Contracts
  LAND_REGISTRY: '0x0000000000000000000000000000000000000000' as Address, // TODO: Deploy and update
  VOID_TOKEN: '0x0000000000000000000000000000000000000000' as Address,    // TODO: Update
  PSX_TOKEN: '0x0000000000000000000000000000000000000000' as Address,     // TODO: Update
  HOOK_ROUTER: '0x0000000000000000000000000000000000000000' as Address,   // V4 Hooks
  
  // Future Contracts
  MARKETPLACE: '0x0000000000000000000000000000000000000000' as Address,
  BUSINESS_REGISTRY: '0x0000000000000000000000000000000000000000' as Address,
} as const;

// ========== ABIs ==========

/**
 * Land Registry Contract ABI
 * From contracts/LandRegistry.sol
 */
export const LAND_REGISTRY_ABI = [
  // ========== VIEW FUNCTIONS ==========
  {
    inputs: [{ name: 'parcelId', type: 'uint256' }],
    name: 'getParcelDetails',
    outputs: [
      { name: 'owner', type: 'address' },
      { name: 'price', type: 'uint256' },
      { name: 'zone', type: 'uint8' },
      { name: 'hasHouse', type: 'bool' },
      { name: 'businessLicense', type: 'uint8' },
      { name: 'businessRevenue', type: 'uint256' },
      { name: 'x', type: 'uint16' },
      { name: 'y', type: 'uint16' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'getOwnerParcels',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'zone', type: 'uint8' }],
    name: 'getParcelsByZone',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'canAccessGlizzyWorld',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'GRID_SIZE',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'TOTAL_PARCELS',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'GLIZZY_WORLD_PSX_REQUIREMENT',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'communityRevenuePool',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalBusinessRevenue',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  
  // ========== WRITE FUNCTIONS ==========
  {
    inputs: [{ name: 'parcelId', type: 'uint256' }],
    name: 'purchaseParcel',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'parcelId', type: 'uint256' },
      { name: 'licenseType', type: 'uint8' }
    ],
    name: 'purchaseLicense',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ name: 'parcelId', type: 'uint256' }],
    name: 'buildHouse',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'parcelId', type: 'uint256' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'recordBusinessRevenue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'licenseType', type: 'uint8' },
      { name: 'newPrice', type: 'uint256' }
    ],
    name: 'updateLicensePrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  
  // ========== EVENTS ==========
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'parcelId', type: 'uint256' },
      { indexed: true, name: 'buyer', type: 'address' },
      { indexed: false, name: 'price', type: 'uint256' }
    ],
    name: 'ParcelPurchased',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'parcelId', type: 'uint256' },
      { indexed: false, name: 'licenseType', type: 'uint8' },
      { indexed: false, name: 'price', type: 'uint256' }
    ],
    name: 'LicensePurchased',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'parcelId', type: 'uint256' },
      { indexed: true, name: 'owner', type: 'address' }
    ],
    name: 'HouseBuilt',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'parcelId', type: 'uint256' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'BusinessRevenueEarned',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'claimer', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'CommunityRevenueClaimed',
    type: 'event'
  },
  
  // ERC-721 Standard Functions
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
] as const;

/**
 * ERC-20 Token ABI (for VOID and PSX tokens)
 */
export const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'increaseAllowance',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
] as const;

/**
 * Helper function to get contract addresses by chain ID
 */
export function getContractAddresses(chainId: number): typeof CONTRACTS {
  // TODO: Add mainnet/testnet addresses
  switch (chainId) {
    case 1: // Ethereum Mainnet
      return CONTRACTS; // Use mainnet addresses
    case 11155111: // Sepolia
      return CONTRACTS; // Use testnet addresses
    case 8453: // Base
      return CONTRACTS; // Use Base addresses
    default:
      return CONTRACTS; // Default to current addresses
  }
}
