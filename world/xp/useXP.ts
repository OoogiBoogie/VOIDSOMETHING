/**
 * XP React Hooks
 * Phase 6.0 - XP state and UI helpers
 */

import { useEffect, useState } from 'react';
import { usePlayerState } from '../../state/player/usePlayerState';
import { worldEventBus } from '../events/eventBus';
import { WorldEventType } from '../events/eventTypes';
import type { XPGainedEvent, XPCapReachedEvent } from '../events/eventPayloads';
import { xpEngine } from './xpEngine';

/**
 * Main XP hook for components
 */
export function useXP() {
  const xp = usePlayerState((state) => state.stats.totalXP || 0);
  const level = usePlayerState((state) => state.stats.level || 1);
  
  const [recentGains, setRecentGains] = useState<XPGainedEvent[]>([]);
  const [sessionStats, setSessionStats] = useState(xpEngine.getSessionStats());

  // Listen to XP gained events
  useEffect(() => {
    const unsubscribe = worldEventBus.on(
      WorldEventType.XP_GAINED,
      (event: XPGainedEvent) => {
        // Add to recent gains
        setRecentGains(prev => {
          const updated = [event, ...prev].slice(0, 10); // Keep last 10
          return updated;
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
          setRecentGains(prev => prev.filter(e => e !== event));
        }, 5000);
      }
    );

    return unsubscribe;
  }, []);

  // Update session stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionStats(xpEngine.getSessionStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    // Current state
    xp,
    level,
    
    // Recent activity
    recentGains,
    lastGain: recentGains[0] || null,
    
    // Session info
    sessionStats,
    
    // Calculations
    xpForNextLevel: calculateXPForLevel(level + 1),
    xpProgress: calculateLevelProgress(xp, level),
    
    // Helpers
    formatXP: (amount: number) => amount.toLocaleString(),
  };
}

/**
 * Hook for XP gain notifications (for HUD)
 */
export function useXPNotifications() {
  const [notifications, setNotifications] = useState<
    Array<{ id: string; amount: number; source: string; timestamp: number }>
  >([]);

  useEffect(() => {
    const unsubscribe = worldEventBus.on(
      WorldEventType.XP_GAINED,
      (event: XPGainedEvent) => {
        const notification = {
          id: `${event.timestamp}-${event.source}`,
          amount: event.amount,
          source: event.sourceDetails || event.source,
          timestamp: event.timestamp,
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-remove after 3 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 3000);
      }
    );

    return unsubscribe;
  }, []);

  return notifications;
}

/**
 * Hook for XP rate limit warnings
 */
export function useXPRateLimitWarnings() {
  const [warning, setWarning] = useState<{
    cappedAmount: number;
    maxPerMinute: number;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = worldEventBus.on(
      WorldEventType.XP_CAP_REACHED,
      (event: XPCapReachedEvent) => {
        setWarning({
          cappedAmount: event.cappedAmount,
          maxPerMinute: event.maxPerMinute,
        });

        // Clear warning after 5 seconds
        setTimeout(() => setWarning(null), 5000);
      }
    );

    return unsubscribe;
  }, []);

  return warning;
}

/**
 * Calculate XP required for a given level
 */
function calculateXPForLevel(level: number): number {
  // Simple exponential curve: level^2 * 100
  // Level 1 = 100 XP, Level 2 = 400 XP, Level 3 = 900 XP, etc.
  return level * level * 100;
}

/**
 * Calculate progress towards next level (0-1)
 */
function calculateLevelProgress(currentXP: number, currentLevel: number): number {
  const currentLevelXP = calculateXPForLevel(currentLevel);
  const nextLevelXP = calculateXPForLevel(currentLevel + 1);
  const xpIntoLevel = currentXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  
  return Math.max(0, Math.min(1, xpIntoLevel / xpNeeded));
}

/**
 * Calculate level from total XP
 */
export function calculateLevelFromXP(xp: number): number {
  let level = 1;
  while (calculateXPForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}
