"use client"

import { useState } from "react"
import { User, Zap, MapPin } from "lucide-react"

interface PlayerChipProps {
  username: string
  avatarUrl: string
  walletShort: string
  xp: number
  level: number
  zone: string
  coordinates: { x: number; z: number }
  voidBalance: number
  psxBalance: number
  chain: string
  compact?: boolean
}

export function PlayerChip({
  username,
  avatarUrl,
  walletShort,
  xp,
  level,
  zone,
  coordinates,
  voidBalance,
  psxBalance,
  chain,
  compact = false,
}: PlayerChipProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className="fixed top-4 left-4 z-[9990] transition-all duration-150"
      onMouseEnter={() => !compact && setIsExpanded(true)}
      onMouseLeave={() => !compact && setIsExpanded(false)}
      style={{
        width: compact ? "64px" : isExpanded ? "280px" : "180px",
        height: compact ? "64px" : "auto",
      }}
    >
      <div
        className="relative overflow-hidden rounded-2xl border transition-all duration-150"
        style={{
          background: "rgba(10, 10, 25, 0.75)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(0, 255, 166, 0.3)",
          boxShadow: "0 0 20px rgba(0, 255, 166, 0.15)",
        }}
      >
        {/* Compact Icon Mode */}
        {compact && (
          <div className="p-3 flex items-center justify-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{
                background: "linear-gradient(135deg, #00FFA6, #442366)",
                boxShadow: "0 0 10px rgba(0, 255, 166, 0.4)",
              }}
            >
              {avatarUrl.startsWith("http") || avatarUrl.startsWith("data:") ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white">{avatarUrl}</span>
              )}
            </div>
          </div>
        )}

        {/* Full Mode */}
        {!compact && (
          <div className="p-3">
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #00FFA6, #442366)",
                  boxShadow: "0 0 10px rgba(0, 255, 166, 0.4)",
                }}
              >
                {avatarUrl.startsWith("http") || avatarUrl.startsWith("data:") ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white">{avatarUrl}</span>
                )}
              </div>

              {/* Mini Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[#00FFA6] font-semibold text-sm font-['Orbitron'] tracking-wide truncate">
                  {username}
                </div>
                <div className="text-gray-400 text-xs font-mono">{walletShort}</div>
              </div>

              <Zap className="w-4 h-4 text-[#00FFA6] flex-shrink-0" />
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="mt-3 space-y-2 animate-slide-down">
                {/* Balances */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-[#00FFA6]/10 border border-[#00FFA6]/20">
                    <div className="text-[#00FFA6] text-[10px] font-['Inter'] mb-0.5">VOID</div>
                    <div className="text-white font-bold text-sm font-mono tabular-nums truncate">
                      {voidBalance.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-[#442366]/10 border border-[#442366]/20">
                    <div className="text-[#442366] text-[10px] font-['Inter'] mb-0.5">PSX</div>
                    <div className="text-white font-bold text-sm font-mono tabular-nums truncate">
                      {psxBalance.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* XP */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 font-['Inter']">Level {level}</span>
                    <span className="text-[#00FFA6] font-mono">{xp} XP</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00FFA6] to-[#442366]"
                      style={{ width: `${(xp % 1000) / 10}%` }}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/10">
                  <MapPin className="w-3 h-3 text-[#33E7FF]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-['Inter'] truncate">{zone}</div>
                    <div className="text-gray-500 text-[10px] font-mono">
                      [{Math.floor(coordinates.x)}, {Math.floor(coordinates.z)}]
                    </div>
                  </div>
                </div>

                {/* Chain */}
                <div className="text-center text-xs text-gray-400 font-['Inter']">{chain}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.15s ease-out;
        }
      `}</style>
    </div>
  )
}
