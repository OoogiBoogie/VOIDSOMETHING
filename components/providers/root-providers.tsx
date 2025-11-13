"use client"

import React from "react"
import { PrivyProviderWrapper } from "@/components/providers/privy-provider"
import dynamic from "next/dynamic"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { baseSepolia } from "wagmi/chains"
import { VoidRuntimeProvider } from "@/src/runtime/VoidRuntimeProvider"

// Import Web3Provider dynamically to avoid SSR issues
const Web3Provider = dynamic(
  () => import("@/components/Web3Provider").then((mod) => ({ default: mod.Web3Provider })),
  { ssr: false }
)

export default function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProviderWrapper>
      <Web3Provider>
        <OnchainKitProvider
          chain={baseSepolia}
        >
          <VoidRuntimeProvider>
            {children}
          </VoidRuntimeProvider>
        </OnchainKitProvider>
      </Web3Provider>
    </PrivyProviderWrapper>
  )
}
