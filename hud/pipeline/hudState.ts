/**
 * PHASE 5.1 — HUD STATE
 * 
 * React hooks for HUD components to react to world events.
 * Provides clean interface for UI components to stay in sync.
 */

import { useEffect, useState, useCallback } from "react";
import type {
  HUDParcelData,
  HUDDistrictData,
  HUDSessionData,
} from "./hudEventAdapter";
import type { MapHighlight } from "./hudMapSync";

/**
 * Hook to react to HUD parcel events
 */
export function useHUDParcelReaction(
  callback: (data: HUDParcelData) => void
): void {
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<HUDParcelData>;
      callback(customEvent.detail);
    };

    window.addEventListener("hud:parcel-entered", handler);
    return () => window.removeEventListener("hud:parcel-entered", handler);
  }, [callback]);
}

/**
 * Hook to react to HUD district events
 */
export function useHUDDistrictReaction(
  callback: (data: HUDDistrictData) => void
): void {
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<HUDDistrictData>;
      callback(customEvent.detail);
    };

    window.addEventListener("hud:district-entered", handler);
    return () => window.removeEventListener("hud:district-entered", handler);
  }, [callback]);
}

/**
 * Hook to react to HUD session events
 */
export function useHUDSessionReaction(callbacks: {
  onStart?: (data: HUDSessionData) => void;
  onEnd?: (data: HUDSessionData) => void;
}): void {
  const { onStart, onEnd } = callbacks;

  useEffect(() => {
    const startHandler = (event: Event) => {
      if (onStart) {
        const customEvent = event as CustomEvent<HUDSessionData>;
        onStart(customEvent.detail);
      }
    };

    const endHandler = (event: Event) => {
      if (onEnd) {
        const customEvent = event as CustomEvent<HUDSessionData>;
        onEnd(customEvent.detail);
      }
    };

    window.addEventListener("hud:session-started", startHandler);
    window.addEventListener("hud:session-ended", endHandler);

    return () => {
      window.removeEventListener("hud:session-started", startHandler);
      window.removeEventListener("hud:session-ended", endHandler);
    };
  }, [onStart, onEnd]);
}

/**
 * Hook to react to area discovery events
 */
export function useHUDAreaDiscovery(
  callback: (data: { areaName: string; areaType: string }) => void
): void {
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{
        areaName: string;
        areaType: string;
      }>;
      callback(customEvent.detail);
    };

    window.addEventListener("hud:area-discovered", handler);
    return () => window.removeEventListener("hud:area-discovered", handler);
  }, [callback]);
}

/**
 * Hook to get active map highlights
 */
export function useMapHighlights(): MapHighlight[] {
  const [highlights, setHighlights] = useState<MapHighlight[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ highlights: MapHighlight[] }>;
      setHighlights(customEvent.detail.highlights);
    };

    window.addEventListener("hud:map-update", handler);
    return () => window.removeEventListener("hud:map-update", handler);
  }, []);

  return highlights;
}

/**
 * Generic hook to react to any HUD event
 */
export function useHUDReaction<T = unknown>(
  eventType: string,
  callback: (data: T) => void
): void {
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<T>;
      callback(customEvent.detail);
    };

    window.addEventListener(eventType, handler);
    return () => window.removeEventListener(eventType, handler);
  }, [eventType, callback]);
}

/**
 * Hook to track current parcel (debounced)
 */
export function useCurrentParcel(): HUDParcelData | null {
  const [currentParcel, setCurrentParcel] = useState<HUDParcelData | null>(
    null
  );

  const handleParcelChange = useCallback((data: HUDParcelData) => {
    setCurrentParcel(data);
  }, []);

  useHUDParcelReaction(handleParcelChange);

  return currentParcel;
}

/**
 * Hook to track current district (debounced)
 */
export function useCurrentDistrict(): HUDDistrictData | null {
  const [currentDistrict, setCurrentDistrict] =
    useState<HUDDistrictData | null>(null);

  const handleDistrictChange = useCallback((data: HUDDistrictData) => {
    setCurrentDistrict(data);
  }, []);

  useHUDDistrictReaction(handleDistrictChange);

  return currentDistrict;
}
