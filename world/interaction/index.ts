/**
 * PHASE 5.3 — INTERACTION SYSTEM
 * 
 * Central export for world interaction system.
 */

export { interactionManager } from "./interactionManager";
export { interactableRegistry } from "./interactableRegistry";
export { raycastDetector, RaycastDetector } from "./raycastDetector";

export type {
  Interactable,
  InteractionType,
  InteractionState,
  RaycastHit,
  ProximityTrigger,
} from "./interactionTypes";

export {
  useClosestInteractable,
  useCanInteract,
  useInteract,
  useInteractionPrompt,
  useInteractionEvents,
} from "./interactionHooks";
