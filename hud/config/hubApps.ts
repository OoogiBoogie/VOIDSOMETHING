/**
 * HUB & APP TYPES
 * Defines all hub modes and app IDs for the desktop HUD
 */

export type HubId = 
  | "WORLD" 
  | "CREATOR" 
  | "DEFI" 
  | "DAO" 
  | "AGENCY" 
  | "AI_OPS";

export type HudAppId =
  | "map"
  | "wallet"
  | "friends"
  | "music"
  | "phone"
  | "vault"
  | "swap"
  | "governance"
  | "jobs"
  | "ai_console"
  | "zones"
  | "achievements"
  | "games"
  | "settings";

export const HUB_COLORS: Record<HubId, string> = {
  WORLD: "#10b981", // emerald
  CREATOR: "#06b6d4", // cyan
  DEFI: "#8b5cf6", // violet
  DAO: "#0ea5e9", // sky
  AGENCY: "#f43f5e", // rose
  AI_OPS: "#84cc16", // lime
};

export const HUB_LABELS: Record<HubId, string> = {
  WORLD: "WORLD",
  CREATOR: "CREATOR",
  DEFI: "DEFI",
  DAO: "DAO",
  AGENCY: "THE AGENCY",
  AI_OPS: "AI OPS",
};
