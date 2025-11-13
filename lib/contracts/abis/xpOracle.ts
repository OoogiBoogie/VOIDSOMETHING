/**
 * XP ORACLE ABI
 * Base Sepolia: 0x8D786454ca2e252cb905f597214dD78C89E3Ba14
 * 
 * Provides XP-based APR boost for stakers
 */

export const XP_ORACLE_ABI = [
  {
    type: 'function',
    name: 'getAPRBoost',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'MAX_APR_BOOST_BPS',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getUserLevel',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getUserXP',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;

export const XP_ORACLE_ADDRESS = '0x8D786454ca2e252cb905f597214dD78C89E3Ba14' as const;
