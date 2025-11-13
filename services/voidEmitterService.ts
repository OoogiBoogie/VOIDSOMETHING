/**
 * VOID Emitter Service
 * 
 * Tracks user activity across all hubs and awards:
 * - vXP (virtual XP, non-transferable synthetic score)
 * - SIGNAL tokens (mintable activity token)
 * 
 * Each hub (World, Creator, DeFi, Governance, Agency) has weighted actions.
 * The more you do, the more vXP and SIGNAL you earn.
 */

import {
  VirtualXP,
  VoidEmission,
  ClaimableReward,
  VoidActionRecord,
} from './voidTypes';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_USER_VXP: Map<string, VirtualXP> = new Map();
const MOCK_EMISSIONS: VoidEmission[] = [];
const MOCK_CLAIMABLE: ClaimableReward[] = [];

// Action weights (determines vXP and SIGNAL earned)
const ACTION_WEIGHTS = {
  // World Hub
  land_visit: 5,
  land_purchase: 100,
  land_lease: 50,
  world_quest_complete: 75,
  social_message: 2,
  event_attend: 25,
  
  // Creator Hub
  creator_profile_view: 3,
  creator_follow: 10,
  sku_purchase: 50,
  sku_mint: 100,
  launchpad_submit: 200,
  incubator_apply: 150,
  job_apply: 30,
  
  // DeFi Hub
  swap: 20,
  pool_add_liquidity: 80,
  pool_remove_liquidity: 40,
  stake: 60,
  unstake: 30,
  claim_rewards: 15,
  
  // Governance Hub
  proposal_create: 150,
  vote_cast: 50,
  delegate: 40,
  
  // Agency Hub (future)
  project_invest: 100,
  milestone_complete: 80,
};

// SIGNAL emission rate (SIGNAL per vXP)
const SIGNAL_PER_VXP = 0.1; // 1 vXP = 0.1 SIGNAL

// ============================================================================
// SERVICE
// ============================================================================

class VoidEmitterService {
  /**
   * Record user activity and award vXP + SIGNAL
   */
  async recordAction(
    userId: string,
    hub: 'world' | 'creator' | 'defi' | 'governance' | 'agency',
    action: string,
    metadata?: Record<string, any>
  ): Promise<VoidEmission> {
    // Get action weight
    const weight = ACTION_WEIGHTS[action as keyof typeof ACTION_WEIGHTS] || 1;
    const vxpEarned = weight;
    const signalEarned = (weight * SIGNAL_PER_VXP).toFixed(2);

    // Create emission record
    const emission: VoidEmission = {
      id: `emission-${Date.now()}-${Math.random()}`,
      userId,
      hub,
      action,
      weight,
      vxpEarned,
      signalEarned,
      timestamp: new Date().toISOString(),
    };

    MOCK_EMISSIONS.push(emission);

    // Update user vXP
    await this.updateUserVXP(userId, hub, vxpEarned);

    // Create claimable SIGNAL reward
    if (parseFloat(signalEarned) > 0) {
      const reward: ClaimableReward = {
        id: `reward-${Date.now()}-${Math.random()}`,
        userId,
        token: 'SIGNAL',
        amount: signalEarned,
        source: 'emitter',
        sourceId: emission.id,
        claimable: true,
        claimed: false,
        earnedAt: new Date().toISOString(),
      };
      MOCK_CLAIMABLE.push(reward);
    }

    return emission;
  }

  /**
   * Update user's vXP score
   */
  private async updateUserVXP(
    userId: string,
    hub: 'world' | 'creator' | 'defi' | 'governance' | 'agency',
    vxpEarned: number
  ): Promise<void> {
    let userVXP = MOCK_USER_VXP.get(userId);

    if (!userVXP) {
      userVXP = {
        userId,
        total: 0,
        byHub: {
          world: 0,
          creator: 0,
          defi: 0,
          governance: 0,
          agency: 0,
        },
        multiplier: 1.0,
        governanceWeight: 0,
      };
    }

    userVXP.total += vxpEarned;
    userVXP.byHub[hub] += vxpEarned;

    // Calculate multiplier based on total vXP
    // Every 1000 vXP = +0.1 multiplier (up to 2.0x max)
    userVXP.multiplier = Math.min(1.0 + Math.floor(userVXP.total / 1000) * 0.1, 2.0);

    // Governance weight is vXP * 0.2 (per voting power formula)
    userVXP.governanceWeight = userVXP.total * 0.2;

    MOCK_USER_VXP.set(userId, userVXP);
  }

  /**
   * Get user's vXP score
   */
  async getUserVXP(userId: string): Promise<VirtualXP | null> {
    const vxp = MOCK_USER_VXP.get(userId);
    return vxp || null;
  }

  /**
   * Get user's emission history
   */
  async getUserEmissions(
    userId: string,
    limit: number = 50
  ): Promise<VoidEmission[]> {
    return MOCK_EMISSIONS
      .filter((e) => e.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get claimable SIGNAL rewards
   */
  async getClaimableRewards(userId: string): Promise<ClaimableReward[]> {
    return MOCK_CLAIMABLE.filter(
      (r) => r.userId === userId && r.token === 'SIGNAL' && r.claimable && !r.claimed
    );
  }

  /**
   * Claim SIGNAL rewards
   */
  async claimRewards(userId: string, rewardIds: string[]): Promise<{
    totalClaimed: string;
    txHash: string;
  }> {
    let totalClaimed = 0;

    for (const rewardId of rewardIds) {
      const reward = MOCK_CLAIMABLE.find((r) => r.id === rewardId);
      if (reward && reward.userId === userId && !reward.claimed) {
        reward.claimed = true;
        reward.claimedAt = new Date().toISOString();
        totalClaimed += parseFloat(reward.amount);
      }
    }

    // TODO: Replace with actual blockchain transaction
    return {
      totalClaimed: totalClaimed.toFixed(2),
      txHash: '0xMOCK_SIGNAL_CLAIM',
    };
  }

  /**
   * Get emission statistics for analytics
   */
  async getEmissionStats(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<{
    totalEmissions: number;
    signalMinted: number;
    vxpGenerated: number;
    byHub: Record<string, number>;
    topActions: { action: string; count: number; vxp: number }[];
  }> {
    const now = Date.now();
    const timeMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[timeframe];

    const recentEmissions = MOCK_EMISSIONS.filter(
      (e) => now - new Date(e.timestamp).getTime() < timeMs
    );

    const byHub: Record<string, number> = {};
    const actionCounts: Record<string, { count: number; vxp: number }> = {};

    let totalVXP = 0;
    let totalSIGNAL = 0;

    for (const emission of recentEmissions) {
      totalVXP += emission.vxpEarned;
      totalSIGNAL += parseFloat(emission.signalEarned);

      byHub[emission.hub] = (byHub[emission.hub] || 0) + emission.vxpEarned;

      if (!actionCounts[emission.action]) {
        actionCounts[emission.action] = { count: 0, vxp: 0 };
      }
      actionCounts[emission.action].count += 1;
      actionCounts[emission.action].vxp += emission.vxpEarned;
    }

    const topActions = Object.entries(actionCounts)
      .map(([action, data]) => ({ action, ...data }))
      .sort((a, b) => b.vxp - a.vxp)
      .slice(0, 10);

    return {
      totalEmissions: recentEmissions.length,
      signalMinted: totalSIGNAL,
      vxpGenerated: totalVXP,
      byHub,
      topActions,
    };
  }

  /**
   * Get leaderboard (top users by vXP)
   */
  async getLeaderboard(limit: number = 10): Promise<{
    userId: string;
    totalVXP: number;
    multiplier: number;
    rank: number;
  }[]> {
    const users = Array.from(MOCK_USER_VXP.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);

    return users.map((user, index) => ({
      userId: user.userId,
      totalVXP: user.total,
      multiplier: user.multiplier,
      rank: index + 1,
    }));
  }
}

// Singleton export
export const voidEmitterService = new VoidEmitterService();
