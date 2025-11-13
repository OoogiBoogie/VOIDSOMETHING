"use client"

import { useState } from "react"
import { PlayerChip } from "@/components/ui/unified-hud/shared/PlayerChip"
import { TokenTicker } from "@/components/ui/unified-hud/shared/TokenTicker"
import { MapWidget } from "@/components/ui/unified-hud/shared/MapWidget"
import { ContextAction } from "@/components/ui/unified-hud/shared/ContextAction"
import { BottomFolderRow } from "../Shared/BottomFolderRow"
import { FolderPanel } from "../Shared/FolderPanel"
import { createAppFolders, AppFolderData } from "@/lib/app-folders"
import { useXPStore } from "@/lib/xp-system/xp-store"
import { getXPProgressInLevel } from "@/lib/xp-system/xp-utils"
import { ChatPanel } from "../Shared/ChatPanel"
import { MySpacePanel } from "../Shared/MySpacePanel"
import { SocialHub } from "../Shared/SocialHub"
import { Web3TradingHub } from "../Shared/Web3TradingHub"
import { TopTicker } from "../Shared/TopTicker"
import { DAOXPPanel } from "../Shared/DAOXPPanel"

interface HUD_PC_Props {
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
  friendsOnline: { id: string; name: string; avatar: string }[]
  globalUnread: number
  proxUnread: number

  // Interaction
  contextAction?: {
    type: "talk" | "open" | "trade" | "enter" | "use"
    label: string
    key: string
  }

  // Handlers for all apps
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

export function HUD_PC({
  username,
  avatarUrl,
  walletAddress,
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
  friendsOnline,
  globalUnread,
  proxUnread,
  contextAction,
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
}: HUD_PC_Props) {
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  
  // XP Store
  const { level, currentXP, xpToNextLevel, totalXP, dailyTasks } = useXPStore()
  const { current, required } = getXPProgressInLevel(totalXP, level)
  

  // Create folders and split left/right
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

  // Update PROGRESS folder badge with incomplete tasks
  const progressFolder = folders.find((f) => f.id === "PROGRESS")
  if (progressFolder) {
    const incompleteTasks = dailyTasks.filter((t) => !t.completed).length
    progressFolder.badge = incompleteTasks
  }

  // Split folders: left = SOCIAL, PLAY; right = WORLD, FINANCE, DAO, PROGRESS, CREATOR
  const leftFolders = folders.filter(f => f.id === "SOCIAL" || f.id === "PLAY")
  const rightFolders = folders.filter(f => f.id !== "SOCIAL" && f.id !== "PLAY")

  const walletShort = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
  const selectedFolder = folders.find((f) => f.id === activeFolder)

  const handleFolderClick = (folderId: string) => {
    if (activeFolder === folderId) {
      setActiveFolder(null)
    } else {
      setActiveFolder(folderId)
    }
  }

  const handleAppClick = (appOnClick: () => void) => {
    appOnClick()
    // Don't close folder here - let FolderPanel handle it
  }

  // Demo/mock data for now; replace with real data from props/store
  const globalMessages = [
    { id: "1", user: "Alice", text: "Welcome to DEX World!", time: "09:01" },
    { id: "2", user: "Bob", text: "Void to the moon 🚀", time: "09:02" },
  ]
  const proxMessages = [
    { id: "3", user: "Nearby", text: "Anyone want to trade?", time: "09:03" },
  ]
  const tradingSignals = [
    { id: "4", text: "PSX breakout above $0.01!", time: "09:04" },
  ]
  const friendsOnlineData = [
    { id: "f1", name: "Charlie", avatar: "/avatars/charlie.png" },
    { id: "f2", name: "Dana", avatar: "/avatars/dana.png" },
  ]
  const onSendChat = (channel: "global" | "prox", text: string) => {
    // TODO: Integrate with chat system
    console.log(`Send to ${channel}:`, text)
  }
  const onDM = (friendId: string) => {
    // TODO: Open DM panel
    console.log("DM friend:", friendId)
  }

  // Mock data for new HUD components
  const announcements = [
    { id: "1", type: "project" as const, title: "New Casino District Opening", description: "Grand opening this Friday! Exclusive NFTs for early visitors", urgent: true },
    { id: "2", type: "job" as const, title: "Hiring: 3D Modelers", description: "Build custom avatars and wearables. 5000 PSX/model", link: "#" },
    { id: "3", type: "collab" as const, title: "Creator Collab: Music x Visual", description: "Looking for musicians to score upcoming event", link: "#" },
    { id: "4", type: "event" as const, title: "DAO Vote: Treasury Allocation", description: "Vote ends in 48 hours. Your voice matters!", link: "#" },
  ]

  const nearbyPlayers = [
    { id: "n1", name: "NearbyUser1", distance: 8, avatar: "/avatars/n1.png" },
    { id: "n2", name: "NearbyUser2", distance: 15, avatar: "/avatars/n2.png" },
  ]

  const tokenPrices = [
    { symbol: "VOID", name: "VOID Token", price: 0.0042, change24h: 5.2, volume: 125000 },
    { symbol: "PSX", name: "PSX Token", price: 0.0089, change24h: -2.1, volume: 89000 },
    { symbol: "ETH", name: "Ethereum", price: 2450.32, change24h: 1.8, volume: 15000000 },
    { symbol: "BTC", name: "Bitcoin", price: 42150.0, change24h: 3.2, volume: 28000000 },
  ]

  const daoProposals = [
    {
      id: "p1",
      title: "Allocate 100K VOID to Marketing",
      votesFor: 1250,
      votesAgainst: 320,
      endsIn: "2 days",
      status: "active" as const,
    },
    {
      id: "p2",
      title: "Launch Creator Grant Program",
      votesFor: 980,
      votesAgainst: 150,
      endsIn: "5 days",
      status: "active" as const,
    },
  ]

  const dailyTasksMock = [
    { id: "t1", title: "Visit 3 districts", xpReward: 50, completed: true, progress: 3, target: 3 },
    { id: "t2", title: "Chat with 5 players", xpReward: 30, completed: false, progress: 2, target: 5 },
    { id: "t3", title: "Complete a trade", xpReward: 75, completed: false, progress: 0, target: 1 },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9980 }}>
      {/* Top Ticker - Announcements */}
      <TopTicker announcements={announcements} />

      {/* Top-Left: MySpace Panel (replaces PlayerChip) */}
      <div className="absolute top-0 left-0 pointer-events-auto">
        <MySpacePanel
          username={username}
          avatarUrl={avatarUrl}
          walletAddress={walletAddress}
          voidBalance={voidBalance}
          psxBalance={psxBalance}
          friends={friendsOnline.map(f => ({ ...f, status: "online" as const }))}
          ownedLand={[
            { id: "1", name: "Downtown Parcel", location: "VOID District", value: 5000 },
            { id: "2", name: "Casino Plaza", location: "Entertainment", value: 12000 },
          ]}
          createdApps={[
            { id: "1", name: "My Casino", icon: "🎰", users: 245 },
          ]}
          createdSKUs={[
            { id: "1", name: "Cyberpunk Jacket", sales: 89 },
          ]}
          level={level}
          xp={totalXP}
          achievements={42}
          onViewWallet={onWalletOpen}
          onViewFriends={onFriendsOpen}
          onViewLand={onZonesOpen}
          onViewCreations={onAgencyOpen}
        />
      </div>

      {/* Social Hub - Left side, below MySpace */}
      <SocialHub
        friendsOnline={friendsOnline.map(f => ({ ...f, distance: Math.floor(Math.random() * 100) }))}
        friendsOffline={[
          { id: "off1", name: "OfflineUser1", avatar: "/avatars/off1.png" },
          { id: "off2", name: "OfflineUser2", avatar: "/avatars/off2.png" },
        ]}
        nearbyPlayers={nearbyPlayers}
        guilds={[
          { id: "g1", name: "Crypto Punks", members: 156, icon: "⚔️" },
          { id: "g2", name: "DeFi Degens", members: 89, icon: "💎" },
        ]}
        parties={[]}
        totalFriends={friendsOnline.length + 2}
        unreadDMs={3}
        voiceChatActive={false}
        onOpenDM={(friendId) => console.log("Open DM:", friendId)}
        onJoinVoice={() => console.log("Join voice")}
        onInviteParty={(playerId) => console.log("Invite:", playerId)}
        onViewGuild={(guildId) => console.log("View guild:", guildId)}
      />

      {/* Web3 Trading Hub - Bottom right */}
      <Web3TradingHub
        tokens={tokenPrices}
        voidBalance={voidBalance}
        psxBalance={psxBalance}
        totalValueUSD={(voidBalance * 0.0042) + (psxBalance * 0.0089)}
        nfts={[
          { id: "nft1", name: "Cyberpunk Avatar #42", image: "/nfts/avatar.png", floor: 500, collection: "Avatars" },
        ]}
        onOpenSwap={() => console.log("Open swap")}
        onOpenChart={(symbol) => console.log("Open chart:", symbol)}
        onOpenNFT={(nftId) => console.log("Open NFT:", nftId)}
        onOpenWallet={onWalletOpen}
      />

      {/* DAO & XP Panel - Top right, next to map */}
      <DAOXPPanel
        activeProposals={2}
        userVotingPower={1500}
        totalVotes={5000}
        daoTreasury={250000}
        level={level}
        currentXP={current}
        xpToNextLevel={required}
        dailyTasksCompleted={1}
        totalDailyTasks={3}
        currentStreak={7}
        achievements={42}
        proposals={daoProposals}
        tasks={dailyTasksMock}
        onVote={(proposalId) => console.log("Vote on:", proposalId)}
        onViewProposal={(proposalId) => console.log("View proposal:", proposalId)}
        onViewTasks={onXPOpen}
      />

      {/* Top-Center: Token Ticker */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-auto">
        <TokenTicker
          voidPrice={voidPrice}
          voidChange={voidChange}
          psxPrice={psxPrice}
          psxChange={psxChange}
        />
      </div>

      {/* Top-Right: Map Widget - moved to avoid overlap with DAO panel */}
      <div className="absolute top-14 right-[400px] pointer-events-auto">
        <MapWidget
          playerPosition={playerPosition}
          playerRotation={playerRotation}
          onClick={onMapClick}
        />
      </div>

      {/* Chat Panel - Bottom Left (removed from top, now at bottom) */}
      <ChatPanel
        globalMessages={globalMessages}
        proxMessages={proxMessages}
        tradingSignals={tradingSignals}
        friendsOnline={friendsOnline || []}
        onSend={onSendChat}
        onDM={onDM}
      />

      {/* Bottom-Center: Context Action */}
      {contextAction && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-auto">
          <ContextAction action={contextAction} onInteract={onInteract} />
        </div>
      )}


      {/* Bottom: Folder Row (split left/right) + XP Widget */}
      <BottomFolderRow
        leftFolders={leftFolders}
        rightFolders={rightFolders}
        activeFolder={activeFolder}
        onFolderClick={handleFolderClick}
        xpLevel={level}
        xpCurrent={current}
        xpRequired={required}
        onXPClick={onXPOpen}
      />

      {/* Folder Panel (Slides up from bottom) */}
      <FolderPanel
        folder={selectedFolder || null}
        isOpen={!!activeFolder}
        onClose={() => setActiveFolder(null)}
        onAppClick={handleAppClick}
      />
    </div>
  )
}
