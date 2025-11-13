"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useCoinbaseWallet } from "./coinbase-wallet-provider"
import { usePrivy } from "@privy-io/react-auth"

interface WalletConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConnected: (address: string, method: "privy" | "coinbase") => void
  onSkip?: () => void // Optional skip/bypass callback
}

export function WalletConnectionModal({ isOpen, onClose, onConnected, onSkip }: WalletConnectionModalProps) {
  const { connect, isConnecting } = useCoinbaseWallet()
  const { login, ready, authenticated, user } = usePrivy()
  const [selectedMethod, setSelectedMethod] = useState<"privy" | "coinbase" | null>(null)

  // Handle Privy authentication success
  useEffect(() => {
    if (authenticated && user?.wallet?.address && selectedMethod === "privy") {
      onConnected(user.wallet.address, "privy")
      onClose()
      setSelectedMethod(null)
    }
  }, [authenticated, user, selectedMethod, onConnected, onClose])

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    } else {
      onClose()
    }
  }

  const handleCoinbaseConnect = async () => {
    setSelectedMethod("coinbase")
    await connect()

    // Check if connected
    if (typeof window.ethereum !== "undefined") {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts.length > 0) {
        onConnected(accounts[0], "coinbase")
        onClose()
      }
    }
    setSelectedMethod(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-cyan-500/30"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: "0 0 50px rgba(6, 255, 165, 0.3)",
            }}
          >
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
              Connect Wallet
            </h2>
            <p className="text-gray-400 text-sm mb-6">Choose your preferred wallet connection method</p>

            <div className="space-y-3">
              {/* Coinbase Wallet */}
              <motion.button
                onClick={handleCoinbaseConnect}
                disabled={isConnecting || selectedMethod === "coinbase"}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-blue-400/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🟦</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-bold text-lg">Coinbase Wallet</h3>
                    <p className="text-blue-200 text-xs">Secure & self-custodial</p>
                  </div>
                  {selectedMethod === "coinbase" && (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </motion.button>

              {/* Privy (Email & Social) */}
              <motion.button
                onClick={async () => {
                  if (!ready) return
                  setSelectedMethod("privy")
                  try {
                    await login()
                  } catch (error) {
                    console.error("Privy login error:", error)
                    setSelectedMethod(null)
                  }
                }}
                disabled={!ready || isConnecting || selectedMethod === "privy" || authenticated}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-purple-400/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-bold text-lg">Privy</h3>
                    <p className="text-purple-200 text-xs">Email & social login</p>
                  </div>
                  {selectedMethod === "privy" && (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </motion.button>
            </div>

            {/* Bypass/Skip Section */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <motion.button
                onClick={handleSkip}
                className="w-full p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border-2 border-gray-600/30 hover:border-gray-500/50 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-bold text-lg">Continue as Guest</h3>
                    <p className="text-gray-400 text-xs">Explore without connecting wallet</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>
              <p className="text-xs text-gray-500 text-center mt-3">
                You can connect your wallet later from settings
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 py-3 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By connecting, you agree to the VOID Terms of Service
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
