"use client"

import { useState } from "react"
import { Users, MessageCircle, Mic, Shield, Heart, UserPlus, Radio, Sparkles } from "lucide-react"

interface SocialHubProps {
  // Friends & Social
  friendsOnline: { id: string; name: string; avatar: string; distance?: number }[]
  friendsOffline: { id: string; name: string; avatar: string }[]
  nearbyPlayers: { id: string; name: string; distance: number; avatar: string }[]
  
  // Groups & Communities
  guilds: { id: string; name: string; members: number; icon: string }[]
  parties: { id: string; leader: string; members: number }[]
  
  // Social Stats
  totalFriends: number
  unreadDMs: number
  voiceChatActive: boolean
  
  // Actions
  onOpenDM?: (friendId: string) => void
  onJoinVoice?: () => void
  onInviteParty?: (playerId: string) => void
  onViewGuild?: (guildId: string) => void
}

export function SocialHub({
  friendsOnline,
  friendsOffline,
  nearbyPlayers,
  guilds,
  parties,
  totalFriends,
  unreadDMs,
  voiceChatActive,
  onOpenDM,
  onJoinVoice,
  onInviteParty,
  onViewGuild,
}: SocialHubProps) {
  const [activeTab, setActiveTab] = useState<"friends" | "nearby" | "guilds" | "party">("friends")

  return (
    <div className="fixed top-[380px] left-4 w-[360px] bg-[rgba(10,12,24,0.98)] rounded-2xl shadow-2xl border-2 border-[#33E7FF]/40 z-[9991] pointer-events-auto overflow-hidden">
      {/* Header */}
      <div className="relative p-4 bg-gradient-to-br from-[#33E7FF]/10 via-transparent to-[#00FFA6]/10 border-b-2 border-[#33E7FF]/20">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "repeating-linear-gradient(0deg, #33E7FF 0px, #33E7FF 1px, transparent 1px, transparent 4px)"
        }} />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#33E7FF]/20">
              <Users className="w-6 h-6 text-[#33E7FF]" />
            </div>
            <div>
              <h2 className="text-xl font-black font-[family-name:var(--font-orbitron)] text-[#33E7FF]">
                SOCIAL HUB
              </h2>
              <div className="text-xs text-white/60">
                {friendsOnline.length} online • {nearbyPlayers.length} nearby
              </div>
            </div>
          </div>

          {/* Voice Chat Indicator */}
          {voiceChatActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00FFA6]/20 border border-[#00FFA6]/40 animate-pulse">
              <Mic className="w-4 h-4 text-[#00FFA6]" />
              <span className="text-xs font-bold text-[#00FFA6]">LIVE</span>
            </div>
          )}

          {/* Unread DMs Badge */}
          {unreadDMs > 0 && (
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#FF6B6B] border-2 border-[#0A0A19] flex items-center justify-center">
              <span className="text-xs font-bold text-white">{unreadDMs}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-2 border-b border-white/10 bg-[#0A0A19]">
        {[
          { id: "friends", label: "Friends", icon: Users },
          { id: "nearby", label: "Nearby", icon: Radio },
          { id: "guilds", label: "Guilds", icon: Shield },
          { id: "party", label: "Party", icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === tab.id
                ? "bg-[#33E7FF]/20 text-[#33E7FF] border border-[#33E7FF]/40"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4 mx-auto mb-0.5" />
            <div>{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 max-h-[280px] overflow-y-auto">
        {/* Friends Tab */}
        {activeTab === "friends" && (
          <div className="space-y-2">
            {friendsOnline.length > 0 && (
              <div>
                <div className="text-[#00FFA6] text-xs font-bold mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00FFA6] animate-pulse" />
                  ONLINE ({friendsOnline.length})
                </div>
                <div className="space-y-1.5">
                  {friendsOnline.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => onOpenDM?.(friend.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#33E7FF]/40 transition group"
                    >
                      <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full" />
                      <div className="flex-1 text-left">
                        <div className="text-white font-semibold text-sm">{friend.name}</div>
                        {friend.distance !== undefined && (
                          <div className="text-[#00FFA6] text-xs">{friend.distance}m away</div>
                        )}
                      </div>
                      <MessageCircle className="w-4 h-4 text-white/40 group-hover:text-[#33E7FF] transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {friendsOffline.length > 0 && (
              <div className="mt-3">
                <div className="text-white/40 text-xs font-bold mb-2">OFFLINE ({friendsOffline.length})</div>
                <div className="space-y-1.5">
                  {friendsOffline.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 opacity-60"
                    >
                      <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full grayscale" />
                      <div className="flex-1 text-left">
                        <div className="text-white/60 font-semibold text-sm">{friend.name}</div>
                        <div className="text-white/30 text-xs">offline</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nearby Players Tab */}
        {activeTab === "nearby" && (
          <div className="space-y-2">
            {nearbyPlayers.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                <Radio className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <div>No players nearby</div>
                <div className="text-xs mt-1">Move around to find others</div>
              </div>
            ) : (
              nearbyPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#33E7FF]/5 border border-[#33E7FF]/20 hover:bg-[#33E7FF]/10 transition"
                >
                  <img src={player.avatar} alt={player.name} className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm mb-0.5">{player.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-[#33E7FF] text-xs font-bold">{player.distance}m</div>
                      {player.distance < 10 && (
                        <div className="px-2 py-0.5 rounded bg-[#FF6B6B]/20 text-[#FF6B6B] text-[10px] font-bold animate-pulse">
                          VERY CLOSE
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onInviteParty?.(player.id)}
                    className="p-2 rounded-lg bg-[#00FFA6]/20 hover:bg-[#00FFA6]/30 transition"
                  >
                    <UserPlus className="w-4 h-4 text-[#00FFA6]" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Guilds Tab */}
        {activeTab === "guilds" && (
          <div className="space-y-2">
            {guilds.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <div>Not in any guilds</div>
                <button className="mt-3 px-4 py-2 rounded-lg bg-[#00FFA6]/20 text-[#00FFA6] hover:bg-[#00FFA6]/30 transition text-sm font-bold">
                  Browse Guilds
                </button>
              </div>
            ) : (
              guilds.map((guild) => (
                <button
                  key={guild.id}
                  onClick={() => onViewGuild?.(guild.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#442366]/40 transition"
                >
                  <div className="text-3xl">{guild.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-semibold text-sm">{guild.name}</div>
                    <div className="text-white/60 text-xs">{guild.members} members</div>
                  </div>
                  <Shield className="w-4 h-4 text-[#442366]" />
                </button>
              ))
            )}
          </div>
        )}

        {/* Party Tab */}
        {activeTab === "party" && (
          <div className="space-y-2">
            {parties.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <div>No active party</div>
                <button className="mt-3 px-4 py-2 rounded-lg bg-[#00FFA6]/20 text-[#00FFA6] hover:bg-[#00FFA6]/30 transition text-sm font-bold">
                  Create Party
                </button>
              </div>
            ) : (
              parties.map((party) => (
                <div
                  key={party.id}
                  className="p-4 rounded-lg bg-gradient-to-br from-[#00FFA6]/10 to-[#442366]/10 border border-[#00FFA6]/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-bold text-sm">Party Leader: {party.leader}</div>
                    <div className="text-[#00FFA6] text-xs">{party.members}/8</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 transition text-xs text-white font-bold">
                      Invite
                    </button>
                    <button className="flex-1 px-3 py-1.5 rounded bg-[#FF6B6B]/20 hover:bg-[#FF6B6B]/30 transition text-xs text-[#FF6B6B] font-bold">
                      Leave
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="p-3 border-t border-white/10 bg-[#0A0A19] flex gap-2">
        <button
          onClick={onJoinVoice}
          className={`flex-1 px-3 py-2 rounded-lg font-bold text-xs transition ${
            voiceChatActive
              ? "bg-[#00FFA6]/20 text-[#00FFA6] border border-[#00FFA6]/40"
              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Mic className="w-4 h-4 mx-auto mb-0.5" />
          Voice Chat
        </button>
        <button className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition font-bold text-xs">
          <Heart className="w-4 h-4 mx-auto mb-0.5" />
          Send Gift
        </button>
      </div>
    </div>
  )
}
