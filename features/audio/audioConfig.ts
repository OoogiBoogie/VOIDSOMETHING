/**
 * Audio Configuration
 * Maps audio events to file paths, volumes, and playback settings
 */

import { AudioEventKey, AudioEvents } from "./audioEvents";

export type AudioConfigEntry = {
  src: string;
  volume: number;
  loop?: boolean;
  category?: "ui" | "world" | "web3" | "ambient" | "social";
};

export const audioConfig: Record<AudioEventKey, AudioConfigEntry> = {
  // UI Sounds
  [AudioEvents.UI_CLICK]: {
    src: "/audio/ui/click.mp3",
    volume: 0.6,
    category: "ui",
  },
  [AudioEvents.UI_HOVER]: {
    src: "/audio/ui/hover.mp3",
    volume: 0.4,
    category: "ui",
  },
  [AudioEvents.UI_OPEN_PANEL]: {
    src: "/audio/ui/panel_open.mp3",
    volume: 0.7,
    category: "ui",
  },
  [AudioEvents.UI_CLOSE_PANEL]: {
    src: "/audio/ui/panel_close.mp3",
    volume: 0.7,
    category: "ui",
  },
  [AudioEvents.UI_TOGGLE_ON]: {
    src: "/audio/ui/toggle_on.mp3",
    volume: 0.5,
    category: "ui",
  },
  [AudioEvents.UI_TOGGLE_OFF]: {
    src: "/audio/ui/toggle_off.mp3",
    volume: 0.5,
    category: "ui",
  },
  [AudioEvents.UI_ERROR]: {
    src: "/audio/ui/error.mp3",
    volume: 0.8,
    category: "ui",
  },
  [AudioEvents.UI_SUCCESS]: {
    src: "/audio/ui/success.mp3",
    volume: 0.8,
    category: "ui",
  },

  // World / 3D Sounds
  [AudioEvents.WORLD_ENTER]: {
    src: "/audio/world/enter_whoosh.mp3",
    volume: 0.8,
    category: "world",
  },
  [AudioEvents.WORLD_LETTER_PULSE]: {
    src: "/audio/world/letter_pulse.mp3",
    volume: 0.7,
    category: "world",
  },
  [AudioEvents.WORLD_TELEPORT]: {
    src: "/audio/world/teleport.mp3",
    volume: 0.9,
    category: "world",
  },
  [AudioEvents.WORLD_FOOTSTEP]: {
    src: "/audio/world/footstep.mp3",
    volume: 0.3,
    category: "world",
  },
  [AudioEvents.WORLD_ZONE_ENTER]: {
    src: "/audio/world/zone_enter.mp3",
    volume: 0.7,
    category: "world",
  },

  // Wallet / Web3 Sounds
  [AudioEvents.WALLET_CONNECTED]: {
    src: "/audio/web3/wallet_connected.mp3",
    volume: 0.9,
    category: "web3",
  },
  [AudioEvents.WALLET_DISCONNECTED]: {
    src: "/audio/web3/wallet_disconnected.mp3",
    volume: 0.7,
    category: "web3",
  },
  [AudioEvents.TX_SUBMITTED]: {
    src: "/audio/web3/tx_submitted.mp3",
    volume: 0.7,
    category: "web3",
  },
  [AudioEvents.TX_SUCCESS]: {
    src: "/audio/web3/tx_success.mp3",
    volume: 0.9,
    category: "web3",
  },
  [AudioEvents.TX_FAILED]: {
    src: "/audio/web3/tx_failed.mp3",
    volume: 0.9,
    category: "web3",
  },
  [AudioEvents.TX_PENDING]: {
    src: "/audio/web3/tx_pending.mp3",
    volume: 0.6,
    category: "web3",
  },

  // Land / Property Sounds
  [AudioEvents.LAND_PURCHASED]: {
    src: "/audio/land/purchased.mp3",
    volume: 1.0,
    category: "web3",
  },
  [AudioEvents.LAND_SELECTED]: {
    src: "/audio/land/selected.mp3",
    volume: 0.6,
    category: "ui",
  },
  [AudioEvents.BUILDING_PLACED]: {
    src: "/audio/land/building_placed.mp3",
    volume: 0.8,
    category: "world",
  },

  // Social Sounds
  [AudioEvents.MESSAGE_RECEIVED]: {
    src: "/audio/social/message_received.mp3",
    volume: 0.7,
    category: "social",
  },
  [AudioEvents.MESSAGE_SENT]: {
    src: "/audio/social/message_sent.mp3",
    volume: 0.5,
    category: "social",
  },
  [AudioEvents.FRIEND_ONLINE]: {
    src: "/audio/social/friend_online.mp3",
    volume: 0.6,
    category: "social",
  },

  // Ambient Loops
  [AudioEvents.AMBIENT_CITY]: {
    src: "/audio/ambience/city_loop.mp3",
    volume: 0.3,
    loop: true,
    category: "ambient",
  },
  [AudioEvents.AMBIENT_MENU]: {
    src: "/audio/ambience/menu_loop.mp3",
    volume: 0.2,
    loop: true,
    category: "ambient",
  },
};
