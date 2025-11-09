"use client"

import { Trophy } from "lucide-react"
import { MobileOptimizedWrapper } from "@/components/mobile/MobileOptimizedComponents"

export function AchievementSystem() {
  const achievements = [
    { id: 1, name: "First Steps", description: "Enter the VOID Metaverse", progress: 100, unlocked: true, icon: "🎯" },
    { id: 2, name: "Social Butterfly", description: "Make 10 friends", progress: 60, unlocked: false, icon: "👥" },
    { id: 3, name: "Property Tycoon", description: "Own 5 properties", progress: 40, unlocked: false, icon: "🏢" },
    { id: 4, name: "VOID Master", description: "Reach level 50", progress: 25, unlocked: false, icon: "⭐" },
  ]

  return (
    <MobileOptimizedWrapper
      title="Achievements"
      preventPullToRefresh={true}
      adjustForKeyboard={false}
    >
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-xl border-2 ${
              achievement.unlocked
                ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">{achievement.icon}</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{achievement.name}</h3>
                <p className="text-sm text-gray-400">{achievement.description}</p>
              </div>
              {achievement.unlocked && <Trophy className="w-5 h-5 text-yellow-400" />}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-bold">{achievement.progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${achievement.unlocked ? "bg-yellow-400" : "bg-purple-500"}`}
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </MobileOptimizedWrapper>
  )
}
