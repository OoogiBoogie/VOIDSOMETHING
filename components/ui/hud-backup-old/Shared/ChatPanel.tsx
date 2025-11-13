"use client"

import { useState } from "react";

interface ChatPanelProps {
  globalMessages: { id: string; user: string; text: string; time: string }[]
  proxMessages: { id: string; user: string; text: string; time: string }[]
  tradingSignals: { id: string; text: string; time: string }[]
  friendsOnline: { id: string; name: string; avatar: string }[]
  onSend: (channel: "global" | "prox", text: string) => void
  onDM: (friendId: string) => void
}

export function ChatPanel({
  globalMessages = [],
  proxMessages = [],
  tradingSignals = [],
  friendsOnline = [],
  onSend,
  onDM,
}: ChatPanelProps) {
  const [tab, setTab] = useState<"global" | "prox" | "signals">("global")
  const [input, setInput] = useState("")

  const messages =
    tab === "global"
      ? globalMessages
      : tab === "prox"
      ? proxMessages
      : tradingSignals.map((s) => ({ id: s.id, user: "Signal", text: s.text, time: s.time }))

  return (
    <div className="fixed bottom-28 left-4 w-[360px] h-[280px] bg-[rgba(10,12,24,0.95)] rounded-2xl shadow-2xl border-2 border-[#33E7FF]/30 flex flex-col z-[9991] pointer-events-auto">
      {/* Tabs */}
      <div className="flex gap-2 p-2 border-b border-white/10">
        <button
          className={`px-3 py-1 rounded-lg font-bold text-sm ${tab === "global" ? "bg-[#00FFA6]/20 text-[#00FFA6]" : "text-white/60"}`}
          onClick={() => setTab("global")}
        >
          Global
        </button>
        <button
          className={`px-3 py-1 rounded-lg font-bold text-sm ${tab === "prox" ? "bg-[#33E7FF]/20 text-[#33E7FF]" : "text-white/60"}`}
          onClick={() => setTab("prox")}
        >
          Prox
        </button>
        <button
          className={`px-3 py-1 rounded-lg font-bold text-sm ${tab === "signals" ? "bg-[#FF6B6B]/20 text-[#FF6B6B]" : "text-white/60"}`}
          onClick={() => setTab("signals")}
        >
          Trading Signals
        </button>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && <div className="text-white/40 text-center mt-8">No messages yet.</div>}
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2 items-start">
            <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-white font-bold text-lg">
              {msg.user?.[0] || "S"}
            </div>
            <div>
              <div className="text-xs text-white/70 font-bold">{msg.user}</div>
              <div className="text-sm text-white">{msg.text}</div>
              <div className="text-[10px] text-white/30">{msg.time}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Input */}
      {tab !== "signals" && (
        <form
          className="flex gap-2 p-2 border-t border-white/10"
          onSubmit={(e) => {
            e.preventDefault()
            if (input.trim()) {
              onSend(tab, input)
              setInput("")
            }
          }}
        >
          <input
            className="flex-1 rounded-lg px-3 py-2 bg-[#181A2A] text-white outline-none"
            placeholder={`Send a message to ${tab === "global" ? "Global" : "Prox"} chat...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#00FFA6] text-black font-bold hover:bg-[#33E7FF] transition"
          >
            Send
          </button>
        </form>
      )}
      {/* Friends Online */}
      <div className="flex gap-2 p-2 border-t border-white/10 bg-[#181A2A]/60">
        <div className="font-bold text-white/60 text-xs">Friends Online:</div>
        {friendsOnline.length === 0 && <span className="text-white/30">None</span>}
        {friendsOnline.map((f) => (
          <button
            key={f.id}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#222]/40 hover:bg-[#33E7FF]/20 text-xs text-white"
            onClick={() => onDM(f.id)}
          >
            <img src={f.avatar} alt={f.name} className="w-5 h-5 rounded-full" />
            {f.name}
          </button>
        ))}
      </div>
    </div>
  )
}
