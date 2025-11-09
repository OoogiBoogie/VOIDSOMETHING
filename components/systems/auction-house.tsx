"use client"

import { Gavel, Clock, Coins } from "lucide-react"
import { MobileOptimizedWrapper } from "@/components/mobile/MobileOptimizedComponents"

export function AuctionHouse() {
  const auctions = [
    { item: "Legendary Sword", currentBid: 1250, timeLeft: "2h 15m", bids: 12 },
    { item: "Epic Mount", currentBid: 3500, timeLeft: "5h 42m", bids: 28 },
    { item: "Rare Artifact", currentBid: 850, timeLeft: "1h 08m", bids: 7 },
  ]

  return (
    <MobileOptimizedWrapper
      title="Auction House"
      preventPullToRefresh={true}
      adjustForKeyboard={true}
    >
    <div className="space-y-4">
      {auctions.map((auction, i) => (
        <div key={i} className="p-4 rounded-xl bg-white/5 border-2 border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">{auction.item}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {auction.timeLeft}
                </span>
                <span className="flex items-center gap-1">
                  <Gavel className="w-4 h-4" />
                  {auction.bids} bids
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Current Bid</p>
              <p className="text-xl font-bold text-yellow-400 flex items-center gap-1">
                <Coins className="w-5 h-5" />
                {auction.currentBid}
              </p>
            </div>
          </div>
          <button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold">
            Place Bid
          </button>
        </div>
      ))}
    </div>
    </MobileOptimizedWrapper>
  )
}
