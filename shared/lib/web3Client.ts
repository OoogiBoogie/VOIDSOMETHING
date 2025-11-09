/**
 * Web3 Client Configuration
 * wagmi v2 setup with Base chain
 */

import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "../config/chains";
import { injected, metaMask, coinbaseWallet, walletConnect } from "wagmi/connectors";

// Use environment variable or default to mainnet
const isDevelopment = process.env.NODE_ENV === "development";
const useTestnet = process.env.NEXT_PUBLIC_USE_TESTNET === "true";

export const activeChain = useTestnet ? baseSepolia : base;

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: "VOID Metaverse",
      },
    }),
    coinbaseWallet({ 
      appName: "VOID Metaverse",
      appLogoUrl: "/logo.png",
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
      metadata: {
        name: "VOID Metaverse",
        description: "Web3 3D Metaverse on Base",
        url: typeof window !== "undefined" ? window.location.origin : "",
        icons: ["/logo.png"],
      },
    }),
  ],
  multiInjectedProviderDiscovery: true,
  ssr: true,
});
