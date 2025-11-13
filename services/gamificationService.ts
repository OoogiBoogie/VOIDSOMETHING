/**
 * Gamification Service
 * Handles XP, quests, achievements, Frame rewards, and progression
 */

import type { PlayerXp } from '@/hud/HUDTypes';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  status: QuestStatus;
  progress: number;
  maxProgress: number;
  expiresAt?: Date;
  creatorId?: string; // For creator-specific quests
}

export type QuestCategory = 'explorer' | 'builder' | 'operator' | 'social' | 'creator';
export type QuestStatus = 'available' | 'active' | 'completed' | 'claimed' | 'expired';

export interface QuestRequirement {
  type: 'visit' | 'interact' | 'collect' | 'social' | 'trade' | 'build';
  target?: string;
  amount: number;
}

export interface QuestReward {
  type: 'xp' | 'frame' | 'token' | 'cosmetic' | 'achievement';
  category?: 'explorer' | 'builder' | 'operator';
  amount: number;
  tokenAddress?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  iconUrl?: string;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface FrameReward {
  id: string;
  userId: string;
  amount: number;
  source: FrameSource;
  sourceId?: string;
  claimable: boolean;
  claimed: boolean;
  earnedAt: Date;
  claimedAt?: Date;
}

export type FrameSource = 'quest' | 'achievement' | 'tutorial' | 'event' | 'staking' | 'creator-mission';

export interface XPHistory {
  id: string;
  userId: string;
  category: 'explorer' | 'builder' | 'operator' | 'total';
  amount: number;
  source: string;
  timestamp: Date;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

class GamificationService {
  private userXP: Map<string, PlayerXp> = new Map();
  private quests: Map<string, Quest> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private frameRewards: FrameReward[] = [];

  /**
   * Get user's XP data
   */
  async getUserXP(userId: string): Promise<PlayerXp> {
    // TODO: Replace with actual API call from gamification_db
    if (!this.userXP.has(userId)) {
      this.userXP.set(userId, {
        totalXp: 0,
        explorerXp: 0,
        builderXp: 0,
        operatorXp: 0,
        level: 1,
      });
    }

    return this.userXP.get(userId)!;
  }

  /**
   * Award XP to user
   */
  async awardXP(
    userId: string,
    amount: number,
    category: 'explorer' | 'builder' | 'operator',
    source: string
  ): Promise<PlayerXp> {
    // TODO: Replace with actual API call
    const xp = await this.getUserXP(userId);

    xp.totalXp += amount;
    xp[`${category}Xp`] += amount;
    xp.level = this.calculateLevel(xp.totalXp);

    // Log XP history
    const history: XPHistory = {
      id: `xp-${Date.now()}`,
      userId,
      category,
      amount,
      source,
      timestamp: new Date(),
    };

    return xp;
  }

  /**
   * Get available quests for user
   */
  async getQuests(userId: string, filter?: {
    category?: QuestCategory;
    status?: QuestStatus;
    creatorId?: string;
  }): Promise<Quest[]> {
    // TODO: Replace with actual API call
    let quests = Array.from(this.quests.values());

    if (filter) {
      if (filter.category) {
        quests = quests.filter(q => q.category === filter.category);
      }
      if (filter.status) {
        quests = quests.filter(q => q.status === filter.status);
      }
      if (filter.creatorId) {
        quests = quests.filter(q => q.creatorId === filter.creatorId);
      }
    }

    return quests;
  }

  /**
   * Get creator-specific missions
   */
  async getCreatorMissions(creatorId: string): Promise<Quest[]> {
    return this.getQuests('any', { creatorId });
  }

  /**
   * Update quest progress
   */
  async updateQuestProgress(
    questId: string,
    progress: number
  ): Promise<Quest> {
    // TODO: Replace with actual API call
    const quest = this.quests.get(questId);
    if (!quest) {
      throw new Error('Quest not found');
    }

    quest.progress = Math.min(progress, quest.maxProgress);
    
    if (quest.progress >= quest.maxProgress && quest.status === 'active') {
      quest.status = 'completed';
      // Trigger notification
    }

    return quest;
  }

  /**
   * Claim quest rewards
   */
  async claimReward(questId: string, userId: string): Promise<QuestReward[]> {
    // TODO: Replace with actual API call
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'completed') {
      throw new Error('Quest not completable');
    }

    // Award rewards
    for (const reward of quest.rewards) {
      if (reward.type === 'xp' && reward.category) {
        await this.awardXP(userId, reward.amount, reward.category, `quest-${questId}`);
      } else if (reward.type === 'frame') {
        await this.awardFrame(userId, reward.amount, 'quest', questId);
      }
    }

    quest.status = 'claimed';
    return quest.rewards;
  }

  /**
   * Get user achievements
   */
  async getAchievements(userId: string): Promise<Achievement[]> {
    // TODO: Replace with actual API call
    return Array.from(this.achievements.values());
  }

  /**
   * Unlock achievement
   */
  async unlockAchievement(
    userId: string,
    achievementId: string
  ): Promise<Achievement> {
    // TODO: Replace with actual API call
    const achievement = this.achievements.get(achievementId);
    if (!achievement) {
      throw new Error('Achievement not found');
    }

    achievement.unlockedAt = new Date();
    return achievement;
  }

  /**
   * Award Frame tokens
   */
  async awardFrame(
    userId: string,
    amount: number,
    source: FrameSource,
    sourceId?: string
  ): Promise<FrameReward> {
    // TODO: Replace with actual API call
    const reward: FrameReward = {
      id: `frame-${Date.now()}`,
      userId,
      amount,
      source,
      sourceId,
      claimable: true,
      claimed: false,
      earnedAt: new Date(),
    };

    this.frameRewards.push(reward);
    return reward;
  }

  /**
   * Get claimable Frame rewards
   */
  async getClaimableFrameRewards(userId: string): Promise<FrameReward[]> {
    // TODO: Replace with actual API call
    return this.frameRewards.filter(
      r => r.userId === userId && r.claimable && !r.claimed
    );
  }

  /**
   * Claim Frame rewards
   */
  async claimFrameRewards(rewardIds: string[]): Promise<number> {
    // TODO: Replace with actual blockchain transaction
    let totalClaimed = 0;

    for (const id of rewardIds) {
      const reward = this.frameRewards.find(r => r.id === id);
      if (reward && reward.claimable && !reward.claimed) {
        reward.claimed = true;
        reward.claimedAt = new Date();
        totalClaimed += reward.amount;
      }
    }

    return totalClaimed;
  }

  /**
   * Get daily tasks
   */
  async getDailyTasks(userId: string): Promise<DailyTask[]> {
    // TODO: Replace with actual API call
    // TODO: Reset daily at midnight UTC

    return [
      {
        id: 'daily-1',
        title: 'Visit 3 Parcels',
        description: 'Explore different land parcels',
        xpReward: 50,
        completed: false,
        progress: 0,
        maxProgress: 3,
      },
      {
        id: 'daily-2',
        title: 'Chat with Friends',
        description: 'Send 5 chat messages',
        xpReward: 25,
        completed: false,
        progress: 0,
        maxProgress: 5,
      },
    ];
  }

  /**
   * Calculate level from total XP
   */
  private calculateLevel(totalXp: number): number {
    // Simple formula: level = sqrt(XP / 100)
    return Math.floor(Math.sqrt(totalXp / 100)) + 1;
  }

  /**
   * Get XP needed for next level
   */
  async getXPForNextLevel(currentLevel: number): Promise<number> {
    const nextLevel = currentLevel + 1;
    const xpNeeded = Math.pow(nextLevel - 1, 2) * 100;
    return xpNeeded;
  }
}

// Export singleton instance
export const gamificationService = new GamificationService();
