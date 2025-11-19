/**
 * Achievement Engine
 * Phase 6.1 - Achievement unlock detection and management
 */

import { worldEventBus } from '../events/eventBus';
import { WorldEventType } from '../events/eventTypes';
import type {
  ParcelEnteredEvent,
  DistrictEnteredEvent,
  InteractionCompletedEvent,
  SessionStartedEvent,
  AchievementUnlockedEvent,
} from '../events/eventPayloads';
import {
  ACHIEVEMENTS,
  AchievementId,
  type AchievementDefinition,
  type AchievementCondition,
} from './achievementDefinitions';
import { usePlayerState } from '../../state/player/usePlayerState';
import { XPSource } from '../xp/xpEvents';

export class AchievementEngine {
  private isRunning = false;
  private unsubscribers: Array<() => void> = [];
  private interactionCounts: Map<string, number> = new Map();
  private landmarkVisited = false;

  /**
   * Start the achievement engine
   */
  start(walletAddress: string, isMainnet: boolean): void {
    if (this.isRunning) {
      console.warn('[AchievementEngine] Already running');
      return;
    }

    this.isRunning = true;
    this.interactionCounts = new Map();
    this.landmarkVisited = false;

    console.log('[AchievementEngine] Started for wallet:', walletAddress, 'Mainnet:', isMainnet);

    // Subscribe to world events
    this.subscribeToEvents(walletAddress, isMainnet);

    // Check achievements that might already be unlocked
    this.checkInitialAchievements(walletAddress, isMainnet);
  }

  /**
   * Stop the achievement engine
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.interactionCounts.clear();

    // Unsubscribe from all events
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];

    console.log('[AchievementEngine] Stopped');
  }

  /**
   * Subscribe to world events
   */
  private subscribeToEvents(walletAddress: string, isMainnet: boolean): void {
    // Parcel exploration
    const unsubParcel = worldEventBus.on(
      WorldEventType.PARCEL_ENTERED,
      (event: ParcelEnteredEvent) => {
        if (!event.isFirstVisit) return;

        const parcelCount = usePlayerState.getState().stats.totalParcelsVisited;
        
        // Check parcel-count achievements
        this.checkAchievements(
          walletAddress,
          isMainnet,
          (condition) => condition.type === 'parcel_count' && condition.count === parcelCount
        );
      }
    );

    // District exploration
    const unsubDistrict = worldEventBus.on(
      WorldEventType.DISTRICT_ENTERED,
      (event: DistrictEnteredEvent) => {
        if (!event.isFirstVisit) return;

        const districtCount = usePlayerState.getState().stats.totalDistrictsVisited;
        
        // Check if landmark
        const isLandmark = this.isLandmarkDistrict(event.districtId);
        if (isLandmark && !this.landmarkVisited) {
          this.landmarkVisited = true;
          this.checkAchievements(
            walletAddress,
            isMainnet,
            (condition) => condition.type === 'landmark_visit'
          );
        }

        // Check district-count achievements
        this.checkAchievements(
          walletAddress,
          isMainnet,
          (condition) => condition.type === 'district_count' && condition.count === districtCount
        );

        // Check all-districts achievement
        this.checkAllDistrictsAchievement(walletAddress, isMainnet);
      }
    );

    // Interactions
    const unsubInteraction = worldEventBus.on(
      WorldEventType.INTERACTION_COMPLETED,
      (event: InteractionCompletedEvent) => {
        const interactionType = event.interactionType.toUpperCase();
        
        // Track interaction counts
        const currentCount = this.interactionCounts.get(interactionType) || 0;
        this.interactionCounts.set(interactionType, currentCount + 1);

        const totalInteractions = Array.from(this.interactionCounts.values())
          .reduce((sum, count) => sum + count, 0);

        // Check interaction-type achievements
        this.checkAchievements(
          walletAddress,
          isMainnet,
          (condition) => 
            condition.type === 'interaction_type' && 
            condition.interactionType === interactionType
        );

        // Check interaction-count achievements
        this.checkAchievements(
          walletAddress,
          isMainnet,
          (condition) => 
            condition.type === 'interaction_count' && 
            condition.count === totalInteractions
        );
      }
    );

    // Session start
    const unsubSession = worldEventBus.on(
      WorldEventType.SESSION_STARTED,
      (event: SessionStartedEvent) => {
        // First session achievement
        this.checkAchievements(
          walletAddress,
          isMainnet,
          (condition) => condition.type === 'first_session'
        );
      }
    );

    this.unsubscribers.push(unsubParcel, unsubDistrict, unsubInteraction, unsubSession);

    // Start session time checker
    this.startSessionTimeChecker(walletAddress, isMainnet);
  }

  /**
   * Check initial achievements (on startup)
   */
  private checkInitialAchievements(walletAddress: string, isMainnet: boolean): void {
    const state = usePlayerState.getState();

    // Check parcel achievements
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (this.isUnlocked(achievement.id)) return;
      
      const isValid = this.checkCondition(achievement.condition, state, isMainnet);
      if (isValid) {
        this.unlockAchievement(walletAddress, achievement);
      }
    });
  }

  /**
   * Start session time checker
   */
  private startSessionTimeChecker(walletAddress: string, isMainnet: boolean): void {
    const checkInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(checkInterval);
        return;
      }

      const totalSessionTime = usePlayerState.getState().stats.totalSessionTime;
      const minutes = totalSessionTime / 60000; // Convert to minutes

      // Check session-time achievements
      this.checkAchievements(
        walletAddress,
        isMainnet,
        (condition) => 
          condition.type === 'session_time' && 
          condition.minutes <= minutes
      );
    }, 30000); // Check every 30 seconds

    this.unsubscribers.push(() => clearInterval(checkInterval));
  }

  /**
   * Check achievements matching a condition
   */
  private checkAchievements(
    walletAddress: string,
    isMainnet: boolean,
    conditionMatcher: (condition: AchievementCondition) => boolean
  ): void {
    const state = usePlayerState.getState();

    Object.values(ACHIEVEMENTS).forEach(achievement => {
      // Skip if already unlocked
      if (this.isUnlocked(achievement.id)) return;

      // Skip mainnet-only achievements on testnet
      if (achievement.mainnetOnly && !isMainnet) return;

      // Check if condition matches
      if (!conditionMatcher(achievement.condition)) return;

      // Double-check the condition is actually met
      if (!this.checkCondition(achievement.condition, state, isMainnet)) return;

      // Unlock!
      this.unlockAchievement(walletAddress, achievement);
    });
  }

  /**
   * Check if a specific condition is met
   */
  private checkCondition(
    condition: AchievementCondition,
    state: ReturnType<typeof usePlayerState.getState>,
    isMainnet: boolean
  ): boolean {
    switch (condition.type) {
      case 'parcel_count':
        return state.stats.totalParcelsVisited >= condition.count;

      case 'district_count':
        return state.stats.totalDistrictsVisited >= condition.count;

      case 'all_districts':
        return this.hasVisitedAllDistricts(state);

      case 'landmark_visit':
        return this.landmarkVisited;

      case 'session_time': {
        const minutes = state.stats.totalSessionTime / 60000;
        return minutes >= condition.minutes;
      }

      case 'first_session':
        return state.session !== null;

      case 'interaction_count': {
        const total = Array.from(this.interactionCounts.values())
          .reduce((sum, count) => sum + count, 0);
        return total >= condition.count;
      }

      case 'interaction_type': {
        const count = this.interactionCounts.get(condition.interactionType) || 0;
        return count >= 1;
      }

      case 'profile_exists':
        // TODO: Check with Net Protocol when social layer is implemented
        return isMainnet && false; // Placeholder

      case 'message_sent':
        // TODO: Check with Net Protocol when social layer is implemented
        return isMainnet && false; // Placeholder

      default:
        return false;
    }
  }

  /**
   * Unlock an achievement
   */
  private unlockAchievement(walletAddress: string, achievement: AchievementDefinition): void {
    console.log(`[AchievementEngine] 🏆 Unlocked: ${achievement.title}`);

    // Update player state
    usePlayerState.getState().unlockAchievement(achievement.id);

    // Award XP bonus if any
    if (achievement.xpBonus > 0) {
      usePlayerState.getState().addXP(achievement.xpBonus);
    }

    // Emit achievement unlocked event
    const unlockEvent: AchievementUnlockedEvent = {
      type: WorldEventType.ACHIEVEMENT_UNLOCKED,
      timestamp: Date.now(),
      walletAddress,
      sessionId: usePlayerState.getState().session?.sessionId || 'unknown',
      achievementId: achievement.id,
      title: achievement.title,
      xpBonus: achievement.xpBonus,
      category: achievement.category,
    };

    worldEventBus.emit(unlockEvent);
  }

  /**
   * Check if achievement is unlocked
   */
  private isUnlocked(achievementId: AchievementId): boolean {
    const state = usePlayerState.getState();
    return state.achievements.has(achievementId);
  }

  /**
   * Check if landmark district
   */
  private isLandmarkDistrict(districtId: string): boolean {
    const landmarks = [
      'CORE_NEXUS',
      'VOID_PLAZA',
      'CREATOR_HUB',
      'GENESIS_POINT',
    ];
    return landmarks.includes(districtId);
  }

  /**
   * Check if all districts have been visited
   */
  private hasVisitedAllDistricts(state: ReturnType<typeof usePlayerState.getState>): boolean {
    // TODO: Replace with actual district count when district registry is available
    const TOTAL_DISTRICTS = 10; // Placeholder
    return state.stats.totalDistrictsVisited >= TOTAL_DISTRICTS;
  }

  /**
   * Check all-districts achievement separately
   */
  private checkAllDistrictsAchievement(walletAddress: string, isMainnet: boolean): void {
    this.checkAchievements(
      walletAddress,
      isMainnet,
      (condition) => condition.type === 'all_districts'
    );
  }
}

// Singleton instance
export const achievementEngine = new AchievementEngine();
