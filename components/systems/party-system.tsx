"use client"

import { Users, UserPlus, Crown, Shield } from "lucide-react"
import { MobileOptimizedWrapper } from "@/components/mobile/MobileOptimizedComponents"

export function PartySystem() {
  const partyMembers = [
    { name: "You", level: 42, role: "Leader", online: true },
    { name: "CryptoKing", level: 38, role: "Member", online: true },
    { name: "VoidMaster", level: 45, role: "Member", online: false },
  ]

  return (
    <MobileOptimizedWrapper
      title="Party"
      preventPullToRefresh={true}
      adjustForKeyboard={true}
    >
    <div className="space-y-6">
      <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Party Members ({partyMembers.length}/4)
          </h3>
          <button className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 font-bold flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite
          </button>
        </div>

        <div className="space-y-2">
          {partyMembers.map((member, i) => (
            <div key={i} className="p-4 rounded-lg bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${member.online ? "bg-green-400" : "bg-gray-400"}`} />
                <div>
                  <p className="font-bold flex items-center gap-2">
                    {member.name}
                    {member.role === "Leader" && <Crown className="w-4 h-4 text-yellow-400" />}
                  </p>
                  <p className="text-sm text-gray-400">Level {member.level}</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">{member.role}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border-2 border-white/10 text-center">
          <Shield className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold">Party Level</p>
          <p className="text-2xl font-bold text-purple-400">42</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border-2 border-white/10 text-center">
          <Users className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold">Total XP</p>
          <p className="text-2xl font-bold text-purple-400">15.2K</p>
        </div>
      </div>
    </div>
    </MobileOptimizedWrapper>
  )
}
