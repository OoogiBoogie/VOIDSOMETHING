"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { Wallet, CheckCircle, Loader2 } from "lucide-react";

interface StartScreenV2Props {
  onStart: () => void;
}

export function StartScreenV2({ onStart }: StartScreenV2Props) {
  const { authenticated, login, ready: privyReady } = usePrivy();
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Auto-show details after brief delay
  useEffect(() => {
    const timer = setTimeout(() => setShowDetails(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      await login();
    } catch (error) {
      console.error("Wallet connection error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const canEnterWorld = authenticated && isConnected && address;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Cyberpunk gradient background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(6, 255, 165, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(0, 217, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 50% 80%, rgba(255, 0, 110, 0.15) 0%, transparent 50%)
            `,
          }}
        />
        <div className="absolute inset-0 scanlines opacity-10" />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-black/90 backdrop-blur-2xl border-2 border-cyan-400/50 rounded-2xl p-8 shadow-[0_0_60px_rgba(6,182,212,0.3)]"
        >
          {/* Header */}
          <motion.div
            className="mb-8 text-center"
            animate={{
              textShadow: [
                "0 0 20px #06ffa5",
                "0 0 40px #00d9ff",
                "0 0 20px #ff006e",
                "0 0 20px #06ffa5",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-2">
              VOID
            </h1>
            <p className="text-cyan-400 text-lg font-bold tracking-widest">
              PSX AGENCY PROTOCOL
            </p>
          </motion.div>

          {/* Wallet Section with OnchainKit */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-2 border-cyan-400/50 rounded-xl p-6">
              {canEnterWorld ? (
                // Connected State
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                    <p className="text-emerald-400 font-bold text-lg">
                      Wallet Connected
                    </p>
                  </div>

                  {/* Wallet Identity Display */}
                  <div className="bg-black/40 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {address?.slice(2, 4).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold text-sm">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </div>
                      <div className="text-cyan-400 text-xs font-mono">
                        Connected Wallet
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Base Sepolia (Chain ID: 84532)
                  </div>
                </motion.div>
              ) : (
                // Not Connected State
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Wallet className="w-6 h-6 text-cyan-400" />
                    <p className="text-cyan-400 font-bold text-lg">
                      Connect Your Wallet
                    </p>
                  </div>

                  {/* OnchainKit Connect Button */}
                  {privyReady ? (
                    <div className="space-y-3">
                      <button
                        onClick={handleConnect}
                        disabled={isLoading}
                        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Connecting...
                          </span>
                        ) : (
                          "Connect with Privy"
                        )}
                      </button>

                      <p className="text-xs text-gray-400 text-center">
                        Email • Google • Twitter • Discord • Wallet
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Info Cards - Only show after initial animation */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-3 mb-6"
              >
                <InfoCard
                  icon="📍"
                  title="Starting Location"
                  description="Spawn at PSX HQ - command center for all creators"
                  color="cyan"
                />
                <InfoCard
                  icon="🎮"
                  title="Controls"
                  description="WASD: Move • Shift: Sprint • E: Interact • Tab: Dashboard"
                  color="purple"
                />
                <InfoCard
                  icon="🌆"
                  title="Explore Zones"
                  description="PSX HQ • DEX Plaza • Casino Strip • Housing • Signal Lab"
                  color="pink"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enter World Button */}
          <motion.button
            onClick={onStart}
            disabled={!canEnterWorld}
            whileHover={canEnterWorld ? { scale: 1.02 } : {}}
            whileTap={canEnterWorld ? { scale: 0.98 } : {}}
            className={`w-full px-8 py-4 rounded-xl text-white text-xl font-bold transition-all ${
              canEnterWorld
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_40px_rgba(6,255,165,0.5)] hover:shadow-[0_0_60px_rgba(6,255,165,0.7)]"
                : "bg-gray-700 cursor-not-allowed opacity-50"
            }`}
          >
            {canEnterWorld ? "ENTER WORLD" : "CONNECT WALLET TO CONTINUE"}
          </motion.button>

          {canEnterWorld && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-xs text-center mt-4 font-mono"
            >
              Ready to enter. Click above to begin your journey.
            </motion.p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Info Card Component
interface InfoCardProps {
  icon: string;
  title: string;
  description: string;
  color: "cyan" | "purple" | "pink";
}

function InfoCard({ icon, title, description, color }: InfoCardProps) {
  const colorClasses = {
    cyan: "from-cyan-500/10 border-cyan-400/30 text-cyan-400",
    purple: "from-purple-500/10 border-purple-400/30 text-purple-400",
    pink: "from-pink-500/10 border-pink-400/30 text-pink-400",
  };

  return (
    <div
      className={`bg-gradient-to-r ${colorClasses[color].split(" ")[0]} border ${
        colorClasses[color].split(" ")[1]
      } rounded-xl p-4`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h3 className={`${colorClasses[color].split(" ")[2]} font-bold mb-1 text-sm`}>
            {title}
          </h3>
          <p className="text-gray-200 text-xs leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
