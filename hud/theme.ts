/**
 * HUB THEMES - Chrome Dreamcore Y2K Aesthetic
 * Each hub mode transforms the entire HUD with unique colors, accents, and chrome styling
 */

export type HubMode = "WORLD" | "CREATOR" | "DEFI" | "DAO" | "AGENCY" | "AI_OPS";

export interface HubTheme {
  name: string;
  rootBg: string;
  accent: string;
  accentBorder: string;
  borderColor: string;
  chromeGlow: string;
  spineColor: string;
  secondaryAccent: string;
}

export const HUB_THEME: Record<HubMode, HubTheme> = {
  WORLD: {
    name: "WORLD",
    rootBg: "bg-gradient-to-b from-black via-[#020617] to-[#020617]",
    accent: "text-signal-green",
    accentBorder: "border-signal-green/70",
    borderColor: "#00FF9D",
    chromeGlow: "shadow-[0_0_36px_rgba(0,255,157,0.8)]",
    spineColor: "bg-signal-green",
    secondaryAccent: "text-cyber-cyan",
  },
  CREATOR: {
    name: "CREATOR",
    rootBg: "bg-gradient-to-b from-black via-[#020617] to-[#022c43]",
    accent: "text-cyber-cyan",
    accentBorder: "border-cyber-cyan/70",
    borderColor: "#00D4FF",
    chromeGlow: "shadow-[0_0_36px_rgba(34,211,238,0.8)]",
    spineColor: "bg-cyber-cyan",
    secondaryAccent: "text-signal-green",
  },
  DEFI: {
    name: "DEFI",
    rootBg: "bg-gradient-to-b from-black via-[#050014] to-[#111827]",
    accent: "text-void-purple",
    accentBorder: "border-void-purple/70",
    borderColor: "#7C00FF",
    chromeGlow: "shadow-[0_0_40px_rgba(124,0,255,0.9)]",
    spineColor: "bg-void-purple",
    secondaryAccent: "text-signal-green",
  },
  DAO: {
    name: "DAO",
    rootBg: "bg-gradient-to-b from-black via-[#020617] to-[#0f172a]",
    accent: "text-psx-blue",
    accentBorder: "border-psx-blue/70",
    borderColor: "#3B82F6",
    chromeGlow: "shadow-[0_0_36px_rgba(59,130,246,0.9)]",
    spineColor: "bg-psx-blue",
    secondaryAccent: "text-cyber-cyan",
  },
  AGENCY: {
    name: "AGENCY",
    rootBg: "bg-gradient-to-b from-black via-[#130012] to-[#111827]",
    accent: "text-red-400",
    accentBorder: "border-red-400/70",
    borderColor: "#FF6B6B",
    chromeGlow: "shadow-[0_0_40px_rgba(248,113,113,0.9)]",
    spineColor: "bg-red-400",
    secondaryAccent: "text-rose-300",
  },
  AI_OPS: {
    name: "AI OPS",
    rootBg: "bg-gradient-to-b from-black via-[#020617] to-[#001a0a]",
    accent: "text-lime-300",
    accentBorder: "border-lime-400/70",
    borderColor: "#BEFF00",
    chromeGlow: "shadow-[0_0_40px_rgba(190,242,100,0.9)]",
    spineColor: "bg-lime-300",
    secondaryAccent: "text-violet-300",
  },
};

export function getHubColor(hub: string): string {
  switch (hub.toUpperCase()) {
    case "WORLD":
      return "text-signal-green";
    case "CREATOR":
      return "text-cyber-cyan";
    case "DEFI":
      return "text-void-purple";
    case "DAO":
      return "text-psx-blue";
    case "AGENCY":
    case "AGENCY_RED":
      return "text-red-400";
    case "AI_OPS":
    case "AI OPS":
      return "text-lime-300";
    default:
      return "text-bio-silver";
  }
}

export function getHubBorderColor(hub: string): string {
  switch (hub.toUpperCase()) {
    case "WORLD":
      return "border-signal-green/60";
    case "CREATOR":
      return "border-cyber-cyan/60";
    case "DEFI":
      return "border-void-purple/60";
    case "DAO":
      return "border-psx-blue/60";
    case "AGENCY":
      return "border-red-400/60";
    case "AI_OPS":
      return "border-lime-300/60";
    default:
      return "border-bio-silver/40";
  }
}

export function getHubSpineColor(hub: string): string {
  switch (hub.toUpperCase()) {
    case "WORLD":
      return "bg-signal-green";
    case "CREATOR":
      return "bg-cyber-cyan";
    case "DEFI":
      return "bg-void-purple";
    case "DAO":
      return "bg-psx-blue";
    case "AGENCY":
      return "bg-red-400";
    case "AI_OPS":
      return "bg-lime-300";
    default:
      return "bg-bio-silver";
  }
}
