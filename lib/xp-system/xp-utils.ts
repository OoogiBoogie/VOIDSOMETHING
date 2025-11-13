// XP System - Core Service for Player Progression
// Event-driven updates, no polling

export interface DailyTask {
  id: string
  title: string
  category: "social" | "trade" | "explore" | "build" | "dao"
  description: string
  rewardXP: number
  rewardVOID?: number
  rewardPSX?: number
  completed: boolean
  progress: number
  total: number
}

export interface XPEvent {
  id: string
  timestamp: Date
  amount: number
  source: string
  category: string
}

export interface PlayerXPData {
  level: number
  currentXP: number
  xpToNextLevel: number
  totalXP: number
  dailyTasks: DailyTask[]
  weeklyMilestone?: {
    current: number
    target: number
    reward: string
  }
  streak: {
    current: number
    longest: number
    lastLogin: Date
  }
  recentEvents: XPEvent[]
}

// XP calculation formula
export function calculateXPForLevel(level: number): number {
  // Progressive curve: level^2 * 100 + level * 50
  return Math.floor(level * level * 100 + level * 50)
}

export function getLevelFromXP(totalXP: number): number {
  let level = 1
  let xpRequired = 0
  
  while (xpRequired <= totalXP) {
    level++
    xpRequired += calculateXPForLevel(level)
  }
  
  return level - 1
}

export function getXPProgressInLevel(totalXP: number, level: number): { current: number; required: number } {
  let xpForPreviousLevels = 0
  for (let i = 1; i < level; i++) {
    xpForPreviousLevels += calculateXPForLevel(i)
  }
  
  const currentInLevel = totalXP - xpForPreviousLevels
  const requiredForThisLevel = calculateXPForLevel(level)
  
  return {
    current: currentInLevel,
    required: requiredForThisLevel,
  }
}

// Sample daily tasks generator
export function generateDailyTasks(): DailyTask[] {
  return [
    {
      id: "daily-1",
      title: "Visit PSX HQ",
      category: "explore",
      description: "Teleport to or walk to PSX HQ zone",
      rewardXP: 50,
      rewardVOID: 10,
      completed: false,
      progress: 0,
      total: 1,
    },
    {
      id: "daily-2",
      title: "Trade in Market",
      category: "trade",
      description: "Complete 1 trade in the marketplace",
      rewardXP: 75,
      rewardVOID: 25,
      completed: false,
      progress: 0,
      total: 1,
    },
    {
      id: "daily-3",
      title: "Chat Activity",
      category: "social",
      description: "Send 5 messages in global or proximity chat",
      rewardXP: 30,
      completed: false,
      progress: 0,
      total: 5,
    },
    {
      id: "daily-4",
      title: "Explore 3 Districts",
      category: "explore",
      description: "Visit 3 different districts",
      rewardXP: 100,
      rewardPSX: 50,
      completed: false,
      progress: 0,
      total: 3,
    },
    {
      id: "daily-5",
      title: "Vote on Proposal",
      category: "dao",
      description: "Cast a vote on any active DAO proposal",
      rewardXP: 150,
      rewardPSX: 100,
      completed: false,
      progress: 0,
      total: 1,
    },
  ]
}

export function getTaskCategoryColor(category: DailyTask["category"]): string {
  switch (category) {
    case "social":
      return "#00FFA6"
    case "trade":
      return "#FFD700"
    case "explore":
      return "#33E7FF"
    case "build":
      return "#FF6B6B"
    case "dao":
      return "#442366"
    default:
      return "#888888"
  }
}

export function getTaskCategoryIcon(category: DailyTask["category"]): string {
  switch (category) {
    case "social":
      return "💬"
    case "trade":
      return "💎"
    case "explore":
      return "🧭"
    case "build":
      return "🏗️"
    case "dao":
      return "⚖️"
    default:
      return "⭐"
  }
}
