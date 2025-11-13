/**
 * VOIDSCORE CONTRACT ABI
 * On-chain identity & reputation system
 * 
 * Key Functions:
 * - getTier(address) → uint8
 * - getCurrentScore(address) → uint256
 * - getLifetimeScore(address) → uint256
 */

export const VoidScoreABI = [
  // View Functions
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getTier',
    outputs: [{ name: 'tier', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getCurrentScore',
    outputs: [{ name: 'score', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getLifetimeScore',
    outputs: [{ name: 'score', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getAccountAge',
    outputs: [{ name: 'age', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'messageType', type: 'uint8' }, // 0=GLOBAL, 1=ZONE, 2=DM
    ],
    name: 'getDailyMessagesRemaining',
    outputs: [{ name: 'remaining', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Write Functions
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'addScore',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'subtractScore',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'newScore', type: 'uint256' },
      { indexed: false, name: 'newTier', type: 'uint8' },
    ],
    name: 'ScoreUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'oldTier', type: 'uint8' },
      { indexed: false, name: 'newTier', type: 'uint8' },
    ],
    name: 'TierChanged',
    type: 'event',
  },
] as const;

export default VoidScoreABI;
