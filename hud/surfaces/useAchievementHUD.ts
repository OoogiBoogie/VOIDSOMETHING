/**
 * HUD Achievement Surface
 * Phase 6.6 - Achievement display and notifications for HUD
 */

import { useAchievements, useAchievementNotifications, useRecentAchievements } from '../../world/achievements/useAchievements';

/**
 * Hook for achievement display in HUD
 */
export function useAchievementHUD() {
  const { count, totalCount, newCount, completionPercentage } = useAchievements();
  const notifications = useAchievementNotifications();
  const recentAchievements = useRecentAchievements(5);

  return {
    // Counts
    unlockedCount: count,
    totalCount,
    newCount,
    completionPercentage,
    
    // Recent unlocks
    recentAchievements,
    
    // Notifications for toasts
    notifications,
    
    // Formatted display
    display: {
      count: `${count}/${totalCount}`,
      completion: `${Math.floor(completionPercentage)}%`,
      newBadge: newCount > 0 ? `${newCount} new` : null,
    },
  };
}
