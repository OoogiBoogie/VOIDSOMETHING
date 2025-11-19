"use client"

import React from "react"
import { SimpleWalletProvider } from "@/components/providers/simple-wallet-provider"
import { VoidRuntimeProvider } from "@/src/runtime/VoidRuntimeProvider"
import { RetroEffectsProvider } from "@/contexts/RetroEffectsContext"

export default function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <SimpleWalletProvider>
      <VoidRuntimeProvider>
        <RetroEffectsProvider>
          {children}
        </RetroEffectsProvider>
      </VoidRuntimeProvider>
    </SimpleWalletProvider>
  )
}
