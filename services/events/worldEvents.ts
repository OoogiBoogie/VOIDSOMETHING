/**
 * VOID PROTOCOL - WORLD EVENT BUS
 * 
 * Event-driven architecture for syncing 3D world state with HUD components.
 * 
 * Usage:
 * 
 * // In 3D Player Controller:
 * import { worldEvents, PLAYER_MOVED, PARCEL_ENTERED } from '@/services/events/worldEvents';
 * worldEvents.emit(PLAYER_MOVED, { position: { x, z }, parcelId });
 * 
 * // In HUD Components:
 * useEffect(() => {
 *   const unsubscribe = worldEvents.on(PLAYER_MOVED, (data) => {
 *     console.log('Player moved to:', data.position);
 *   });
 *   return unsubscribe;
 * }, []);
 */

import { ParcelInfo, WorldPosition } from '@/world/WorldCoords';

// ============================================================================
// EVENT TYPES
// ============================================================================

export const PLAYER_MOVED = 'player:moved';
export const PARCEL_ENTERED = 'parcel:entered';
export const PARCEL_EXITED = 'parcel:exited';
export const LAND_PURCHASED = 'land:purchased';
export const BUILDING_PLACED = 'building:placed';
export const DISTRICT_ENTERED = 'district:entered';
export const TOKEN_SWAPPED = 'token:swapped';

// ============================================================================
// EVENT PAYLOAD TYPES
// ============================================================================

export interface PlayerMovedEvent {
  position: WorldPosition;
  parcelId: number;
  timestamp: number;
}

export interface ParcelEnteredEvent {
  parcelInfo: ParcelInfo;
  previousParcelId: number | null;
  timestamp: number;
}

export interface ParcelExitedEvent {
  parcelId: number;
  newParcelId: number;
  timestamp: number;
}

export interface LandPurchasedEvent {
  parcelId: number;
  buyer: string; // Ethereum address
  price: bigint;
  txHash: string;
  timestamp: number;
}

export interface BuildingPlacedEvent {
  parcelId: number;
  buildingType: string;
  owner: string;
  timestamp: number;
}

export interface DistrictEnteredEvent {
  district: 'defi' | 'creator' | 'dao' | 'ai' | 'neutral';
  parcelId: number;
  timestamp: number;
}

export interface TokenSwappedEvent {
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  amountOut: bigint;
  user: string;
  txHash: string;
  timestamp: number;
}

// ============================================================================
// EVENT PAYLOAD MAP
// ============================================================================

type EventPayloadMap = {
  [PLAYER_MOVED]: PlayerMovedEvent;
  [PARCEL_ENTERED]: ParcelEnteredEvent;
  [PARCEL_EXITED]: ParcelExitedEvent;
  [LAND_PURCHASED]: LandPurchasedEvent;
  [BUILDING_PLACED]: BuildingPlacedEvent;
  [DISTRICT_ENTERED]: DistrictEnteredEvent;
  [TOKEN_SWAPPED]: TokenSwappedEvent;
};

// ============================================================================
// EVENT BUS
// ============================================================================

type EventHandler<T = any> = (data: T) => void;

class WorldEventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private debug: boolean = false;

  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  on<K extends keyof EventPayloadMap>(
    event: K,
    handler: EventHandler<EventPayloadMap[K]>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(handler as EventHandler);

    if (this.debug) {
      console.log(`[WorldEvents] Subscribed to ${event}`, {
        totalListeners: this.listeners.get(event)!.size,
      });
    }

    // Return unsubscribe function
    return () => {
      this.off(event, handler);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof EventPayloadMap>(
    event: K,
    handler: EventHandler<EventPayloadMap[K]>
  ): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler as EventHandler);

      if (this.debug) {
        console.log(`[WorldEvents] Unsubscribed from ${event}`, {
          remainingListeners: handlers.size,
        });
      }
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit<K extends keyof EventPayloadMap>(
    event: K,
    data: EventPayloadMap[K]
  ): void {
    const handlers = this.listeners.get(event);

    if (this.debug) {
      console.log(`[WorldEvents] Emitting ${event}`, {
        data,
        listenerCount: handlers?.size || 0,
      });
    }

    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[WorldEvents] Error in ${event} handler:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event (or all events if no event specified)
   */
  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      if (this.debug) {
        console.log(`[WorldEvents] Cleared listeners for ${event}`);
      }
    } else {
      this.listeners.clear();
      if (this.debug) {
        console.log('[WorldEvents] Cleared all listeners');
      }
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }

  /**
   * Enable/disable debug logging
   */
  setDebug(enabled: boolean): void {
    this.debug = enabled;
    console.log(`[WorldEvents] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const worldEvents = new WorldEventBus();

// Enable debug in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // @ts-ignore - Expose for debugging
  window.worldEvents = worldEvents;
  console.log('[WorldEvents] Event bus initialized. Use window.worldEvents to debug.');
}

// ============================================================================
// REACT HOOK
// ============================================================================

/**
 * React hook for subscribing to world events
 * 
 * @example
 * useWorldEvent(PLAYER_MOVED, (data) => {
 *   console.log('Player at:', data.position);
 * });
 */
export function useWorldEvent<K extends keyof EventPayloadMap>(
  event: K,
  handler: EventHandler<EventPayloadMap[K]>,
  deps: React.DependencyList = []
) {
  React.useEffect(() => {
    const unsubscribe = worldEvents.on(event, handler);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// Add React import
import React from 'react';
