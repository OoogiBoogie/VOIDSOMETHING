"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface CoinbaseWalletContextType {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const CoinbaseWalletContext = createContext<CoinbaseWalletContextType | undefined>(undefined)

export function useCoinbaseWallet() {
  const context = useContext(CoinbaseWalletContext)
  if (!context) {
    throw new Error("useCoinbaseWallet must be used within CoinbaseWalletProvider")
  }
  return context
}

export function CoinbaseWalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setAddress(accounts[0])
        }
      } catch (error) {
        console.error("[v0] Failed to check wallet connection:", error)
      }
    }
  }

  const connect = async () => {
    setIsConnecting(true)

    try {
      if (typeof window.ethereum === "undefined") {
        window.open("https://www.coinbase.com/wallet", "_blank")
        setIsConnecting(false)
        return
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setAddress(accounts[0])

        // Store connection preference
        localStorage.setItem("void_wallet_preference", "coinbase")
      }
    } catch (error) {
      console.error("[v0] Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
    localStorage.removeItem("void_wallet_preference")
  }

  useEffect(() => {
    if (typeof window.ethereum !== "undefined" && window.ethereum.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setAddress(accounts[0])
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        }
      }
    }
  }, [])

  const value = {
    address,
    isConnected: !!address,
    isConnecting,
    connect,
    disconnect,
  }

  return <CoinbaseWalletContext.Provider value={value}>{children}</CoinbaseWalletContext.Provider>
}
