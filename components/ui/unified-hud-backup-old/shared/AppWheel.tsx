"use client"

import { useState, useEffect } from "react"
import { Phone, Map, ShoppingCart, Users, Settings, Music, Radio, Zap } from "lucide-react"

interface AppWheelProps {
  isOpen: boolean
  onClose: () => void
  apps: {
    onPhoneOpen?: () => void
    onMapOpen?: () => void
    onMarketOpen?: () => void
    onFriendsOpen?: () => void
    onSettingsOpen?: () => void
    onMusicOpen?: () => void
    onVoiceOpen?: () => void
    onVoidHubOpen?: () => void
  }
}

const wheelApps = [
  { id: "phone", icon: Phone, label: "Phone", key: "P", color: "#00FFA6" },
  { id: "map", icon: Map, label: "Map", key: "N", color: "#33E7FF" },
  { id: "market", icon: ShoppingCart, label: "Market", key: "M", color: "#FFD700" },
  { id: "friends", icon: Users, label: "Friends", key: "F", color: "#FF6B6B" },
  { id: "voice", icon: Radio, label: "Voice", key: "V", color: "#FF00FF" },
  { id: "music", icon: Music, label: "Music", key: "J", color: "#00FFFF" },
  { id: "void", icon: Zap, label: "VOID Hub", key: "H", color: "#FFA500" },
  { id: "settings", icon: Settings, label: "Settings", key: "ESC", color: "#888888" },
]

export function AppWheel({ isOpen, onClose, apps }: AppWheelProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    if (!isOpen) return

    const handleClick = () => {
      if (selectedIndex >= 0) {
        const app = wheelApps[selectedIndex]
        switch (app.id) {
          case "phone":
            apps.onPhoneOpen?.()
            break
          case "map":
            apps.onMapOpen?.()
            break
          case "market":
            apps.onMarketOpen?.()
            break
          case "friends":
            apps.onFriendsOpen?.()
            break
          case "voice":
            apps.onVoiceOpen?.()
            break
          case "music":
            apps.onMusicOpen?.()
            break
          case "void":
            apps.onVoidHubOpen?.()
            break
          case "settings":
            apps.onSettingsOpen?.()
            break
        }
        onClose()
      }
    }

    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [isOpen, selectedIndex, apps, onClose])

  if (!isOpen) return null

  const radius = 140
  const angleStep = (2 * Math.PI) / wheelApps.length

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in"
      style={{
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div className="relative w-96 h-96" onClick={(e) => e.stopPropagation()}>
        {/* Center Hub */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center z-10"
          style={{
            background: "radial-gradient(circle, rgba(10, 10, 25, 0.95), rgba(5, 5, 15, 1))",
            border: "2px solid #00FFA6",
            boxShadow: "0 0 30px rgba(0, 255, 166, 0.5)",
          }}
        >
          <div className="text-center">
            <div className="text-[#00FFA6] text-[10px] font-['Orbitron'] font-bold">APPS</div>
          </div>
        </div>

        {/* App Buttons */}
        {wheelApps.map((app, index) => {
          const angle = index * angleStep - Math.PI / 2
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          const Icon = app.icon

          return (
            <div
              key={app.id}
              className="absolute top-1/2 left-1/2 transition-all duration-150 cursor-pointer"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              onMouseLeave={() => setSelectedIndex(-1)}
            >
              <div
                className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-150"
                style={{
                  background:
                    selectedIndex === index
                      ? `radial-gradient(circle, ${app.color}40, ${app.color}20)`
                      : "rgba(10, 10, 25, 0.8)",
                  border: `2px solid ${selectedIndex === index ? app.color : "rgba(255, 255, 255, 0.2)"}`,
                  boxShadow: selectedIndex === index ? `0 0 20px ${app.color}80` : "none",
                  transform: selectedIndex === index ? "scale(1.1)" : "scale(1)",
                }}
              >
                <Icon className="w-6 h-6" style={{ color: selectedIndex === index ? app.color : "#888" }} />

                {/* Key Badge */}
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-['Orbitron']"
                  style={{
                    background: selectedIndex === index ? app.color : "#444",
                    color: selectedIndex === index ? "#000" : "#888",
                  }}
                >
                  {app.key.length > 1 ? "⚙" : app.key}
                </div>
              </div>

              {/* Label */}
              {selectedIndex === index && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap animate-fade-in">
                  <div
                    className="px-2 py-1 rounded font-['Orbitron'] font-semibold text-xs"
                    style={{
                      background: `${app.color}30`,
                      border: `1px solid ${app.color}`,
                      color: app.color,
                    }}
                  >
                    {app.label}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out;
        }
      `}</style>
    </div>
  )
}
