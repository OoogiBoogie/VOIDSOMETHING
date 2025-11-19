/**
 * PHASE 5.2 — PLAYER STATE SELECTORS
 * 
 * Efficient selectors for player state queries.
 */

import type { PlayerState } from "./playerStateTypes";

/**
 * Session selectors
 */
export const selectIsSessionActive = (state: PlayerState): boolean => {
  return state.session?.isActive ?? false;
};

export const selectSessionDuration = (state: PlayerState): number => {
  if (!state.session?.startTime) return 0;
  const endTime = state.session.endTime || Date.now();
  return endTime - state.session.startTime;
};

export const selectTimeSinceLastActivity = (state: PlayerState): number => {
  if (!state.session?.lastActivityTime) return 0;
  return Date.now() - state.session.lastActivityTime;
};

/**
 * Position selectors
 */
export const selectCurrentPosition = (state: PlayerState) => {
  return state.position;
};

export const selectCurrentParcel = (state: PlayerState) => {
  return state.currentParcel;
};

export const selectCurrentDistrict = (state: PlayerState) => {
  return state.currentDistrict;
};

/**
 * Visit tracking selectors
 */
export const selectParcelsVisitedCount = (state: PlayerState): number => {
  return state.parcelsVisited.size;
};

export const selectDistrictsVisitedCount = (state: PlayerState): number => {
  return state.districtsVisited.size;
};

export const selectAllParcelsVisited = (state: PlayerState) => {
  return Array.from(state.parcelsVisited.values());
};

export const selectAllDistrictsVisited = (state: PlayerState) => {
  return Array.from(state.districtsVisited.values());
};

export const selectRecentParcels = (state: PlayerState, limit = 10) => {
  return Array.from(state.parcelsVisited.values())
    .sort((a, b) => b.lastVisitTime - a.lastVisitTime)
    .slice(0, limit);
};

/**
 * Stats selectors
 */
export const selectTotalXP = (state: PlayerState): number => {
  return state.stats.totalXP;
};

export const selectLevel = (state: PlayerState): number => {
  return state.stats.level;
};

export const selectTotalSessionTime = (state: PlayerState): number => {
  return state.stats.totalSessionTime;
};

/**
 * Achievement selectors
 */
export const selectAchievementsCount = (state: PlayerState): number => {
  return state.achievements.size;
};

export const selectNewAchievementsCount = (state: PlayerState): number => {
  return Array.from(state.achievements.values()).filter((a) => a.isNew).length;
};

export const selectAllAchievements = (state: PlayerState) => {
  return Array.from(state.achievements.values());
};

export const selectNewAchievements = (state: PlayerState) => {
  return Array.from(state.achievements.values()).filter((a) => a.isNew);
};

/**
 * Wallet selectors
 */
export const selectIsConnected = (state: PlayerState): boolean => {
  return state.isConnected && state.walletAddress !== null;
};

export const selectWalletAddress = (state: PlayerState): string | null => {
  return state.walletAddress;
};

/**
 * Composite selectors
 */
export const selectPlayerSummary = (state: PlayerState) => {
  return {
    walletAddress: state.walletAddress,
    isConnected: state.isConnected,
    sessionActive: selectIsSessionActive(state),
    sessionDuration: selectSessionDuration(state),
    parcelsVisited: selectParcelsVisitedCount(state),
    districtsVisited: selectDistrictsVisitedCount(state),
    level: selectLevel(state),
    totalXP: selectTotalXP(state),
    achievementsUnlocked: selectAchievementsCount(state),
    newAchievements: selectNewAchievementsCount(state),
  };
};

export const selectExplorationProgress = (state: PlayerState) => {
  return {
    parcelsVisited: selectParcelsVisitedCount(state),
    districtsVisited: selectDistrictsVisitedCount(state),
    currentParcel: state.currentParcel,
    currentDistrict: state.currentDistrict,
    recentParcels: selectRecentParcels(state, 5),
  };
};
