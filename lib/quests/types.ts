/**
 * QUEST TYPES & INTERFACES
 * Quest system v1.5 - daily, weekly, milestone quests
 */

export type QuestFrequency = 'DAILY' | 'WEEKLY' | 'MILESTONE';

export type QuestCategory = 
  | 'MESSAGING'
  | 'SOCIAL'
  | 'AGENCY'
  | 'ECONOMY'
  | 'EXPLORATION'
  | 'CREATOR';

export type QuestObjectiveType =
  | 'SEND_MESSAGES' // Send N messages
  | 'SEND_DMS' // Send N DMs
  | 'JOIN_GUILD' // Join a guild
  | 'APPLY_GIGS' // Apply to N gigs
  | 'COMPLETE_GIG' // Complete a gig
  | 'STAKE_VOID' // Stake VOID
  | 'VISIT_ZONES' // Visit N zones
  | 'UNLOCK_DISTRICT' // Unlock a district
  | 'POST_CONTENT' // Post content
  | 'REACH_TIER'; // Reach tier N

export interface QuestObjective {
  type: QuestObjectiveType;
  target: number; // e.g., "Send 10 messages"
  current: number; // Current progress
  description: string;
}

export interface QuestReward {
  xp: number;
  badge?: string; // Optional badge unlock
  voidTokens?: number; // Optional VOID reward
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  frequency: QuestFrequency;
  objectives: QuestObjective[];
  reward: QuestReward;
  isActive: boolean;
  isCompleted: boolean;
  expiresAt?: number; // Timestamp (for daily/weekly)
  completedAt?: number; // Timestamp
}

export interface QuestProgress {
  questId: string;
  objectiveProgress: Record<string, number>; // objectiveType → current value
  isCompleted: boolean;
  completedAt?: number;
}
