import { z } from "zod";

/**
 * Environment Variable Validation Schema
 * 
 * Validates all required environment variables at build/runtime.
 * Fails fast with clear error messages if configuration is invalid.
 * 
 * Usage:
 * ```typescript
 * import { env } from '@/lib/env';
 * 
 * const config = createConfig({
 *   chains: [baseSepolia],
 *   transports: {
 *     [baseSepolia.id]: http(env.NEXT_PUBLIC_BASE_RPC_URL),
 *   },
 * });
 * ```
 */

const EnvSchema = z.object({
  // Auth providers (REQUIRED)
  PRIVY_APP_ID: z.string().min(1, "Privy App ID is required"),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1, "WalletConnect Project ID is required"),
  
  // Network configuration (REQUIRED)
  NEXT_PUBLIC_CHAIN_ID: z.literal("84532", {
    errorMap: () => ({ message: "Chain ID must be 84532 (Base Sepolia)" })
  }),
  NEXT_PUBLIC_BASE_RPC_URL: z.string().url("Base RPC URL must be a valid URL"),
  
  // Fallback RPC (OPTIONAL)
  NEXT_PUBLIC_BASE_RPC_URL_FALLBACK: z.string().url().optional(),
  
  // Feature flags (OPTIONAL)
  NEXT_PUBLIC_ENABLE_FPS: z.enum(["0", "1"]).default("0"),
  NEXT_PUBLIC_ENABLE_QA_LOGS: z.enum(["0", "1"]).default("0"),
  
  // Supabase (OPTIONAL)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

/**
 * Validated environment variables
 * 
 * Import this throughout the app instead of process.env directly.
 * Ensures type safety and runtime validation.
 */
export const env = EnvSchema.parse({
  PRIVY_APP_ID: process.env.PRIVY_APP_ID,
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  NEXT_PUBLIC_BASE_RPC_URL: process.env.NEXT_PUBLIC_BASE_RPC_URL,
  NEXT_PUBLIC_BASE_RPC_URL_FALLBACK: process.env.NEXT_PUBLIC_BASE_RPC_URL_FALLBACK,
  NEXT_PUBLIC_ENABLE_FPS: process.env.NEXT_PUBLIC_ENABLE_FPS,
  NEXT_PUBLIC_ENABLE_QA_LOGS: process.env.NEXT_PUBLIC_ENABLE_QA_LOGS,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NODE_ENV: process.env.NODE_ENV,
});

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof EnvSchema>;
