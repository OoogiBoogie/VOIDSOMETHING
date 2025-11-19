/**
 * PHASE 5 — WORLD EVENT BUS
 * 
 * Global event bus for The Void world system.
 * Supports subscription, emission, batching, and analytics logging.
 */

import React from "react";
import { WorldEvent } from "./eventPayloads";
import { WorldEventType } from "./eventTypes";

type EventHandler<T extends WorldEvent = WorldEvent> = (event: T) => void | Promise<void>;

interface Subscription {
  id: string;
  handler: EventHandler;
  once: boolean;
}

class WorldEventBus {
  private subscribers = new Map<WorldEventType, Subscription[]>();
  private eventQueue: WorldEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private batchInterval = 5000; // 5 seconds
  private isProcessing = false;
  
  // Analytics endpoint
  private analyticsEndpoint = "/api/world-events";
  private enableAnalytics = true;

  /**
   * Subscribe to a specific event type
   */
  on<T extends WorldEvent>(
    eventType: WorldEventType,
    handler: EventHandler<T>,
    once = false
  ): () => void {
    const subscription: Subscription = {
      id: `${eventType}-${Date.now()}-${Math.random()}`,
      handler: handler as EventHandler,
      once,
    };

    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }

    this.subscribers.get(eventType)!.push(subscription);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(eventType);
      if (subs) {
        const index = subs.findIndex((s) => s.id === subscription.id);
        if (index > -1) {
          subs.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to an event type, auto-unsubscribe after first trigger
   */
  once<T extends WorldEvent>(
    eventType: WorldEventType,
    handler: EventHandler<T>
  ): () => void {
    return this.on(eventType, handler, true);
  }

  /**
   * Unsubscribe from all handlers for a given event type
   */
  off(eventType: WorldEventType): void {
    this.subscribers.delete(eventType);
  }

  /**
   * Emit a world event
   */
  async emit<T extends WorldEvent>(event: T): Promise<void> {
    const subs = this.subscribers.get(event.type);

    if (subs && subs.length > 0) {
      const toRemove: string[] = [];

      for (const sub of subs) {
        try {
          await sub.handler(event);
          if (sub.once) {
            toRemove.push(sub.id);
          }
        } catch (error) {
          console.error(`[WorldEventBus] Error in handler for ${event.type}:`, error);
        }
      }

      // Remove one-time subscriptions
      if (toRemove.length > 0) {
        this.subscribers.set(
          event.type,
          subs.filter((s) => !toRemove.includes(s.id))
        );
      }
    }

    // Queue for analytics
    if (this.enableAnalytics) {
      this.queueAnalyticsEvent(event);
    }
  }

  /**
   * Queue event for batched analytics logging
   */
  private queueAnalyticsEvent(event: WorldEvent): void {
    this.eventQueue.push(event);

    // Start batch timer if not already running
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flushAnalytics();
      }, this.batchInterval);
    }
  }

  /**
   * Flush queued events to analytics endpoint
   */
  async flushAnalytics(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return;

    this.isProcessing = true;
    const batch = [...this.eventQueue];
    this.eventQueue = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      const response = await fetch(this.analyticsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: batch }),
      });

      if (!response.ok) {
        console.warn(`[WorldEventBus] Analytics failed: ${response.status}`);
        // Re-queue failed events (with limit to avoid infinite growth)
        if (batch.length < 1000) {
          this.eventQueue.unshift(...batch);
        }
      }
    } catch (error) {
      console.error("[WorldEventBus] Analytics error:", error);
      // Re-queue on network error
      if (batch.length < 1000) {
        this.eventQueue.unshift(...batch);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.subscribers.clear();
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Get current subscriber count for debugging
   */
  getSubscriberCount(eventType?: WorldEventType): number {
    if (eventType) {
      return this.subscribers.get(eventType)?.length || 0;
    }
    let total = 0;
    this.subscribers.forEach((subs) => {
      total += subs.length;
    });
    return total;
  }

  /**
   * Enable/disable analytics logging
   */
  setAnalyticsEnabled(enabled: boolean): void {
    this.enableAnalytics = enabled;
  }

  /**
   * Force flush analytics queue (useful on page unload)
   */
  async forceFlush(): Promise<void> {
    await this.flushAnalytics();
  }
}

// Global singleton instance
export const worldEventBus = new WorldEventBus();

// Convenience hook for React components
export function useWorldEvent<T extends WorldEvent>(
  eventType: WorldEventType,
  handler: EventHandler<T>,
  deps: React.DependencyList = []
): void {
  React.useEffect(() => {
    const unsubscribe = worldEventBus.on(eventType, handler);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
