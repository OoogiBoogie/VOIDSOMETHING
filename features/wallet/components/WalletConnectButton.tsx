/**
 * Wallet Connect Button
 * Clean wallet connection UI with audio feedback
 */

"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect } from "react";
import { useAudio } from "../../audio/AudioProvider";
import { AudioEvents } from "../../audio/audioEvents";

export function WalletConnectButton() {
  const { isConnected, address, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { play } = useAudio();

  // Play sound on connection/disconnection
  useEffect(() => {
    if (isConnected) {
      play(AudioEvents.WALLET_CONNECTED);
    }
  }, [isConnected, play]);

  const handleConnect = () => {
    play(AudioEvents.UI_CLICK);
    connect({ connector: connectors[0] });
  };

  const handleDisconnect = () => {
    play(AudioEvents.UI_CLICK);
    disconnect();
    play(AudioEvents.WALLET_DISCONNECTED);
  };

  if (isConnected && address) {
    return (
      <button
        onClick={handleDisconnect}
        className="px-4 py-2 bg-gradient-to-r from-[#ff0032] to-[#7b00ff] hover:opacity-80 rounded-lg font-mono text-sm uppercase tracking-wider transition-opacity"
      >
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-gray-300">
            {chain?.name || "Base"}
          </span>
          <span className="text-white font-bold">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      className="px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#7b00ff] hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-mono text-sm uppercase tracking-wider transition-opacity font-bold"
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
