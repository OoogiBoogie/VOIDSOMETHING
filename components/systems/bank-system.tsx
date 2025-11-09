"use client"

import { Vault, TrendingUp } from "lucide-react"
import { MobileOptimizedWrapper } from "@/components/mobile/MobileOptimizedComponents"

export function BankSystem() {
  return (
    <MobileOptimizedWrapper
      title="Bank"
      preventPullToRefresh={true}
      adjustForKeyboard={true}
    >
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-400">
          <Vault className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Vault Storage</h3>
          <p className="text-gray-300 mb-4">Securely store your items and assets</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Capacity</span>
              <span className="font-bold">45 / 100</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: "45%" }} />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400">
          <TrendingUp className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">VOID Staking</h3>
          <p className="text-gray-300 mb-4">Stake VOID tokens to earn rewards</p>
          <div className="bg-black/20 rounded-lg p-4">
            <p className="text-sm text-gray-400">Current APY</p>
            <p className="text-3xl font-bold text-green-400">12.5%</p>
          </div>
        </div>
      </div>
    </div>
    </MobileOptimizedWrapper>
  )
}
