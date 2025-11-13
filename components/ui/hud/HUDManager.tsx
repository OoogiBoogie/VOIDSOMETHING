"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { useOrientation } from "@/hooks/use-orientation"
import { HUD_PC } from "./PC/HUD_PC"

interface HUDManagerProps {
  // Player data
  username: string
  avatarUrl: string
  walletAddress: string
  zone: string
  playerPosition: { x: number; z: number }
  playerRotation: number
  voidBalance: number
  psxBalance: number
  chain: string

  // Economy
  voidPrice: number
  voidChange: number
  psxPrice: number
  psxChange: number

  // Social
  friendsOnline?: { id: string; name: string; avatar: string }[];
  globalUnread: number
  proxUnread: number

  // Interaction
  contextAction?: {
    type: "talk" | "open" | "trade" | "enter" | "use"
    label: string
    key: string
  }

  // All app handlers
  onMapClick?: () => void
  onInteract?: () => void
  onOpenChat?: (channel: "global" | "prox" | "friends") => void
  onPhoneOpen?: () => void
  onMapOpen?: () => void
  onMarketOpen?: () => void
  onFriendsOpen?: () => void
  onSettingsOpen?: () => void
  onMusicOpen?: () => void
  onVoiceOpen?: () => void
  onVoidHubOpen?: () => void
  onZonesOpen?: () => void
  onPortalsOpen?: () => void
  onWalletOpen?: () => void
  onVaultOpen?: () => void
  onGuildsOpen?: () => void
  onGamesOpen?: () => void
  onEventsOpen?: () => void
  onLeaderboardOpen?: () => void
  onDAOOpen?: () => void
  onVotingOpen?: () => void
  onXPOpen?: () => void
  onAchievementsOpen?: () => void
  onStreaksOpen?: () => void
  onAgencyOpen?: () => void
}

export function HUDManager(props: HUDManagerProps) {
  const isMobile = useIsMobile()
  const orientation = useOrientation()

  // Route to correct HUD based on device + orientation
    // Always provide friendsOnline as array
    const safeProps = {
      ...props,
      friendsOnline: props.friendsOnline ?? [],
    }

    if (!isMobile) {
      // Desktop: Always use HUD_PC
      return <HUD_PC {...safeProps} />
  }

  // Mobile routing (Phase 5-7)
  if (orientation === "portrait") {
    // TODO: Phase 6 - Return HUD_Mobile_LitePortrait
      return <HUD_PC {...safeProps} /> // Temporary fallback
  }

  if (orientation === "landscape") {
    // TODO: Phase 7 - Return HUD_Mobile_LiteLandscape
      return <HUD_PC {...safeProps} /> // Temporary fallback
  }

  // Default: Mobile Roam
  // TODO: Phase 5 - Return HUD_Mobile_Roam
    return <HUD_PC {...safeProps} /> // Temporary fallback
}
