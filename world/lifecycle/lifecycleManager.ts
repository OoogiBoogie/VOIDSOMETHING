/**
 * PHASE 5.0 — PLAYER LIFECYCLE MANAGER
 * 
 * Orchestrates the complete player lifecycle from wallet connection to session end.
 * Emits lifecycle events, manages session tracking, and handles cleanup.
 */

import { worldEventBus } from "../events/eventBus";
import {
  LifecycleEventType,
  type LifecycleEvent,
  type OnWalletConnectEvent,
  type OnProfileReadyEvent,
  type OnWorldLoadedEvent,
  type OnPlayerSpawnEvent,
  type OnGameplayStartEvent,
  type OnGameplayTickEvent,
  type OnSessionEndedEvent,
} from "./lifecycleEvents";
import { v4 as uuidv4 } from "uuid";

class PlayerLifecycleManager {
  private sessionId: string | null = null;
  private sessionStartTime: number | null = null;
  private gameplayStartTime: number | null = null;
  private tickInterval: NodeJS.Timeout | null = null;
  private isWorldLoaded = false;
  private hasGameplayStarted = false;
  
  // Session stats
  private parcelsVisited = new Set<string>();
  private districtsVisited = new Set<string>();
  
  // Player info
  private walletAddress: string | null = null;
  private currentParcelId: string | null = null;
  private currentDistrictId: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      // Listen for tab close / navigation away
      window.addEventListener("beforeunload", this.handleBeforeUnload);
      window.addEventListener("pagehide", this.handlePageHide);
    }
  }

  /**
   * Initialize session when wallet connects
   */
  onWalletConnect(walletAddress: string, loginMethod: "wallet" | "bypass" = "wallet", chainId?: number): void {
    this.walletAddress = walletAddress;
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();

    const event: OnWalletConnectEvent = {
      type: LifecycleEventType.ON_WALLET_CONNECT,
      timestamp: Date.now(),
      walletAddress,
      loginMethod,
      chainId,
    };

    worldEventBus.emit(event as any);
  }

  /**
   * Profile ready (Net Protocol or bypass mode)
   */
  onProfileReady(
    profile?: any,
    bypassMode = false
  ): void {
    if (!this.sessionId) {
      console.warn("[LifecycleManager] onProfileReady called before wallet connect");
      // Create session anyway for bypass mode
      this.sessionId = this.generateSessionId();
      this.sessionStartTime = Date.now();
    }

    const event: OnProfileReadyEvent = {
      type: LifecycleEventType.ON_PROFILE_READY,
      timestamp: Date.now(),
      walletAddress: this.walletAddress,
      sessionId: this.sessionId!,
      profile: profile ? {
        level: profile.level || 1,
        xp: profile.xp || 0,
        posX: profile.posX || 0,
        posY: profile.posY || 0,
        posZ: profile.posZ || 0,
        zoneX: profile.zoneX || 0,
        zoneY: profile.zoneY || 0,
      } : undefined,
      bypassMode,
    };

    worldEventBus.emit(event as any);
  }

  /**
   * World scene loaded and ready
   */
  onWorldLoaded(loadDuration: number, renderMode: "desktop" | "mobile", worldVersion = "1.0.0"): void {
    if (!this.sessionId) {
      console.warn("[LifecycleManager] onWorldLoaded called before session start");
      return;
    }

    this.isWorldLoaded = true;

    const event: OnWorldLoadedEvent = {
      type: LifecycleEventType.ON_WORLD_LOADED,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      loadDuration,
      renderMode,
      worldVersion,
    };

    worldEventBus.emit(event as any);
  }

  /**
   * Player spawned into world at initial position
   */
  onPlayerSpawn(
    spawnPosition: { x: number; y: number; z: number },
    spawnParcelId: string,
    spawnDistrictId: string,
    isResume = false
  ): void {
    if (!this.sessionId) {
      console.warn("[LifecycleManager] onPlayerSpawn called before session start");
      return;
    }

    this.currentParcelId = spawnParcelId;
    this.currentDistrictId = spawnDistrictId;
    this.parcelsVisited.add(spawnParcelId);
    this.districtsVisited.add(spawnDistrictId);

    const event: OnPlayerSpawnEvent = {
      type: LifecycleEventType.ON_PLAYER_SPAWN,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      walletAddress: this.walletAddress,
      spawnPosition,
      spawnParcelId,
      spawnDistrictId,
      isResume,
    };

    worldEventBus.emit(event as any);
  }

  /**
   * Gameplay officially started (intro complete, controls active)
   */
  onGameplayStart(currentParcelId: string, currentDistrictId: string): void {
    if (!this.sessionId) {
      console.warn("[LifecycleManager] onGameplayStart called before session start");
      return;
    }

    if (this.hasGameplayStarted) {
      console.warn("[LifecycleManager] Gameplay already started");
      return;
    }

    this.hasGameplayStarted = true;
    this.gameplayStartTime = Date.now();
    this.currentParcelId = currentParcelId;
    this.currentDistrictId = currentDistrictId;

    const event: OnGameplayStartEvent = {
      type: LifecycleEventType.ON_GAMEPLAY_START,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      walletAddress: this.walletAddress,
      currentParcelId,
      currentDistrictId,
    };

    worldEventBus.emit(event as any);

    // Start gameplay tick (every 10 seconds)
    this.startGameplayTick();
  }

  /**
   * Update current location (called by VoidGameShell on parcel/district change)
   */
  updateLocation(parcelId: string, districtId: string): void {
    this.currentParcelId = parcelId;
    this.currentDistrictId = districtId;
    this.parcelsVisited.add(parcelId);
    this.districtsVisited.add(districtId);
  }

  /**
   * Start periodic gameplay tick (every 10s)
   */
  private startGameplayTick(): void {
    if (this.tickInterval) return;

    this.tickInterval = setInterval(() => {
      this.emitGameplayTick();
    }, 10000); // 10 seconds
  }

  /**
   * Emit gameplay tick event
   */
  private emitGameplayTick(): void {
    if (!this.sessionId || !this.gameplayStartTime) return;

    const event: OnGameplayTickEvent = {
      type: LifecycleEventType.ON_GAMEPLAY_TICK,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      walletAddress: this.walletAddress,
      currentParcelId: this.currentParcelId,
      currentDistrictId: this.currentDistrictId,
      sessionDuration: Date.now() - this.gameplayStartTime,
      totalParcelsVisited: this.parcelsVisited.size,
      totalDistrictsVisited: this.districtsVisited.size,
    };

    worldEventBus.emit(event as any);
  }

  /**
   * End session (manual logout, tab close, timeout, error)
   */
  endSession(reason: "manual" | "tab_close" | "timeout" | "error" = "manual"): void {
    if (!this.sessionId) return;

    const sessionDuration = this.sessionStartTime
      ? Date.now() - this.sessionStartTime
      : 0;

    const event: OnSessionEndedEvent = {
      type: LifecycleEventType.ON_SESSION_ENDED,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      walletAddress: this.walletAddress,
      sessionDuration,
      totalParcelsVisited: this.parcelsVisited.size,
      totalDistrictsVisited: this.districtsVisited.size,
      endReason: reason,
    };

    worldEventBus.emit(event as any);

    // Flush analytics immediately
    worldEventBus.forceFlush();

    // Cleanup
    this.cleanup();
  }

  /**
   * Cleanup on session end
   */
  private cleanup(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    this.sessionId = null;
    this.sessionStartTime = null;
    this.gameplayStartTime = null;
    this.hasGameplayStarted = false;
    this.parcelsVisited.clear();
    this.districtsVisited.clear();
    this.walletAddress = null;
    this.currentParcelId = null;
    this.currentDistrictId = null;
  }

  /**
   * Handle beforeunload event (tab close / navigation away)
   */
  private handleBeforeUnload = (): void => {
    this.endSession("tab_close");
  };

  /**
   * Handle pagehide event (mobile Safari, Firefox)
   */
  private handlePageHide = (): void => {
    this.endSession("tab_close");
  };

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    // Try uuid package first, fallback to manual
    try {
      return uuidv4();
    } catch {
      return `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }
  }

  /**
   * Get current session info (for debugging / HUD display)
   */
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      sessionStartTime: this.sessionStartTime,
      gameplayStartTime: this.gameplayStartTime,
      hasGameplayStarted: this.hasGameplayStarted,
      walletAddress: this.walletAddress,
      currentParcelId: this.currentParcelId,
      currentDistrictId: this.currentDistrictId,
      parcelsVisited: this.parcelsVisited.size,
      districtsVisited: this.districtsVisited.size,
    };
  }

  /**
   * Destroy manager (cleanup on unmount)
   */
  destroy(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", this.handleBeforeUnload);
      window.removeEventListener("pagehide", this.handlePageHide);
    }
    this.cleanup();
  }
}

// Global singleton instance
export const playerLifecycleManager = new PlayerLifecycleManager();
