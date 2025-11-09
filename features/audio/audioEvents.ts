/**
 * Audio Events - Centralized event definitions
 * All audio triggers in the app are defined here
 */

export const AudioEvents = {
  // UI Sounds
  UI_CLICK: "ui.click",
  UI_HOVER: "ui.hover",
  UI_OPEN_PANEL: "ui.openPanel",
  UI_CLOSE_PANEL: "ui.closePanel",
  UI_TOGGLE_ON: "ui.toggleOn",
  UI_TOGGLE_OFF: "ui.toggleOff",
  UI_ERROR: "ui.error",
  UI_SUCCESS: "ui.success",
  
  // World / 3D Sounds
  WORLD_ENTER: "world.enter",
  WORLD_LETTER_PULSE: "world.letterPulse",
  WORLD_TELEPORT: "world.teleport",
  WORLD_FOOTSTEP: "world.footstep",
  WORLD_ZONE_ENTER: "world.zoneEnter",
  
  // Wallet / Web3 Sounds
  WALLET_CONNECTED: "wallet.connected",
  WALLET_DISCONNECTED: "wallet.disconnected",
  TX_SUBMITTED: "tx.submitted",
  TX_SUCCESS: "tx.success",
  TX_FAILED: "tx.failed",
  TX_PENDING: "tx.pending",
  
  // Land / Property Sounds
  LAND_PURCHASED: "land.purchased",
  LAND_SELECTED: "land.selected",
  BUILDING_PLACED: "building.placed",
  
  // Social Sounds
  MESSAGE_RECEIVED: "social.messageReceived",
  MESSAGE_SENT: "social.messageSent",
  FRIEND_ONLINE: "social.friendOnline",
  
  // Ambient Loops
  AMBIENT_CITY: "ambient.city",
  AMBIENT_MENU: "ambient.menu",
} as const;

export type AudioEventKey = (typeof AudioEvents)[keyof typeof AudioEvents];
