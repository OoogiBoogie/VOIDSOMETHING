"use client"

import { useXPStore } from "@/lib/xp-system/xp-store"
import { getXPProgressInLevel } from "@/lib/xp-system/xp-utils"
import { useState, useEffect } from "react"

interface XPWidgetProps {
  compact?: boolean
  onClick?: () => void
  className?: string
}

export function XPWidget({ compact = false, onClick, className = "" }: XPWidgetProps) {
  const { level, currentXP, xpToNextLevel, totalXP, dailyTasks } = useXPStore()
  const [showGainedXP, setShowGainedXP] = useState(false)
  const [gainedAmount, setGainedAmount] = useState(0)

  const { current, required } = getXPProgressInLevel(totalXP, level)
  const percentage = (current / required) * 100

  const incompleteTasks = dailyTasks.filter((t) => !t.completed).length

  // Subscribe to XP gains for animation
  useEffect(() => {
    const store = useXPStore.getState()
    if (store.onXPGained) {
      store.onXPGained = (event) => {
        setGainedAmount(event.amount)
        setShowGainedXP(true)
        setTimeout(() => setShowGainedXP(false), 2000)
      }
    }
  }, [])

  if (compact) {
    // Compact mode: Small pill for Mobile Roam
    return (
      <button
        onClick={onClick}
        className={`
          relative flex items-center gap-2 px-3 py-1.5 rounded-full
          bg-[rgba(10,10,25,0.85)] backdrop-blur-[25px] border border-[#00FFA6]/30
          hover:border-[#00FFA6] hover:bg-[rgba(10,10,25,0.95)] transition-all duration-150
          ${className}
        `}
      >
        {/* Level Badge */}
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00FFA6]/20 border border-[#00FFA6]">
          <span className="text-[10px] font-[family-name:var(--font-orbitron)] text-[#00FFA6]">
            {level}
          </span>
        </div>

        {/* XP Bar */}
        <div className="w-20 h-1.5 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00FFA6] to-[#33E7FF] transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Tasks Badge */}
        {incompleteTasks > 0 && (
          <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#FF6B6B] border border-white/20">
            <span className="text-[8px] font-bold text-white">{incompleteTasks}</span>
          </div>
        )}
      </button>
    )
  }

  // Full mode: Desktop Roam horizontal bar
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center gap-3 px-4 py-2 rounded-lg
        bg-[rgba(10,10,25,0.75)] backdrop-blur-[25px] border border-[#00FFA6]/30
        hover:border-[#00FFA6] hover:bg-[rgba(10,10,25,0.9)] transition-all duration-150
        ${className}
      `}
    >
      {/* Level Circle */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00FFA6]/20 border-2 border-[#00FFA6] shadow-[0_0_10px_rgba(0,255,166,0.3)]">
        <span className="text-sm font-bold font-[family-name:var(--font-orbitron)] text-[#00FFA6]">
          {level}
        </span>
      </div>

      {/* XP Info */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-[family-name:var(--font-orbitron)] text-white/70">
            LEVEL {level}
          </span>
          <span className="text-xs font-mono text-white/50">
            {current.toLocaleString()} / {required.toLocaleString()}
          </span>
        </div>

        {/* XP Bar */}
        <div className="relative w-full h-2 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00FFA6] to-[#33E7FF] transition-all duration-300 shadow-[0_0_10px_rgba(0,255,166,0.5)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Daily Tasks Badge */}
      {incompleteTasks > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#FF6B6B]/20 border border-[#FF6B6B]">
          <span className="text-[10px] font-[family-name:var(--font-orbitron)] text-[#FF6B6B]">
            {incompleteTasks} TASKS
          </span>
        </div>
      )}

      {/* XP Gained Toast */}
      {showGainedXP && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#00FFA6] text-white text-xs font-bold shadow-[0_0_15px_rgba(0,255,166,0.8)] animate-bounce"
        >
          +{gainedAmount} XP
        </div>
      )}
    </button>
  )
}
