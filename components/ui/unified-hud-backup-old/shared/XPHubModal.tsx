"use client"

import { useXPStore } from "@/lib/xp-system/xp-store"
import { getTaskCategoryColor, getTaskCategoryIcon } from "@/lib/xp-system/xp-utils"

interface XPHubModalProps {
  isOpen: boolean
  onClose: () => void
}

export function XPHubModal({ isOpen, onClose }: XPHubModalProps) {
  const { level, currentXP, xpToNextLevel, totalXP, dailyTasks, streak, weeklyMilestone } = useXPStore()

  if (!isOpen) return null

  const incompleteTasks = dailyTasks.filter((t) => !t.completed)
  const completedTasks = dailyTasks.filter((t) => t.completed)

  const currentLevelXP = totalXP - currentXP
  const nextLevelXP = currentLevelXP + xpToNextLevel
  const percentage = (currentXP / xpToNextLevel) * 100

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-[8px] z-[9990]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9995] flex items-center justify-center pointer-events-none p-8">
        <div className="pointer-events-auto w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[rgba(5,7,19,0.95)] backdrop-blur-[25px] border-2 border-[#00FFA6] rounded-2xl shadow-[0_0_40px_rgba(0,255,166,0.3)]">
          
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#00FFA6]/20 to-[#33E7FF]/20 border-b border-[#00FFA6]/30 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#00FFA6]/20 border-2 border-[#00FFA6] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,166,0.5)]">
                  <span className="text-2xl font-bold font-[family-name:var(--font-orbitron)] text-[#00FFA6]">
                    {level}
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold font-[family-name:var(--font-orbitron)] text-white">
                    PROGRESS HUB
                  </h2>
                  <p className="text-sm text-white/50 mt-1">
                    Level {level} • {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all duration-150"
              >
                ✕
              </button>
            </div>

            {/* XP Bar */}
            <div className="mt-4">
              <div className="h-3 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00FFA6] to-[#33E7FF] transition-all duration-300 shadow-[0_0_10px_rgba(0,255,166,0.5)]"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[rgba(255,255,255,0.05)] border border-[#00FFA6]/30 rounded-xl p-4">
                <div className="text-xs text-white/50 mb-1">Current Streak</div>
                <div className="text-2xl font-bold font-[family-name:var(--font-orbitron)] text-[#FF6B6B]">
                  🔥 {streak?.current || 0} {(streak?.current || 0) === 1 ? "day" : "days"}
                </div>
              </div>
              <div className="bg-[rgba(255,255,255,0.05)] border border-[#00FFA6]/30 rounded-xl p-4">
                <div className="text-xs text-white/50 mb-1">Longest Streak</div>
                <div className="text-2xl font-bold font-[family-name:var(--font-orbitron)] text-[#FFD700]">
                  ⭐ {streak?.longest || 0} {(streak?.longest || 0) === 1 ? "day" : "days"}
                </div>
              </div>
              <div className="bg-[rgba(255,255,255,0.05)] border border-[#00FFA6]/30 rounded-xl p-4">
                <div className="text-xs text-white/50 mb-1">Weekly Milestone</div>
                <div className="text-2xl font-bold font-[family-name:var(--font-orbitron)] text-[#33E7FF]">
                  {weeklyMilestone?.current?.toLocaleString() || "0"} / {weeklyMilestone?.target?.toLocaleString() || "5000"}
                </div>
              </div>
            </div>

            {/* Daily Tasks */}
            <div>
              <h3 className="text-xl font-bold font-[family-name:var(--font-orbitron)] text-[#00FFA6] mb-4">
                DAILY TASKS ({completedTasks.length}/{dailyTasks.length})
              </h3>
              
              {/* Incomplete Tasks */}
              {incompleteTasks.length > 0 && (
                <div className="space-y-3 mb-4">
                  {incompleteTasks.map((task) => {
                    const color = getTaskCategoryColor(task.category)
                    const icon = getTaskCategoryIcon(task.category)
                    const progress = task.total ? (task.progress / task.total) * 100 : 0

                    return (
                      <div
                        key={task.id}
                        className="bg-[rgba(255,255,255,0.05)] border border-white/20 hover:border-[#00FFA6]/50 rounded-xl p-4 transition-all duration-150"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl border"
                              style={{ backgroundColor: `${color}20`, borderColor: `${color}60` }}
                            >
                              {icon}
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{task.title}</h4>
                              <p className="text-xs text-white/50 mt-0.5">{task.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-[#00FFA6]">+{task.rewardXP} XP</span>
                            {task.rewardVOID && <span className="text-[#FFD700]">+{task.rewardVOID} VOID</span>}
                            {task.rewardPSX && <span className="text-[#442366]">+{task.rewardPSX} PSX</span>}
                          </div>
                        </div>

                        {/* Progress Bar (if applicable) */}
                        {task.total && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                              <span>
                                {task.progress} / {task.total}
                              </span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
                              <div
                                className="h-full transition-all duration-300"
                                style={{ width: `${progress}%`, backgroundColor: color }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-white/30 uppercase tracking-wide">Completed</div>
                  {completedTasks.map((task) => {
                    const color = getTaskCategoryColor(task.category)
                    const icon = getTaskCategoryIcon(task.category)

                    return (
                      <div
                        key={task.id}
                        className="bg-[rgba(0,255,166,0.05)] border border-[#00FFA6]/30 rounded-xl p-3 opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg">
                            ✓
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white line-through">{task.title}</h4>
                          </div>
                          <div className="text-xs text-[#00FFA6]">+{task.rewardXP} XP</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
