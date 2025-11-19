/**
 * PHASE 5.3 — INTERACTABLE REGISTRY
 * 
 * Central registry for all interactable objects in the world.
 */

import type { Interactable, ProximityTrigger } from "./interactionTypes";
import type { Vector3 } from "three";

class InteractableRegistry {
  private interactables: Map<string, Interactable> = new Map();
  private proximityTriggers: Map<string, ProximityTrigger> = new Map();

  /**
   * Register an interactable object
   */
  register(interactable: Interactable): void {
    this.interactables.set(interactable.id, interactable);
    console.log(`[InteractableRegistry] Registered: ${interactable.id}`);
  }

  /**
   * Unregister an interactable object
   */
  unregister(id: string): void {
    this.interactables.delete(id);
    console.log(`[InteractableRegistry] Unregistered: ${id}`);
  }

  /**
   * Get interactable by ID
   */
  get(id: string): Interactable | undefined {
    return this.interactables.get(id);
  }

  /**
   * Get all interactables
   */
  getAll(): Interactable[] {
    return Array.from(this.interactables.values());
  }

  /**
   * Get enabled interactables
   */
  getEnabled(): Interactable[] {
    return this.getAll().filter((i) => i.enabled);
  }

  /**
   * Get interactables within radius of position
   */
  getNearby(position: Vector3, radius: number): Interactable[] {
    return this.getEnabled().filter((interactable) => {
      const distance = position.distanceTo(interactable.position);
      return distance <= radius;
    });
  }

  /**
   * Get closest interactable to position
   */
  getClosest(position: Vector3, maxRadius: number): Interactable | null {
    const nearby = this.getNearby(position, maxRadius);
    if (nearby.length === 0) return null;

    return nearby.reduce((closest, current) => {
      const closestDist = position.distanceTo(closest.position);
      const currentDist = position.distanceTo(current.position);
      return currentDist < closestDist ? current : closest;
    });
  }

  /**
   * Enable interactable
   */
  enable(id: string): void {
    const interactable = this.get(id);
    if (interactable) {
      interactable.enabled = true;
    }
  }

  /**
   * Disable interactable
   */
  disable(id: string): void {
    const interactable = this.get(id);
    if (interactable) {
      interactable.enabled = false;
    }
  }

  /**
   * Clear all interactables
   */
  clear(): void {
    this.interactables.clear();
    console.log("[InteractableRegistry] Cleared all interactables");
  }

  // ============================================================
  // PROXIMITY TRIGGERS
  // ============================================================

  /**
   * Register a proximity trigger
   */
  registerTrigger(trigger: ProximityTrigger): void {
    this.proximityTriggers.set(trigger.id, trigger);
    console.log(`[InteractableRegistry] Registered trigger: ${trigger.id}`);
  }

  /**
   * Unregister a proximity trigger
   */
  unregisterTrigger(id: string): void {
    this.proximityTriggers.delete(id);
    console.log(`[InteractableRegistry] Unregistered trigger: ${id}`);
  }

  /**
   * Get trigger by ID
   */
  getTrigger(id: string): ProximityTrigger | undefined {
    return this.proximityTriggers.get(id);
  }

  /**
   * Get all triggers
   */
  getAllTriggers(): ProximityTrigger[] {
    return Array.from(this.proximityTriggers.values());
  }

  /**
   * Get active triggers
   */
  getActiveTriggers(): ProximityTrigger[] {
    return this.getAllTriggers().filter((t) => t.isActive);
  }

  /**
   * Check triggers for position
   */
  checkTriggers(playerId: string, position: Vector3): void {
    this.getActiveTriggers().forEach((trigger) => {
      const distance = position.distanceTo(trigger.position);
      const isInside = distance <= trigger.radius;
      const wasInside = trigger.playersInside.has(playerId);

      if (isInside && !wasInside) {
        // Player entered trigger
        trigger.playersInside.add(playerId);
        trigger.onEnter(playerId);
      } else if (!isInside && wasInside) {
        // Player exited trigger
        trigger.playersInside.delete(playerId);
        trigger.onExit(playerId);
      }
    });
  }

  /**
   * Clear all triggers
   */
  clearTriggers(): void {
    this.proximityTriggers.clear();
    console.log("[InteractableRegistry] Cleared all triggers");
  }
}

// Global singleton
export const interactableRegistry = new InteractableRegistry();
