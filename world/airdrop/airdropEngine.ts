/**
 * Airdrop Scoring Engine
 * Phase 6.2 - Real-time airdrop score calculation
 */

import { worldEventBus } from '../events/eventBus';
import { WorldEventType } from '../events/eventTypes';
import type { InteractionCompletedEvent } from '../events/eventPayloads';
import { usePlayerState } from '../../state/player/usePlayerState';
import { airdropRules } from './airdropRules';
import type { AirdropScore } from './airdropTypes';

export interface AirdropScoreUpdatedEvent {
  type: 'AIRDROP_SCORE_UPDATED';
  timestamp: number;
  walletAddress: string;
  sessionId: string;
  previousScore: number;
  newScore: number;
  score: AirdropScore;
}

export class AirdropEngine {
  private isRunning = false;
  private currentScore: AirdropScore | null = null;
  private lastUpdateTime = 0;
  private updateThrottle = 30000; // Update max every 30 seconds
  private creatorTerminalUses = 0;

  /**
   * Start the airdrop engine
   */
  start(walletAddress: string, hasMainnetProfile: boolean, isBetaUser: boolean): void {
    if (this.isRunning) {
      console.warn('[AirdropEngine] Already running');
      return;
    }

    this.isRunning = true;
    this.creatorTerminalUses = 0;
    this.lastUpdateTime = 0;

    console.log('[AirdropEngine] Started for wallet:', walletAddress);

    // Calculate initial score
    this.updateScore(walletAddress, hasMainnetProfile, isBetaUser, true);

    // Subscribe to relevant events
    this.subscribeToEvents(walletAddress, hasMainnetProfile, isBetaUser);
  }

  /**
   * Stop the airdrop engine
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.currentScore = null;

    console.log('[AirdropEngine] Stopped');
  }

  /**
   * Subscribe to score-affecting events
   */
  private subscribeToEvents(walletAddress: string, hasMainnetProfile: boolean, isBetaUser: boolean): void {
    // Update on XP gains
    worldEventBus.on(WorldEventType.XP_GAINED, () => {
      this.throttledUpdate(walletAddress, hasMainnetProfile, isBetaUser);
    });

    // Update on achievement unlocks
    worldEventBus.on(WorldEventType.ACHIEVEMENT_UNLOCKED, () => {
      this.throttledUpdate(walletAddress, hasMainnetProfile, isBetaUser);
    });

    // Update on exploration
    worldEventBus.on(WorldEventType.PARCEL_ENTERED, () => {
      this.throttledUpdate(walletAddress, hasMainnetProfile, isBetaUser);
    });

    worldEventBus.on(WorldEventType.DISTRICT_ENTERED, () => {
      this.throttledUpdate(walletAddress, hasMainnetProfile, isBetaUser);
    });

    // Track creator terminal uses
    worldEventBus.on(WorldEventType.INTERACTION_COMPLETED, (event) => {
      const interactionEvent = event as InteractionCompletedEvent;
      if (interactionEvent.interactionType.toUpperCase() === 'CREATOR_TERMINAL') {
        this.creatorTerminalUses++;
        this.throttledUpdate(walletAddress, hasMainnetProfile, isBetaUser);
      }
    });
  }

  /**
   * Throttled score update
   */
  private throttledUpdate(walletAddress: string, hasMainnetProfile: boolean, isBetaUser: boolean): void {
    const now = Date.now();
    if (now - this.lastUpdateTime < this.updateThrottle) {
      return; // Too soon, skip
    }

    this.updateScore(walletAddress, hasMainnetProfile, isBetaUser);
  }

  /**
   * Calculate and update airdrop score
   */
  private updateScore(
    walletAddress: string,
    hasMainnetProfile: boolean,
    isBetaUser: boolean,
    skipEmit = false
  ): void {
    const state = usePlayerState.getState();
    
    // Gather stats
    const stats = {
      totalXP: state.stats.totalXP,
      achievementsCount: state.achievements.size,
      districtsVisited: state.stats.totalDistrictsVisited,
      parcelsVisited: state.stats.totalParcelsVisited,
      totalSessionMinutes: state.stats.totalSessionTime / 60000,
      creatorTerminalUses: this.creatorTerminalUses,
      hasMainnetProfile,
      isBetaUser,
    };

    // Calculate score
    const previousScore = this.currentScore?.totalScore || 0;
    const newScore = airdropRules.calculateScore(stats);
    newScore.walletAddress = walletAddress;

    this.currentScore = newScore;
    this.lastUpdateTime = Date.now();

    // Emit update event
    if (!skipEmit) {
      const updateEvent: AirdropScoreUpdatedEvent = {
        type: 'AIRDROP_SCORE_UPDATED',
        timestamp: Date.now(),
        walletAddress,
        sessionId: state.session?.sessionId || 'unknown',
        previousScore,
        newScore: newScore.totalScore,
        score: newScore,
      };

      worldEventBus.emit(updateEvent as any);

      console.log(
        `[AirdropEngine] Score updated: ${previousScore} → ${newScore.totalScore} (Δ ${newScore.totalScore - previousScore})`
      );
    }
  }

  /**
   * Get current score
   */
  getCurrentScore(): AirdropScore | null {
    return this.currentScore ? { ...this.currentScore } : null;
  }

  /**
   * Force score recalculation
   */
  forceUpdate(walletAddress: string, hasMainnetProfile: boolean, isBetaUser: boolean): void {
    this.lastUpdateTime = 0; // Reset throttle
    this.updateScore(walletAddress, hasMainnetProfile, isBetaUser);
  }
}

// Singleton instance
export const airdropEngine = new AirdropEngine();
