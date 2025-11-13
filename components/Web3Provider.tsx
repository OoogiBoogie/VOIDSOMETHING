"use client"

import type React from "react"
import { Suspense, lazy, useState } from "react"
import { CoinbaseWalletProvider } from "@/components/wallet/coinbase-wallet-provider"

const WagmiProvider = lazy(() =>
  import("wagmi")
    .then((mod) => ({ default: mod.WagmiProvider }))
    .catch((error) => {
      console.error("[v0] Failed to load Wagmi:", error)
      return {
        default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
      }
    }),
)

const QueryClientProvider = lazy(() =>
  import("@tanstack/react-query")
    .then((mod) => ({ default: mod.QueryClientProvider }))
    .catch((error) => {
      console.error("[v0] Failed to load React Query:", error)
      return {
        default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
      }
    }),
)

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    try {
      // Only create QueryClient if react-query is available
      const { QueryClient } = require("@tanstack/react-query")
      return new QueryClient()
    } catch {
      return null
    }
  })

  const [wagmiConfig] = useState(() => {
    try {
      const { wagmiConfig: config } = require("@/lib/wagmiConfig")
      return config
    } catch {
      return null
    }
  })

  if (!queryClient || !wagmiConfig) {
    console.log("[v0] Web3 providers not available, running in fallback mode")
    return (
      <CoinbaseWalletProvider>
        {children}
      </CoinbaseWalletProvider>
    )
  }

  return (
    <CoinbaseWalletProvider>
      <Suspense fallback={<>{children}</>}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </Suspense>
    </CoinbaseWalletProvider>
  )
}
