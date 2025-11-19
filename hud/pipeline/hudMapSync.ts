/**
 * PHASE 5.1 — HUD MAP SYNC
 * 
 * Manages map highlight behaviors in response to world events.
 * Coordinates with mini-map components to show visual feedback.
 */

export interface MapHighlight {
  id: string;
  type: "parcel" | "district" | "marker";
  x?: number;
  z?: number;
  districtId?: string;
  color: string;
  duration: number;
  startTime: number;
}

class HUDMapSync {
  private activeHighlights: Map<string, MapHighlight> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired highlights every 500ms
    this.startCleanupLoop();
  }

  /**
   * Highlight a parcel on the map
   */
  highlightParcel(x: number, z: number, duration = 2000): void {
    const id = `parcel-${x}-${z}`;
    
    const highlight: MapHighlight = {
      id,
      type: "parcel",
      x,
      z,
      color: "#00ff00",
      duration,
      startTime: Date.now(),
    };

    this.activeHighlights.set(id, highlight);
    this.emitMapUpdate();
  }

  /**
   * Highlight a district on the map
   */
  highlightDistrict(districtId: string, duration = 3000): void {
    const id = `district-${districtId}`;
    
    const highlight: MapHighlight = {
      id,
      type: "district",
      districtId,
      color: this.getDistrictColor(districtId),
      duration,
      startTime: Date.now(),
    };

    this.activeHighlights.set(id, highlight);
    this.emitMapUpdate();
  }

  /**
   * Add custom marker highlight
   */
  highlightMarker(
    x: number,
    z: number,
    color = "#ff00ff",
    duration = 2000
  ): void {
    const id = `marker-${x}-${z}-${Date.now()}`;
    
    const highlight: MapHighlight = {
      id,
      type: "marker",
      x,
      z,
      color,
      duration,
      startTime: Date.now(),
    };

    this.activeHighlights.set(id, highlight);
    this.emitMapUpdate();
  }

  /**
   * Clear specific highlight
   */
  clearHighlight(id: string): void {
    this.activeHighlights.delete(id);
    this.emitMapUpdate();
  }

  /**
   * Clear all highlights
   */
  clearAll(): void {
    this.activeHighlights.clear();
    this.emitMapUpdate();
  }

  /**
   * Get all active highlights (for map components)
   */
  getActiveHighlights(): MapHighlight[] {
    return Array.from(this.activeHighlights.values());
  }

  /**
   * Cleanup expired highlights
   */
  private startCleanupLoop(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let hasExpired = false;

      for (const [id, highlight] of this.activeHighlights.entries()) {
        if (now - highlight.startTime > highlight.duration) {
          this.activeHighlights.delete(id);
          hasExpired = true;
        }
      }

      if (hasExpired) {
        this.emitMapUpdate();
      }
    }, 500);
  }

  /**
   * Stop cleanup loop (for cleanup)
   */
  stopCleanupLoop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Emit map update event for React components
   */
  private emitMapUpdate(): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("hud:map-update", {
          detail: {
            highlights: this.getActiveHighlights(),
          },
        })
      );
    }
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
export const hudMapSync = new HUDMapSync();
