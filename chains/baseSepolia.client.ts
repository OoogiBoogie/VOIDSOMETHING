// chains/baseSepolia.client.ts
// Client-safe address registry and ABIs (NO hardhat imports)

export const ADDRS = {
  VOID: "0x8de4043445939B0D0Cc7d6c752057707279D9893",
  USDC: "0xca0DE376C5ab634A4cA528Fe2468aF53d751E8a9",
  xVOIDVault: "0xab10B2B5E1b07447409BCa889d14F046bEFd8192",
  WorldLand: "0xC4559144b784A8991924b1389a726d68C910A206",
  VoidSwap: "0x74bD32c493C9be6237733507b00592e6AB231e4F",
  Router: "0x687E678aB2152d9e0952d42B0F872604533D25a9",
  XPOracle: "0x8D786454ca2e252cb905f597214dD78C89E3Ba14",
} as const;

// Import JSON ABIs only (no hardhat types)
import VOID from "@/abi/VOID.json";
import VAULT from "@/abi/xVOIDVault.json";
import LAND from "@/abi/WorldLandTestnet.json";
import SWAP from "@/abi/VoidSwapTestnet.json";
import ORACLE from "@/abi/XPOracle.json";

export const ABIS = { VOID, VAULT, LAND, SWAP, ORACLE } as const;
