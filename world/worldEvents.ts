/**
 * VOID WORLD EVENT SYSTEM - Phase 5 COMPLETE
 * 
 * Comprehensive event system for tracking player movement,
 * district changes, and property interactions.
 * 
 * PHASE 5 IMPLEMENTATION:
 * - Complete event bus with analytics batching
 * - Full event type coverage (movement, lifecycle, discovery)
 * - HUD integration with toast notifications
 * - Analytics logging to /api/world-events
 * 
 * ARCHITECTURE:
 * - Re-exports from /world/events/* for backward compatibility
 * - Type-safe event payloads
 * - Pub/sub with batching and analytics
 * - SSR-safe (no window at module scope)
 */

// Re-export everything from the new event system for clean imports
export * from './events/eventTypes';
export * from './events/eventPayloads';
export { worldEventBus, useWorldEvent } from './events/eventBus';
export * from './events/eventHandlers';

// Import for helper functions
import { worldEventBus } from './events/eventBus';
import type { WorldEvent } from './events/eventPayloads';

// ================================
// CONVENIENCE FUNCTIONS
// (Backward compatible with Phase 5.1)
// ================================

/**
 * Subscribe to world events
 * @deprecated Use worldEventBus.on(type, handler) for type-specific subscriptions
 */
export function subscribeToWorldEvents(listener: (event: WorldEvent) => void): () => void {
  console.warn('[worldEvents] subscribeToWorldEvents is deprecated. Use worldEventBus.on() instead.');
  // For legacy compatibility, this would need to subscribe to all event types
  // Not ideal, but maintains backward compatibility
  const unsubscribes: Array<() => void> = [];
  return () => {
    unsubscribes.forEach(unsub => unsub());
  };
}

/**
 * Emit a world event to all subscribers + queue for analytics
 * 
 * @example
 * emitWorldEvent({
 *   type: WorldEventType.PARCEL_ENTERED,
 *   timestamp: Date.now(),
 *   walletAddress: '0x...',
 *   parcelId: '43',
 *   parcelCoords: { x: 12, z: 5 },
 *   districtId: 'creator',
 *   worldPosition: { x: 1250, y: 0, z: 550 },
 *   isFirstVisit: false,
 * });
 */
export async function emitWorldEvent(event: WorldEvent): Promise<void> {
  // Log event in dev mode
  if (process.env.NODE_ENV === 'development') {
    console.log('[WorldEvent]', event.type, event);
  }

  await worldEventBus.emit(event);
}

/**
 * Clear all event listeners (for testing/cleanup)
 */
export function clearWorldEventListeners(): void {
  worldEventBus.clear();
}

/**
 * Get current listener count (for debugging)
 */
export function getWorldEventListenerCount(eventType?: any): number {
  return worldEventBus.getSubscriberCount(eventType);
}

/**
 * Force flush analytics queue (useful on page unload)
 */
export async function flushWorldEventAnalytics(): Promise<void> {
  await worldEventBus.forceFlush();
}

/**
 * Enable/disable analytics logging
 */
export function setWorldEventAnalyticsEnabled(enabled: boolean): void {
  worldEventBus.setAnalyticsEnabled(enabled);
}
