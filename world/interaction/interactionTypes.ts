/**
 * PHASE 5.3 — INTERACTION TYPES
 * 
 * Type definitions for world interaction system.
 */

import type { Vector3, Object3D } from "three";

export type InteractionType =
  | "examine"
  | "pickup"
  | "activate"
  | "talk"
  | "enter"
  | "custom";

export interface Interactable {
  id: string;
  type: InteractionType;
  position: Vector3;
  radius: number; // Interaction radius in world units
  label: string; // e.g., "Press E to examine"
  enabled: boolean;
  metadata?: Record<string, unknown>;
  onInteract: (playerId: string) => void | Promise<void>;
}

export interface InteractionState {
  nearbyInteractables: Interactable[];
  closestInteractable: Interactable | null;
  isInteracting: boolean;
  lastInteractionTime: number;
}

export interface RaycastHit {
  object: Object3D;
  distance: number;
  point: Vector3;
  normal: Vector3;
}

export interface ProximityTrigger {
  id: string;
  position: Vector3;
  radius: number;
  onEnter: (playerId: string) => void;
  onExit: (playerId: string) => void;
  isActive: boolean;
  playersInside: Set<string>;
}
