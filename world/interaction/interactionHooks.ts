/**
 * PHASE 5.3 — INTERACTION HOOKS
 * 
 * React hooks for interaction system.
 */

import { useEffect, useState, useCallback } from "react";
import type { Interactable } from "./interactionTypes";
import { interactionManager } from "./interactionManager";

/**
 * Hook to get closest interactable
 */
export function useClosestInteractable(): Interactable | null {
  const [closest, setClosest] = useState<Interactable | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ interactable: Interactable | null }>;
      setClosest(customEvent.detail.interactable);
    };

    window.addEventListener("interaction:proximity-change", handler);
    return () =>
      window.removeEventListener("interaction:proximity-change", handler);
  }, []);

  return closest;
}

/**
 * Hook to check if can interact
 */
export function useCanInteract(): boolean {
  const closest = useClosestInteractable();
  return closest !== null && interactionManager.canInteract();
}

/**
 * Hook to trigger interaction
 */
export function useInteract(): () => void {
  return useCallback(() => {
    interactionManager.interact();
  }, []);
}

/**
 * Hook for interaction prompt (e.g., "Press E to examine")
 */
export function useInteractionPrompt(): string | null {
  const closest = useClosestInteractable();
  const canInteract = useCanInteract();

  if (!closest || !canInteract) return null;

  return closest.label;
}

/**
 * Hook to listen for interaction events
 */
export function useInteractionEvents(callbacks: {
  onStarted?: (data: {
    playerId: string;
    interactableId: string;
    interactionType: string;
  }) => void;
  onCompleted?: (data: {
    playerId: string;
    interactableId: string;
    interactionType: string;
  }) => void;
  onFailed?: (data: {
    playerId: string;
    interactableId: string;
    error: string;
  }) => void;
}): void {
  const { onStarted, onCompleted, onFailed } = callbacks;

  useEffect(() => {
    const startHandler = (event: Event) => {
      if (onStarted) {
        const customEvent = event as CustomEvent;
        onStarted(customEvent.detail);
      }
    };

    const completeHandler = (event: Event) => {
      if (onCompleted) {
        const customEvent = event as CustomEvent;
        onCompleted(customEvent.detail);
      }
    };

    const failHandler = (event: Event) => {
      if (onFailed) {
        const customEvent = event as CustomEvent;
        onFailed(customEvent.detail);
      }
    };

    window.addEventListener("interaction:started", startHandler);
    window.addEventListener("interaction:completed", completeHandler);
    window.addEventListener("interaction:failed", failHandler);

    return () => {
      window.removeEventListener("interaction:started", startHandler);
      window.removeEventListener("interaction:completed", completeHandler);
      window.removeEventListener("interaction:failed", failHandler);
    };
  }, [onStarted, onCompleted, onFailed]);
}
