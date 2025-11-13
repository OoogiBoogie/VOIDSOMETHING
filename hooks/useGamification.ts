/**
 * useGamification Hook
 * Manages XP, quests, achievements, and Frame rewards
 */

import { useState, useEffect, useCallback } from 'react';
import { gamificationService } from '@/services/gamificationService';
import type { Quest, Achievement, PlayerXp } from '@/services/gamificationService';

export interface UseGamificationReturn {
  xp: PlayerXp | null;
  quests: Quest[];
  achievements: Achievement[];
  loading: boolean;
  awardXP: (amount: number, category: 'explorer' | 'builder' | 'operator', source: string) => Promise<void>;
  claimQuestReward: (questId: string) => Promise<void>;
  claimableFrameRewards: number;
  claimFrameRewards: () => Promise<number>;
}

export function useGamification(userId: string | null): UseGamificationReturn {
  const [xp, setXp] = useState<PlayerXp | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [claimableFrameRewards, setClaimableFrameRewards] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setXp(null);
      setQuests([]);
      setAchievements([]);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [xpData, questsData, achievementsData, frameRewards] = await Promise.all([
          gamificationService.getUserXP(userId),
          gamificationService.getQuests(userId),
          gamificationService.getAchievements(userId),
          gamificationService.getClaimableFrameRewards(userId),
        ]);

        setXp(xpData);
        setQuests(questsData);
        setAchievements(achievementsData);
        setClaimableFrameRewards(frameRewards.reduce((sum, r) => sum + r.amount, 0));
      } catch (error) {
        console.error('[useGamification] Load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const awardXP = useCallback(async (
    amount: number,
    category: 'explorer' | 'builder' | 'operator',
    source: string
  ) => {
    if (!userId) return;
    const updatedXp = await gamificationService.awardXP(userId, amount, category, source);
    setXp(updatedXp);
  }, [userId]);

  const claimQuestReward = useCallback(async (questId: string) => {
    if (!userId) return;
    await gamificationService.claimReward(questId, userId);
    const updatedQuests = await gamificationService.getQuests(userId);
    setQuests(updatedQuests);
  }, [userId]);

  const claimFrameRewards = useCallback(async (): Promise<number> => {
    if (!userId) return 0;
    const rewards = await gamificationService.getClaimableFrameRewards(userId);
    const rewardIds = rewards.map(r => r.id);
    const claimed = await gamificationService.claimFrameRewards(rewardIds);
    setClaimableFrameRewards(0);
    return claimed;
  }, [userId]);

  return {
    xp,
    quests,
    achievements,
    loading,
    awardXP,
    claimQuestReward,
    claimableFrameRewards,
    claimFrameRewards,
  };
}
