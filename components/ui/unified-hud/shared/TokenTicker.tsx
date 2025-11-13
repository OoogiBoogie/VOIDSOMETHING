"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface TokenTickerProps {
  voidPrice: number
  voidChange: number
  psxPrice: number
  psxChange: number
  visible?: boolean
}

export function TokenTicker({ voidPrice, voidChange, psxPrice, psxChange, visible = true }: TokenTickerProps) {
  const [show, setShow] = useState(visible)

  useEffect(() => {
    setShow(visible)
  }, [visible])

  if (!show) return null

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9985] px-4 py-1.5 rounded-full border flex items-center gap-4 animate-slide-in"
      style={{
        background: "rgba(10, 10, 25, 0.75)",
        backdropFilter: "blur(15px)",
        borderColor: "rgba(0, 255, 166, 0.3)",
        boxShadow: "0 0 15px rgba(0, 255, 166, 0.1)",
      }}
    >
      {/* VOID */}
      <div className="flex items-center gap-1.5">
        <span className="text-[#00FFA6] font-semibold text-xs font-['Orbitron']">VOID</span>
        <span className="text-white font-bold text-xs font-mono tabular-nums">${voidPrice.toFixed(4)}</span>
        <div className={`flex items-center gap-0.5 ${voidChange >= 0 ? "text-green-400" : "text-red-400"}`}>
          {voidChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span className="text-[10px] font-bold font-mono">
            {voidChange >= 0 ? "+" : ""}
            {voidChange.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Separator */}
      <div className="w-px h-4 bg-white/20" />

      {/* PSX */}
      <div className="flex items-center gap-1.5">
        <span className="text-[#442366] font-semibold text-xs font-['Orbitron']">PSX</span>
        <span className="text-white font-bold text-xs font-mono tabular-nums">${psxPrice.toFixed(4)}</span>
        <div className={`flex items-center gap-0.5 ${psxChange >= 0 ? "text-green-400" : "text-red-400"}`}>
          {psxChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span className="text-[10px] font-bold font-mono">
            {psxChange >= 0 ? "+" : ""}
            {psxChange.toFixed(2)}%
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.15s ease-out;
        }
      `}</style>
    </div>
  )
}
