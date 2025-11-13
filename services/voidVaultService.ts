/**
 * VOID Vault Service
 * 
 * Handles staking and yield distribution for PSX, CREATE, and VOID tokens.
 * 
 * Key Features:
 * - Stake PSX, CREATE, or VOID to earn yield
 * - Lock periods grant multipliers (30d/90d/180d/365d)
 * - vXP score provides additional boost
 * - Rewards distributed from treasury-funded pools (no minting for PSX/CREATE)
 * - VOID can be minted as rewards
 */

import {
  VoidVaultPosition,
  PendingReward,
  VaultYieldRate,
  RewardPool,
  TokenSymbol,
} from './voidTypes';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_POSITIONS: VoidVaultPosition[] = [];
const MOCK_REWARD_POOLS: RewardPool[] = [
  {
    id: 'psx-pool',
    token: 'PSX',
    balance: '1000000.00',
    totalDistributed: '250000.00',
    refillSchedule: 'monthly',
    lastRefill: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    nextRefill: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    refillAmount: '500000.00',
    sourceWallet: '0xPSX_TREASURY_WALLET',
  },
  {
    id: 'create-pool',
    token: 'CREATE',
    balance: '750000.00',
    totalDistributed: '180000.00',
    refillSchedule: 'monthly',
    lastRefill: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    nextRefill: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    refillAmount: '400000.00',
    sourceWallet: '0xCREATE_TREASURY_WALLET',
  },
  {
    id: 'void-pool',
    token: 'VOID',
    balance: '5000000.00',
    totalDistributed: '1200000.00',
    refillSchedule: 'weekly',
    lastRefill: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextRefill: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    refillAmount: '1000000.00',
    sourceWallet: '0xVOID_TREASURY_WALLET',
  },
];

// Base APRs by token (before lock multipliers)
const BASE_APRS: Record<TokenSymbol, number> = {
  PSX: 12.5,      // 12.5% base APR
  CREATE: 15.0,   // 15% base APR
  VOID: 18.0,     // 18% base APR
  SIGNAL: 0,      // Not stakeable
  AGENCY: 20.0,   // 20% base APR (future)
};

// Lock multipliers
const LOCK_MULTIPLIERS = {
  '30d': 1.5,      // 30 days = 1.5x
  '90d': 2.0,      // 90 days = 2x
  '180d': 3.0,     // 180 days = 3x
  '365d': 5.0,     // 365 days = 5x
};

// ============================================================================
// SERVICE
// ============================================================================

class VoidVaultService {
  /**
   * Get all staking positions for a user
   */
  async getPositions(userId: string): Promise<VoidVaultPosition[]> {
    return MOCK_POSITIONS.filter((p) => p.userId === userId);
  }

  /**
   * Get a specific position by ID
   */
  async getPosition(positionId: string): Promise<VoidVaultPosition | null> {
    return MOCK_POSITIONS.find((p) => p.id === positionId) || null;
  }

  /**
   * Stake tokens
   */
  async stake(
    userId: string,
    token: TokenSymbol,
    amount: string,
    lockDays: number = 0,
    vxpBoost: number = 1.0
  ): Promise<{ positionId: string; txHash: string }> {
    if (!['PSX', 'CREATE', 'VOID'].includes(token)) {
      throw new Error(`Cannot stake ${token}. Only PSX, CREATE, and VOID are stakeable.`);
    }

    const lockEnd = lockDays > 0 
      ? new Date(Date.now() + lockDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const lockMultiplier = this.getLockMultiplier(lockDays);

    const position: VoidVaultPosition = {
      id: `position-${Date.now()}-${Math.random()}`,
      userId,
      stakedToken: token,
      stakedAmount: amount,
      lockEnd,
      lockDuration: lockDays > 0 ? lockDays : undefined,
      multiplier: lockMultiplier,
      vxpBoost,
      pendingRewards: [],
      createdAt: new Date().toISOString(),
    };

    MOCK_POSITIONS.push(position);

    // TODO: Replace with actual blockchain transaction
    return {
      positionId: position.id,
      txHash: '0xMOCK_STAKE_TX',
    };
  }

  /**
   * Unstake tokens (if not locked or lock expired)
   */
  async unstake(positionId: string): Promise<{ amount: string; txHash: string }> {
    const position = MOCK_POSITIONS.find((p) => p.id === positionId);
    if (!position) {
      throw new Error('Position not found');
    }

    // Check if locked
    if (position.lockEnd) {
      const lockEndTime = new Date(position.lockEnd).getTime();
      if (Date.now() < lockEndTime) {
        const remainingDays = Math.ceil((lockEndTime - Date.now()) / (24 * 60 * 60 * 1000));
        throw new Error(`Position is locked for ${remainingDays} more days`);
      }
    }

    const amount = position.stakedAmount;

    // Remove position
    const index = MOCK_POSITIONS.findIndex((p) => p.id === positionId);
    if (index > -1) {
      MOCK_POSITIONS.splice(index, 1);
    }

    // TODO: Replace with actual blockchain transaction
    return {
      amount,
      txHash: '0xMOCK_UNSTAKE_TX',
    };
  }

  /**
   * Calculate pending rewards for a position
   */
  async calculatePendingRewards(positionId: string): Promise<PendingReward[]> {
    const position = MOCK_POSITIONS.find((p) => p.id === positionId);
    if (!position) {
      return [];
    }

    const stakedAmount = parseFloat(position.stakedAmount);
    const baseAPR = BASE_APRS[position.stakedToken] || 0;
    const multiplier = position.multiplier;
    const vxpBoost = position.vxpBoost;

    // Calculate days staked
    const createdAt = new Date(position.createdAt).getTime();
    const daysStaked = (Date.now() - createdAt) / (24 * 60 * 60 * 1000);

    // Calculate annual yield, then pro-rate for days staked
    const annualYield = stakedAmount * (baseAPR / 100) * multiplier * vxpBoost;
    const dailyYield = annualYield / 365;
    const totalYield = dailyYield * daysStaked;

    // Rewards are paid in the same token staked (from pool)
    const rewards: PendingReward[] = [
      {
        token: position.stakedToken,
        amount: totalYield.toFixed(4),
        source: 'pool_yield',
      },
    ];

    // Add vXP bonus if applicable (5% of yield as VOID)
    if (vxpBoost > 1.0) {
      const vxpBonusAmount = totalYield * 0.05;
      rewards.push({
        token: 'VOID',
        amount: vxpBonusAmount.toFixed(4),
        source: 'vxp_bonus',
      });
    }

    return rewards;
  }

  /**
   * Claim rewards from a position
   */
  async claimRewards(positionId: string): Promise<{
    rewards: { token: TokenSymbol; amount: string }[];
    txHash: string;
  }> {
    const pendingRewards = await this.calculatePendingRewards(positionId);

    const rewards = pendingRewards.map((r) => ({
      token: r.token,
      amount: r.amount,
    }));

    // TODO: Replace with actual blockchain transaction
    // TODO: Deduct from reward pools
    return {
      rewards,
      txHash: '0xMOCK_CLAIM_TX',
    };
  }

  /**
   * Get yield rates for all stakeable tokens
   */
  async getYieldRates(): Promise<VaultYieldRate[]> {
    return [
      {
        stakedToken: 'PSX',
        baseAprPct: BASE_APRS.PSX,
        lockMultipliers: LOCK_MULTIPLIERS,
        vxpBoostMax: 1.5,
      },
      {
        stakedToken: 'CREATE',
        baseAprPct: BASE_APRS.CREATE,
        lockMultipliers: LOCK_MULTIPLIERS,
        vxpBoostMax: 1.5,
      },
      {
        stakedToken: 'VOID',
        baseAprPct: BASE_APRS.VOID,
        lockMultipliers: LOCK_MULTIPLIERS,
        vxpBoostMax: 1.5,
      },
    ];
  }

  /**
   * Get reward pool balances
   */
  async getRewardPools(): Promise<RewardPool[]> {
    return MOCK_REWARD_POOLS;
  }

  /**
   * Get a specific reward pool
   */
  async getRewardPool(token: TokenSymbol): Promise<RewardPool | null> {
    return MOCK_REWARD_POOLS.find((p) => p.token === token) || null;
  }

  /**
   * Get vault TVL (Total Value Locked)
   */
  async getTVL(): Promise<{
    psx: string;
    create: string;
    void: string;
    totalUSD: number;
  }> {
    const tvl = {
      psx: '0',
      create: '0',
      void: '0',
      totalUSD: 0,
    };

    for (const position of MOCK_POSITIONS) {
      const amount = parseFloat(position.stakedAmount);
      switch (position.stakedToken) {
        case 'PSX':
          tvl.psx = (parseFloat(tvl.psx) + amount).toFixed(2);
          break;
        case 'CREATE':
          tvl.create = (parseFloat(tvl.create) + amount).toFixed(2);
          break;
        case 'VOID':
          tvl.void = (parseFloat(tvl.void) + amount).toFixed(2);
          break;
      }
    }

    // TODO: Calculate USD value using price oracle
    tvl.totalUSD = 
      parseFloat(tvl.psx) * 0.50 +     // Assume $0.50 per PSX
      parseFloat(tvl.create) * 0.25 +  // Assume $0.25 per CREATE
      parseFloat(tvl.void) * 0.05;     // Assume $0.05 per VOID

    return tvl;
  }

  /**
   * Helper: Get lock multiplier based on days
   */
  private getLockMultiplier(lockDays: number): number {
    if (lockDays >= 365) return LOCK_MULTIPLIERS['365d'];
    if (lockDays >= 180) return LOCK_MULTIPLIERS['180d'];
    if (lockDays >= 90) return LOCK_MULTIPLIERS['90d'];
    if (lockDays >= 30) return LOCK_MULTIPLIERS['30d'];
    return 1.0; // No lock = 1x
  }
}

// Singleton export
export const voidVaultService = new VoidVaultService();
