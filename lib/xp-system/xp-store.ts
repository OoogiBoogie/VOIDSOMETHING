"use client"

import { create } from "zustand"
import { PlayerXPData, DailyTask, XPEvent, generateDailyTasks, getLevelFromXP, getXPProgressInLevel } from "./xp-utils"

interface XPStore extends PlayerXPData {
  // Actions
  addXP: (amount: number, source: string, category: string) => void
  completeTask: (taskId: string) => void
  updateTaskProgress: (taskId: string, progress: number) => void
  resetDailyTasks: () => void
  updateStreak: () => void
  
  // Event listeners
  onXPGained?: (event: XPEvent) => void
  onLevelUp?: (newLevel: number) => void
  onTaskCompleted?: (task: DailyTask) => void
}

export const useXPStore = create<XPStore>((set, get) => ({
  // Initial state
  level: 4,
  currentXP: 0,
  xpToNextLevel: 650,
  totalXP: 2450,
  dailyTasks: generateDailyTasks(),
  weeklyMilestone: {
    current: 2450,
    target: 5000,
    reward: "500 VOID + Rare Badge",
  },
  streak: {
    current: 7,
    longest: 12,
    lastLogin: new Date(),
  },
  recentEvents: [],

  // Add XP
  addXP: (amount: number, source: string, category: string) => {
    const state = get()
    const newTotalXP = state.totalXP + amount
    const newLevel = getLevelFromXP(newTotalXP)
    const leveledUp = newLevel > state.level
    
    const progress = getXPProgressInLevel(newTotalXP, newLevel)
    
    const event: XPEvent = {
      id: `xp-${Date.now()}`,
      timestamp: new Date(),
      amount,
      source,
      category,
    }
    
    set({
      totalXP: newTotalXP,
      level: newLevel,
      currentXP: progress.current,
      xpToNextLevel: progress.required,
      recentEvents: [event, ...state.recentEvents.slice(0, 19)], // Keep last 20
    })
    
    // Trigger callbacks
    state.onXPGained?.(event)
    if (leveledUp) {
      state.onLevelUp?.(newLevel)
    }
  },

  // Complete a daily task
  completeTask: (taskId: string) => {
    const state = get()
    const task = state.dailyTasks.find((t) => t.id === taskId)
    
    if (!task || task.completed) return
    
    const updatedTasks = state.dailyTasks.map((t) =>
      t.id === taskId ? { ...t, completed: true, progress: t.total } : t
    )
    
    set({ dailyTasks: updatedTasks })
    
    // Add XP reward
    state.addXP(task.rewardXP, `Daily: ${task.title}`, task.category)
    state.onTaskCompleted?.(task)
  },

  // Update task progress
  updateTaskProgress: (taskId: string, progress: number) => {
    const state = get()
    const task = state.dailyTasks.find((t) => t.id === taskId)
    
    if (!task || task.completed) return
    
    const updatedTasks = state.dailyTasks.map((t) => {
      if (t.id === taskId) {
        const newProgress = Math.min(progress, t.total)
        const nowCompleted = newProgress >= t.total
        return { ...t, progress: newProgress, completed: nowCompleted }
      }
      return t
    })
    
    set({ dailyTasks: updatedTasks })
    
    // Auto-complete if reached total
    if (task.progress < task.total && progress >= task.total) {
      state.completeTask(taskId)
    }
  },

  // Reset daily tasks (call at midnight or on new day)
  resetDailyTasks: () => {
    set({ dailyTasks: generateDailyTasks() })
  },

  // Update login streak
  updateStreak: () => {
    const state = get()
    const now = new Date()
    const lastLogin = state.streak.lastLogin
    const daysSince = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSince === 1) {
      // Consecutive day
      const newCurrent = state.streak.current + 1
      set({
        streak: {
          ...state.streak,
          current: newCurrent,
          longest: Math.max(newCurrent, state.streak.longest),
          lastLogin: now,
        },
      })
    } else if (daysSince > 1) {
      // Streak broken
      set({
        streak: {
          ...state.streak,
          current: 1,
          lastLogin: now,
        },
      })
    }
    // Same day: no change
  },
}))
