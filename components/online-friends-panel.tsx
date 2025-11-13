"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, MessageCircle, MapPin, ChevronDown, ChevronUp, Settings, VolumeX, UserX, Flag } from "lucide-react"

interface OnlineFriend {
  id: string
  wallet: string
  username: string
  location: string
  position: { x: number; z: number }
  status: "online" | "in-game"
}

interface OnlineFriendsPanelProps {
  onOpenDM: (friend: OnlineFriend) => void
  onTeleportToFriend: (friend: OnlineFriend) => void
  expanded?: boolean
}

export function OnlineFriendsPanel({ onOpenDM, onTeleportToFriend, expanded = false }: OnlineFriendsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showProxOptions, setShowProxOptions] = useState(false)
  const [showGlobalOptions, setShowGlobalOptions] = useState(false)
  const [onlineFriends, setOnlineFriends] = useState<OnlineFriend[]>([
    {
      id: "1",
      wallet: "0xabcd...1234",
      username: "CryptoKnight",
      location: "Gaming District",
      position: { x: -800, z: -800 },
      status: "in-game",
    },
    {
      id: "2",
      wallet: "0xefgh...5678",
      username: "VoidExplorer",
      location: "DeFi District",
      position: { x: -800, z: 800 },
      status: "online",
    },
    {
      id: "3",
      wallet: "0xijkl...9012",
      username: "MetaTrader",
      location: "Social District",
      position: { x: 800, z: 800 },
      status: "online",
    },
  ])

  return (
    <div className="w-full space-y-2">
      <motion.div
        className="w-full relative overflow-hidden rounded-2xl border-2"
        style={{
          background: `
          linear-gradient(
            135deg,
            rgba(70, 70, 80, 0.22) 0%,
            rgba(55, 55, 65, 0.18) 25%,
            rgba(80, 80, 90, 0.24) 50%,
            rgba(65, 65, 75, 0.20) 75%,
            rgba(72, 72, 82, 0.22) 100%
          )
        `,
          backgroundSize: "400% 400%",
          animation: "plasticFlow 18s ease-in-out infinite",
          backdropFilter: "blur(36px) saturate(200%) contrast(1.18) brightness(0.95)",
          border: "2px solid rgba(255, 255, 255, 0.35)",
          boxShadow: `
          0 0 40px rgba(255, 255, 255, 0.25),
          0 10px 42px rgba(0, 0, 0, 0.45),
          inset 0 0 55px rgba(255, 255, 255, 0.08),
          inset 0 5px 0 rgba(255, 255, 255, 0.5),
          inset 0 -5px 10px rgba(0, 0, 0, 0.35)
        `,
          maxHeight: expanded ? "70vh" : undefined,
        }}
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 2.9, type: "spring", damping: 20 }}
      >
        {/* Xenomorphic organic morphing highlights */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
            radial-gradient(
              ellipse 85% 110% at 22% 35%,
              rgba(255, 255, 255, 0.12) 0%,
              transparent 42%
            ),
            radial-gradient(
              ellipse 120% 70% at 78% 65%,
              rgba(255, 255, 255, 0.10) 0%,
              transparent 38%
            ),
            radial-gradient(
              ellipse 95% 130% at 50% 80%,
              rgba(255, 255, 255, 0.08) 0%,
              transparent 35%
            )
          `,
            animation: "organicGlow 16s ease-in-out infinite",
            mixBlendMode: "overlay",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
            linear-gradient(
              115deg,
              transparent 0%,
              transparent 32%,
              rgba(255, 255, 255, 0.10) 42%,
              rgba(255, 255, 255, 0.18) 50%,
              rgba(255, 255, 255, 0.10) 58%,
              transparent 68%,
              transparent 100%
            )
          `,
            backgroundSize: "400% 100%",
            animation: "plasticShine 15s ease-in-out infinite",
            mixBlendMode: "overlay",
          }}
        />

        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{
            background: `
            repeating-linear-gradient(
              17deg,
              rgba(255, 255, 255, 0.04) 0px,
              rgba(255, 255, 255, 0.04) 1px,
              transparent 1px,
              transparent 6px
            ),
            repeating-linear-gradient(
              73deg,
              rgba(255, 255, 255, 0.035) 0px,
              rgba(255, 255, 255, 0.035) 1px,
              transparent 1px,
              transparent 5px
            ),
            radial-gradient(ellipse 75% 95% at 18% 62%, rgba(255, 255, 255, 0.06) 0%, transparent 45%),
            radial-gradient(ellipse 90% 65% at 82% 38%, rgba(255, 255, 255, 0.05) 0%, transparent 40%),
            radial-gradient(ellipse 80% 110% at 45% 85%, rgba(255, 255, 255, 0.04) 0%, transparent 38%)
          `,
            animation: "textureShift 20s ease-in-out infinite",
          }}
        />

        {/* Header */}
        <div
          className="relative px-4 py-3 flex items-center justify-between cursor-pointer"
          style={{
            background: `linear-gradient(
            135deg,
            rgba(80, 80, 90, 0.28),
            rgba(70, 70, 85, 0.25),
            rgba(75, 75, 88, 0.28)
          )`,
            borderBottom: "1px solid rgba(255, 255, 255, 0.25)",
          }}
          onClick={() => !expanded && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Users
              className="w-5 h-5"
              style={{
                filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))",
                color: "#22D3EE",
              }}
            />
            <div>
              <h3
                className="text-sm font-bold font-mono"
                style={{
                  background:
                    "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 25%, #E5E5E5 50%, #F5F5F5 75%, #FFFFFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter:
                    "drop-shadow(0 0 20px rgba(180, 180, 180, 0.7)) drop-shadow(0 0 12px rgba(255, 255, 255, 0.5))",
                  textShadow: "0 0 25px rgba(200, 200, 200, 0.6)",
                }}
              >
                ONLINE FRIENDS
              </h3>
              <p
                className="text-xs font-mono"
                style={{
                  color: "#60A5FA",
                  textShadow: "0 0 10px rgba(96, 165, 250, 0.4)",
                }}
              >
                {onlineFriends.length} online now
              </p>
            </div>
          </div>
          {!expanded && (
            <button className="p-1 hover:bg-cyan-500/15 rounded transition-all">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-cyan-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-cyan-400" />
              )}
            </button>
          )}
        </div>

        {/* Friends List */}
        <AnimatePresence>
          {(isExpanded || expanded) && (
            <motion.div
              className={`p-3 space-y-2 overflow-y-auto relative ${expanded ? "max-h-[60vh]" : "max-h-48"}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {onlineFriends.map((friend, index) => (
                <motion.div
                  key={friend.id}
                  className="relative rounded-lg p-3 transition-all group overflow-hidden"
                  style={{
                    background: `
                    linear-gradient(
                      135deg,
                      rgba(65, 65, 78, 0.18),
                      rgba(60, 60, 75, 0.16),
                      rgba(70, 70, 82, 0.20)
                    )
                  `,
                    border: "1px solid rgba(255, 255, 255, 0.28)",
                    boxShadow: `
                    0 3px 18px rgba(255, 255, 255, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -1px 2px rgba(0, 0, 0, 0.25)
                  `,
                    backdropFilter: "blur(18px)",
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `linear-gradient(
                      110deg,
                      transparent 0%,
                      transparent 40%,
                      rgba(255, 255, 255, 0.22) 50%,
                      transparent 60%,
                      transparent 100%
                    )`,
                      backgroundSize: "200% 100%",
                      animation: "shimmer 3s linear infinite",
                    }}
                  />

                  <div className="flex items-start justify-between mb-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{
                            background: `linear-gradient(135deg, #A78BFA, #60A5FA, #34D399)`,
                            boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
                          }}
                        >
                          {friend.username[0].toUpperCase()}
                        </div>
                        <div
                          className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 animate-pulse"
                          style={{
                            background: "#34D399",
                            borderColor: "rgba(30, 41, 59, 0.8)",
                            boxShadow: "0 0 10px #34D399",
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm font-mono">{friend.username}</p>
                        <p className="text-slate-400 text-xs font-mono">{friend.wallet}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-2 relative z-10">
                    <MapPin className="w-3 h-3 text-cyan-400" style={{ filter: "drop-shadow(0 0 4px #22D3EE)" }} />
                    <p
                      className="text-xs font-mono"
                      style={{
                        color: "#22D3EE",
                        textShadow: "0 0 8px rgba(34, 211, 238, 0.5)",
                      }}
                    >
                      {friend.location}
                    </p>
                  </div>

                  <div className="flex gap-2 relative z-10">
                    <button
                      onClick={() => onOpenDM(friend)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-bold transition-all"
                      style={{
                        background: "rgba(16, 185, 129, 0.2)",
                        color: "#34D399",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        textShadow: "0 0 8px rgba(16, 185, 129, 0.5)",
                      }}
                    >
                      <MessageCircle className="w-3 h-3" />
                      DM
                    </button>
                    <button
                      onClick={() => onTeleportToFriend(friend)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-bold transition-all"
                      style={{
                        background: "rgba(59, 130, 246, 0.2)",
                        color: "#60A5FA",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        textShadow: "0 0 8px rgba(59, 130, 246, 0.5)",
                      }}
                    >
                      <MapPin className="w-3 h-3" />
                      Join
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Buttons with Dropdowns */}
        <motion.div
          className="w-full space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.1, type: "spring", damping: 20 }}
        >
          {/* Proximity Chat with Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("openProximityChat"))
              }}
              className="w-full rounded-xl p-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, rgba(34, 211, 238, 0.25), rgba(6, 182, 212, 0.25))",
                border: "3px solid rgba(34, 211, 238, 0.6)",
                boxShadow: "0 0 25px rgba(34, 211, 238, 0.5), inset 0 0 20px rgba(34, 211, 238, 0.1)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-cyan-300" style={{ filter: "drop-shadow(0 0 6px #22D3EE)" }} />
                  <span className="text-sm font-black text-cyan-200 font-mono tracking-wider">PROX CHAT</span>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowProxOptions(!showProxOptions)
                    setShowGlobalOptions(false)
                  }}
                  className="p-1 hover:bg-cyan-500/20 rounded transition-all cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4 text-cyan-300" />
                </div>
              </div>
            </button>

            {/* Proximity Chat Dropdown Options */}
            <AnimatePresence>
              {showProxOptions && (
                <motion.div
                  className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-50"
                  style={{
                    background: "rgba(20, 20, 30, 0.95)",
                    border: "2px solid rgba(239, 68, 68, 0.6)",
                    boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)",
                    backdropFilter: "blur(10px)",
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <button
                    onClick={() => {
                      console.log("Prox Settings")
                      setShowProxOptions(false)
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-500/20 transition-colors text-left"
                    style={{ color: "#EF4444" }}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-mono">Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      console.log("Mute Prox")
                      setShowProxOptions(false)
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-500/20 transition-colors text-left"
                    style={{ color: "#EF4444" }}
                  >
                    <VolumeX className="w-4 h-4" />
                    <span className="text-sm font-mono">Mute</span>
                  </button>
                  <button
                    onClick={() => {
                      console.log("Block User")
                      setShowProxOptions(false)
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-500/20 transition-colors text-left"
                    style={{ color: "#EF4444" }}
                  >
                    <UserX className="w-4 h-4" />
                    <span className="text-sm font-mono">Block User</span>
                  </button>
                  <button
                    onClick={() => {
                      console.log("Report")
                      setShowProxOptions(false)
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-500/20 transition-colors text-left"
                    style={{ color: "#EF4444" }}
                  >
                    <Flag className="w-4 h-4" />
                    <span className="text-sm font-mono">Report</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Global Chat with Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("openGlobalChat"))
              }}
              className="w-full rounded-xl p-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(139, 92, 246, 0.25))",
                border: "3px solid rgba(168, 85, 247, 0.6)",
                boxShadow: "0 0 25px rgba(168, 85, 247, 0.5), inset 0 0 20px rgba(168, 85, 247, 0.1)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle
                    className="w-4 h-4 text-purple-300"
                    style={{ filter: "drop-shadow(0 0 6px #A855F7)" }}
                  />
                  <span className="text-sm font-black text-purple-200 font-mono tracking-wider">GLOBAL</span>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowGlobalOptions(!showGlobalOptions)
                    setShowProxOptions(false)
                  }}
                  className="p-1 hover:bg-purple-500/20 rounded transition-all cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4 text-purple-300" />
                </div>
              </div>
            </button>

            {/* Global Chat Dropdown Options */}
            <AnimatePresence>
              {showGlobalOptions && (
                <motion.div
                  className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-50"
                  style={{
                    background: "rgba(20, 20, 30, 0.95)",
                    border: "2px solid rgba(239, 68, 68, 0.6)",
                    boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)",
                    backdropFilter: "blur(10px)",
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <button
                    onClick={() => {
                      console.log("Global Settings")
                      setShowGlobalOptions(false)
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-500/20 transition-colors text-left"
                    style={{ color: "#EF4444" }}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-mono">Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      console.log("Mute Global")
                      setShowGlobalOptions(false)
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-500/20 transition-colors text-left"
                    style={{ color: "#EF4444" }}
                  >
                    <VolumeX className="w-4 h-4" />
                    <span className="text-sm font-mono">Mute</span>
                  </button>
                  <button
                    onClick={() => {
                      console.log("Block User")
                      setShowGlobalOptions(false)
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-500/20 transition-colors text-left"
                    style={{ color: "#EF4444" }}
                  >
                    <UserX className="w-4 h-4" />
                    <span className="text-sm font-mono">Block User</span>
                  </button>
                  <button
                    onClick={() => {
                      console.log("Report")
                      setShowGlobalOptions(false)
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-500/20 transition-colors text-left"
                    style={{ color: "#EF4444" }}
                  >
                    <Flag className="w-4 h-4" />
                    <span className="text-sm font-mono">Report</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
