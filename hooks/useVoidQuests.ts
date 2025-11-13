/**
 * HOOK: useVoidQuests
 * Quest system - tracks daily, weekly, and milestone quests
 * Integrates with event system for automatic progress
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { shouldUseMockData } from '@/config/voidConfig';
import {
  DAILY_QUESTS,
  WEEKLY_QUESTS,
  MILESTONE_QUESTS,
  getQuestById,
} from '@/lib/quests/questDefinitions';
import type { Quest, QuestProgress } from '@/lib/quests/types';
import { onVoidEvent, emitVoidEvent } from '@/lib/events/voidEvents';

export function useVoidQuests() {
  const { address } = useAccount();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load quests from storage/contract
   */
  const loadQuests = useCallback(async () => {
    if (!address) {
      setQuests([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (shouldUseMockData()) {
      // Mock mode: Load from localStorage
      const storageKey = `void_quests_${address}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setQuests(parsed);
        } catch (error) {
          console.error('[useVoidQuests] Failed to parse stored quests:', error);
          // Initialize with default quests
          const defaultQuests = [...DAILY_QUESTS, ...WEEKLY_QUESTS, ...MILESTONE_QUESTS];
          setQuests(defaultQuests);
          localStorage.setItem(storageKey, JSON.stringify(defaultQuests));
        }
      } else {
        // Initialize with default quests
        const defaultQuests = [...DAILY_QUESTS, ...WEEKLY_QUESTS, ...MILESTONE_QUESTS];
        setQuests(defaultQuests);
        localStorage.setItem(storageKey, JSON.stringify(defaultQuests));
      }
    } else {
      // Live mode: TODO - Load from VoidQuests contract
      console.log('[useVoidQuests] Live mode: Contract call would happen here');
      const defaultQuests = [...DAILY_QUESTS, ...WEEKLY_QUESTS, ...MILESTONE_QUESTS];
      setQuests(defaultQuests);
    }

    setIsLoading(false);
  }, [address]);

  /**
   * Update quest progress
   */
  const updateQuestProgress = useCallback(
    (questId: string, objectiveIndex: number, newProgress: number) => {
      if (!address) return;

      setQuests((prev) => {
        const updated = prev.map((quest) => {
          if (quest.id !== questId) return quest;

          const objectives = [...quest.objectives];
          objectives[objectiveIndex] = {
            ...objectives[objectiveIndex],
            current: Math.min(newProgress, objectives[objectiveIndex].target),
          };

          // Check if quest is completed
          const isCompleted = objectives.every((obj) => obj.current >= obj.target);
          const wasCompleted = quest.isCompleted;

          // Emit quest completion event
          if (isCompleted && !wasCompleted) {
            emitVoidEvent({
              type: 'QUEST_COMPLETE',
              address,
              payload: {
                questId: quest.id,
                questTitle: quest.title,
                xpReward: quest.reward.xp,
              },
            });
          }

          return {
            ...quest,
            objectives,
            isCompleted,
            completedAt: isCompleted && !quest.completedAt ? Date.now() : quest.completedAt,
          };
        });

        // Save to storage (mock mode)
        if (shouldUseMockData()) {
          const storageKey = `void_quests_${address}`;
          localStorage.setItem(storageKey, JSON.stringify(updated));
        }

        return updated;
      });
    },
    [address]
  );

  /**
   * Increment objective progress by 1
   */
  const incrementQuestProgress = useCallback(
    (questId: string, objectiveIndex: number = 0) => {
      const quest = quests.find((q) => q.id === questId);
      if (!quest) return;

      const currentProgress = quest.objectives[objectiveIndex].current;
      updateQuestProgress(questId, objectiveIndex, currentProgress + 1);
    },
    [quests, updateQuestProgress]
  );

  /**
   * Reset daily quests (called at midnight)
   */
  const resetDailyQuests = useCallback(() => {
    setQuests((prev) => {
      const updated = prev.map((quest) => {
        if (quest.frequency !== 'DAILY') return quest;

        return {
          ...quest,
          objectives: quest.objectives.map((obj) => ({ ...obj, current: 0 })),
          isCompleted: false,
          completedAt: undefined,
        };
      });

      if (shouldUseMockData() && address) {
        const storageKey = `void_quests_${address}`;
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }

      return updated;
    });
  }, [address]);

  /**
   * Reset weekly quests (called every Monday)
   */
  const resetWeeklyQuests = useCallback(() => {
    setQuests((prev) => {
      const updated = prev.map((quest) => {
        if (quest.frequency !== 'WEEKLY') return quest;

        return {
          ...quest,
          objectives: quest.objectives.map((obj) => ({ ...obj, current: 0 })),
          isCompleted: false,
          completedAt: undefined,
        };
      });

      if (shouldUseMockData() && address) {
        const storageKey = `void_quests_${address}`;
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }

      return updated;
    });
  }, [address]);

  /**
   * Get quests by category
   */
  const getQuestsByCategory = useCallback(
    (category: Quest['category']) => {
      return quests.filter((q) => q.category === category);
    },
    [quests]
  );

  /**
   * Get active quests
   */
  const getActiveQuests = useCallback(() => {
    return quests.filter((q) => q.isActive && !q.isCompleted);
  }, [quests]);

  /**
   * Get completed quests
   */
  const getCompletedQuests = useCallback(() => {
    return quests.filter((q) => q.isCompleted);
  }, [quests]);

  // Load quests on mount
  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  // Auto-progress quests on XP events
  useEffect(() => {
    if (!address) return;

    const unsubscribe = onVoidEvent('SCORE_EVENT', (event) => {
      if (event.address.toLowerCase() !== address.toLowerCase()) return;

      const eventType = event.payload.eventType;

      // Map event types to quest IDs
      const questMapping: Record<string, string[]> = {
        MESSAGE_GLOBAL: ['daily_messaging'], // Daily Chatter
        MESSAGE_DM: ['daily_social'], // Direct Connect
        ZONE_VISITED: ['daily_exploration'], // Explorer
        GIG_APPLIED: ['weekly_agency', 'milestone_first_gig'], // Job Hunter, Freelancer
        GIG_COMPLETED: ['milestone_first_gig'], // Freelancer milestone
        GUILD_JOINED: ['milestone_first_guild'], // Guild Initiate
      };

      const questIds = questMapping[eventType];
      if (questIds) {
        questIds.forEach((questId) => {
          incrementQuestProgress(questId, 0);
        });
      }
    });

    return unsubscribe;
  }, [address, incrementQuestProgress]);

  return {
    quests,
    isLoading,
    updateQuestProgress,
    incrementQuestProgress,
    resetDailyQuests,
    resetWeeklyQuests,
    getQuestsByCategory,
    getActiveQuests,
    getCompletedQuests,
    refresh: loadQuests,
  };
}
