/**
 * XP Engine
 * Phase 6.0 - XP event processing and state management
 */

import { worldEventBus } from '../events/eventBus';
import { WorldEventType } from '../events/eventTypes';
import type { 
  ParcelEnteredEvent, 
  DistrictEnteredEvent,
  InteractionCompletedEvent,
  XPGainedEvent,
  XPCapReachedEvent,
} from '../events/eventPayloads';
import { XPSource } from './xpEvents';
import { xpRules } from './xpRules';
import { usePlayerState } from '../../state/player/usePlayerState';

export class XPEngine {
  private isRunning = false;
  private sessionStartTime: number | null = null;
  private lastSessionXPTime: number | null = null;
  private longSessionBonusGranted = false;
  private unsubscribers: Array<() => void> = [];

  /**
   * Start the XP engine
   */
  start(walletAddress: string): void {
    if (this.isRunning) {
      console.warn('[XPEngine] Already running');
      return;
    }

    this.isRunning = true;
    this.sessionStartTime = Date.now();
    this.lastSessionXPTime = Date.now();
    this.longSessionBonusGranted = false;

    console.log('[XPEngine] Started for wallet:', walletAddress);

    // Subscribe to world events
    this.subscribeToEvents(walletAddress);

    // Start session time tracker
    this.startSessionTimer(walletAddress);
  }

  /**
   * Stop the XP engine
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.sessionStartTime = null;
    this.lastSessionXPTime = null;
    this.longSessionBonusGranted = false;

    // Unsubscribe from all events
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];

    console.log('[XPEngine] Stopped');
  }

  /**
   * Subscribe to world events
   */
  private subscribeToEvents(walletAddress: string): void {
    // Parcel exploration
    const unsubParcel = worldEventBus.on(
      WorldEventType.PARCEL_ENTERED,
      (event: ParcelEnteredEvent) => {
        if (event.isFirstVisit) {
          this.awardXP(
            walletAddress,
            XPSource.PARCEL_FIRST_VISIT,
            `Parcel (${event.parcelCoords.x}, ${event.parcelCoords.z})`
          );
        }
      }
    );

    // District exploration
    const unsubDistrict = worldEventBus.on(
      WorldEventType.DISTRICT_ENTERED,
      (event: DistrictEnteredEvent) => {
        if (event.isFirstVisit) {
          // Check if landmark
          const isLandmark = xpRules.isLandmarkDistrict(event.districtId);
          const source = isLandmark 
            ? XPSource.LANDMARK_FIRST_VISIT 
            : XPSource.DISTRICT_FIRST_VISIT;
          
          this.awardXP(
            walletAddress,
            source,
            `District: ${event.districtName}`
          );
        }
      }
    );

    // Interactions
    const unsubInteraction = worldEventBus.on(
      WorldEventType.INTERACTION_COMPLETED,
      (event: InteractionCompletedEvent) => {
        let source: XPSource;
        const interactionType = event.interactionType.toUpperCase();
        
        switch (interactionType) {
          case 'CREATOR_TERMINAL':
            source = XPSource.CREATOR_TERMINAL;
            break;
          case 'NPC':
            source = XPSource.NPC_INTERACTION;
            break;
          case 'INFO_TERMINAL':
          case 'STORY_TERMINAL':
            source = XPSource.INFO_TERMINAL;
            break;
          default:
            return; // No XP for unknown types
        }

        this.awardXP(
          walletAddress,
          source,
          `Interaction: ${event.interactionType}`
        );
      }
    );

    this.unsubscribers.push(unsubParcel, unsubDistrict, unsubInteraction);
  }

  /**
   * Start session time tracker
   */
  private startSessionTimer(walletAddress: string): void {
    const checkInterval = setInterval(() => {
      if (!this.isRunning || !this.sessionStartTime || !this.lastSessionXPTime) {
        clearInterval(checkInterval);
        return;
      }

      const now = Date.now();
      const config = xpRules.getConfig();
      
      // Check for 10-minute interval XP
      const minutesSinceLastXP = (now - this.lastSessionXPTime) / 60000;
      if (minutesSinceLastXP >= config.sessionInterval) {
        this.awardXP(
          walletAddress,
          XPSource.SESSION_TIME_MILESTONE,
          `Active for ${config.sessionInterval} minutes`
        );
        this.lastSessionXPTime = now;
      }

      // Check for long session bonus (one-time)
      const totalSessionMinutes = (now - this.sessionStartTime) / 60000;
      if (
        !this.longSessionBonusGranted &&
        totalSessionMinutes >= config.longSessionThreshold
      ) {
        this.awardXP(
          walletAddress,
          XPSource.LONG_SESSION_BONUS,
          `${config.longSessionThreshold} minute session`
        );
        this.longSessionBonusGranted = true;
      }
    }, 60000); // Check every minute

    // Clean up on stop
    this.unsubscribers.push(() => clearInterval(checkInterval));
  }

  /**
   * Award XP to player
   */
  private awardXP(
    walletAddress: string,
    source: XPSource,
    sourceDetails?: string
  ): void {
    // Calculate base XP
    const baseAmount = xpRules.calculateXP(source);
    if (baseAmount <= 0) return;

    // Validate against rate limits
    const validation = xpRules.validateXPGain(walletAddress, baseAmount);
    if (!validation.allowed) {
      console.warn('[XPEngine] XP cap reached for wallet:', walletAddress);
      
      // Emit cap reached event
      const capEvent: XPCapReachedEvent = {
        type: WorldEventType.XP_CAP_REACHED,
        timestamp: Date.now(),
        walletAddress,
        sessionId: usePlayerState.getState().session?.sessionId || 'unknown',
        cappedAmount: baseAmount,
        maxPerMinute: xpRules.getConfig().maxXPPerMinute,
      };
      worldEventBus.emit(capEvent);
      
      return;
    }

    // Use capped amount if necessary
    const finalAmount = validation.cappedAmount || baseAmount;

    // Record in rate limit history
    xpRules.recordXPGain(walletAddress, finalAmount);

    // Update player state
    const currentXP = usePlayerState.getState().stats.totalXP || 0;
    const newTotal = currentXP + finalAmount;
    usePlayerState.getState().addXP(finalAmount);

    // Emit XP gained event
    const xpEvent: XPGainedEvent = {
      type: WorldEventType.XP_GAINED,
      timestamp: Date.now(),
      walletAddress,
      sessionId: usePlayerState.getState().session?.sessionId || 'unknown',
      amount: finalAmount,
      newTotal,
      source,
      sourceDetails,
    };

    worldEventBus.emit(xpEvent);

    console.log(
      `[XPEngine] +${finalAmount} XP from ${source} (Total: ${newTotal})`,
      sourceDetails ? `- ${sourceDetails}` : ''
    );
  }

  /**
   * Manually grant XP (for admin/special cases)
   */
  grantXP(
    walletAddress: string,
    amount: number,
    reason: string
  ): void {
    this.awardXP(walletAddress, XPSource.MANUAL_GRANT, reason);
  }

  /**
   * Get current session stats
   */
  getSessionStats(): {
    isRunning: boolean;
    sessionDuration: number | null;
    timeUntilNextSessionXP: number | null;
    longSessionBonusGranted: boolean;
  } {
    if (!this.isRunning || !this.sessionStartTime || !this.lastSessionXPTime) {
      return {
        isRunning: false,
        sessionDuration: null,
        timeUntilNextSessionXP: null,
        longSessionBonusGranted: false,
      };
    }

    const now = Date.now();
    const config = xpRules.getConfig();
    const minutesSinceLastXP = (now - this.lastSessionXPTime) / 60000;
    const timeUntilNext = Math.max(0, config.sessionInterval - minutesSinceLastXP);

    return {
      isRunning: true,
      sessionDuration: (now - this.sessionStartTime) / 60000,
      timeUntilNextSessionXP: timeUntilNext,
      longSessionBonusGranted: this.longSessionBonusGranted,
    };
  }
}

// Singleton instance
export const xpEngine = new XPEngine();

// Cleanup job for rate limit history
setInterval(() => {
  xpRules.cleanup();
}, 120000); // Every 2 minutes
