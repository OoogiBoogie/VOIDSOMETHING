/**
 * PHASE 5.0 — LIFECYCLE EVENT HANDLERS
 * 
 * Handlers for lifecycle events (logging, analytics prep, HUD reactions).
 * These can be imported and wired into components.
 */

import { toast } from "sonner";
import type {
  OnWalletConnectEvent,
  OnProfileReadyEvent,
  OnWorldLoadedEvent,
  OnPlayerSpawnEvent,
  OnGameplayStartEvent,
  OnSessionEndedEvent,
} from "./lifecycleEvents";

/**
 * Handle wallet connection
 */
export function handleWalletConnect(event: OnWalletConnectEvent): void {
  console.log("[Lifecycle] Wallet connected:", event.walletAddress.slice(0, 8));
  
  if (process.env.NODE_ENV === "development") {
    toast.success(`Wallet connected: ${event.walletAddress.slice(0, 6)}...`, {
      duration: 2000,
    });
  }
}

/**
 * Handle profile ready
 */
export function handleProfileReady(event: OnProfileReadyEvent): void {
  console.log("[Lifecycle] Profile ready:", {
    session: event.sessionId,
    bypass: event.bypassMode,
    level: event.profile?.level,
  });

  if (event.bypassMode) {
    toast.info("Guest mode activated", { duration: 2000 });
  } else if (event.profile) {
    const message = `Welcome back! Level ${event.profile.level}`;
    toast.success(message, { duration: 3000 });
  }
}

/**
 * Handle world loaded
 */
export function handleWorldLoaded(event: OnWorldLoadedEvent): void {
  console.log("[Lifecycle] World loaded in", event.loadDuration, "ms");
  
  // Show load time if slow
  if (event.loadDuration > 3000 && process.env.NODE_ENV === "development") {
    toast.info(`World loaded (${(event.loadDuration / 1000).toFixed(1)}s)`, {
      duration: 2000,
    });
  }
}

/**
 * Handle player spawn
 */
export function handlePlayerSpawn(event: OnPlayerSpawnEvent): void {
  console.log("[Lifecycle] Player spawned at", event.spawnPosition);
  
  if (event.isResume) {
    toast.info("Resuming from last position", { duration: 2000 });
  } else {
    toast.success("Welcome to THE VOID", { duration: 3000 });
  }
}

/**
 * Handle gameplay start
 */
export function handleGameplayStart(event: OnGameplayStartEvent): void {
  console.log("[Lifecycle] Gameplay started at", event.currentDistrictId);
  
  // Optional: Show controls hint
  toast.info("Use WASD to move, SPACE to jump", {
    duration: 5000,
    position: "bottom-center",
  });
}

/**
 * Handle session ended
 */
export function handleSessionEnded(event: OnSessionEndedEvent): void {
  console.log("[Lifecycle] Session ended:", {
    duration: event.sessionDuration,
    parcels: event.totalParcelsVisited,
    districts: event.totalDistrictsVisited,
    reason: event.endReason,
  });

  // Save session summary to localStorage for post-session analytics
  try {
    const summary = {
      sessionId: event.sessionId,
      duration: event.sessionDuration,
      parcelsVisited: event.totalParcelsVisited,
      districtsVisited: event.totalDistrictsVisited,
      endedAt: event.timestamp,
    };
    localStorage.setItem("void_last_session", JSON.stringify(summary));
  } catch (error) {
    console.warn("[LifecycleHandlers] Failed to save session summary:", error);
  }

  // Show farewell toast (only if manual logout, not tab close)
  if (event.endReason === "manual") {
    const minutes = Math.floor(event.sessionDuration / 60000);
    toast.success(`Session ended. Played for ${minutes}m`, {
      duration: 3000,
    });
  }
}

/**
 * Log lifecycle event for debugging
 */
export function logLifecycleEvent(event: any): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[LifecycleEvent] ${event.type}`, event);
  }
}
