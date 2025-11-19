/**
 * PHASE 5.3 — INTERACTION MANAGER
 * 
 * Manages player interactions with world objects.
 * Handles proximity detection, "Press E" prompts, and interaction execution.
 */

import { Vector3 } from "three";
import type { Interactable, InteractionState } from "./interactionTypes";
import { interactableRegistry } from "./interactableRegistry";
import { worldEventBus } from "../../world/events";

const INTERACTION_RADIUS = 3.0; // Default interaction radius
const INTERACTION_COOLDOWN = 500; // ms between interactions

class InteractionManager {
  private state: InteractionState = {
    nearbyInteractables: [],
    closestInteractable: null,
    isInteracting: false,
    lastInteractionTime: 0,
  };

  private currentPlayerId: string | null = null;
  private currentPlayerPosition: Vector3 = new Vector3();
  private updateInterval: NodeJS.Timeout | null = null;

  /**
   * Start interaction system
   */
  start(playerId: string): void {
    this.currentPlayerId = playerId;
    console.log("[InteractionManager] Started for player:", playerId);

    // Update nearby interactables every 100ms
    this.updateInterval = setInterval(() => {
      this.updateNearbyInteractables();
    }, 100);

    // Listen for interaction key
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", this.handleKeyPress);
    }
  }

  /**
   * Stop interaction system
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", this.handleKeyPress);
    }

    this.currentPlayerId = null;
    console.log("[InteractionManager] Stopped");
  }

  /**
   * Update player position (call from movement system)
   */
  updatePlayerPosition(position: Vector3): void {
    this.currentPlayerPosition.copy(position);

    // Check proximity triggers
    if (this.currentPlayerId) {
      interactableRegistry.checkTriggers(
        this.currentPlayerId,
        this.currentPlayerPosition
      );
    }
  }

  /**
   * Update nearby interactables
   */
  private updateNearbyInteractables(): void {
    const nearby = interactableRegistry.getNearby(
      this.currentPlayerPosition,
      INTERACTION_RADIUS
    );

    this.state.nearbyInteractables = nearby;

    // Find closest interactable
    const closest = interactableRegistry.getClosest(
      this.currentPlayerPosition,
      INTERACTION_RADIUS
    );

    // Check if closest changed
    if (closest?.id !== this.state.closestInteractable?.id) {
      this.state.closestInteractable = closest;
      this.emitProximityChange(closest);
    }
  }

  /**
   * Handle interaction key press (E)
   */
  private handleKeyPress = (event: KeyboardEvent): void => {
    if (event.key.toLowerCase() === "e") {
      this.interact();
    }
  };

  /**
   * Attempt to interact with closest object
   */
  interact(): void {
    if (this.state.isInteracting) {
      console.log("[InteractionManager] Already interacting");
      return;
    }

    const now = Date.now();
    if (now - this.state.lastInteractionTime < INTERACTION_COOLDOWN) {
      console.log("[InteractionManager] Interaction on cooldown");
      return;
    }

    const target = this.state.closestInteractable;
    if (!target) {
      console.log("[InteractionManager] No interactable nearby");
      return;
    }

    if (!this.currentPlayerId) {
      console.log("[InteractionManager] No player ID set");
      return;
    }

    this.executeInteraction(target);
  }

  /**
   * Execute interaction with object
   */
  private async executeInteraction(interactable: Interactable): Promise<void> {
    this.state.isInteracting = true;
    this.state.lastInteractionTime = Date.now();

    console.log(`[InteractionManager] Interacting with: ${interactable.id}`);

    // Emit interaction event
    worldEventBus.emit("INTERACTION_STARTED", {
      playerId: this.currentPlayerId!,
      interactableId: interactable.id,
      interactionType: interactable.type,
      position: {
        x: interactable.position.x,
        y: interactable.position.y,
        z: interactable.position.z,
      },
      timestamp: Date.now(),
    });

    try {
      // Execute interaction callback
      await interactable.onInteract(this.currentPlayerId!);

      // Emit completion event
      worldEventBus.emit("INTERACTION_COMPLETED", {
        playerId: this.currentPlayerId!,
        interactableId: interactable.id,
        interactionType: interactable.type,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("[InteractionManager] Interaction failed:", error);

      // Emit failure event
      worldEventBus.emit("INTERACTION_FAILED", {
        playerId: this.currentPlayerId!,
        interactableId: interactable.id,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      });
    } finally {
      this.state.isInteracting = false;
    }
  }

  /**
   * Emit proximity change event
   */
  private emitProximityChange(interactable: Interactable | null): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("interaction:proximity-change", {
          detail: { interactable },
        })
      );
    }
  }

  /**
   * Get current interaction state
   */
  getState(): InteractionState {
    return { ...this.state };
  }

  /**
   * Get closest interactable
   */
  getClosestInteractable(): Interactable | null {
    return this.state.closestInteractable;
  }

  /**
   * Check if can interact
   */
  canInteract(): boolean {
    return (
      !this.state.isInteracting &&
      this.state.closestInteractable !== null &&
      Date.now() - this.state.lastInteractionTime >= INTERACTION_COOLDOWN
    );
  }
}

// Global singleton
export const interactionManager = new InteractionManager();
