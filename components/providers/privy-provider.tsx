"use client";

import React, { Suspense } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { base, baseSepolia } from "viem/chains";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? '';

// helper: decide chain once
const USE_TESTNET = true; // flip to false when you go mainnet
const defaultChain = USE_TESTNET ? baseSepolia : base;

type Props = {
  children: React.ReactNode;
};

export function PrivyProviderWrapper({ children }: Props) {
  // If app id missing/invalid, render children without Privy instead of crashing
  const isValid = typeof privyAppId === 'string' && privyAppId.trim().length > 10;

  if (!isValid) {
    if (typeof window !== "undefined") {
      console.warn(
        "[PSX VOID] Privy disabled: missing or invalid NEXT_PUBLIC_PRIVY_APP_ID. " +
          "Set it in your .env.local to enable wallet auth."
      );
    }
    return <>{children}</>;
  }

  return (
    <Suspense fallback={<>{children}</>}>
      <PrivyProvider
        appId={privyAppId}
        config={{
          // chain configuration
          defaultChain,
          supportedChains: [baseSepolia, base],

          // auth & wallets
          loginMethods: ["email", "google", "twitter", "discord", "wallet"],
          appearance: {
            theme: "dark",
            accentColor: "#a855ff", // matches VOID neon purple
            logo: "/icon-dark-32x32.png",
          },
        }}
      >
        {children}
      </PrivyProvider>
    </Suspense>
  );
}
