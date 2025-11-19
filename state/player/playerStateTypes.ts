/**
 * PHASE 5.2 — PLAYER STATE TYPES
 * 
 * Type definitions for global player state management.
 */

export interface PlayerPosition {
  x: number;
  y: number;
  z: number;
  rotation: number;
  timestamp: number;
}

export interface ParcelVisit {
  x: number;
  z: number;
  firstVisitTime: number;
  lastVisitTime: number;
  visitCount: number;
}

export interface DistrictVisit {
  districtId: string;
  firstVisitTime: number;
  lastVisitTime: number;
  visitCount: number;
}

export interface PlayerSession {
  sessionId: string;
  walletAddress: string;
  startTime: number;
  endTime?: number;
  lastActivityTime: number;
  isActive: boolean;
}

export interface PlayerStats {
  totalSessionTime: number;
  totalParcelsVisited: number;
  totalDistrictsVisited: number;
  totalXP: number;
  level: number;
}

export interface PlayerAchievement {
  id: string;
  unlockedAt: number;
  isNew: boolean;
}

export interface PlayerState {
  // Wallet
  walletAddress: string | null;
  isConnected: boolean;

  // Position
  position: PlayerPosition | null;
  currentParcel: { x: number; z: number } | null;
  currentDistrict: string | null;

  // Visit tracking
  parcelsVisited: Map<string, ParcelVisit>;
  districtsVisited: Map<string, DistrictVisit>;

  // Session
  session: PlayerSession | null;

  // Stats (Phase 6 prep)
  stats: PlayerStats;
  achievements: Map<string, PlayerAchievement>;

  // UI state
  isLoading: boolean;
  lastUpdate: number;
}

export interface PlayerStateActions {
  // Wallet actions
  setWalletAddress: (address: string | null) => void;
  connect: (address: string) => void;
  disconnect: () => void;

  // Position actions
  updatePosition: (position: Partial<PlayerPosition>) => void;
  setCurrentParcel: (x: number, z: number) => void;
  setCurrentDistrict: (districtId: string | null) => void;

  // Visit tracking
  recordParcelVisit: (x: number, z: number) => void;
  recordDistrictVisit: (districtId: string) => void;
  getParcelVisit: (x: number, z: number) => ParcelVisit | undefined;
  getDistrictVisit: (districtId: string) => DistrictVisit | undefined;
  hasVisitedParcel: (x: number, z: number) => boolean;
  hasVisitedDistrict: (districtId: string) => boolean;

  // Session actions
  startSession: (walletAddress: string) => void;
  endSession: () => void;
  updateActivity: () => void;

  // Stats actions (Phase 6 prep)
  addXP: (amount: number) => void;
  unlockAchievement: (achievementId: string) => void;
  markAchievementSeen: (achievementId: string) => void;

  // Utility
  reset: () => void;
  getState: () => PlayerState;
}
