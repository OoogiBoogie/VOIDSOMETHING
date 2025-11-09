"use client"

import { motion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import { useOrientation } from "@/hooks/use-orientation"
import { Package, Map, Store, Zap, Coins, ShoppingBag, Users, Mic, Music, Activity, Gamepad2, Building2 } from "lucide-react"

interface ActionBarProps {
  onPhoneOpen: () => void
  onDashboardOpen: () => void
  onInventoryOpen: () => void
  onChatOpen: () => void
  onMapOpen: () => void
  onMarketplaceOpen: () => void
  onLandInventoryOpen?: () => void
  onPowerUpOpen: () => void
  onPledgeOpen: () => void
  onSKUMarketOpen: () => void
  onFriendSystemOpen: () => void
  onVoiceChatOpen?: () => void
  onJukeboxOpen?: () => void
  onPerformanceToggle?: () => void
  onCasinoOpen?: () => void // Added casino handler
}

export function ActionBar({
  onPhoneOpen,
  onDashboardOpen,
  onInventoryOpen,
  onChatOpen,
  onMapOpen,
  onMarketplaceOpen,
  onLandInventoryOpen,
  onPowerUpOpen,
  onPledgeOpen,
  onSKUMarketOpen,
  onFriendSystemOpen,
  onVoiceChatOpen,
  onJukeboxOpen,
  onPerformanceToggle,
  onCasinoOpen, // Added casino handler
}: ActionBarProps) {
  const isMobile = useIsMobile()
  const orientation = useOrientation()
  const isLandscape = orientation === "landscape"

  const actions = [
    {
      icon: Map,
      label: "Map",
      key: "N",
      onClick: onMapOpen,
      color: "from-pink-500/30 to-pink-600/30 border-pink-400/40 hover:border-pink-400/70",
      iconColor: "text-pink-300",
    },
    {
      icon: Package,
      label: "Quests",
      key: "Q",
      onClick: onInventoryOpen,
      color: "from-blue-500/30 to-blue-600/30 border-blue-400/40 hover:border-blue-400/70",
      iconColor: "text-blue-300",
    },
    {
      icon: Store,
      label: "Real Estate",
      key: "R",
      onClick: onMarketplaceOpen,
      color: "from-yellow-500/30 to-yellow-600/30 border-yellow-400/40 hover:border-yellow-400/70",
      iconColor: "text-yellow-300",
    },
    {
      icon: Building2,
      label: "Land Registry",
      key: "L",
      onClick: onLandInventoryOpen || onMarketplaceOpen,
      color: "from-cyan-500/30 to-cyan-600/30 border-cyan-400/40 hover:border-cyan-400/70",
      iconColor: "text-cyan-300",
    },
    {
      icon: Zap,
      label: "Boosts",
      key: "B",
      onClick: onPowerUpOpen,
      color: "from-orange-500/30 to-orange-600/30 border-orange-400/40 hover:border-orange-400/70",
      iconColor: "text-orange-300",
    },
    {
      icon: Coins,
      label: "PSX Pledge",
      key: "X",
      onClick: onPledgeOpen,
      color: "from-emerald-500/30 to-emerald-600/30 border-emerald-400/40 hover:border-emerald-400/70",
      iconColor: "text-emerald-300",
    },
    {
      icon: Gamepad2,
      label: "Casino",
      key: "G",
      onClick: onCasinoOpen || onSKUMarketOpen,
      color: "from-purple-500/30 to-purple-600/30 border-purple-400/40 hover:border-purple-400/70",
      iconColor: "text-purple-300",
    },
    {
      icon: ShoppingBag,
      label: "SKU Market",
      key: "M",
      onClick: onSKUMarketOpen,
      color: "from-indigo-500/30 to-indigo-600/30 border-indigo-400/40 hover:border-indigo-400/70",
      iconColor: "text-indigo-300",
    },
    {
      icon: Users,
      label: "Friends",
      key: "F",
      onClick: onFriendSystemOpen,
      color: "from-rose-500/30 to-rose-600/30 border-rose-400/40 hover:border-rose-400/70",
      iconColor: "text-rose-300",
    },
  ]

  if (onVoiceChatOpen) {
    actions.push({
      icon: Mic,
      label: "Voice Chat",
      key: "V",
      onClick: onVoiceChatOpen,
      color: "from-teal-500/30 to-teal-600/30 border-teal-400/40 hover:border-teal-400/70",
      iconColor: "text-teal-300",
    })
  }

  if (onJukeboxOpen) {
    actions.push({
      icon: Music,
      label: "Jukebox",
      key: "J",
      onClick: onJukeboxOpen,
      color: "from-violet-500/30 to-violet-600/30 border-violet-400/40 hover:border-violet-400/70",
      iconColor: "text-violet-300",
    })
  }

  if (onPerformanceToggle) {
    actions.push({
      icon: Activity,
      label: "Performance",
      key: "P",
      onClick: onPerformanceToggle,
      color: "from-amber-500/30 to-amber-600/30 border-amber-400/40 hover:border-amber-400/70",
      iconColor: "text-amber-300",
    })
  }

  return (
    <motion.div
      className={`fixed left-1/2 -translate-x-1/2 z-30 pointer-events-auto ${
        isMobile && !isLandscape ? "bottom-2" : isMobile && isLandscape ? "bottom-3" : "bottom-4"
      }`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, type: "spring", damping: 20 }}
    >
      <div
        className={`flex items-center rounded-2xl shadow-2xl relative overflow-hidden ${
          isMobile && !isLandscape
            ? "gap-1 p-1.5 flex-wrap max-w-[90vw]"
            : isMobile && isLandscape
              ? "gap-1.5 p-2"
              : "gap-2 p-3"
        }`}
        style={{
          background: `
            linear-gradient(
              135deg,
              rgba(70, 70, 80, 0.25) 0%,
              rgba(55, 55, 65, 0.20) 25%,
              rgba(80, 80, 90, 0.28) 50%,
              rgba(65, 65, 75, 0.22) 75%,
              rgba(72, 72, 82, 0.25) 100%
            )
          `,
          backdropFilter: "blur(40px) saturate(200%) contrast(1.2) brightness(0.95)",
          border: "2px solid rgba(255, 255, 255, 0.4)",
          boxShadow: `
            0 0 45px rgba(255, 255, 255, 0.3),
            0 12px 50px rgba(0, 0, 0, 0.5),
            inset 0 0 60px rgba(255, 255, 255, 0.1),
            inset 0 6px 0 rgba(255, 255, 255, 0.55),
            inset 0 -6px 12px rgba(0, 0, 0, 0.4)
          `,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 90% 115% at 25% 40%, rgba(255, 255, 255, 0.15) 0%, transparent 45%),
              radial-gradient(ellipse 125% 75% at 80% 70%, rgba(255, 255, 255, 0.12) 0%, transparent 40%)
            `,
            animation: "organicGlow 18s ease-in-out infinite",
            mixBlendMode: "overlay",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(
                120deg,
                transparent 0%,
                transparent 35%,
                rgba(255, 255, 255, 0.15) 45%,
                rgba(255, 255, 255, 0.25) 50%,
                rgba(255, 255, 255, 0.15) 55%,
                transparent 65%,
                transparent 100%
              )
            `,
            backgroundSize: "400% 100%",
            animation: "plasticShine 18s ease-in-out infinite",
          }}
        />

        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            onClick={action.onClick}
            className={`group relative flex flex-col items-center justify-center rounded-xl overflow-hidden transition-all hover:scale-110 active:scale-95 ${
              isMobile && !isLandscape ? "w-12 h-12" : isMobile && isLandscape ? "w-14 h-14" : "w-16 h-16"
            }`}
            style={{
              background: `
                linear-gradient(
                  135deg,
                  rgba(60, 60, 72, 0.25),
                  rgba(50, 50, 62, 0.22),
                  rgba(70, 70, 82, 0.28)
                )
              `,
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(255, 255, 255, 0.35)",
              boxShadow: `
                0 0 20px rgba(255, 255, 255, 0.2),
                0 4px 15px rgba(0, 0, 0, 0.3),
                inset 0 2px 0 rgba(255, 255, 255, 0.5),
                inset 0 -2px 8px rgba(0, 0, 0, 0.3)
              `,
            }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
            whileHover={{ y: -4 }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${action.color.match(/from-(\w+-\d+)/)?.[0].replace("from-", "")} / 0.3, transparent 70%)`,
                filter: "blur(10px)",
              }}
            />

            <action.icon
              className={`${action.iconColor} group-hover:brightness-125 relative z-10 ${isMobile ? "w-5 h-5" : "w-6 h-6"}`}
              style={{
                filter: "drop-shadow(0 0 8px currentColor)",
              }}
            />
            <span
              className={`font-bold relative z-10 ${
                isMobile && !isLandscape ? "text-[8px] mt-0.5" : isMobile ? "text-[9px] mt-0.5" : "text-[10px] mt-1"
              }`}
              style={{
                background: "linear-gradient(135deg, #FFFFFF, #E5E5E5)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.5))",
              }}
            >
              {action.key}
            </span>

            {!isMobile && (
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div
                  className="rounded-lg px-3 py-2 whitespace-nowrap"
                  style={{
                    background: "linear-gradient(135deg, rgba(60, 60, 70, 0.95), rgba(50, 50, 60, 0.95))",
                    backdropFilter: "blur(20px)",
                    border: "2px solid rgba(255, 255, 255, 0.4)",
                    boxShadow: "0 0 30px rgba(255, 255, 255, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <p
                    className="text-xs font-bold"
                    style={{
                      background: "linear-gradient(135deg, #FFFFFF, #F0F0F0)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {action.label}
                  </p>
                  <p className="text-[10px] text-gray-300">Press {action.key}</p>
                </div>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
