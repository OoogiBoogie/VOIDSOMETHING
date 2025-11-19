/**
 * Achievement Events
 * Phase 6.1 - Achievement unlock and tracking events
 */

import { WorldEventType } from '../events/eventTypes';
import type { BaseWorldEvent } from '../events/eventPayloads';
import type { AchievementId, AchievementCategory } from './achievementDefinitions';

export interface AchievementUnlockedEvent extends BaseWorldEvent {
  type: WorldEventType.ACHIEVEMENT_UNLOCKED;
  walletAddress: string;
  sessionId: string;
  achievementId: AchievementId;
  title: string;
  xpBonus: number;
  category: AchievementCategory;
}

export interface AchievementProgressEvent extends BaseWorldEvent {
  type: WorldEventType.ACHIEVEMENT_PROGRESS;
  walletAddress: string;
  sessionId: string;
  achievementId: AchievementId;
  progress: number; // 0-1
  current: number;
  required: number;
}
