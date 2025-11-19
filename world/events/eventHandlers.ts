/**
 * PHASE 5 — WORLD EVENT HANDLERS
 * 
 * Centralized event handlers for common world events.
 * These can be imported and registered by HUD components.
 */

import { toast } from "sonner";
import {
  DistrictEnteredEvent,
  DistrictExitedEvent,
  FirstDistrictVisitEvent,
  FirstParcelVisitEvent,
  ParcelEnteredEvent,
  ParcelExitedEvent,
  WorldEvent,
} from "./eventPayloads";

/**
 * Show toast notification on district entry
 */
export function handleDistrictEntered(event: DistrictEnteredEvent): void {
  const message = event.isFirstVisit
    ? `🎉 Discovered: ${event.districtName}`
    : `Entering ${event.districtName}`;

  toast.success(message, {
    duration: 3000,
    position: "bottom-center",
  });
}

/**
 * Show toast notification on district exit
 */
export function handleDistrictExited(event: DistrictExitedEvent): void {
  const timeInMinutes = Math.floor(event.timeInDistrict / 60000);
  if (timeInMinutes > 0) {
    toast.info(`Left ${event.districtName} (${timeInMinutes}m)`, {
      duration: 2000,
      position: "bottom-center",
    });
  }
}

/**
 * Handle first parcel visit (award XP, show notification)
 */
export function handleFirstParcelVisit(event: FirstParcelVisitEvent): void {
  toast.success(`New parcel discovered! +${event.xpAwarded} XP`, {
    duration: 3000,
    position: "bottom-center",
  });
}

/**
 * Handle first district visit (award XP, show notification)
 */
export function handleFirstDistrictVisit(event: FirstDistrictVisitEvent): void {
  toast.success(`New district discovered! +${event.xpAwarded} XP`, {
    duration: 4000,
    position: "bottom-center",
  });
}

/**
 * Generic event logger for debugging
 */
export function logWorldEvent(event: WorldEvent): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[WorldEvent] ${event.type}`, event);
  }
}

/**
 * Update player position in localStorage for persistence
 */
export function persistPlayerPosition(event: ParcelEnteredEvent): void {
  try {
    localStorage.setItem(
      "void_last_position",
      JSON.stringify({
        parcelId: event.parcelId,
        districtId: event.districtId,
        worldPosition: event.worldPosition,
        timestamp: event.timestamp,
      })
    );
  } catch (error) {
    console.warn("[WorldEventHandlers] Failed to persist position:", error);
  }
}

/**
 * Track visited parcels for exploration progress
 */
export function trackParcelVisit(event: ParcelEnteredEvent): void {
  try {
    const visited = JSON.parse(localStorage.getItem("void_visited_parcels") || "[]");
    if (!visited.includes(event.parcelId)) {
      visited.push(event.parcelId);
      localStorage.setItem("void_visited_parcels", JSON.stringify(visited));
    }
  } catch (error) {
    console.warn("[WorldEventHandlers] Failed to track parcel visit:", error);
  }
}

/**
 * Track visited districts for exploration progress
 */
export function trackDistrictVisit(event: DistrictEnteredEvent): void {
  try {
    const visited = JSON.parse(localStorage.getItem("void_visited_districts") || "[]");
    if (!visited.includes(event.districtId)) {
      visited.push(event.districtId);
      localStorage.setItem("void_visited_districts", JSON.stringify(visited));
    }
  } catch (error) {
    console.warn("[WorldEventHandlers] Failed to track district visit:", error);
  }
}
