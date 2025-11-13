/**
 * WINDOW TYPE REGISTRY
 * All pop-out windows that can open in the center bay
 */

export type WindowType =
  | "WORLD_MAP"
  | "LAND_REGISTRY"
  | "PROPERTY_MARKET"
  | "DEFI_OVERVIEW"
  | "VAULT_DETAIL"
  | "CREATOR_HUB"
  | "DROP_DETAIL"
  | "DAO_CONSOLE"
  | "PROPOSAL_DETAIL"
  | "AGENCY_BOARD"
  | "JOB_DETAIL"
  | "AI_OPS_CONSOLE"
  | "AI_OPS_PANEL"
  | "MISSION_DETAIL"
  | "FRIENDS"
  | "WALLET"
  | "ZONES"
  | "ZONE_BROWSER"
  | "ACHIEVEMENTS"
  | "GAMES"
  | "MINIGAMES"
  | "VOID_HUB"
  | "HUB_SELECTOR"
  | "PHONE"
  | "GUILDS"
  | "VOICE_CHAT"
  | "MUSIC"
  | "GLOBAL_CHAT"
  | "PLAYER_PROFILE"
  | "LEADERBOARDS"
  | "AI_CONSOLE"
  | "MULTI_TAB";

export interface ActiveWindow {
  type: WindowType;
  props?: Record<string, any>;
}

export function getWindowLabel(type: WindowType): string {
  switch (type) {
    case "WORLD_MAP":
      return "WORLD · MAP";
    case "LAND_REGISTRY":
      return "LAND · REGISTRY";
    case "PROPERTY_MARKET":
      return "PROPERTY · MARKETPLACE";
    case "DEFI_OVERVIEW":
      return "DEFI · VAULT MATRIX";
    case "VAULT_DETAIL":
      return "DEFI · VAULT DETAIL";
    case "CREATOR_HUB":
      return "CREATOR · LAUNCH BAY";
    case "DROP_DETAIL":
      return "CREATOR · DROP";
    case "DAO_CONSOLE":
      return "DAO · CONSOLE";
    case "PROPOSAL_DETAIL":
      return "DAO · PROPOSAL";
    case "AGENCY_BOARD":
      return "AGENCY · GIG BOARD";
    case "JOB_DETAIL":
      return "AGENCY · GIG DETAIL";
    case "AI_OPS_CONSOLE":
      return "AI OPS · CONTROL ROOM";
    case "AI_OPS_PANEL":
      return "AI OPS · PANEL";
    case "MISSION_DETAIL":
      return "MISSION · BRIEFING";
    case "FRIENDS":
      return "SOCIAL · FRIENDS";
    case "WALLET":
      return "BASE · WALLET";
    case "ZONES":
      return "WORLD · ZONES & LAND";
    case "ZONE_BROWSER":
      return "WORLD · ZONE BROWSER";
    case "ACHIEVEMENTS":
      return "PLAYER · ACHIEVEMENTS";
    case "GAMES":
      return "ARCADE · GAMES";
    case "MINIGAMES":
      return "ARCADE · MINIGAMES";
    case "VOID_HUB":
      return "VOID · HUB CENTRAL";
    case "HUB_SELECTOR":
      return "HUB · SELECTOR";
    case "PHONE":
      return "COMMS · PHONE";
    case "GUILDS":
      return "SOCIAL · GUILDS";
    case "VOICE_CHAT":
      return "COMMS · VOICE";
    case "MUSIC":
      return "MEDIA · MUSIC";
    case "GLOBAL_CHAT":
      return "COMMS · GLOBAL CHAT";
    case "PLAYER_PROFILE":
      return "SOCIAL · PROFILE";
    case "LEADERBOARDS":
      return "SOCIAL · RANKINGS";
    case "AI_CONSOLE":
      return "AI OPS · CONSOLE";
    case "MULTI_TAB":
      return "PSX VOID · MULTI-TAB INTERFACE";
    default:
      return "WINDOW";
  }
}

