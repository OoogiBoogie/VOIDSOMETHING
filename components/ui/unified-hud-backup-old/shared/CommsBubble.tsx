"use client"

import { useState } from "react"
import { MessageSquare, Users, Radio, X } from "lucide-react"

interface CommsBubbleProps {
  friendsOnline: number
  globalUnread: number
  proxUnread: number
  onOpenChat?: (channel: "global" | "prox" | "friends") => void
}

export function CommsBubble({ friendsOnline, globalUnread, proxUnread, onOpenChat }: CommsBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const totalUnread = globalUnread + proxUnread

  return (
    <div className="fixed bottom-4 left-4 z-[9990]">
      {/* Collapsed Pill */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-150 hover:scale-105"
          style={{
            background: "rgba(10, 10, 25, 0.75)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(0, 255, 166, 0.3)",
            boxShadow: "0 0 20px rgba(0, 255, 166, 0.15)",
          }}
        >
          <MessageSquare className="w-4 h-4 text-[#00FFA6]" />
          <div className="flex items-center gap-2">
            <span className="text-[#00FFA6] text-xs font-['Orbitron'] font-semibold">{friendsOnline}</span>
            <span className="text-gray-400 text-xs font-['Inter']">Friends</span>
          </div>
          {totalUnread > 0 && (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse"
              style={{
                background: "linear-gradient(135deg, #FF6B6B, #FF0844)",
                boxShadow: "0 0 10px rgba(255, 8, 68, 0.6)",
              }}
            >
              {totalUnread}
            </div>
          )}
        </button>
      )}

      {/* Expanded Panel */}
      {isExpanded && (
        <div
          className="w-72 rounded-2xl border overflow-hidden animate-expand-up"
          style={{
            background: "rgba(10, 10, 25, 0.85)",
            backdropFilter: "blur(25px)",
            borderColor: "rgba(0, 255, 166, 0.3)",
            boxShadow: "0 0 30px rgba(0, 255, 166, 0.2)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#00FFA6]" />
              <span className="text-[#00FFA6] font-['Orbitron'] font-semibold text-sm">Communications</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Channel Buttons */}
          <div className="p-3 space-y-2">
            <button
              onClick={() => {
                onOpenChat?.("friends")
                setIsExpanded(false)
              }}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-150 hover:scale-102"
            >
              <Users className="w-4 h-4 text-[#00FFA6]" />
              <div className="flex-1 text-left">
                <div className="text-white text-sm font-['Inter']">Friends</div>
                <div className="text-gray-500 text-xs">{friendsOnline} online</div>
              </div>
            </button>

            <button
              onClick={() => {
                onOpenChat?.("global")
                setIsExpanded(false)
              }}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-150 hover:scale-102"
            >
              <MessageSquare className="w-4 h-4 text-[#33E7FF]" />
              <div className="flex-1 text-left">
                <div className="text-white text-sm font-['Inter']">Global Chat</div>
                {globalUnread > 0 && <div className="text-[#33E7FF] text-xs">{globalUnread} new</div>}
              </div>
            </button>

            <button
              onClick={() => {
                onOpenChat?.("prox")
                setIsExpanded(false)
              }}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-150 hover:scale-102"
            >
              <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
              <div className="flex-1 text-left">
                <div className="text-white text-sm font-['Inter']">Proximity Chat</div>
                {proxUnread > 0 && <div className="text-purple-400 text-xs">{proxUnread} new</div>}
              </div>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes expand-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-expand-up {
          animation: expand-up 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  )
}
