"use client"

import { useState } from "react"
import { Eye, EyeOff, Wallet, Users, Briefcase, Home, Sparkles, Copy, ExternalLink } from "lucide-react"

interface MySpacePanelProps {
  // User identity
  username: string
  avatarUrl: string
  walletAddress: string
  
  // Balances
  voidBalance: number
  psxBalance: number
  
  // User belongings
  friends: { id: string; name: string; avatar: string; status: "online" | "offline" }[]
  ownedLand: { id: string; name: string; location: string; value: number }[]
  createdApps: { id: string; name: string; icon: string; users: number }[]
  createdSKUs: { id: string; name: string; sales: number }[]
  
  // Stats
  level: number
  xp: number
  achievements: number
  
  // Actions
  onViewWallet?: () => void
  onViewFriends?: () => void
  onViewLand?: () => void
  onViewCreations?: () => void
}

export function MySpacePanel({
  username,
  avatarUrl,
  walletAddress,
  voidBalance,
  psxBalance,
  friends,
  ownedLand,
  createdApps,
  createdSKUs,
  level,
  xp,
  achievements,
  onViewWallet,
  onViewFriends,
  onViewLand,
  onViewCreations,
}: MySpacePanelProps) {
  const [isPrivate, setIsPrivate] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "wallet" | "friends" | "land" | "creations">("overview")
  const [copied, setCopied] = useState(false)

  const walletShort = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
  const onlineFriends = friends.filter(f => f.status === "online").length

  const copyWallet = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed top-14 left-4 w-[360px] bg-[rgba(10,12,24,0.98)] rounded-2xl shadow-2xl border-2 border-[#00FFA6]/40 z-[9992] pointer-events-auto overflow-hidden">
      {/* Header - Profile Card */}
      <div className="relative p-6 bg-gradient-to-br from-[#00FFA6]/10 via-transparent to-[#442366]/10 border-b-2 border-[#00FFA6]/20">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "repeating-linear-gradient(0deg, #00FFA6 0px, #00FFA6 1px, transparent 1px, transparent 4px)"
        }} />
        
        <div className="relative flex items-start gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#00FFA6] to-[#442366] shadow-[0_0_30px_rgba(0,255,166,0.5)]">
            {avatarUrl.startsWith("http") || avatarUrl.startsWith("data:") ? (
              <img src={avatarUrl} alt={username} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span className="text-4xl">{avatarUrl}</span>
            )}
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black font-[family-name:var(--font-orbitron)] text-[#00FFA6] mb-1 truncate">
              {username}
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-white/60">{walletShort}</span>
              <button
                onClick={copyWallet}
                className="p-1 rounded hover:bg-white/10 transition"
                title="Copy wallet address"
              >
                {copied ? (
                  <span className="text-[#00FFA6] text-xs">✓</span>
                ) : (
                  <Copy className="w-3 h-3 text-white/40" />
                )}
              </button>
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className="p-1 rounded hover:bg-white/10 transition"
                title={isPrivate ? "Show wallet publicly" : "Hide wallet from others"}
              >
                {isPrivate ? (
                  <EyeOff className="w-3 h-3 text-white/40" />
                ) : (
                  <Eye className="w-3 h-3 text-[#00FFA6]/60" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/60">
              <span>LV {level}</span>
              <span>•</span>
              <span>{xp.toLocaleString()} XP</span>
              <span>•</span>
              <span>{achievements} 🏆</span>
            </div>
          </div>
        </div>

        {/* Balances - only show if not private */}
        {!isPrivate && (
          <div className="relative grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-[#00FFA6]/10 border border-[#00FFA6]/30">
              <div className="text-[#00FFA6] text-xs font-bold mb-1">VOID</div>
              <div className="text-white font-black text-lg font-mono tabular-nums">
                {voidBalance.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#442366]/10 border border-[#442366]/30">
              <div className="text-[#442366] text-xs font-bold mb-1">PSX</div>
              <div className="text-white font-black text-lg font-mono tabular-nums">
                {psxBalance.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-2 border-b border-white/10 bg-[#0A0A19]">
        {[
          { id: "overview", label: "Overview", icon: Sparkles },
          { id: "wallet", label: "MyWallet", icon: Wallet },
          { id: "friends", label: "MyFriends", icon: Users },
          { id: "land", label: "MyLand", icon: Home },
          { id: "creations", label: "MyApps", icon: Briefcase },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 px-2 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === tab.id
                ? "bg-[#00FFA6]/20 text-[#00FFA6] border border-[#00FFA6]/40"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-3 h-3 mx-auto mb-0.5" />
            <div className="text-[10px]">{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Friends"
              value={`${onlineFriends}/${friends.length} online`}
              color="#00FFA6"
              onClick={onViewFriends}
            />
            <StatCard
              icon={<Home className="w-5 h-5" />}
              label="Land Owned"
              value={`${ownedLand.length} parcels`}
              color="#33E7FF"
              onClick={onViewLand}
            />
            <StatCard
              icon={<Briefcase className="w-5 h-5" />}
              label="Apps Created"
              value={`${createdApps.length} apps`}
              color="#442366"
              onClick={onViewCreations}
            />
            <StatCard
              icon={<Sparkles className="w-5 h-5" />}
              label="SKUs Minted"
              value={`${createdSKUs.length} items`}
              color="#FFD700"
              onClick={onViewCreations}
            />
          </div>
        )}

        {/* MyWallet */}
        {activeTab === "wallet" && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#00FFA6]/5 border border-[#00FFA6]/20">
              <div className="text-white/60 text-xs mb-2">Wallet Address</div>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm flex-1 truncate">{walletAddress}</span>
                <button onClick={copyWallet} className="p-2 rounded-lg hover:bg-white/10">
                  <Copy className="w-4 h-4 text-[#00FFA6]" />
                </button>
                <button onClick={onViewWallet} className="p-2 rounded-lg hover:bg-white/10">
                  <ExternalLink className="w-4 h-4 text-[#00FFA6]" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <BalanceCard label="VOID Balance" value={voidBalance} color="#00FFA6" />
              <BalanceCard label="PSX Balance" value={psxBalance} color="#442366" />
            </div>
          </div>
        )}

        {/* MyFriends */}
        {activeTab === "friends" && (
          <div className="space-y-2">
            {friends.length === 0 ? (
              <div className="text-center text-white/40 py-8">No friends yet</div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
                >
                  <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">{friend.name}</div>
                    <div className={`text-xs ${friend.status === "online" ? "text-[#00FFA6]" : "text-white/40"}`}>
                      {friend.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* MyLand */}
        {activeTab === "land" && (
          <div className="space-y-2">
            {ownedLand.length === 0 ? (
              <div className="text-center text-white/40 py-8">No land owned yet</div>
            ) : (
              ownedLand.map((land) => (
                <div
                  key={land.id}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
                >
                  <div className="text-white font-semibold text-sm mb-1">{land.name}</div>
                  <div className="text-xs text-white/60">{land.location}</div>
                  <div className="text-[#00FFA6] text-xs font-bold mt-1">
                    {land.value.toLocaleString()} VOID
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* MyApps & Creations */}
        {activeTab === "creations" && (
          <div className="space-y-4">
            {createdApps.length > 0 && (
              <div>
                <h3 className="text-white/60 text-xs font-bold mb-2">Apps Created</h3>
                <div className="space-y-2">
                  {createdApps.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
                    >
                      <div className="text-2xl">{app.icon}</div>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">{app.name}</div>
                        <div className="text-xs text-white/60">{app.users} users</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {createdSKUs.length > 0 && (
              <div>
                <h3 className="text-white/60 text-xs font-bold mb-2">SKUs Minted</h3>
                <div className="space-y-2">
                  {createdSKUs.map((sku) => (
                    <div
                      key={sku.id}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
                    >
                      <div className="text-white font-semibold text-sm mb-1">{sku.name}</div>
                      <div className="text-xs text-[#FFD700]">{sku.sales} sales</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {createdApps.length === 0 && createdSKUs.length === 0 && (
              <div className="text-center text-white/40 py-8">No creations yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper components
function StatCard({
  icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition text-left"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        <div className="flex-1">
          <div className="text-white/60 text-xs mb-0.5">{label}</div>
          <div className="text-white font-bold text-lg">{value}</div>
        </div>
      </div>
    </button>
  )
}

function BalanceCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-4 rounded-xl border" style={{ backgroundColor: `${color}10`, borderColor: `${color}30` }}>
      <div className="text-xs mb-1" style={{ color }}>
        {label}
      </div>
      <div className="text-white font-black text-xl font-mono tabular-nums">
        {value.toLocaleString()}
      </div>
    </div>
  )
}
