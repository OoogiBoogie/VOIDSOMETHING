/**
 * PHASE 5.1 — HUD EVENT ADAPTER
 * 
 * Converts raw world events into UI-safe data for HUD components.
 * Acts as the translation layer between world state and UI state.
 */

import { worldEventBus } from "@/world/events";
import type {
  ParcelEnteredPayload,
  DistrictEnteredPayload,
  AreaDiscoveredPayload,
  SessionStartedPayload,
  SessionEndedPayload,
} from "@/world/events/eventPayloads";
import { hudToastQueue } from "./hudToastQueue";
import { hudMapSync } from "./hudMapSync";

export interface HUDParcelData {
  x: number;
  z: number;
  districtId: string | null;
  displayName: string;
  isFirstVisit: boolean;
}

export interface HUDDistrictData {
  id: string;
  name: string;
  description: string;
  color: string;
  isFirstVisit: boolean;
}

export interface HUDSessionData {
  walletAddress: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class HUDEventAdapter {
  private isListening = false;

  /**
   * Start listening to world events
   */
  start(): void {
    if (this.isListening) return;
    this.isListening = true;

    // Parcel entry reactions
    worldEventBus.on("PARCEL_ENTERED", this.handleParcelEntered);

    // District entry reactions
    worldEventBus.on("DISTRICT_ENTERED", this.handleDistrictEntered);

    // Area discovery reactions
    worldEventBus.on("AREA_DISCOVERED", this.handleAreaDiscovered);

    // Session lifecycle reactions
    worldEventBus.on("SESSION_STARTED", this.handleSessionStarted);
    worldEventBus.on("SESSION_ENDED", this.handleSessionEnded);

    console.log("[HUDEventAdapter] Started listening to world events");
  }

  /**
   * Stop listening to world events
   */
  stop(): void {
    if (!this.isListening) return;
    this.isListening = false;

    worldEventBus.off("PARCEL_ENTERED", this.handleParcelEntered);
    worldEventBus.off("DISTRICT_ENTERED", this.handleDistrictEntered);
    worldEventBus.off("AREA_DISCOVERED", this.handleAreaDiscovered);
    worldEventBus.off("SESSION_STARTED", this.handleSessionStarted);
    worldEventBus.off("SESSION_ENDED", this.handleSessionEnded);

    console.log("[HUDEventAdapter] Stopped listening to world events");
  }

  /**
   * Handle parcel entry
   */
  private handleParcelEntered = (payload: ParcelEnteredPayload): void => {
    const hudData: HUDParcelData = {
      x: payload.x,
      z: payload.z,
      districtId: payload.districtId,
      displayName: `Parcel (${payload.x}, ${payload.z})`,
      isFirstVisit: payload.isFirstVisit,
    };

    // Show toast for first visits
    if (payload.isFirstVisit) {
      const districtInfo = payload.districtId
        ? ` in ${this.getDistrictName(payload.districtId)}`
        : "";
      hudToastQueue.info(`Discovered ${hudData.displayName}${districtInfo}`, {
        duration: 2500,
      });
    }

    // Sync map highlight
    hudMapSync.highlightParcel(payload.x, payload.z, 2000);

    // Emit HUD-safe event for components
    this.emitHUDEvent("hud:parcel-entered", hudData);
  };

  /**
   * Handle district entry
   */
  private handleDistrictEntered = (payload: DistrictEnteredPayload): void => {
    const hudData: HUDDistrictData = {
      id: payload.districtId,
      name: this.getDistrictName(payload.districtId),
      description: this.getDistrictDescription(payload.districtId),
      color: this.getDistrictColor(payload.districtId),
      isFirstVisit: payload.isFirstVisit,
    };

    // Show toast
    const message = payload.isFirstVisit
      ? `Discovered ${hudData.name}!`
      : `Entered ${hudData.name}`;
    
    hudToastQueue.info(message, {
      duration: 3000,
    });

    // Sync map district highlight
    hudMapSync.highlightDistrict(payload.districtId, 3000);

    // Emit HUD-safe event
    this.emitHUDEvent("hud:district-entered", hudData);
  };

  /**
   * Handle area discovery (generic)
   */
  private handleAreaDiscovered = (payload: AreaDiscoveredPayload): void => {
    hudToastQueue.success(`Area discovered: ${payload.areaName}`, {
      duration: 3000,
    });

    this.emitHUDEvent("hud:area-discovered", {
      areaName: payload.areaName,
      areaType: payload.areaType,
    });
  };

  /**
   * Handle session start
   */
  private handleSessionStarted = (payload: SessionStartedPayload): void => {
    const hudData: HUDSessionData = {
      walletAddress: payload.walletAddress,
      startTime: payload.timestamp,
    };

    // Welcome toast
    hudToastQueue.success("Welcome to VOID", {
      duration: 2000,
    });

    this.emitHUDEvent("hud:session-started", hudData);
  };

  /**
   * Handle session end
   */
  private handleSessionEnded = (payload: SessionEndedPayload): void => {
    const duration = Date.now() - (payload.sessionStartTime || 0);
    
    const hudData: HUDSessionData = {
      walletAddress: payload.walletAddress,
      startTime: payload.sessionStartTime || 0,
      endTime: payload.timestamp,
      duration,
    };

    // Goodbye toast
    const minutes = Math.floor(duration / 60000);
    const message = minutes > 0
      ? `Session ended. Played for ${minutes} min.`
      : "Session ended";
    
    hudToastQueue.info(message, {
      duration: 2500,
    });

    this.emitHUDEvent("hud:session-ended", hudData);
  };

  /**
   * Emit HUD-safe custom event (for React components to listen)
   */
  private emitHUDEvent(type: string, detail: unknown): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(type, { detail }));
    }
  }

  /**
   * Get district name from ID
   */
  private getDistrictName(districtId: string): string {
    const names: Record<string, string> = {
      "district-01": "The Core",
      "district-02": "East Quadrant",
      "district-03": "West Reach",
      "district-04": "North Expanse",
      "district-05": "South Terminal",
    };
    return names[districtId] || districtId;
  }

  /**
   * Get district description
   */
  private getDistrictDescription(districtId: string): string {
    const descriptions: Record<string, string> = {
      "district-01": "Central hub of VOID activity",
      "district-02": "Eastern frontier lands",
      "district-03": "Western trading routes",
      "district-04": "Northern wilderness",
      "district-05": "Southern edge territories",
    };
    return descriptions[districtId] || "Unknown district";
  }

  /**
   * Get district color
   */
  private getDistrictColor(districtId: string): string {
    const colors: Record<string, string> = {
      "district-01": "#00ff00",
      "district-02": "#ff00ff",
      "district-03": "#00ffff",
      "district-04": "#ffff00",
      "district-05": "#ff8800",
    };
    return colors[districtId] || "#ffffff";
  }
}

// Global singleton
export const hudEventAdapter = new HUDEventAdapter();
