/**
 * VOID EVENT SYSTEM
 * Central event emitter for all VOID actions (XP, quests, airdrops, unlocks)
 */

export type VoidEventType =
  | 'SCORE_EVENT' // XP granted
  | 'QUEST_PROGRESS' // Quest objective updated
  | 'QUEST_COMPLETE' // Quest completed
  | 'TIER_CHANGE' // Tier upgraded
  | 'ZONE_UNLOCK' // New zone unlocked
  | 'AIRDROP_UPDATE' // Airdrop weight changed
  | 'GUILD_ACTION' // Guild-related action
  | 'CREATOR_ACTION'; // Creator-related action

export interface VoidEvent {
  type: VoidEventType;
  address: string;
  payload: any;
  timestamp?: number;
}

type EventListener = (event: VoidEvent) => void;

class VoidEventEmitter {
  private listeners: Map<VoidEventType, Set<EventListener>> = new Map();

  /**
   * Subscribe to event type
   */
  on(eventType: VoidEventType, listener: EventListener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => this.off(eventType, listener);
  }

  /**
   * Unsubscribe from event type
   */
  off(eventType: VoidEventType, listener: EventListener) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit event
   */
  emit(event: VoidEvent) {
    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp || Date.now(),
    };

    console.log('[VoidEvent]', eventWithTimestamp.type, eventWithTimestamp);

    // Notify type-specific listeners
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => listener(eventWithTimestamp));
    }

    // Store in localStorage for debugging (last 100 events)
    this.storeEvent(eventWithTimestamp);
  }

  /**
   * Store event in localStorage for debugging
   */
  private storeEvent(event: VoidEvent) {
    try {
      const key = 'void_events';
      const stored = localStorage.getItem(key);
      const events: VoidEvent[] = stored ? JSON.parse(stored) : [];
      
      events.push(event);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.shift();
      }
      
      localStorage.setItem(key, JSON.stringify(events));
    } catch (error) {
      console.error('[VoidEventEmitter] Failed to store event:', error);
    }
  }

  /**
   * Get recent events (for debugging)
   */
  getRecentEvents(type?: VoidEventType): VoidEvent[] {
    try {
      const key = 'void_events';
      const stored = localStorage.getItem(key);
      const events: VoidEvent[] = stored ? JSON.parse(stored) : [];
      
      if (type) {
        return events.filter((e) => e.type === type);
      }
      
      return events;
    } catch (error) {
      console.error('[VoidEventEmitter] Failed to get recent events:', error);
      return [];
    }
  }
}

// Global event emitter singleton
export const voidEventEmitter = new VoidEventEmitter();

/**
 * Convenience function to emit void event
 */
export function emitVoidEvent(event: VoidEvent) {
  voidEventEmitter.emit(event);
}

/**
 * Convenience function to subscribe to void events
 */
export function onVoidEvent(eventType: VoidEventType, listener: EventListener) {
  return voidEventEmitter.on(eventType, listener);
}
