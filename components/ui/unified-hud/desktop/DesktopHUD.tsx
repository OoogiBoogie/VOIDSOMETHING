"use client"

import { PlayerChip } from "../shared/PlayerChip"
import { TokenTicker } from "../shared/TokenTicker"
import { MapWidget } from "../shared/MapWidget"
import { ContextAction } from "../shared/ContextAction"
import { CommsBubble } from "../shared/CommsBubble"
import { AppWheel } from "../shared/AppWheel"
import { XPWidget } from "../shared/XPWidget"
import { AppHub } from "../shared/AppHub"
import { createAppFolders } from "@/lib/app-folders"
import { useHUDState } from "@/lib/hud-state"

interface DesktopHUDProps {
  // Player data
  username: string
  avatarUrl: string
  walletAddress: string
  xp: number
  level: number
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
  showTicker?: boolean

  // Social
  friendsOnline: number
  globalUnread: number
  proxUnread: number

  // Interaction
  contextAction?: {
    type: "talk" | "open" | "trade" | "enter" | "use"
    label: string
    key: string
  }

  // App Hub (replaces App Wheel)
  isAppHubOpen: boolean
  onAppHubClose: () => void

  // Handlers
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

export function DesktopHUD({
  username,
  avatarUrl,
  walletAddress,
  xp,
  level,
  zone,
  playerPosition,
  playerRotation,
  voidBalance,
  psxBalance,
  chain,
  voidPrice,
  voidChange,
  psxPrice,
  psxChange,
  showTicker = true,
  friendsOnline,
  globalUnread,
  proxUnread,
  contextAction,
  isAppHubOpen,
  onAppHubClose,
  onMapClick,
  onInteract,
  onOpenChat,
  onPhoneOpen,
  onMapOpen,
  onMarketOpen,
  onFriendsOpen,
  onSettingsOpen,
  onMusicOpen,
  onVoiceOpen,
  onVoidHubOpen,
  onZonesOpen,
  onPortalsOpen,
  onWalletOpen,
  onVaultOpen,
  onGuildsOpen,
  onGamesOpen,
  onEventsOpen,
  onLeaderboardOpen,
  onDAOOpen,
  onVotingOpen,
  onXPOpen,
  onAchievementsOpen,
  onStreaksOpen,
  onAgencyOpen,
}: DesktopHUDProps) {
  const walletShort = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`

  // Create app folders with all handlers
  const folders = createAppFolders({
    onMapOpen: onMapOpen || (() => {}),
    onZonesOpen: onZonesOpen || (() => {}),
    onPortalsOpen: onPortalsOpen || (() => {}),
    onWalletOpen: onWalletOpen || (() => {}),
    onMarketOpen: onMarketOpen || (() => {}),
    onVaultOpen: onVaultOpen || (() => {}),
    onFriendsOpen: onFriendsOpen || (() => {}),
    onVoiceOpen: onVoiceOpen || (() => {}),
    onGuildsOpen: onGuildsOpen || (() => {}),
    onGamesOpen: onGamesOpen || (() => {}),
    onEventsOpen: onEventsOpen || (() => {}),
    onLeaderboardOpen: onLeaderboardOpen || (() => {}),
    onDAOOpen: onDAOOpen || (() => {}),
    onVotingOpen: onVotingOpen || (() => {}),
    onXPOpen: onXPOpen || (() => {}),
    onAchievementsOpen: onAchievementsOpen || (() => {}),
    onStreaksOpen: onStreaksOpen || (() => {}),
    onAgencyOpen: onAgencyOpen || (() => {}),
  })

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9980 }}>
      {/* Top-Left: Player Chip */}
      <div className="pointer-events-auto">
        <PlayerChip
          username={username}
          avatarUrl={avatarUrl}
          walletShort={walletShort}
          xp={xp}
          level={level}
          zone={zone}
          coordinates={playerPosition}
          voidBalance={voidBalance}
          psxBalance={psxBalance}
          chain={chain}
        />
      </div>

      {/* Top-Center: Token Ticker */}
      {showTicker && (
        <div className="pointer-events-auto">
          <TokenTicker voidPrice={voidPrice} voidChange={voidChange} psxPrice={psxPrice} psxChange={psxChange} />
        </div>
      )}

      {/* Top-Right: Map Widget */}
      <div className="pointer-events-auto">
        <MapWidget playerPosition={playerPosition} playerRotation={playerRotation} onClick={onMapClick} />
      </div>

      {/* Left Side: XP Widget */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
        <XPWidget onClick={onXPOpen} />
      </div>

      {/* Bottom-Left: Comms Bubble */}
      <div className="pointer-events-auto">
        <CommsBubble
          friendsOnline={friendsOnline}
          globalUnread={globalUnread}
          proxUnread={proxUnread}
          onOpenChat={onOpenChat}
        />
      </div>

      {/* Bottom-Center: Context Action */}
      {contextAction && (
        <div className="pointer-events-auto">
          <ContextAction action={contextAction} onInteract={onInteract} />
        </div>
      )}

      {/* App Hub Overlay (replaces App Wheel) */}
      <div className="pointer-events-auto">
        <AppHub folders={folders} isOpen={isAppHubOpen} onClose={onAppHubClose} />
      </div>
    </div>
  )
}
