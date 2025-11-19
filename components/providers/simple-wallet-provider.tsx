"use client";

import React, { useEffect, useRef } from "react";
import { WagmiProvider, createConfig, http, createStorage, useDisconnect } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  RainbowKitProvider, 
  ConnectButton, 
  darkTheme,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { 
  coinbaseWallet,
  metaMaskWallet,
  walletConnectWallet,
  phantomWallet,
  rabbyWallet,
} from '@rainbow-me/rainbowkit/wallets';
import "@rainbow-me/rainbowkit/styles.css";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";
const chains = [baseSepolia] as const;

// Create a memory-only storage that never persists
const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// Configure wallets with shimDisconnect to properly track disconnection
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [metaMaskWallet, phantomWallet, coinbaseWallet, walletConnectWallet, rabbyWallet],
    },
  ],
  {
    appName: "THE VOID",
    projectId,
  }
);

const config = createConfig({
  chains,
  connectors,
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: true,
  // Use memory-only storage - nothing persists between sessions
  storage: createStorage({ storage: memoryStorage }),
});

const queryClient = new QueryClient();

const SESSION_IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function SessionDisconnect({ children }: { children: React.ReactNode }) {
  const { disconnect } = useDisconnect();
  const idleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    disconnect();

    if (typeof window === "undefined") return;

    const clearIdleTimer = () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };

    const startIdleTimer = () => {
      clearIdleTimer();
      idleTimerRef.current = window.setTimeout(() => {
        disconnect();
      }, SESSION_IDLE_TIMEOUT);
    };

    const handleActivity = () => {
      startIdleTimer();
    };

    const handleBeforeUnload = () => disconnect();
    const handlePageHide = () => disconnect();

    const activityEvents: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "focus",
    ];

    activityEvents.forEach((event) => window.addEventListener(event, handleActivity));
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    startIdleTimer();

    return () => {
      clearIdleTimer();
      activityEvents.forEach((event) => window.removeEventListener(event, handleActivity));
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [disconnect]);

  return <>{children}</>;
}

export function SimpleWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#06ffa5',
            accentColorForeground: 'black',
            borderRadius: 'medium',
          })}
          modalSize="compact"
          initialChain={baseSepolia}
        >
          <SessionDisconnect>{children}</SessionDisconnect>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Export ConnectButton for easy use
export { ConnectButton };
