/**
 * @title Hardhat Configuration for VOID Protocol
 * @notice Base Sepolia deployment config for Week 1-2 contracts
 */

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false, // Disable for faster compilation
    },
  },
  
  networks: {
    hardhat: {
      chainId: 31337,
      forking: process.env.BASE_SEPOLIA_RPC_URL
        ? {
            url: process.env.BASE_SEPOLIA_RPC_URL,
            enabled: false, // Enable only when testing against mainnet state
          }
        : undefined,
    },
    
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      chainId: 84532,
      gasPrice: 1000000000, // 1 gwei (adjust based on network congestion)
    },
  },
  
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  mocha: {
    timeout: 40000,
  },
};

export default config;
