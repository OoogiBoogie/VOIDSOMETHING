/**
 * VOID Demo Page
 * Showcases new feature-based architecture with:
 * - Glowing 3D letters (React Three Fiber, no Babylon.js)
 * - Centralized audio system
 * - Base chain wallet integration
 */

"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { wagmiConfig } from "@/shared/lib/web3Client";
import { AudioProvider } from "@/features/audio/AudioProvider";
import { WorldCanvas } from "@/features/world/components/WorldCanvas";
import { WalletConnectButton } from "@/features/wallet/components/WalletConnectButton";
import { AudioEvents } from "@/features/audio/audioEvents";
import { useAudio } from "@/features/audio/AudioProvider";

const queryClient = new QueryClient();

function DemoControls() {
  const { play, setCategoryVolume } = useAudio();

  return (
    <div className="absolute top-4 left-4 z-10 space-y-4">
      {/* Audio Test Panel */}
      <div className="bg-black/80 backdrop-blur-sm border-2 border-[#00f0ff]/30 rounded-lg p-4 space-y-2">
        <h3 className="text-[#00f0ff] font-mono text-sm uppercase tracking-wider mb-3">
          Audio System Test
        </h3>
        
        <button
          onClick={() => play(AudioEvents.UI_CLICK)}
          className="w-full px-3 py-2 bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 border border-[#00f0ff]/50 rounded text-white text-xs font-mono uppercase transition-colors"
        >
          UI Click
        </button>
        
        <button
          onClick={() => play(AudioEvents.WORLD_TELEPORT)}
          className="w-full px-3 py-2 bg-[#ff0032]/20 hover:bg-[#ff0032]/30 border border-[#ff0032]/50 rounded text-white text-xs font-mono uppercase transition-colors"
        >
          Teleport
        </button>
        
        <button
          onClick={() => play(AudioEvents.TX_SUCCESS)}
          className="w-full px-3 py-2 bg-[#7b00ff]/20 hover:bg-[#7b00ff]/30 border border-[#7b00ff]/50 rounded text-white text-xs font-mono uppercase transition-colors"
        >
          TX Success
        </button>

        <button
          onClick={() => play(AudioEvents.AMBIENT_CITY)}
          className="w-full px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded text-white text-xs font-mono uppercase transition-colors"
        >
          Start Ambient
        </button>
      </div>

      {/* Info Panel */}
      <div className="bg-black/80 backdrop-blur-sm border-2 border-[#7b00ff]/30 rounded-lg p-4">
        <h3 className="text-[#7b00ff] font-mono text-sm uppercase tracking-wider mb-2">
          New Architecture
        </h3>
        <ul className="text-gray-300 text-xs font-mono space-y-1">
          <li>✅ No Babylon.js</li>
          <li>✅ React Three Fiber</li>
          <li>✅ Feature-based structure</li>
          <li>✅ Centralized audio</li>
          <li>✅ Base chain ready</li>
        </ul>
      </div>
    </div>
  );
}

function DemoPageContent() {
  return (
    <div className="relative w-full h-screen bg-black">
      {/* 3D World */}
      <div className="absolute inset-0">
        <WorldCanvas />
      </div>

      {/* Controls */}
      <DemoControls />

      {/* Wallet Button */}
      <div className="absolute top-4 right-4 z-10">
        <WalletConnectButton />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/80 backdrop-blur-sm border-2 border-[#ff0032]/30 rounded-lg px-6 py-3">
          <p className="text-[#ff0032] font-mono text-sm uppercase tracking-wider">
            Click letters for sound • Drag to orbit • Scroll to zoom
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AudioProvider masterVolume={1} enableSounds={true}>
          <DemoPageContent />
        </AudioProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
