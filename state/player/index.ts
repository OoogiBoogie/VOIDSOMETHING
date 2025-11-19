/**
 * PHASE 5.2 — PLAYER STATE
 * 
 * Central export for player state management.
 */

export { usePlayerState } from "./usePlayerState";

export type {
  PlayerState,
  PlayerStateActions,
  PlayerPosition,
  ParcelVisit,
  DistrictVisit,
  PlayerSession,
  PlayerStats,
  PlayerAchievement,
} from "./playerStateTypes";

export {
  selectIsSessionActive,
  selectSessionDuration,
  selectTimeSinceLastActivity,
  selectCurrentPosition,
  selectCurrentParcel,
  selectCurrentDistrict,
  selectParcelsVisitedCount,
  selectDistrictsVisitedCount,
  selectAllParcelsVisited,
  selectAllDistrictsVisited,
  selectRecentParcels,
  selectTotalXP,
  selectLevel,
  selectTotalSessionTime,
  selectAchievementsCount,
  selectNewAchievementsCount,
  selectAllAchievements,
  selectNewAchievements,
  selectIsConnected,
  selectWalletAddress,
  selectPlayerSummary,
  selectExplorationProgress,
} from "./playerStateSelectors";
