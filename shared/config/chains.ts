/**
 * Chain Configuration
 * Base mainnet and testnet configuration
 */

import { defineChain } from "viem";

export const base = defineChain({
  id: 8453,
  name: "Base",
  nativeCurrency: { 
    name: "Ether", 
    symbol: "ETH", 
    decimals: 18 
  },
  rpcUrls: {
    default: { 
      http: ["https://mainnet.base.org"] 
    },
    public: { 
      http: ["https://mainnet.base.org"] 
    },
  },
  blockExplorers: {
    default: { 
      name: "BaseScan", 
      url: "https://basescan.org" 
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 5022,
    },
  },
});

export const baseSepolia = defineChain({
  id: 84532,
  name: "Base Sepolia",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.base.org"],
    },
    public: {
      http: ["https://sepolia.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "BaseScan",
      url: "https://sepolia.basescan.org",
    },
  },
  testnet: true,
});
