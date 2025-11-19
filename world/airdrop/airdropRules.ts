/**
 * Airdrop Scoring Rules
 * Phase 6.2 - Score calculation logic
 */

import type { AirdropConfig, AirdropScore, AirdropScoreBreakdown } from './airdropTypes';
import { DEFAULT_AIRDROP_CONFIG } from './airdropTypes';

export class AirdropRules {
  private config: AirdropConfig;

  constructor(config: Partial<AirdropConfig> = {}) {
    this.config = { ...DEFAULT_AIRDROP_CONFIG, ...config };
  }

  /**
   * Calculate total airdrop score from player stats
   */
  calculateScore(stats: {
    totalXP: number;
    achievementsCount: number;
    districtsVisited: number;
    parcelsVisited: number;
    totalSessionMinutes: number;
    creatorTerminalUses: number;
    hasMainnetProfile: boolean;
    isBetaUser: boolean;
  }): AirdropScore {
    // Calculate breakdown
    const breakdown: AirdropScoreBreakdown = {
      xpPoints: stats.totalXP * this.config.xpWeight,
      achievementPoints: stats.achievementsCount * this.config.achievementWeight,
      explorationPoints: 
        (stats.districtsVisited * this.config.districtWeight) +
        (stats.parcelsVisited * this.config.parcelWeight),
      sessionPoints: stats.totalSessionMinutes * this.config.sessionTimeWeight,
      interactionPoints: 0, // Placeholder
      creatorTerminalPoints: stats.creatorTerminalUses * this.config.creatorTerminalWeight,
      socialPoints: 0, // Placeholder
    };

    // Calculate base score
    const baseScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    // Apply multipliers
    const multipliers = [];
    let totalScore = baseScore;

    if (stats.hasMainnetProfile) {
      multipliers.push({
        type: 'MAINNET_PROFILE',
        value: this.config.mainnetProfileMultiplier,
        reason: 'On-chain profile bonus',
      });
      totalScore *= this.config.mainnetProfileMultiplier;
    }

    if (stats.isBetaUser) {
      multipliers.push({
        type: 'EARLY_ADOPTER',
        value: this.config.earlyAdopterMultiplier,
        reason: 'Beta user bonus',
      });
      totalScore *= this.config.earlyAdopterMultiplier;
    }

    // Apply caps
    totalScore = Math.min(totalScore, this.config.maxTotalPoints);

    return {
      walletAddress: '', // Will be set by engine
      baseScore: Math.floor(baseScore),
      totalScore: Math.floor(totalScore),
      breakdown,
      multipliers,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<AirdropConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfig(): AirdropConfig {
    return { ...this.config };
  }
}

// Singleton instance
export const airdropRules = new AirdropRules();
