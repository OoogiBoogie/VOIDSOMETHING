// App Folder System - iOS-style grouped apps

export interface App {
  id: string
  name: string
  icon: string // emoji or icon name
  color: string
  onClick: () => void
}

export interface AppFolderData {
  id: string
  name: string
  icon: string
  color: string
  apps: App[]
  badge?: number
  glow?: boolean
}

export function createAppFolders(handlers: {
  onMapOpen: () => void
  onZonesOpen: () => void
  onPortalsOpen: () => void
  onWalletOpen: () => void
  onMarketOpen: () => void
  onVaultOpen: () => void
  onFriendsOpen: () => void
  onVoiceOpen: () => void
  onGuildsOpen: () => void
  onGamesOpen: () => void
  onEventsOpen: () => void
  onLeaderboardOpen: () => void
  onDAOOpen: () => void
  onVotingOpen: () => void
  onXPOpen: () => void
  onAchievementsOpen: () => void
  onStreaksOpen: () => void
  onAgencyOpen: () => void
}): AppFolderData[] {
  return [
    {
      id: "WORLD",
      name: "World",
      icon: "🌍",
      color: "#33E7FF",
      apps: [
        { id: "map", name: "Map", icon: "🗺️", color: "#33E7FF", onClick: handlers.onMapOpen },
        { id: "zones", name: "Real Estate", icon: "🏠", color: "#00FFA6", onClick: handlers.onZonesOpen },
        { id: "portals", name: "Portals", icon: "🌀", color: "#442366", onClick: handlers.onPortalsOpen },
      ],
    },
    {
      id: "FINANCE",
      name: "Finance",
      icon: "💎",
      color: "#FFD700",
      apps: [
        { id: "wallet", name: "Wallet", icon: "💳", color: "#00FFA6", onClick: handlers.onWalletOpen },
        { id: "market", name: "Market", icon: "🛒", color: "#FFD700", onClick: handlers.onMarketOpen },
        { id: "vault", name: "Vault", icon: "🏦", color: "#442366", onClick: handlers.onVaultOpen },
      ],
    },
    {
      id: "SOCIAL",
      name: "Social",
      icon: "👥",
      color: "#00FFA6",
      apps: [
        { id: "friends", name: "Friends", icon: "👥", color: "#00FFA6", onClick: handlers.onFriendsOpen },
        { id: "voice", name: "Voice Chat", icon: "🎙️", color: "#FF00FF", onClick: handlers.onVoiceOpen },
        { id: "guilds", name: "Guilds", icon: "⚔️", color: "#FF6B6B", onClick: handlers.onGuildsOpen },
      ],
    },
    {
      id: "PLAY",
      name: "Games",
      icon: "🎮",
      color: "#FF6B6B",
      apps: [
        { id: "games", name: "Mini Games", icon: "🎮", color: "#FF6B6B", onClick: handlers.onGamesOpen },
        { id: "events", name: "Events", icon: "🎪", color: "#FFA500", onClick: handlers.onEventsOpen },
        { id: "leaderboard", name: "Leaderboards", icon: "🏆", color: "#FFD700", onClick: handlers.onLeaderboardOpen },
      ],
    },
    {
      id: "DAO",
      name: "Governance",
      icon: "⚖️",
      color: "#442366",
      apps: [
        { id: "dao", name: "Proposals", icon: "📜", color: "#442366", onClick: handlers.onDAOOpen },
        { id: "voting", name: "Voting", icon: "🗳️", color: "#7C3AED", onClick: handlers.onVotingOpen },
      ],
    },
    {
      id: "PROGRESS",
      name: "Progress",
      icon: "⭐",
      color: "#00FFA6",
      glow: true, // Highlight this folder
      apps: [
        { id: "xp", name: "XP & Tasks", icon: "⭐", color: "#00FFA6", onClick: handlers.onXPOpen },
        { id: "achievements", name: "Achievements", icon: "🏅", color: "#FFD700", onClick: handlers.onAchievementsOpen },
        { id: "streaks", name: "Streaks", icon: "🔥", color: "#FF6B6B", onClick: handlers.onStreaksOpen },
      ],
      badge: 3, // Number of incomplete daily tasks
    },
    {
      id: "CREATOR",
      name: "Creator",
      icon: "🎨",
      color: "#7C3AED",
      apps: [
        { id: "agency", name: "Agency HQ", icon: "🏢", color: "#7C3AED", onClick: handlers.onAgencyOpen },
      ],
    },
  ]
}
