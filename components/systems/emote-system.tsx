"use client"

import { Smile } from "lucide-react"
import { MobileOptimizedWrapper } from "@/components/mobile/MobileOptimizedComponents"

export function EmoteSystem() {
  const emotes = [
    { name: "Wave", icon: "👋", unlocked: true },
    { name: "Dance", icon: "💃", unlocked: true },
    { name: "Thumbs Up", icon: "👍", unlocked: true },
    { name: "Heart", icon: "❤️", unlocked: true },
    { name: "Celebration", icon: "🎉", unlocked: false },
    { name: "Crying", icon: "😭", unlocked: false },
  ]

  return (
    <MobileOptimizedWrapper
      title="Emotes"
      preventPullToRefresh={true}
      adjustForKeyboard={false}
    >
    <div className="space-y-6">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {emotes.map((emote, i) => (
          <button
            key={i}
            disabled={!emote.unlocked}
            className={`aspect-square p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 ${
              emote.unlocked
                ? "bg-white/5 border-white/10 hover:bg-white/10"
                : "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
            }`}
          >
            <span className="text-4xl">{emote.icon}</span>
            <span className="text-xs font-bold">{emote.name}</span>
            {!emote.unlocked && <Lock className="w-4 h-4 text-gray-500" />}
          </button>
        ))}
      </div>

      <div className="p-6 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-pink-400 text-center">
        <Smile className="w-12 h-12 mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-2">Express Yourself</h3>
        <p className="text-gray-300">Unlock new emotes by completing achievements and quests</p>
      </div>
    </div>
    </MobileOptimizedWrapper>
  )
}
