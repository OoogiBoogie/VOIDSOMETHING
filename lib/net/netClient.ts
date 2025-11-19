/**
 * NET PROTOCOL CLIENT — MAINNET-ONLY PROFILES
 * 
 * Centralized Net Protocol integration with capability flags.
 * 
 * RULES:
 * - Base Sepolia: Chat + Storage ONLY (NO profiles)
 * - Base Mainnet: Chat + Storage + Profiles
 * 
 * All profile-dependent code MUST check NET_CAPABILITIES.profiles first.
 */

// ============================================================
// CAPABILITY FLAGS
// ============================================================

const isMainnet = process.env.NEXT_PUBLIC_CHAIN_ENV === 'mainnet';
const isProduction = process.env.NODE_ENV === 'production';

export const NET_CAPABILITIES = {
  chat: true,                    // Available on all chains
  storage: true,                 // Available on all chains
  profiles: isMainnet,           // ONLY on Base Mainnet
} as const;

// ============================================================
// TYPES
// ============================================================

export interface NetProfile {
  userId: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  level?: number;
  xp?: number;
  // Add other profile fields as needed
}

export interface NetMessage {
  id: string;
  fromUserId: string;
  toUserId?: string;
  channelId?: string;
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface NetStorageItem {
  key: string;
  value: unknown;
  timestamp: number;
}

// ============================================================
// PROFILE API (MAINNET ONLY)
// ============================================================

/**
 * Check if profiles are enabled on current chain
 */
export function hasProfilesEnabled(): boolean {
  return NET_CAPABILITIES.profiles;
}

/**
 * Get user profile (returns null on Sepolia)
 */
export async function getProfileSafe(userId: string): Promise<NetProfile | null> {
  if (!NET_CAPABILITIES.profiles) {
    console.warn('[NetClient] Profiles not available on this chain (Sepolia)');
    return null;
  }

  try {
    // TODO: Replace with actual Net Protocol SDK call
    // const profile = await netSDK.profiles.get(userId);
    // return profile;
    
    console.log('[NetClient] getProfile called for:', userId);
    return null; // Placeholder
  } catch (error) {
    console.error('[NetClient] getProfile error:', error);
    return null;
  }
}

/**
 * Update user profile (no-op on Sepolia)
 */
export async function updateProfileSafe(
  userId: string,
  updates: Partial<NetProfile>
): Promise<boolean> {
  if (!NET_CAPABILITIES.profiles) {
    console.warn('[NetClient] Profile updates not available on Sepolia');
    return false;
  }

  try {
    // TODO: Replace with actual Net Protocol SDK call
    // await netSDK.profiles.update(userId, updates);
    
    console.log('[NetClient] updateProfile called:', userId, updates);
    return true;
  } catch (error) {
    console.error('[NetClient] updateProfile error:', error);
    return false;
  }
}

/**
 * Get profile display name with fallback
 */
export async function getDisplayName(userId: string, walletAddress?: string): Promise<string> {
  const profile = await getProfileSafe(userId);
  
  if (profile?.displayName) return profile.displayName;
  if (profile?.username) return profile.username;
  if (walletAddress) return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  
  return 'Anonymous';
}

// ============================================================
// CHAT API (ALL CHAINS)
// ============================================================

/**
 * Send chat message
 */
export async function sendMessage(
  fromUserId: string,
  content: string,
  channelId?: string,
  toUserId?: string
): Promise<boolean> {
  try {
    // TODO: Replace with actual Net Protocol SDK call
    // await netSDK.chat.send({ fromUserId, content, channelId, toUserId });
    
    console.log('[NetClient] sendMessage:', { fromUserId, content, channelId, toUserId });
    return true;
  } catch (error) {
    console.error('[NetClient] sendMessage error:', error);
    return false;
  }
}

/**
 * Subscribe to chat messages
 */
export function subscribeToMessages(
  channelId: string,
  callback: (message: NetMessage) => void
): () => void {
  try {
    // TODO: Replace with actual Net Protocol SDK call
    // const unsubscribe = netSDK.chat.subscribe(channelId, callback);
    // return unsubscribe;
    
    console.log('[NetClient] subscribeToMessages:', channelId);
    return () => console.log('[NetClient] unsubscribed from:', channelId);
  } catch (error) {
    console.error('[NetClient] subscribeToMessages error:', error);
    return () => {};
  }
}

// ============================================================
// STORAGE API (ALL CHAINS)
// ============================================================

/**
 * Store data in Net Protocol storage
 */
export async function setStorage(
  userId: string,
  key: string,
  value: unknown
): Promise<boolean> {
  try {
    // TODO: Replace with actual Net Protocol SDK call
    // await netSDK.storage.set(userId, key, value);
    
    console.log('[NetClient] setStorage:', { userId, key, value });
    return true;
  } catch (error) {
    console.error('[NetClient] setStorage error:', error);
    return false;
  }
}

/**
 * Get data from Net Protocol storage
 */
export async function getStorage<T = unknown>(
  userId: string,
  key: string
): Promise<T | null> {
  try {
    // TODO: Replace with actual Net Protocol SDK call
    // const value = await netSDK.storage.get(userId, key);
    // return value as T;
    
    console.log('[NetClient] getStorage:', { userId, key });
    return null; // Placeholder
  } catch (error) {
    console.error('[NetClient] getStorage error:', error);
    return null;
  }
}

/**
 * Delete data from Net Protocol storage
 */
export async function deleteStorage(
  userId: string,
  key: string
): Promise<boolean> {
  try {
    // TODO: Replace with actual Net Protocol SDK call
    // await netSDK.storage.delete(userId, key);
    
    console.log('[NetClient] deleteStorage:', { userId, key });
    return true;
  } catch (error) {
    console.error('[NetClient] deleteStorage error:', error);
    return false;
  }
}

// ============================================================
// UI HELPER: Profile Feature Gate
// ============================================================

/**
 * React component wrapper for profile-gated features
 * 
 * Usage:
 *   <ProfileFeature fallback={<div>Profiles only on mainnet</div>}>
 *     <ProfileEditor />
 *   </ProfileFeature>
 */
export function ProfileFeature({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.ReactNode {
  if (!NET_CAPABILITIES.profiles) {
    return fallback;
  }
  
  return children;
}

// ============================================================
// DEBUG LOGGING
// ============================================================

if (typeof window !== 'undefined') {
  console.log('[NetClient] Initialized with capabilities:', {
    chain: process.env.NEXT_PUBLIC_CHAIN_ENV,
    ...NET_CAPABILITIES,
  });
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  capabilities: NET_CAPABILITIES,
  hasProfilesEnabled,
  getProfileSafe,
  updateProfileSafe,
  getDisplayName,
  sendMessage,
  subscribeToMessages,
  setStorage,
  getStorage,
  deleteStorage,
  ProfileFeature,
};
