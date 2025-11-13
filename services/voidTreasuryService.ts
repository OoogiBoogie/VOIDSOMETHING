/**
 * VOID Treasury Service
 * 
 * Manages multi-sig treasury wallets and reward pool refills.
 * Monitors pool health and schedules automated refills.
 * 
 * Key Functions:
 * - Track balances of PSX/CREATE/VOID/SIGNAL treasury wallets
 * - Schedule and execute reward pool refills
 * - Predict depletion times for pools
 * - Alert when pools fall below thresholds
 * - Manage multi-sig operations
 * 
 * This is what VaultAI (Phase 5) will monitor for auto-refill proposals.
 */

import {
  TreasuryWallet,
  TreasurySnapshot,
  RewardPool,
  RewardPoolRefill,
  TokenSymbol,
} from './voidTypes';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_TREASURY_WALLETS: TreasuryWallet[] = [
  {
    id: 'psx-treasury',
    token: 'PSX',
    address: '0xPSX_TREASURY_MULTISIG',
    balance: '50000000.00', // 50M PSX
    purpose: 'governance',
    isMultisig: true,
    signatories: ['0xSIGNER1', '0xSIGNER2', '0xSIGNER3', '0xSIGNER4', '0xSIGNER5'],
    threshold: 3, // 3 of 5 signatures required
  },
  {
    id: 'create-treasury',
    token: 'CREATE',
    address: '0xCREATE_TREASURY_MULTISIG',
    balance: '30000000.00', // 30M CREATE
    purpose: 'creator_rewards',
    isMultisig: true,
    signatories: ['0xSIGNER1', '0xSIGNER2', '0xSIGNER3', '0xSIGNER4', '0xSIGNER5'],
    threshold: 3,
  },
  {
    id: 'void-treasury',
    token: 'VOID',
    address: '0xVOID_TREASURY_MULTISIG',
    balance: '100000000.00', // 100M VOID
    purpose: 'emissions',
    isMultisig: true,
    signatories: ['0xSIGNER1', '0xSIGNER2', '0xSIGNER3', '0xSIGNER4', '0xSIGNER5'],
    threshold: 3,
  },
  {
    id: 'signal-treasury',
    token: 'SIGNAL',
    address: '0xSIGNAL_TREASURY_MULTISIG',
    balance: '200000000.00', // 200M SIGNAL
    purpose: 'vault_rewards',
    isMultisig: true,
    signatories: ['0xSIGNER1', '0xSIGNER2', '0xSIGNER3', '0xSIGNER4', '0xSIGNER5'],
    threshold: 3,
  },
];

const MOCK_REFILLS: RewardPoolRefill[] = [];
const MOCK_SNAPSHOTS: TreasurySnapshot[] = [];

// Minimum thresholds (trigger alerts when pool < threshold)
const MIN_POOL_THRESHOLDS: Record<TokenSymbol, number> = {
  PSX: 0.20,    // 20% of target balance
  CREATE: 0.20,
  VOID: 0.15,   // 15% for VOID (refills more frequently)
  SIGNAL: 0.10, // 10% for SIGNAL (most dynamic)
  AGENCY: 0.20, // Future
};

// ============================================================================
// SERVICE
// ============================================================================

class VoidTreasuryService {
  /**
   * Get all treasury wallets
   */
  async getTreasuryWallets(): Promise<TreasuryWallet[]> {
    return MOCK_TREASURY_WALLETS;
  }

  /**
   * Get a specific treasury wallet
   */
  async getTreasuryWallet(token: TokenSymbol): Promise<TreasuryWallet | null> {
    return MOCK_TREASURY_WALLETS.find((w) => w.token === token) || null;
  }

  /**
   * Get current treasury snapshot
   */
  async getCurrentSnapshot(): Promise<TreasurySnapshot> {
    const snapshot: TreasurySnapshot = {
      timestamp: new Date().toISOString(),
      balances: {
        psx: MOCK_TREASURY_WALLETS.find((w) => w.token === 'PSX')?.balance || '0',
        create: MOCK_TREASURY_WALLETS.find((w) => w.token === 'CREATE')?.balance || '0',
        void: MOCK_TREASURY_WALLETS.find((w) => w.token === 'VOID')?.balance || '0',
        signal: MOCK_TREASURY_WALLETS.find((w) => w.token === 'SIGNAL')?.balance || '0',
        agency: '0', // Not yet active
      },
      poolBalances: {
        psxPool: '1000000.00',
        createPool: '750000.00',
        voidPool: '5000000.00',
      },
      totalDistributed24h: '12345.67',
      totalRefilled24h: '500000.00',
    };

    MOCK_SNAPSHOTS.push(snapshot);
    return snapshot;
  }

  /**
   * Get historical snapshots
   */
  async getSnapshotHistory(limit: number = 30): Promise<TreasurySnapshot[]> {
    return MOCK_SNAPSHOTS.slice(-limit);
  }

  /**
   * Execute a reward pool refill (DAO-approved)
   */
  async refillRewardPool(
    poolId: string,
    token: TokenSymbol,
    amount: string,
    executedBy: string
  ): Promise<RewardPoolRefill> {
    const refill: RewardPoolRefill = {
      id: `refill-${Date.now()}-${Math.random()}`,
      poolId,
      amount,
      timestamp: new Date().toISOString(),
      txHash: '0xMOCK_REFILL_TX',
      executedBy,
    };

    MOCK_REFILLS.push(refill);

    // Update treasury balance
    const treasury = MOCK_TREASURY_WALLETS.find((w) => w.token === token);
    if (treasury) {
      const currentBalance = parseFloat(treasury.balance);
      const refillAmount = parseFloat(amount);
      treasury.balance = (currentBalance - refillAmount).toFixed(2);
    }

    // TODO: Replace with actual on-chain multi-sig transaction
    return refill;
  }

  /**
   * Get refill history
   */
  async getRefillHistory(
    poolId?: string,
    limit: number = 50
  ): Promise<RewardPoolRefill[]> {
    let refills = MOCK_REFILLS;

    if (poolId) {
      refills = refills.filter((r) => r.poolId === poolId);
    }

    return refills
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Predict pool depletion time (for VaultAI alerts)
   */
  async predictPoolDepletion(
    poolId: string,
    currentBalance: string,
    dailyDistribution: string
  ): Promise<{
    poolId: string;
    currentBalance: string;
    dailyDistribution: string;
    daysUntilDepletion: number;
    depletionDate: string;
    alertStatus: 'healthy' | 'warning' | 'critical';
  }> {
    const balance = parseFloat(currentBalance);
    const dailyRate = parseFloat(dailyDistribution);

    if (dailyRate <= 0) {
      return {
        poolId,
        currentBalance,
        dailyDistribution,
        daysUntilDepletion: Infinity,
        depletionDate: 'Never',
        alertStatus: 'healthy',
      };
    }

    const daysUntilDepletion = balance / dailyRate;
    const depletionDate = new Date(Date.now() + daysUntilDepletion * 24 * 60 * 60 * 1000).toISOString();

    // Determine alert status
    let alertStatus: 'healthy' | 'warning' | 'critical';
    if (daysUntilDepletion > 30) {
      alertStatus = 'healthy';
    } else if (daysUntilDepletion > 7) {
      alertStatus = 'warning';
    } else {
      alertStatus = 'critical';
    }

    return {
      poolId,
      currentBalance,
      dailyDistribution,
      daysUntilDepletion,
      depletionDate,
      alertStatus,
    };
  }

  /**
   * Check pool health (called by VaultAI every 6 hours)
   */
  async checkPoolHealth(): Promise<{
    timestamp: string;
    pools: {
      poolId: string;
      token: TokenSymbol;
      balance: string;
      threshold: string;
      belowThreshold: boolean;
      daysUntilDepletion: number;
      recommendedRefill: string;
    }[];
    overallHealth: 'healthy' | 'needs_attention' | 'critical';
  }> {
    // Mock pool data (in production, fetch from voidVaultService)
    const mockPools = [
      { poolId: 'psx-pool', token: 'PSX' as TokenSymbol, balance: '1000000.00', dailyDist: '5000.00', target: '5000000.00' },
      { poolId: 'create-pool', token: 'CREATE' as TokenSymbol, balance: '750000.00', dailyDist: '3000.00', target: '4000000.00' },
      { poolId: 'void-pool', token: 'VOID' as TokenSymbol, balance: '5000000.00', dailyDist: '15000.00', target: '10000000.00' },
    ];

    const pools = [];
    let criticalCount = 0;

    for (const pool of mockPools) {
      const threshold = parseFloat(pool.target) * (MIN_POOL_THRESHOLDS[pool.token] || 0.2);
      const belowThreshold = parseFloat(pool.balance) < threshold;
      const daysUntilDepletion = parseFloat(pool.balance) / parseFloat(pool.dailyDist);

      let recommendedRefill = '0';
      if (belowThreshold) {
        // Recommend refilling to target balance
        recommendedRefill = (parseFloat(pool.target) - parseFloat(pool.balance)).toFixed(2);
        criticalCount++;
      }

      pools.push({
        poolId: pool.poolId,
        token: pool.token,
        balance: pool.balance,
        threshold: threshold.toFixed(2),
        belowThreshold,
        daysUntilDepletion,
        recommendedRefill,
      });
    }

    const overallHealth: 'healthy' | 'needs_attention' | 'critical' =
      criticalCount === 0 ? 'healthy' : criticalCount <= 1 ? 'needs_attention' : 'critical';

    return {
      timestamp: new Date().toISOString(),
      pools,
      overallHealth,
    };
  }

  /**
   * Get treasury health KPIs (for analytics/dashboard)
   */
  async getTreasuryHealth(): Promise<{
    totalTreasuryUSD: number;
    poolHealthScore: number; // 0-100
    avgDaysUntilRefill: number;
    recentRefills: number; // Last 30 days
    pendingRefills: number;
  }> {
    // Mock calculations (TODO: implement real logic)
    return {
      totalTreasuryUSD: 9_500_000, // Combined USD value
      poolHealthScore: 85, // 85/100 = good health
      avgDaysUntilRefill: 180, // ~6 months average
      recentRefills: 3, // Last 30 days
      pendingRefills: 1, // Approved but not executed
    };
  }

  /**
   * Propose a refill (creates DAO proposal, VaultAI uses this)
   */
  async proposeRefill(
    poolId: string,
    token: TokenSymbol,
    amount: string,
    reason: string
  ): Promise<{
    proposalId: string;
    poolId: string;
    token: TokenSymbol;
    amount: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
  }> {
    // TODO: Integrate with voidGovernanceService to create actual DAO proposal
    const proposalId = `refill-proposal-${Date.now()}`;

    return {
      proposalId,
      poolId,
      token,
      amount,
      reason,
      status: 'pending',
    };
  }

  /**
   * Emergency pause (Security AI can trigger this)
   */
  async emergencyPause(
    reason: string,
    pauseDuration: number = 24 // hours
  ): Promise<{
    paused: boolean;
    reason: string;
    pausedAt: string;
    resumesAt: string;
  }> {
    const pausedAt = new Date();
    const resumesAt = new Date(pausedAt.getTime() + pauseDuration * 60 * 60 * 1000);

    // TODO: Call PolicyManager.pause() on-chain
    return {
      paused: true,
      reason,
      pausedAt: pausedAt.toISOString(),
      resumesAt: resumesAt.toISOString(),
    };
  }
}

// Singleton export
export const voidTreasuryService = new VoidTreasuryService();
