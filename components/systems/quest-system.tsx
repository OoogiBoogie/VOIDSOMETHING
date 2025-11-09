"use client"

import { Swords, Award } from "lucide-react"
import { MobileOptimizedWrapper } from "@/components/mobile/MobileOptimizedComponents"

export function QuestSystem() {
  const quests = [
    { id: 1, name: "Daily Login", type: "Daily", reward: "100 XP", progress: 100, completed: true },
    { id: 2, name: "Explore 3 Districts", type: "Daily", reward: "250 XP", progress: 66, completed: false },
    { id: 3, name: "Trade with Players", type: "Weekly", reward: "1000 XP", progress: 40, completed: false },
    { id: 4, name: "Win 10 Casino Games", type: "Weekly", reward: "500 XP + NFT", progress: 30, completed: false },
  ]

  return (
    <MobileOptimizedWrapper
      title="Quests"
      preventPullToRefresh={true}
      adjustForKeyboard={false}
    >
    <div className="space-y-4">
      {quests.map((quest) => (
        <div
          key={quest.id}
          className={`p-4 rounded-xl border-2 ${
            quest.completed
              ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400"
              : "bg-white/5 border-white/10"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <Swords className="w-6 h-6 text-purple-400" />
              <div>
                <h3 className="font-bold text-lg">{quest.name}</h3>
                <p className="text-sm text-gray-400">{quest.type} Quest</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-yellow-400 font-bold">
                <Award className="w-4 h-4" />
                {quest.reward}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-bold">{quest.progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${quest.progress}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
    </MobileOptimizedWrapper>
  )
}
