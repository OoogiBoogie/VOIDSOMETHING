/**
 * XP System Event Types
 * Phase 6.0 - XP tracking and analytics
 */

export enum XPEventType {
  XP_GAINED = 'XP_GAINED',
  XP_CAP_REACHED = 'XP_CAP_REACHED',
  XP_MULTIPLIER_APPLIED = 'XP_MULTIPLIER_APPLIED',
}

export interface XPGainedEvent {
  type: XPEventType.XP_GAINED;
  timestamp: number;
  walletAddress: string;
  sessionId: string;
  amount: number;
  newTotal: number;
  source: XPSource;
  sourceDetails?: string;
}

export interface XPCapReachedEvent {
  type: XPEventType.XP_CAP_REACHED;
  timestamp: number;
  walletAddress: string;
  sessionId: string;
  cappedAmount: number;
  maxPerMinute: number;
}

export interface XPMultiplierAppliedEvent {
  type: XPEventType.XP_MULTIPLIER_APPLIED;
  timestamp: number;
  multiplier: number;
  reason: string;
  expiresAt?: number;
}

export type XPEvent = 
  | XPGainedEvent 
  | XPCapReachedEvent 
  | XPMultiplierAppliedEvent;

/**
 * XP Source Categories
 */
export enum XPSource {
  // Exploration
  PARCEL_FIRST_VISIT = 'PARCEL_FIRST_VISIT',
  DISTRICT_FIRST_VISIT = 'DISTRICT_FIRST_VISIT',
  LANDMARK_FIRST_VISIT = 'LANDMARK_FIRST_VISIT',
  
  // Session Activity
  SESSION_TIME_MILESTONE = 'SESSION_TIME_MILESTONE',
  LONG_SESSION_BONUS = 'LONG_SESSION_BONUS',
  
  // Interaction
  CREATOR_TERMINAL = 'CREATOR_TERMINAL',
  NPC_INTERACTION = 'NPC_INTERACTION',
  INFO_TERMINAL = 'INFO_TERMINAL',
  
  // Achievements
  ACHIEVEMENT_BONUS = 'ACHIEVEMENT_BONUS',
  
  // Manual/Admin
  MANUAL_GRANT = 'MANUAL_GRANT',
}

/**
 * XP Configuration Interface
 */
export interface XPConfig {
  // Exploration rewards
  parcelFirstVisit: number;
  districtFirstVisit: number;
  landmarkFirstVisit: number;
  
  // Session rewards
  sessionInterval: number; // minutes
  sessionIntervalReward: number;
  longSessionThreshold: number; // minutes
  longSessionBonus: number;
  
  // Interaction rewards
  creatorTerminal: number;
  npcInteraction: number;
  infoTerminal: number;
  
  // Rate limiting
  maxXPPerMinute: number;
  
  // Global multiplier
  globalMultiplier: number;
  multiplierReason?: string;
  multiplierExpiresAt?: number;
}

/**
 * Default XP Configuration
 */
export const DEFAULT_XP_CONFIG: XPConfig = {
  // Exploration
  parcelFirstVisit: 1,
  districtFirstVisit: 5,
  landmarkFirstVisit: 10,
  
  // Session
  sessionInterval: 10, // Every 10 minutes
  sessionIntervalReward: 2,
  longSessionThreshold: 60, // 60 minutes
  longSessionBonus: 10,
  
  // Interaction
  creatorTerminal: 3,
  npcInteraction: 1,
  infoTerminal: 2,
  
  // Rate limiting
  maxXPPerMinute: 50, // Prevent abuse
  
  // Multiplier (default 1x)
  globalMultiplier: 1.0,
};
