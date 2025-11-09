"use client"

import { ArrowLeftRight, Package, Coins } from "lucide-react"
import { MobileOptimizedWrapper } from "@/components/mobile/MobileOptimizedComponents"

export function TradingSystem() {
  return (
    <MobileOptimizedWrapper
      title="Trading"
      preventPullToRefresh={true}
      adjustForKeyboard={true}
    >
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="w-6 h-6" />
            Your Items
          </h3>
          <div className="space-y-2">
            {["Rare Sword", "Epic Shield", "Legendary Helmet"].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 flex justify-between items-center">
                <span>{item}</span>
                <button className="px-3 py-1 rounded bg-purple-500/20 border border-purple-400 text-sm font-bold">
                  Offer
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Coins className="w-6 h-6" />
            Active Trades
          </h3>
          <div className="space-y-2">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-400">
              <p className="text-sm text-gray-400 mb-2">Trade with CryptoKing</p>
              <div className="flex items-center justify-between">
                <span className="text-sm">Your Sword ⇄ Their Armor</span>
                <button className="px-3 py-1 rounded bg-green-500/20 border border-green-400 text-sm font-bold">
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400 text-center">
        <ArrowLeftRight className="w-12 h-12 mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-2">Trade with Players</h3>
        <p className="text-gray-300 mb-4">Securely trade items and assets with other players</p>
        <button className="px-6 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 font-bold">Create New Trade</button>
      </div>
    </div>
    </MobileOptimizedWrapper>
  )
}
