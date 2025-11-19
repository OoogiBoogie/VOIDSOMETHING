let wagmiConfig: any

try {
  const { http, fallback, createConfig } = require("wagmi")
  const { base, baseSepolia } = require("wagmi/chains")
  const { coinbaseWallet, walletConnect } = require("wagmi/connectors")

  // Set to false when moving to mainnet
  const USE_TESTNET = true
  const activeChain = USE_TESTNET ? baseSepolia : base

  // RPC fallback array with retry/rank for resilience
  const rpcTransports = fallback([
    http("https://base-sepolia-rpc.publicnode.com"), // fallback 1 (better rate limits)
    http("https://base-sepolia.blockpi.network/v1/rpc/public"), // fallback 2
    http(process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org"), // primary (official)
    http("https://base-sepolia.rpc.thirdweb.com"), // fallback 3
  ], { 
    rank: true, 
    retryCount: 3,
    retryDelay: 1000, // 1s exponential backoff
  })

  wagmiConfig = createConfig({
    chains: [activeChain],
    connectors: [
      coinbaseWallet({
        appName: "PSX VOID Metaverse",
        preference: "smartWalletOnly",
      }),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
        metadata: {
          name: "PSX VOID Metaverse",
          description: "On-chain creator economy and metaverse on Base",
          url: typeof window !== 'undefined' ? window.location.origin : "https://psx.void.city",
          icons: ["https://psx.void.city/icon.png"],
        },
        showQrModal: true,
      }),
    ],
    transports: {
      [activeChain.id]: rpcTransports,
    },
    ssr: true,
    autoConnect: true,
  })

  // Chain guard: prevent silent mainnet misconfiguration
  const ACTIVE_CHAIN_ID = 84532; // Base Sepolia
  if (wagmiConfig.chains[0].id !== ACTIVE_CHAIN_ID) {
    console.error("Wagmi misconfigured: wrong chain id", wagmiConfig.chains[0].id);
  }
} catch (error) {
  console.error("[v0] Failed to initialize wagmi config:", error)
  wagmiConfig = null
}

export { wagmiConfig }
