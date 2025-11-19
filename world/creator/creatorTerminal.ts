/**
 * Creator Terminal System
 * Phase 6.5 - Creator Hub interactions
 */

import { worldEventBus } from '../events/eventBus';
import { WorldEventType } from '../events/eventTypes';
import type { InteractionCompletedEvent } from '../events/eventPayloads';

export interface CreatorTerminalUsedEvent {
  type: 'CREATOR_TERMINAL_USED';
  timestamp: number;
  walletAddress: string;
  sessionId: string;
  parcelId?: string;
  districtId?: string;
  creatorId?: string;
}

export class CreatorTerminalHandler {
  private isRunning = false;
  private totalUses = 0;

  /**
   * Start tracking creator terminal usage
   */
  start(walletAddress: string): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.totalUses = 0;

    // Subscribe to interaction events
    worldEventBus.on(WorldEventType.INTERACTION_COMPLETED, (event) => {
      const interactionEvent = event as InteractionCompletedEvent;
      if (interactionEvent.interactionType.toUpperCase() === 'CREATOR_TERMINAL') {
        this.onCreatorTerminalUsed(walletAddress, interactionEvent);
      }
    });

    console.log('[CreatorTerminalHandler] Started for wallet:', walletAddress);
  }

  /**
   * Stop tracking
   */
  stop(): void {
    this.isRunning = false;
    this.totalUses = 0;
  }

  /**
   * Handle creator terminal use
   */
  private onCreatorTerminalUsed(walletAddress: string, event: InteractionCompletedEvent): void {
    this.totalUses++;

    console.log('[CreatorTerminalHandler] Terminal used:', {
      total: this.totalUses,
      interactableId: event.interactableId,
    });

    // Emit custom event for analytics
    const terminalEvent: CreatorTerminalUsedEvent = {
      type: 'CREATOR_TERMINAL_USED',
      timestamp: Date.now(),
      walletAddress,
      sessionId: event.sessionId || 'unknown',
      // TODO: Extract from interactable metadata
      parcelId: undefined,
      districtId: undefined,
      creatorId: event.interactableId,
    };

    worldEventBus.emit(terminalEvent as any);
  }

  /**
   * Get total uses
   */
  getTotalUses(): number {
    return this.totalUses;
  }
}

// Singleton instance
export const creatorTerminalHandler = new CreatorTerminalHandler();
