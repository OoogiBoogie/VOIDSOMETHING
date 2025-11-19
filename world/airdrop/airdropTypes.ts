/**
 * Airdrop Types & Configuration
 * Phase 6.2 - Airdrop scoring data structures
 */

export interface AirdropScore {
  walletAddress: string;
  baseScore: number;
  totalScore: number;
  breakdown: AirdropScoreBreakdown;
  multipliers: AirdropMultiplier[];
  lastUpdated: number;
  rank?: number;
}

export interface AirdropScoreBreakdown {
  xpPoints: number;
  achievementPoints: number;
  explorationPoints: number;
  sessionPoints: number;
  interactionPoints: number;
  creatorTerminalPoints: number;
  socialPoints: number;
}

export interface AirdropMultiplier {
  type: string;
  value: number;
  reason: string;
}

export interface AirdropConfig {
  // Point weights
  xpWeight: number; // 1 XP = X points
  achievementWeight: number; // Per achievement
  districtWeight: number; // Per unique district
  parcelWeight: number; // Per unique parcel
  sessionTimeWeight: number; // Per minute
  creatorTerminalWeight: number; // Per use
  
  // Multipliers
  mainnetProfileMultiplier: number; // e.g. 1.1 = +10%
  earlyAdopterMultiplier: number; // For beta users
  
  // Caps
  maxDailyPoints: number;
  maxTotalPoints: number;
}

export const DEFAULT_AIRDROP_CONFIG: AirdropConfig = {
  // Weights
  xpWeight: 1, // 1:1 XP to points
  achievementWeight: 25, // 25 points per achievement
  districtWeight: 10, // 10 points per district
  parcelWeight: 0.5, // 0.5 points per parcel
  sessionTimeWeight: 0.2, // 0.2 points per minute
  creatorTerminalWeight: 5, // 5 points per use
  
  // Multipliers
  mainnetProfileMultiplier: 1.1, // +10% for mainnet profiles
  earlyAdopterMultiplier: 1.2, // +20% for beta users
  
  // Caps
  maxDailyPoints: 1000,
  maxTotalPoints: 100000,
};
