/**
 * PHASE 5.1 — HUD PIPELINE
 * 
 * Central export for HUD event pipeline components.
 */

export { hudEventAdapter } from "./hudEventAdapter";
export type {
  HUDParcelData,
  HUDDistrictData,
  HUDSessionData,
} from "./hudEventAdapter";

export { hudToastQueue } from "./hudToastQueue";

export { hudMapSync } from "./hudMapSync";
export type { MapHighlight } from "./hudMapSync";

export {
  useHUDParcelReaction,
  useHUDDistrictReaction,
  useHUDSessionReaction,
  useHUDAreaDiscovery,
  useMapHighlights,
  useHUDReaction,
  useCurrentParcel,
  useCurrentDistrict,
} from "./hudState";
