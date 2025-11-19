/**
 * XP Rules Engine
 * Phase 6.0 - XP calculation and validation logic
 */

import { XPSource, XPConfig, DEFAULT_XP_CONFIG } from './xpEvents';

export class XPRules {
  private config: XPConfig;
  private xpHistory: Map<string, { timestamp: number; amount: number }[]>;

  constructor(config: Partial<XPConfig> = {}) {
    this.config = { ...DEFAULT_XP_CONFIG, ...config };
    this.xpHistory = new Map();
  }

  /**
   * Calculate XP for a given source
   */
  calculateXP(source: XPSource, metadata?: Record<string, unknown>): number {
    let baseXP = 0;

    switch (source) {
      // Exploration
      case XPSource.PARCEL_FIRST_VISIT:
        baseXP = this.config.parcelFirstVisit;
        break;
      case XPSource.DISTRICT_FIRST_VISIT:
        baseXP = this.config.districtFirstVisit;
        break;
      case XPSource.LANDMARK_FIRST_VISIT:
        baseXP = this.config.landmarkFirstVisit;
        break;

      // Session
      case XPSource.SESSION_TIME_MILESTONE:
        baseXP = this.config.sessionIntervalReward;
        break;
      case XPSource.LONG_SESSION_BONUS:
        baseXP = this.config.longSessionBonus;
        break;

      // Interaction
      case XPSource.CREATOR_TERMINAL:
        baseXP = this.config.creatorTerminal;
        break;
      case XPSource.NPC_INTERACTION:
        baseXP = this.config.npcInteraction;
        break;
      case XPSource.INFO_TERMINAL:
        baseXP = this.config.infoTerminal;
        break;

      // Achievement
      case XPSource.ACHIEVEMENT_BONUS:
        baseXP = (metadata?.bonusAmount as number) || 0;
        break;

      // Manual
      case XPSource.MANUAL_GRANT:
        baseXP = (metadata?.amount as number) || 0;
        break;

      default:
        baseXP = 0;
    }

    // Apply global multiplier
    return Math.floor(baseXP * this.config.globalMultiplier);
  }

  /**
   * Validate XP gain against rate limits
   * Returns { allowed: boolean, cappedAmount?: number }
   */
  validateXPGain(
    walletAddress: string,
    amount: number
  ): { allowed: boolean; cappedAmount?: number } {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Get XP history for this wallet in the last minute
    const history = this.xpHistory.get(walletAddress) || [];
    const recentXP = history
      .filter(entry => entry.timestamp > oneMinuteAgo)
      .reduce((sum, entry) => sum + entry.amount, 0);

    // Check if adding this amount would exceed the cap
    if (recentXP + amount > this.config.maxXPPerMinute) {
      const remainingCap = this.config.maxXPPerMinute - recentXP;
      
      if (remainingCap <= 0) {
        return { allowed: false };
      }
      
      return { 
        allowed: true, 
        cappedAmount: remainingCap 
      };
    }

    return { allowed: true };
  }

  /**
   * Record XP gain in rate limit history
   */
  recordXPGain(walletAddress: string, amount: number): void {
    const now = Date.now();
    const history = this.xpHistory.get(walletAddress) || [];
    
    // Add new entry
    history.push({ timestamp: now, amount });
    
    // Clean up old entries (older than 1 minute)
    const oneMinuteAgo = now - 60000;
    const recentHistory = history.filter(entry => entry.timestamp > oneMinuteAgo);
    
    this.xpHistory.set(walletAddress, recentHistory);
  }

  /**
   * Update global multiplier
   */
  setGlobalMultiplier(
    multiplier: number,
    reason?: string,
    expiresAt?: number
  ): void {
    this.config.globalMultiplier = multiplier;
    this.config.multiplierReason = reason;
    this.config.multiplierExpiresAt = expiresAt;
  }

  /**
   * Get current configuration
   */
  getConfig(): XPConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<XPConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Check if a landmark district (for higher XP)
   */
  isLandmarkDistrict(districtId: string): boolean {
    // Landmark districts (can be configured)
    const landmarks = [
      'CORE_NEXUS',
      'VOID_PLAZA',
      'CREATOR_HUB',
      'GENESIS_POINT',
    ];
    
    return landmarks.includes(districtId);
  }

  /**
   * Clean up old rate limit history
   */
  cleanup(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    for (const [wallet, history] of this.xpHistory.entries()) {
      const recent = history.filter(entry => entry.timestamp > oneMinuteAgo);
      
      if (recent.length === 0) {
        this.xpHistory.delete(wallet);
      } else {
        this.xpHistory.set(wallet, recent);
      }
    }
  }
}

// Singleton instance
export const xpRules = new XPRules();
