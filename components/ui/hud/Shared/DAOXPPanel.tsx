"use client"

import { useState } from "react"
import { Scale, Vote, TrendingUp, Target, Award, Flame, CheckCircle } from "lucide-react"

interface DAOXPPanelProps {
  // DAO Stats
  activeProposals: number
  userVotingPower: number
  totalVotes: number
  daoTreasury: number
  
  // XP & Progress
  level: number
  currentXP: number
  xpToNextLevel: number
  dailyTasksCompleted: number
  totalDailyTasks: number
  currentStreak: number
  achievements: number
  
  // Proposals
  proposals: {
    id: string
    title: string
    votesFor: number
    votesAgainst: number
    endsIn: string
    status: "active" | "passed" | "failed"
  }[]
  
  // Daily Tasks
  tasks: {
    id: string
    title: string
    xpReward: number
    completed: boolean
    progress: number
    target: number
  }[]
  
  // Actions
  onVote?: (proposalId: string) => void
  onViewProposal?: (proposalId: string) => void
  onViewTasks?: () => void
}

export function DAOXPPanel({
  activeProposals,
  userVotingPower,
  totalVotes,
  daoTreasury,
  level,
  currentXP,
  xpToNextLevel,
  dailyTasksCompleted,
  totalDailyTasks,
  currentStreak,
  achievements,
  proposals,
  tasks,
  onVote,
  onViewProposal,
  onViewTasks,
}: DAOXPPanelProps) {
  const [activeTab, setActiveTab] = useState<"dao" | "xp" | "tasks">("dao")

  const xpPercentage = (currentXP / xpToNextLevel) * 100

  return (
    <div className="fixed top-14 right-4 w-[380px] bg-[rgba(10,12,24,0.98)] rounded-2xl shadow-2xl border-2 border-[#442366]/40 z-[9992] pointer-events-auto overflow-hidden">
      {/* Header */}
      <div className="relative p-4 bg-gradient-to-br from-[#442366]/10 via-transparent to-[#00FFA6]/10 border-b-2 border-[#442366]/20">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "repeating-linear-gradient(0deg, #442366 0px, #442366 1px, transparent 1px, transparent 4px)"
        }} />
        
        <div className="relative flex items-start gap-4">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#442366] to-[#00FFA6] shadow-[0_0_30px_rgba(68,35,102,0.5)]">
            <Scale className="w-8 h-8 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-xl font-black font-[family-name:var(--font-orbitron)] text-[#442366] mb-1">
              DAO & PROGRESS
            </h2>
            <div className="flex items-center gap-3 text-xs text-white/60">
              <span>LV {level}</span>
              <span>•</span>
              <span>{currentXP}/{xpToNextLevel} XP</span>
              <span>•</span>
              <span>{currentStreak}🔥 streak</span>
            </div>
          </div>

          {/* Level Badge */}
          <div className="w-14 h-14 rounded-full bg-[#00FFA6]/20 border-4 border-[#00FFA6] flex items-center justify-center animate-pulse-slow">
            <span className="text-2xl font-black font-[family-name:var(--font-orbitron)] text-[#00FFA6]">
              {level}
            </span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="relative mt-4">
          <div className="h-3 bg-[#0A0A19] rounded-full overflow-hidden border border-[#00FFA6]/20">
            <div
              className="h-full bg-gradient-to-r from-[#00FFA6] to-[#33E7FF] transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1 text-white/60">
            <span>Level {level}</span>
            <span className="text-[#00FFA6] font-bold">{currentXP} / {xpToNextLevel} XP</span>
            <span>Level {level + 1}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-2 border-b border-white/10 bg-[#0A0A19]">
        {[
          { id: "dao", label: "DAO", icon: Scale },
          { id: "xp", label: "XP & Stats", icon: TrendingUp },
          { id: "tasks", label: "Daily Tasks", icon: Target },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === tab.id
                ? "bg-[#442366]/20 text-[#442366] border border-[#442366]/40"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4 mx-auto mb-0.5" />
            <div>{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-[350px] overflow-y-auto">
        {/* DAO Tab */}
        {activeTab === "dao" && (
          <div className="space-y-3">
            {/* DAO Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#442366]/10 border border-[#442366]/20">
                <div className="text-[#442366] text-xs mb-1">Active Proposals</div>
                <div className="text-white font-black text-2xl">{activeProposals}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#00FFA6]/10 border border-[#00FFA6]/20">
                <div className="text-[#00FFA6] text-xs mb-1">Treasury</div>
                <div className="text-white font-black text-lg">{(daoTreasury / 1000).toFixed(0)}K</div>
              </div>
            </div>

            {/* Proposals */}
            <div className="text-white/60 text-xs font-bold mb-2">ACTIVE PROPOSALS</div>
            {proposals.length === 0 ? (
              <div className="text-center text-white/40 py-8">No active proposals</div>
            ) : (
              proposals.map((proposal) => {
                const totalVotes = proposal.votesFor + proposal.votesAgainst
                const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0

                return (
                  <div
                    key={proposal.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-white font-bold text-sm mb-1">{proposal.title}</div>
                        <div className="text-white/40 text-xs">Ends in {proposal.endsIn}</div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          proposal.status === "active"
                            ? "bg-[#00FFA6]/20 text-[#00FFA6]"
                            : proposal.status === "passed"
                            ? "bg-[#33E7FF]/20 text-[#33E7FF]"
                            : "bg-[#FF6B6B]/20 text-[#FF6B6B]"
                        }`}
                      >
                        {proposal.status.toUpperCase()}
                      </div>
                    </div>

                    {/* Vote Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#00FFA6]">FOR: {proposal.votesFor}</span>
                        <span className="text-[#FF6B6B]">AGAINST: {proposal.votesAgainst}</span>
                      </div>
                      <div className="h-2 bg-[#FF6B6B]/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00FFA6]"
                          style={{ width: `${forPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    {proposal.status === "active" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onVote?.(proposal.id)}
                          className="flex-1 px-3 py-1.5 rounded bg-[#00FFA6]/20 hover:bg-[#00FFA6]/30 text-[#00FFA6] text-xs font-bold transition"
                        >
                          Vote
                        </button>
                        <button
                          onClick={() => onViewProposal?.(proposal.id)}
                          className="flex-1 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition"
                        >
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* XP & Stats Tab */}
        {activeTab === "xp" && (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Total XP" value={currentXP.toLocaleString()} color="#00FFA6" />
              <StatCard icon={<Award className="w-5 h-5" />} label="Achievements" value={achievements.toString()} color="#FFD700" />
              <StatCard icon={<Flame className="w-5 h-5" />} label="Streak" value={`${currentStreak} days`} color="#FF6B6B" />
              <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Tasks Done" value={`${dailyTasksCompleted}/${totalDailyTasks}`} color="#33E7FF" />
            </div>

            {/* Level Progress */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#00FFA6]/10 to-[#442366]/10 border border-[#00FFA6]/20">
              <div className="text-white font-bold mb-2">Level Progress</div>
              <div className="text-white/60 text-sm mb-3">
                {xpToNextLevel - currentXP} XP needed for Level {level + 1}
              </div>
              <div className="h-6 bg-[#0A0A19] rounded-full overflow-hidden border border-[#00FFA6]/20">
                <div
                  className="h-full bg-gradient-to-r from-[#00FFA6] to-[#33E7FF] flex items-center justify-center text-xs font-bold text-black"
                  style={{ width: `${xpPercentage}%` }}
                >
                  {xpPercentage > 10 && `${xpPercentage.toFixed(0)}%`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Daily Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white/60 text-xs font-bold">
                TODAY'S TASKS ({dailyTasksCompleted}/{totalDailyTasks})
              </div>
              <button
                onClick={onViewTasks}
                className="text-[#00FFA6] text-xs font-bold hover:text-[#33E7FF] transition"
              >
                View All
              </button>
            </div>

            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-xl border transition ${
                  task.completed
                    ? "bg-[#00FFA6]/10 border-[#00FFA6]/20"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className={`font-bold text-sm ${task.completed ? "text-[#00FFA6] line-through" : "text-white"}`}>
                      {task.title}
                    </div>
                    <div className="text-white/60 text-xs mt-0.5">
                      {task.progress}/{task.target} • +{task.xpReward} XP
                    </div>
                  </div>
                  {task.completed && <CheckCircle className="w-5 h-5 text-[#00FFA6]" />}
                </div>

                {!task.completed && (
                  <div className="h-1.5 bg-[#0A0A19] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00FFA6]"
                      style={{ width: `${(task.progress / task.target) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper component
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-1">
        <div style={{ color }}>{icon}</div>
        <div className="text-white/60 text-xs">{label}</div>
      </div>
      <div className="text-white font-black text-xl">{value}</div>
    </div>
  )
}
