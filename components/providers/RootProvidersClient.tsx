// components/providers/RootProvidersClient.tsx
"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { useState } from "react";

export default function RootProvidersClient({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!; // ensure it's set

  if (!wagmiConfig) {
    return <div className="p-4 text-red-500">wagmi config failed to initialize</div>;
  }

  return (
    <PrivyProvider appId={privyAppId}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
}
