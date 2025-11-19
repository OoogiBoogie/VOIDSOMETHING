/**
 * HUD XP Surface
 * Phase 6.6 - XP display and notifications for HUD
 */

import { useXP, useXPNotifications, useXPRateLimitWarnings } from '../../world/xp/useXP';

/**
 * Hook for XP display in HUD
 */
export function useXPHUD() {
  const { xp, level, xpForNextLevel, xpProgress, recentGains, lastGain } = useXP();
  const notifications = useXPNotifications();
  const rateLimitWarning = useXPRateLimitWarnings();

  return {
    // Current state
    currentXP: xp,
    currentLevel: level,
    nextLevelXP: xpForNextLevel,
    progressToNextLevel: xpProgress,
    
    // Recent activity
    lastGain,
    recentGains,
    
    // Notifications for toasts
    notifications,
    
    // Warnings
    rateLimitWarning,
    
    // Formatted display
    display: {
      xp: xp.toLocaleString(),
      level: `Level ${level}`,
      progress: `${Math.floor(xpProgress * 100)}%`,
    },
  };
}
