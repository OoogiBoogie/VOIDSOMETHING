/**
 * Achievement React Hooks
 * Phase 6.1 - Achievement state and UI helpers
 */

import { useEffect, useState } from 'react';
import { usePlayerState } from '../../state/player/usePlayerState';
import { worldEventBus } from '../events/eventBus';
import { WorldEventType } from '../events/eventTypes';
import type { AchievementUnlockedEvent } from '../events/eventPayloads';
import { ACHIEVEMENTS, AchievementId, type AchievementDefinition } from './achievementDefinitions';

/**
 * Main achievements hook for components
 */
export function useAchievements() {
  const achievementsMap = usePlayerState((state) => state.achievements);
  
  // Convert Map to array of achievement IDs
  const unlockedIds = Array.from(achievementsMap.keys()) as AchievementId[];
  
  // Get new (unseen) achievements
  const newAchievements = Array.from(achievementsMap.entries())
    .filter(([_, data]) => data.isNew)
    .map(([id]) => id as AchievementId);

  return {
    // All unlocked achievement IDs
    unlockedIds,
    
    // Count
    count: unlockedIds.length,
    totalCount: Object.keys(ACHIEVEMENTS).length,
    
    // New achievements (unseen)
    newAchievements,
    newCount: newAchievements.length,
    
    // Helpers
    hasAchievement: (id: AchievementId) => achievementsMap.has(id),
    getAchievement: (id: AchievementId) => ACHIEVEMENTS[id],
    getAllAchievements: () => Object.values(ACHIEVEMENTS),
    
    // Completion percentage
    completionPercentage: (unlockedIds.length / Object.keys(ACHIEVEMENTS).length) * 100,
  };
}

/**
 * Hook for achievement unlock notifications (for HUD)
 */
export function useAchievementNotifications() {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      achievementId: AchievementId;
      title: string;
      xpBonus: number;
      timestamp: number;
    }>
  >([]);

  useEffect(() => {
    const unsubscribe = worldEventBus.on(
      WorldEventType.ACHIEVEMENT_UNLOCKED,
      (event: AchievementUnlockedEvent) => {
        const notification = {
          id: `${event.timestamp}-${event.achievementId}`,
          achievementId: event.achievementId as AchievementId,
          title: event.title,
          xpBonus: event.xpBonus,
          timestamp: event.timestamp,
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-remove after 5 seconds (achievements are more important)
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
      }
    );

    return unsubscribe;
  }, []);

  return notifications;
}

/**
 * Hook for tracking achievement progress
 */
export function useAchievementProgress(achievementId: AchievementId) {
  const achievement = ACHIEVEMENTS[achievementId];
  const state = usePlayerState();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Calculate progress based on condition
    const condition = achievement.condition;
    let current = 0;
    let required = 0;

    switch (condition.type) {
      case 'parcel_count':
        current = state.stats.totalParcelsVisited;
        required = condition.count;
        break;

      case 'district_count':
        current = state.stats.totalDistrictsVisited;
        required = condition.count;
        break;

      case 'session_time':
        current = state.stats.totalSessionTime / 60000; // minutes
        required = condition.minutes;
        break;

      case 'interaction_count':
        // TODO: Track interaction count when available
        current = 0;
        required = condition.count;
        break;

      default:
        // Binary achievements (yes/no)
        current = state.achievements.has(achievementId) ? 1 : 0;
        required = 1;
    }

    const percentage = Math.min(100, (current / required) * 100);
    setProgress(percentage);
  }, [achievementId, achievement, state]);

  return {
    progress,
    isUnlocked: state.achievements.has(achievementId),
    achievement,
  };
}

/**
 * Hook to mark achievements as seen
 */
export function useMarkAchievementSeen() {
  const markSeen = usePlayerState((state) => state.markAchievementSeen);

  return (achievementId: AchievementId) => {
    markSeen(achievementId);
  };
}

/**
 * Hook for recent achievements (last 10)
 */
export function useRecentAchievements(limit = 10) {
  const achievementsMap = usePlayerState((state) => state.achievements);
  
  // Convert to array and sort by unlock time (most recent first)
  const recentAchievements = Array.from(achievementsMap.entries())
    .map(([id, data]) => ({
      achievementId: id as AchievementId,
      ...data,
      definition: ACHIEVEMENTS[id as AchievementId],
    }))
    .sort((a, b) => b.unlockedAt - a.unlockedAt)
    .slice(0, limit);

  return recentAchievements;
}
