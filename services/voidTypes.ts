/**
 * VOID v4 Hook System - Core Types
 * 
 * Multi-token ecosystem powered by VOID as the base layer.
 * All tokens launch off VOID through v4 hooks and treasury-funded reward pools.
 * 
 * Token Hierarchy:
 * - PSX: Governance & DAO (fixed ERC-20 v2, no mint)
 * - CREATE: Creator economy (fixed ERC-20 v2, no mint)
 * - VOID: Router & emissions engine (dynamic, mintable)
 * - SIGNAL: Mission rewards & XP (dynamic, mintable)
 * - AGENCY: Incubator DAO (future, planned)
 */

// ============================================================================
// TOKEN SYSTEM
// ============================================================================

export type TokenSymbol = 'PSX' | 'CREATE' | 'VOID' | 'SIGNAL' | 'AGENCY';

export interface TokenInfo {
  address: string;
  symbol: TokenSymbol;
  name: string;
  decimals: number;
  chainId: number;
  iconUrl?: string;
  type: 'fixed' | 'dynamic';        // fixed = no mint (PSX/CREATE), dynamic = mintable (VOID/SIGNAL)
  canMint: boolean;                 // true for VOID/SIGNAL, false for PSX/CREATE
}

// ============================================================================
// VOID v4 HOOK SYSTEM
// ============================================================================

/**
 * VoidHook - Unified hook for all token operations
 * Routes fees, emissions, and rewards through VOID base layer
 */
export interface VoidHook {
  id: string;
  type: 'swap' | 'stake' | 'mint' | 'governance' | 'activity';
  fromToken: TokenSymbol;
  toToken?: TokenSymbol;
  feeBps: number;                   // Basis points (20 = 0.20%)
  split: VoidHookSplit;
}

export interface VoidHookSplit {
  voidEmitterPct: number;           // % to activity emissions (SIGNAL + vXP)
  voidVaultPct: number;             // % to staking vault rewards
  creatorRouterPct: number;         // % to creator royalties
  psxTreasuryPct: number;           // % to PSX DAO treasury
  createDaoPct: number;             // % to CREATE DAO
  reservePct: number;               // % to reserve/emergency fund
}

// ============================================================================
// REWARD POOLS (Treasury-Funded)
// ============================================================================

/**
 * RewardPool - Distributes tokens from treasury (no minting for PSX/CREATE)
 * DAO periodically refills pools from multi-sig wallets
 */
export interface RewardPool {
  id: string;
  token: TokenSymbol;
  balance: string;                  // Current pool balance (human-readable)
  totalDistributed: string;         // Lifetime distributed amount
  refillSchedule: 'daily' | 'weekly' | 'monthly';
  lastRefill: string;               // ISO timestamp
  nextRefill: string;               // ISO timestamp
  refillAmount: string;             // Amount per refill
  sourceWallet: string;             // Treasury address
}

export interface RewardPoolRefill {
  id: string;
  poolId: string;
  amount: string;
  timestamp: string;
  txHash?: string;
  executedBy: string;               // DAO or admin wallet
}

// ============================================================================
// VOID EMITTER (Activity & vXP)
// ============================================================================

/**
 * vXP - Virtual XP (non-transferable, synthetic score)
 * Earned through activity, boosts yields and governance weight
 */
export interface VirtualXP {
  userId: string;
  total: number;                    // Total vXP earned
  byHub: {
    world: number;
    creator: number;
    defi: number;
    governance: number;
    agency: number;
  };
  multiplier: number;               // Current yield boost multiplier (1.0 = no boost)
  governanceWeight: number;         // Contributes to voting power
}

export interface VoidEmission {
  id: string;
  userId: string;
  hub: 'world' | 'creator' | 'defi' | 'governance' | 'agency';
  action: string;                   // e.g., "land_visit", "token_mint", "swap", "vote"
  weight: number;                   // Activity weight (determines reward)
  vxpEarned: number;                // vXP awarded
  signalEarned: string;             // SIGNAL tokens minted
  timestamp: string;
}

export interface ClaimableReward {
  id: string;
  userId: string;
  token: TokenSymbol;
  amount: string;
  source: 'emitter' | 'vault' | 'creator_router' | 'governance';
  sourceId?: string;
  claimable: boolean;
  claimed: boolean;
  earnedAt: string;
  claimedAt?: string;
}

// ============================================================================
// VOID VAULT (Staking & Yield)
// ============================================================================

export interface VoidVaultPosition {
  id: string;
  userId: string;
  stakedToken: TokenSymbol;         // Can stake PSX, CREATE, or VOID
  stakedAmount: string;
  lockEnd?: string;                 // ISO timestamp (undefined = no lock)
  lockDuration?: number;            // Days
  multiplier: number;               // Lock bonus (1.0 = no lock, 2.0 = 2x, etc.)
  vxpBoost: number;                 // Additional boost from vXP score
  pendingRewards: PendingReward[];
  createdAt: string;
}

export interface PendingReward {
  token: TokenSymbol;
  amount: string;
  source: 'pool_yield' | 'fee_share' | 'vxp_bonus';
}

export interface VaultYieldRate {
  stakedToken: TokenSymbol;
  baseAprPct: number;               // Base APR without lock
  lockMultipliers: {
    '30d': number;                  // 1.5x
    '90d': number;                  // 2.0x
    '180d': number;                 // 3.0x
    '365d': number;                 // 5.0x
  };
  vxpBoostMax: number;              // Max additional boost from vXP (e.g., 1.5 = +50%)
}

// ============================================================================
// VOID CREATOR ROUTER (Royalties & Mints)
// ============================================================================

export interface CreatorMintEvent {
  id: string;
  creatorId: string;
  buyerId: string;
  skuId: string;
  price: string;                    // In CREATE tokens
  priceToken: 'CREATE' | 'VOID';
  feeSplit: CreatorFeeSplit;
  nftContractAddress?: string;      // For ERC-1155 mints
  nftTokenId?: string;
  timestamp: string;
  txHash?: string;
}

export interface CreatorFeeSplit {
  totalFee: string;
  creatorShare: string;             // 40%
  voidEmitterShare: string;         // 20% → SIGNAL emissions
  voidVaultShare: string;           // 20% → Vault yields
  psxTreasuryShare: string;         // 20% → PSX DAO
}

export interface CreatorRoyalties {
  creatorId: string;
  totalEarned: string;              // Lifetime CREATE earned
  claimable: string;                // Ready to claim
  claimed: string;                  // Already claimed
  lastClaim?: string;               // ISO timestamp
}

// ============================================================================
// GOVERNANCE (PSX DAO)
// ============================================================================

/**
 * Voting Power Formula:
 * power = PSX_held + (VOID_staked × 0.5) + (vXP × 0.2)
 */
export interface VotingPower {
  userId: string;
  psxHeld: string;
  psxWeight: number;                // 1:1 ratio
  voidStaked: string;
  voidWeight: number;               // 0.5 ratio
  vxpScore: number;
  vxpWeight: number;                // 0.2 ratio
  totalPower: number;               // Sum of all weights
}

export interface GovernanceProposal {
  id: string;
  type: 'emission_adjust' | 'pool_refill' | 'hook_update' | 'treasury_spend' | 'other';
  title: string;
  description: string;
  proposer: string;
  status: 'pending' | 'active' | 'succeeded' | 'failed' | 'executed';
  votesFor: string;
  votesAgainst: string;
  votesAbstain: string;
  quorum: string;
  startTime: string;
  endTime: string;
  params?: ProposalParams;
}

export interface ProposalParams {
  // For emission adjustments
  emissionRates?: {
    voidEmitterRate?: number;
    voidVaultRate?: number;
    creatorRouterRate?: number;
  };
  // For pool refills
  poolRefills?: {
    token: TokenSymbol;
    amount: string;
  }[];
  // For hook updates
  hookUpdates?: {
    hookId: string;
    newSplit: VoidHookSplit;
  };
  // For treasury spending
  treasurySpend?: {
    token: TokenSymbol;
    recipient: string;
    amount: string;
    purpose: string;
  };
}

// ============================================================================
// TREASURY SYSTEM
// ============================================================================

export interface TreasuryWallet {
  id: string;
  token: TokenSymbol;
  address: string;
  balance: string;
  purpose: 'governance' | 'creator_rewards' | 'vault_rewards' | 'emissions' | 'incubation';
  isMultisig: boolean;
  signatories?: string[];           // If multisig
  threshold?: number;               // Required signatures
}

export interface TreasurySnapshot {
  timestamp: string;
  balances: {
    psx: string;
    create: string;
    void: string;
    signal: string;
    agency: string;
  };
  poolBalances: {
    psxPool: string;
    createPool: string;
    voidPool: string;
  };
  totalDistributed24h: string;
  totalRefilled24h: string;
}

// ============================================================================
// ANALYTICS & KPIs
// ============================================================================

export interface VoidEcosystemStats {
  timestamp: string;
  // Emissions
  signalEmitted24h: number;
  voidEmitted24h: number;
  vxpGenerated24h: number;
  // Vault
  totalStakedValue: number;         // USD value
  vaultTVL: {
    psx: string;
    create: string;
    void: string;
  };
  avgVaultAPR: number;
  // Creator Economy
  creatorMintVolume24h: number;     // In CREATE
  creatorRoyaltiesPaid24h: number;
  activeCreators: number;
  // Governance
  activeProposals: number;
  totalVotingPower: number;
  participationRate: number;        // % of tokens voting
  // Treasury
  treasuryHealth: {
    psxPoolDays: number;            // Days until refill needed
    createPoolDays: number;
    voidPoolDays: number;
  };
}

// ============================================================================
// DATABASE TABLES (for Indexer)
// ============================================================================

export interface VoidActionRecord {
  id: string;
  userId: string;
  hub: string;
  action: string;
  weight: number;
  vxpEarned: number;
  signalEarned: string;
  timestamp: string;
  blockNumber?: number;
  txHash?: string;
}

export interface RewardPoolRecord {
  id: string;
  token: TokenSymbol;
  balance: string;
  totalDistributed: string;
  lastRefill: string;
  nextRefill: string;
  updatedAt: string;
}

export interface VaultStakeRecord {
  id: string;
  userId: string;
  stakedToken: TokenSymbol;
  stakedAmount: string;
  lockEnd?: string;
  multiplier: number;
  status: 'active' | 'unlocked' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
}

export interface CreatorMintRecord {
  id: string;
  creatorId: string;
  buyerId: string;
  skuId: string;
  price: string;
  priceToken: TokenSymbol;
  creatorShare: string;
  emitterShare: string;
  vaultShare: string;
  treasuryShare: string;
  timestamp: string;
  txHash?: string;
}

export interface GovernanceVoteRecord {
  id: string;
  proposalId: string;
  voterId: string;
  support: 'for' | 'against' | 'abstain';
  votingPower: number;
  reason?: string;
  timestamp: string;
  txHash?: string;
}
