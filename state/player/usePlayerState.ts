/**
 * PHASE 5.2 — GLOBAL PLAYER STATE
 * 
 * Zustand store for centralized player state management.
 * Single source of truth for wallet, position, visits, stats, achievements.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  PlayerState,
  PlayerStateActions,
  PlayerPosition,
  ParcelVisit,
  DistrictVisit,
  PlayerSession,
} from "./playerStateTypes";

const initialState: PlayerState = {
  walletAddress: null,
  isConnected: false,
  position: null,
  currentParcel: null,
  currentDistrict: null,
  parcelsVisited: new Map(),
  districtsVisited: new Map(),
  session: null,
  stats: {
    totalSessionTime: 0,
    totalParcelsVisited: 0,
    totalDistrictsVisited: 0,
    totalXP: 0,
    level: 1,
  },
  achievements: new Map(),
  isLoading: false,
  lastUpdate: Date.now(),
};

/**
 * Helper to generate parcel key
 */
function parcelKey(x: number, z: number): string {
  return `${x},${z}`;
}

/**
 * Helper to calculate level from XP
 */
function calculateLevel(xp: number): number {
  // Simple formula: level = floor(sqrt(xp/100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export const usePlayerState = create<PlayerState & PlayerStateActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ============================================================
        // WALLET ACTIONS
        // ============================================================

        setWalletAddress: (address) => {
          set({
            walletAddress: address,
            isConnected: !!address,
            lastUpdate: Date.now(),
          });
        },

        connect: (address) => {
          set({
            walletAddress: address,
            isConnected: true,
            lastUpdate: Date.now(),
          });
        },

        disconnect: () => {
          const state = get();
          if (state.session?.isActive) {
            state.endSession();
          }
          set({
            walletAddress: null,
            isConnected: false,
            session: null,
            lastUpdate: Date.now(),
          });
        },

        // ============================================================
        // POSITION ACTIONS
        // ============================================================

        updatePosition: (positionUpdate) => {
          const state = get();
          const newPosition: PlayerPosition = {
            x: positionUpdate.x ?? state.position?.x ?? 0,
            y: positionUpdate.y ?? state.position?.y ?? 0,
            z: positionUpdate.z ?? state.position?.z ?? 0,
            rotation: positionUpdate.rotation ?? state.position?.rotation ?? 0,
            timestamp: Date.now(),
          };
          set({
            position: newPosition,
            lastUpdate: Date.now(),
          });
          state.updateActivity();
        },

        setCurrentParcel: (x, z) => {
          set({
            currentParcel: { x, z },
            lastUpdate: Date.now(),
          });
          get().recordParcelVisit(x, z);
          get().updateActivity();
        },

        setCurrentDistrict: (districtId) => {
          set({
            currentDistrict: districtId,
            lastUpdate: Date.now(),
          });
          if (districtId) {
            get().recordDistrictVisit(districtId);
          }
          get().updateActivity();
        },

        // ============================================================
        // VISIT TRACKING ACTIONS
        // ============================================================

        recordParcelVisit: (x, z) => {
          const state = get();
          const key = parcelKey(x, z);
          const existing = state.parcelsVisited.get(key);
          const now = Date.now();

          const visit: ParcelVisit = existing
            ? {
                ...existing,
                lastVisitTime: now,
                visitCount: existing.visitCount + 1,
              }
            : {
                x,
                z,
                firstVisitTime: now,
                lastVisitTime: now,
                visitCount: 1,
              };

          const newMap = new Map(state.parcelsVisited);
          newMap.set(key, visit);

          set({
            parcelsVisited: newMap,
            stats: {
              ...state.stats,
              totalParcelsVisited: newMap.size,
            },
            lastUpdate: now,
          });
        },

        recordDistrictVisit: (districtId) => {
          const state = get();
          const existing = state.districtsVisited.get(districtId);
          const now = Date.now();

          const visit: DistrictVisit = existing
            ? {
                ...existing,
                lastVisitTime: now,
                visitCount: existing.visitCount + 1,
              }
            : {
                districtId,
                firstVisitTime: now,
                lastVisitTime: now,
                visitCount: 1,
              };

          const newMap = new Map(state.districtsVisited);
          newMap.set(districtId, visit);

          set({
            districtsVisited: newMap,
            stats: {
              ...state.stats,
              totalDistrictsVisited: newMap.size,
            },
            lastUpdate: now,
          });
        },

        getParcelVisit: (x, z) => {
          return get().parcelsVisited.get(parcelKey(x, z));
        },

        getDistrictVisit: (districtId) => {
          return get().districtsVisited.get(districtId);
        },

        hasVisitedParcel: (x, z) => {
          return get().parcelsVisited.has(parcelKey(x, z));
        },

        hasVisitedDistrict: (districtId) => {
          return get().districtsVisited.has(districtId);
        },

        // ============================================================
        // SESSION ACTIONS
        // ============================================================

        startSession: (walletAddress) => {
          const now = Date.now();
          const sessionId = `session-${now}-${Math.random()
            .toString(36)
            .substring(7)}`;

          const newSession: PlayerSession = {
            sessionId,
            walletAddress,
            startTime: now,
            lastActivityTime: now,
            isActive: true,
          };

          set({
            session: newSession,
            walletAddress,
            isConnected: true,
            lastUpdate: now,
          });
        },

        endSession: () => {
          const state = get();
          if (!state.session) return;

          const now = Date.now();
          const sessionDuration = now - state.session.startTime;

          set({
            session: {
              ...state.session,
              endTime: now,
              isActive: false,
            },
            stats: {
              ...state.stats,
              totalSessionTime: state.stats.totalSessionTime + sessionDuration,
            },
            lastUpdate: now,
          });
        },

        updateActivity: () => {
          const state = get();
          if (state.session?.isActive) {
            set({
              session: {
                ...state.session,
                lastActivityTime: Date.now(),
              },
              lastUpdate: Date.now(),
            });
          }
        },

        // ============================================================
        // STATS ACTIONS (Phase 6 prep)
        // ============================================================

        addXP: (amount) => {
          const state = get();
          const newXP = state.stats.totalXP + amount;
          const newLevel = calculateLevel(newXP);

          set({
            stats: {
              ...state.stats,
              totalXP: newXP,
              level: newLevel,
            },
            lastUpdate: Date.now(),
          });
        },

        unlockAchievement: (achievementId) => {
          const state = get();
          if (state.achievements.has(achievementId)) return;

          const newMap = new Map(state.achievements);
          newMap.set(achievementId, {
            id: achievementId,
            unlockedAt: Date.now(),
            isNew: true,
          });

          set({
            achievements: newMap,
            lastUpdate: Date.now(),
          });
        },

        markAchievementSeen: (achievementId) => {
          const state = get();
          const achievement = state.achievements.get(achievementId);
          if (!achievement) return;

          const newMap = new Map(state.achievements);
          newMap.set(achievementId, {
            ...achievement,
            isNew: false,
          });

          set({
            achievements: newMap,
            lastUpdate: Date.now(),
          });
        },

        // ============================================================
        // UTILITY
        // ============================================================

        reset: () => {
          set({
            ...initialState,
            lastUpdate: Date.now(),
          });
        },

        getState: () => {
          return get();
        },
      }),
      {
        name: "player-state-storage",
        partialize: (state) => ({
          // Only persist these fields
          walletAddress: state.walletAddress,
          parcelsVisited: Array.from(state.parcelsVisited.entries()),
          districtsVisited: Array.from(state.districtsVisited.entries()),
          stats: state.stats,
          achievements: Array.from(state.achievements.entries()),
        }),
        onRehydrateStorage: () => (state) => {
          // Convert arrays back to Maps after rehydration
          if (state) {
            state.parcelsVisited = new Map(
              (state.parcelsVisited as unknown as [string, ParcelVisit][]) || []
            );
            state.districtsVisited = new Map(
              (state.districtsVisited as unknown as [
                string,
                DistrictVisit
              ][]) || []
            );
            state.achievements = new Map(
              (state.achievements as unknown as [
                string,
                { id: string; unlockedAt: number; isNew: boolean }
              ][]) || []
            );
          }
        },
      }
    )
  )
);
