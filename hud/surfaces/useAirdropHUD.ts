/**
 * HUD Airdrop Surface
 * Phase 6.6 - Airdrop score display for HUD
 */

import { useEffect, useState } from 'react';
import { airdropEngine } from '../../world/airdrop/airdropEngine';
import type { AirdropScore } from '../../world/airdrop/airdropTypes';

/**
 * Hook for airdrop score display in HUD
 */
export function useAirdropHUD() {
  const [score, setScore] = useState<AirdropScore | null>(null);

  useEffect(() => {
    // Update score periodically
    const updateScore = () => {
      const currentScore = airdropEngine.getCurrentScore();
      setScore(currentScore);
    };

    updateScore();
    const interval = setInterval(updateScore, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (!score) {
    return {
      totalScore: 0,
      baseScore: 0,
      breakdown: null,
      rank: null,
      display: {
        score: '0',
        multipliers: '',
      },
    };
  }

  // Format multipliers
  const multiplierText = score.multipliers.length > 0
    ? score.multipliers.map(m => `${m.reason} (${m.value}x)`).join(', ')
    : 'None';

  return {
    totalScore: score.totalScore,
    baseScore: score.baseScore,
    breakdown: score.breakdown,
    rank: score.rank,
    multipliers: score.multipliers,
    
    // Formatted display
    display: {
      score: score.totalScore.toLocaleString(),
      multipliers: multiplierText,
      breakdown: {
        xp: score.breakdown.xpPoints.toFixed(0),
        achievements: score.breakdown.achievementPoints.toFixed(0),
        exploration: score.breakdown.explorationPoints.toFixed(0),
        session: score.breakdown.sessionPoints.toFixed(0),
        creator: score.breakdown.creatorTerminalPoints.toFixed(0),
      },
    },
  };
}
