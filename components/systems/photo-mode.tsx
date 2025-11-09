"use client"

import { Camera, Download, Share2, Sliders } from "lucide-react"
import { MobileOptimizedWrapper } from "@/components/mobile/MobileOptimizedComponents"

export function PhotoMode() {
  return (
    <MobileOptimizedWrapper
      title="Photo Mode"
      preventPullToRefresh={true}
      adjustForKeyboard={false}
    >
    <div className="space-y-6">
      <div className="aspect-video bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl border-2 border-purple-400 flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl font-bold">Camera Preview</p>
          <p className="text-sm text-gray-400 mt-2">Press P to enter Photo Mode in-game</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 rounded-xl bg-white/5 border-2 border-white/10 hover:bg-white/10 flex flex-col items-center gap-2">
          <Sliders className="w-8 h-8" />
          <span className="font-bold">Filters</span>
        </button>
        <button className="p-4 rounded-xl bg-white/5 border-2 border-white/10 hover:bg-white/10 flex flex-col items-center gap-2">
          <Download className="w-8 h-8" />
          <span className="font-bold">Save</span>
        </button>
        <button className="p-4 rounded-xl bg-white/5 border-2 border-white/10 hover:bg-white/10 flex flex-col items-center gap-2">
          <Share2 className="w-8 h-8" />
          <span className="font-bold">Share</span>
        </button>
      </div>

      <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400 text-center">
        <Camera className="w-12 h-12 mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-2">Capture the Moment</h3>
        <p className="text-gray-300">Take stunning screenshots with advanced camera controls</p>
      </div>
    </div>
    </MobileOptimizedWrapper>
  )
}
