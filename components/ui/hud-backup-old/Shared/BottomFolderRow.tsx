"use client"


import { AppFolderData } from "@/lib/app-folders"

interface BottomFolderRowProps {
  leftFolders: AppFolderData[]
  rightFolders: AppFolderData[]
  activeFolder: string | null
  onFolderClick: (folderId: string) => void
  showXPWidget?: boolean
  xpLevel?: number
  xpCurrent?: number
  xpRequired?: number
  onXPClick?: () => void
  className?: string
}

export function BottomFolderRow({
  leftFolders,
  rightFolders,
  activeFolder,
  onFolderClick,
  showXPWidget = true,
  xpLevel = 1,
  xpCurrent = 0,
  xpRequired = 100,
  onXPClick,
  className = "",
}: BottomFolderRowProps) {
  const xpPercentage = (xpCurrent / xpRequired) * 100

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 h-24 pointer-events-auto ${className}`}
      style={{ zIndex: 9990 }}
    >
      {/* Glass Background Bar with CRT overlay */}
      <div className="absolute inset-0 bg-[rgba(5,7,19,0.98)] backdrop-blur-[30px] border-t-2 border-[#00FFA6]/40" />
      <div className="absolute inset-0 pointer-events-none mix-blend-soft-light opacity-60" style={{background: "repeating-linear-gradient(0deg,rgba(0,255,166,0.08),rgba(0,255,166,0.08) 1px,transparent 1px,transparent 4px)"}} />

      {/* Folder Tiles + XP Widget */}
      <div className="relative h-full px-10 flex items-center justify-between gap-6">
        {/* Left: Social/Games Folders */}
        <div className="flex items-center gap-5">
          {leftFolders.map((folder) => {
            const isActive = activeFolder === folder.id
            const hasGlow = folder.glow
            return (
              <button
                key={folder.id}
                onClick={() => onFolderClick(folder.id)}
                className={`
                  relative h-20 px-6 rounded-2xl transition-all duration-150
                  flex items-center gap-3 text-xl
                  ${
                    isActive
                      ? "bg-[rgba(255,255,255,0.22)] border-2 scale-110"
                      : "bg-[rgba(255,255,255,0.10)] border-2 hover:bg-[rgba(255,255,255,0.18)] hover:scale-105"
                  }
                  ${hasGlow ? "border-[#00FFA6] shadow-[0_0_30px_rgba(0,255,166,0.7)]" : "border-white/40"}
                `}
                style={{ borderColor: isActive ? folder.color : hasGlow ? "#00FFA6" : undefined }}
              >
                <div className="text-3xl leading-none">{folder.icon}</div>
                <div className="flex items-center gap-2">
                  {folder.apps.slice(0, 3).map((app) => (
                    <div key={app.id} className="text-lg opacity-80">
                      {app.icon}
                    </div>
                  ))}
                </div>
                {folder.badge !== undefined && folder.badge > 0 && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#FF6B6B] border-2 border-[#050713] flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{folder.badge}</span>
                  </div>
                )}
                {isActive && (
                  <div className="absolute -bottom-px left-0 right-0 h-1" style={{ backgroundColor: folder.color }} />
                )}
              </button>
            )
          })}
        </div>

        {/* Right: Web3/DAO/DEX Folders + XP Widget */}
        <div className="flex items-center gap-5">
          {rightFolders.map((folder) => {
            const isActive = activeFolder === folder.id
            const hasGlow = folder.glow
            return (
              <button
                key={folder.id}
                onClick={() => onFolderClick(folder.id)}
                className={`
                  relative h-20 px-6 rounded-2xl transition-all duration-150
                  flex items-center gap-3 text-xl
                  ${
                    isActive
                      ? "bg-[rgba(255,255,255,0.22)] border-2 scale-110"
                      : "bg-[rgba(255,255,255,0.10)] border-2 hover:bg-[rgba(255,255,255,0.18)] hover:scale-105"
                  }
                  ${hasGlow ? "border-[#00FFA6] shadow-[0_0_30px_rgba(0,255,166,0.7)]" : "border-white/40"}
                `}
                style={{ borderColor: isActive ? folder.color : hasGlow ? "#00FFA6" : undefined }}
              >
                <div className="text-3xl leading-none">{folder.icon}</div>
                <div className="flex items-center gap-2">
                  {folder.apps.slice(0, 3).map((app) => (
                    <div key={app.id} className="text-lg opacity-80">
                      {app.icon}
                    </div>
                  ))}
                </div>
                {folder.badge !== undefined && folder.badge > 0 && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#FF6B6B] border-2 border-[#050713] flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{folder.badge}</span>
                  </div>
                )}
                {isActive && (
                  <div className="absolute -bottom-px left-0 right-0 h-1" style={{ backgroundColor: folder.color }} />
                )}
              </button>
            )
          })}

          {/* XP Widget - always glowing, pulsing, neon green */}
          {showXPWidget && (
            <button
              onClick={onXPClick}
              className="relative h-20 px-7 rounded-2xl bg-[rgba(0,255,166,0.12)] border-2 border-[#00FFA6] shadow-[0_0_40px_10px_rgba(0,255,166,0.5)] animate-pulse-slow flex items-center gap-4 group"
              style={{ boxShadow: "0 0 40px 10px #00FFA6AA, 0 0 0 4px #00FFA644" }}
            >
              <div className="w-14 h-14 rounded-full bg-[#00FFA6]/30 border-4 border-[#00FFA6] flex items-center justify-center animate-pulse-fast group-hover:scale-110 transition-transform">
                <span className="text-2xl font-black font-[family-name:var(--font-orbitron)] text-[#00FFA6] drop-shadow-[0_0_8px_#00FFA6]">
                  {xpLevel}
                </span>
              </div>
              <div className="w-32 h-3 rounded-full bg-[rgba(255,255,255,0.18)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00FFA6] to-[#33E7FF]"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
              <span className="text-base font-mono text-[#00FFA6] font-bold">
                {xpCurrent}/{xpRequired}
              </span>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs text-[#00FFA6] font-black animate-pulse-fast">
                DAILY XP
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
