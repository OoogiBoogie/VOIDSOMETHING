"use client"

import { useState } from "react"
import { TrendingUp, Wallet, BarChart3, Coins, ArrowUpDown, Zap, DollarSign } from "lucide-react"

interface Web3TradingHubProps {
  // Token prices
  tokens: {
    symbol: string
    name: string
    price: number
    change24h: number
    volume: number
  }[]
  
  // User portfolio
  voidBalance: number
  psxBalance: number
  totalValueUSD: number
  
  // NFTs
  nfts: {
    id: string
    name: string
    image: string
    floor: number
    collection: string
  }[]
  
  // Actions
  onOpenSwap?: () => void
  onOpenChart?: (symbol: string) => void
  onOpenNFT?: (nftId: string) => void
  onOpenWallet?: () => void
}

export function Web3TradingHub({
  tokens,
  voidBalance,
  psxBalance,
  totalValueUSD,
  nfts,
  onOpenSwap,
  onOpenChart,
  onOpenNFT,
  onOpenWallet,
}: Web3TradingHubProps) {
  const [activeTab, setActiveTab] = useState<"tokens" | "nfts" | "swap" | "charts">("tokens")

  return (
    <div className="fixed bottom-28 right-4 w-[420px] bg-[rgba(10,12,24,0.98)] rounded-2xl shadow-2xl border-2 border-[#FFD700]/40 z-[9991] pointer-events-auto overflow-hidden">
      {/* Header */}
      <div className="relative p-4 bg-gradient-to-br from-[#FFD700]/10 via-transparent to-[#00FFA6]/10 border-b-2 border-[#FFD700]/20">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "repeating-linear-gradient(0deg, #FFD700 0px, #FFD700 1px, transparent 1px, transparent 4px)"
        }} />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#FFD700]/20">
              <TrendingUp className="w-6 h-6 text-[#FFD700]" />
            </div>
            <div>
              <h2 className="text-xl font-black font-[family-name:var(--font-orbitron)] text-[#FFD700]">
                WEB3 TRADING HUB
              </h2>
              <div className="text-xs text-white/60">
                Portfolio: ${totalValueUSD.toLocaleString()}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenWallet}
            className="px-4 py-2 rounded-lg bg-[#00FFA6]/20 border border-[#00FFA6]/40 hover:bg-[#00FFA6]/30 transition"
          >
            <Wallet className="w-5 h-5 text-[#00FFA6]" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-2 border-b border-white/10 bg-[#0A0A19]">
        {[
          { id: "tokens", label: "Tokens", icon: Coins },
          { id: "nfts", label: "NFTs", icon: Zap },
          { id: "swap", label: "Swap", icon: ArrowUpDown },
          { id: "charts", label: "Charts", icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === tab.id
                ? "bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4 mx-auto mb-0.5" />
            <div>{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 max-h-[340px] overflow-y-auto">
        {/* Tokens Tab */}
        {activeTab === "tokens" && (
          <div className="space-y-2">
            {/* User Holdings */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#00FFA6]/10 to-[#442366]/10 border border-[#00FFA6]/20 mb-3">
              <div className="text-white/60 text-xs mb-3 font-bold">MY HOLDINGS</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[#00FFA6] text-xs mb-1">VOID</div>
                  <div className="text-white font-black text-xl font-mono">{voidBalance.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[#442366] text-xs mb-1">PSX</div>
                  <div className="text-white font-black text-xl font-mono">{psxBalance.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Token List */}
            <div className="text-white/60 text-xs font-bold mb-2">LIVE PRICES</div>
            {tokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => onOpenChart?.(token.symbol)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FFD700]/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#00FFA6] flex items-center justify-center font-bold text-sm">
                    {token.symbol.slice(0, 2)}
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm">{token.symbol}</div>
                    <div className="text-white/40 text-xs">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-sm font-mono">
                    ${token.price.toFixed(4)}
                  </div>
                  <div className={`text-xs font-bold ${token.change24h >= 0 ? "text-[#00FFA6]" : "text-[#FF6B6B]"}`}>
                    {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* NFTs Tab */}
        {activeTab === "nfts" && (
          <div>
            {nfts.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <div>No NFTs owned</div>
                <button className="mt-3 px-4 py-2 rounded-lg bg-[#00FFA6]/20 text-[#00FFA6] hover:bg-[#00FFA6]/30 transition text-sm font-bold">
                  Browse NFTs
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {nfts.map((nft) => (
                  <button
                    key={nft.id}
                    onClick={() => onOpenNFT?.(nft.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FFD700]/40 transition group"
                  >
                    <img src={nft.image} alt={nft.name} className="w-full aspect-square rounded-lg mb-2 object-cover" />
                    <div className="text-left">
                      <div className="text-white font-semibold text-xs truncate">{nft.name}</div>
                      <div className="text-white/40 text-[10px] truncate">{nft.collection}</div>
                      <div className="text-[#00FFA6] text-xs font-bold mt-1">Floor: {nft.floor} VOID</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Swap Tab */}
        {activeTab === "swap" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-white/60 text-xs mb-2">FROM</div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-white text-2xl font-bold outline-none"
                />
                <select className="px-3 py-2 rounded-lg bg-[#0A0A19] border border-white/20 text-white font-bold">
                  <option>VOID</option>
                  <option>PSX</option>
                  <option>ETH</option>
                </select>
              </div>
              <div className="text-white/40 text-xs mt-1">Balance: {voidBalance.toLocaleString()}</div>
            </div>

            <div className="flex justify-center">
              <button className="p-3 rounded-full bg-[#00FFA6]/20 border-4 border-[#0A0A19] hover:bg-[#00FFA6]/30 transition">
                <ArrowUpDown className="w-5 h-5 text-[#00FFA6]" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-white/60 text-xs mb-2">TO</div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-white text-2xl font-bold outline-none"
                />
                <select className="px-3 py-2 rounded-lg bg-[#0A0A19] border border-white/20 text-white font-bold">
                  <option>PSX</option>
                  <option>VOID</option>
                  <option>ETH</option>
                </select>
              </div>
              <div className="text-white/40 text-xs mt-1">Balance: {psxBalance.toLocaleString()}</div>
            </div>

            <button
              onClick={onOpenSwap}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00FFA6] to-[#33E7FF] text-black font-black text-lg hover:opacity-90 transition"
            >
              SWAP TOKENS
            </button>
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === "charts" && (
          <div className="space-y-3">
            {tokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => onOpenChart?.(token.symbol)}
                className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FFD700]/40 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white font-bold text-lg">{token.symbol}</div>
                    <div className="text-white/40 text-xs">{token.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg font-mono">${token.price.toFixed(4)}</div>
                    <div className={`text-sm font-bold ${token.change24h >= 0 ? "text-[#00FFA6]" : "text-[#FF6B6B]"}`}>
                      {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
                {/* Mini chart placeholder */}
                <div className="h-16 bg-gradient-to-r from-[#00FFA6]/10 to-[#FFD700]/10 rounded-lg flex items-end justify-between px-2 pb-2">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#00FFA6]/60 rounded-t"
                      style={{ height: `${Math.random() * 100}%` }}
                    />
                  ))}
                </div>
                <div className="text-white/40 text-xs mt-2">
                  24h Vol: ${(token.volume / 1000).toFixed(1)}K
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
