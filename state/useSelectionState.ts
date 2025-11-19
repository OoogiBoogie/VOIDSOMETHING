/**
 * SELECTION STATE - API BRIDGE
 * 
 * Re-exports the canonical selection store from state/selection/useSelectionState.
 * This allows imports from both:
 * - @/state/useSelectionState (marketplace, new components)
 * - @/state/selection/useSelectionState (existing components)
 * 
 * Single source of truth: state/selection/useSelectionState.ts
 */

export { useSelectionState } from '@/state/selection/useSelectionState';
export type { SelectionState, ActiveSelection } from '@/state/selection/useSelectionState';

