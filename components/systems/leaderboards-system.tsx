"use client"

import { Trophy, TrendingUp, Award } from "lucide-react"
import { MobileOptimizedWrapper } from "@/components/mobile/MobileOptimizedComponents"

export function LeaderboardsSystem() {
  const leaderboard = [
    { rank: 1, name: "CryptoKing", score: 15420, change: 0, avatar: "👑" },
    { rank: 2, name: "VoidMaster", score: 14890, change: 2, avatar: "🎮" },
    { rank: 3, name: "MetaLord", score: 13250, change: -1, avatar: "⚡" },
    { rank: 4, name: "PixelWarrior", score: 12100, change: 1, avatar: "🗡️" },
    { rank: 5, name: "NeonDreamer", score: 11500, change: -2, avatar: "✨" },
  ]

  return (
    <MobileOptimizedWrapper
      title="Leaderboards"
      preventPullToRefresh={true}
      adjustForKeyboard={false}
    >
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button className="p-4 rounded-xl bg-purple-500/20 border-2 border-purple-400 font-bold">
          <Trophy className="w-6 h-6 mx-auto mb-2" />
          Global
        </button>
        <button className="p-4 rounded-xl bg-white/5 border-2 border-white/10 font-bold">
          <Award className="w-6 h-6 mx-auto mb-2" />
          Friends
        </button>
        <button className="p-4 rounded-xl bg-white/5 border-2 border-white/10 font-bold">
          <TrendingUp className="w-6 h-6 mx-auto mb-2" />
          Weekly
        </button>
      </div>

      <div className="space-y-2">
        {leaderboard.map((entry) => (
          <div
            key={entry.rank}
            className={`p-4 rounded-xl flex items-center gap-4 ${
              entry.rank <= 3
                ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400"
                : "bg-white/5 border-2 border-white/10"
            }`}
          >
            <div className="text-2xl font-bold w-8 text-center">{entry.rank}</div>
            <span className="text-3xl">{entry.avatar}</span>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{entry.name}</h3>
              <p className="text-sm text-gray-400">{entry.score.toLocaleString()} points</p>
            </div>
            {entry.change !== 0 && (
              <div className={`text-sm font-bold ${entry.change > 0 ? "text-green-400" : "text-red-400"}`}>
                {entry.change > 0 ? "↑" : "↓"} {Math.abs(entry.change)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </MobileOptimizedWrapper>
  )
}
