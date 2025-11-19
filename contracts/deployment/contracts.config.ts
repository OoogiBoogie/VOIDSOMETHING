/**
 * PHASE 5A — CONTRACT ADDRESSES
 * 
 * Deployed contract addresses for Base Sepolia and Base Mainnet.
 * Update after each deployment.
 */

export interface ChainContracts {
  worldRegistry: string;
  parcelOwnership: string;
  playerOracle: string;
  airdropTracker: string;
}

export const CONTRACT_ADDRESSES: Record<string, ChainContracts> = {
  // Base Sepolia (ChainID: 84532)
  sepolia: {
    worldRegistry: process.env.NEXT_PUBLIC_WORLD_REGISTRY_SEPOLIA || "0x0000000000000000000000000000000000000000", // TODO: Deploy
    parcelOwnership: process.env.NEXT_PUBLIC_PARCEL_OWNERSHIP_SEPOLIA || "0x0000000000000000000000000000000000000000", // TODO: Deploy
    playerOracle: process.env.NEXT_PUBLIC_PLAYER_ORACLE_SEPOLIA || "0x0000000000000000000000000000000000000000", // TODO: Deploy
    airdropTracker: process.env.NEXT_PUBLIC_AIRDROP_TRACKER_SEPOLIA || "0x0000000000000000000000000000000000000000", // TODO: Deploy
  },

  // Base Mainnet (ChainID: 8453)
  mainnet: {
    worldRegistry: process.env.NEXT_PUBLIC_WORLD_REGISTRY_MAINNET || "0x0000000000000000000000000000000000000000", // TODO: Deploy
    parcelOwnership: process.env.NEXT_PUBLIC_PARCEL_OWNERSHIP_MAINNET || "0x0000000000000000000000000000000000000000", // TODO: Deploy
    playerOracle: process.env.NEXT_PUBLIC_PLAYER_ORACLE_MAINNET || "0x0000000000000000000000000000000000000000", // TODO: Deploy
    airdropTracker: process.env.NEXT_PUBLIC_AIRDROP_TRACKER_MAINNET || "0x0000000000000000000000000000000000000000", // TODO: Deploy
  },
};

/**
 * Get contract addresses for current chain environment
 */
export function getContracts(): ChainContracts {
  const chainEnv = process.env.NEXT_PUBLIC_CHAIN_ENV || "sepolia";
  
  if (chainEnv !== "sepolia" && chainEnv !== "mainnet") {
    console.warn(`[Contracts] Unknown chain environment: ${chainEnv}, defaulting to sepolia`);
    return CONTRACT_ADDRESSES.sepolia;
  }
  
  return CONTRACT_ADDRESSES[chainEnv];
}

/**
 * Check if contracts are deployed (non-zero addresses)
 */
export function areContractsDeployed(chainEnv: "sepolia" | "mainnet" = "sepolia"): boolean {
  const contracts = CONTRACT_ADDRESSES[chainEnv];
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  
  return Object.values(contracts).every((address) => address !== zeroAddress);
}

/**
 * Get chain ID for environment
 */
export function getChainId(chainEnv: "sepolia" | "mainnet" = "sepolia"): number {
  return chainEnv === "mainnet" ? 8453 : 84532;
}
