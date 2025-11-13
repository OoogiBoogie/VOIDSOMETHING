/**
 * NET PROTOCOL PROFILE TYPES & CLIENT
 * 
 * On-chain user profiles for cross-platform resume functionality.
 * Stores user progress, position, XP, and preferences on-chain via Net Protocol.
 */

import { VOID_CONFIG } from '@/config/voidConfig';

// ================================
// TYPES
// ================================

export interface NetProfile {
  wallet: string;
  agentId: string; // Unique user ID (can be wallet or privy ID)
  
  // Progress & Stats
  xp: string; // BigInt as string for on-chain compatibility
  level: number;
  
  // Position & Scene
  lastSceneId: string; // e.g. "hq", "district-3", "creator-zone"
  lastPosition?: {
    x: number;
    y: number;
    z: number;
  };
  
  // User Identity
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  
  // Preferences
  preferences?: {
    theme?: string;
    notifications?: boolean;
    graphics?: 'low' | 'medium' | 'high';
  };
  
  // Optional metadata hash (for additional off-chain data)
  dataHash?: string;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

export interface NetProfileUpdate {
  lastSceneId?: string;
  lastPosition?: { x: number; y: number; z: number };
  xp?: string;
  level?: number;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  preferences?: Partial<NetProfile['preferences']>;
}

// ================================
// NET PROFILE CLIENT
// ================================

class NetProfileClient {
  private readonly PROFILE_KEY = 'void:profile';
  private cache: Map<string, NetProfile> = new Map();

  /**
   * Get user profile from Net Protocol
   * Returns null if profile doesn't exist yet
   */
  async getProfile(wallet: string): Promise<NetProfile | null> {
    console.log(`[NetProfile] Fetching profile for wallet: ${wallet}`);

    // Check cache first
    const cached = this.cache.get(wallet.toLowerCase());
    if (cached) {
      console.log(`[NetProfile] Cache hit for ${wallet}`);
      return cached;
    }

    try {
      // TODO: Replace with actual Net Protocol / VoidStorage contract call
      // Example:
      // const voidStorage = new ethers.Contract(STORAGE_ADDR, ABI, provider);
      // const [profileJson] = await voidStorage.getProfile(wallet);
      // if (!profileJson || profileJson === '{}') return null;
      // const profile = JSON.parse(profileJson) as NetProfile;

      // For now: Check localStorage as fallback (development mode)
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`${this.PROFILE_KEY}:${wallet.toLowerCase()}`);
        if (stored) {
          const profile = JSON.parse(stored) as NetProfile;
          this.cache.set(wallet.toLowerCase(), profile);
          console.log(`[NetProfile] Loaded from localStorage`);
          return profile;
        }
      }

      console.log(`[NetProfile] No profile found for ${wallet}`);
      return null;
    } catch (error) {
      console.error(`[NetProfile] Error fetching profile:`, error);
      return null;
    }
  }

  /**
   * Create or update user profile on Net Protocol
   */
  async upsertProfile(profile: NetProfile): Promise<void> {
    console.log(`[NetProfile] Upserting profile for wallet: ${profile.wallet}`);

    try {
      // Update timestamp
      profile.updatedAt = Date.now();

      // TODO: Replace with actual Net Protocol / VoidStorage contract call
      // Example:
      // const voidStorage = new ethers.Contract(STORAGE_ADDR, ABI, signer);
      // const profileJson = JSON.stringify(profile);
      // const tx = await voidStorage.setProfile(profileJson);
      // await tx.wait();
      // console.log(`[NetProfile] Profile updated on-chain: ${tx.hash}`);

      // For now: Store in localStorage (development mode)
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `${this.PROFILE_KEY}:${profile.wallet.toLowerCase()}`,
          JSON.stringify(profile)
        );
        console.log(`[NetProfile] Profile saved to localStorage`);
      }

      // Update cache
      this.cache.set(profile.wallet.toLowerCase(), profile);
    } catch (error) {
      console.error(`[NetProfile] Error upserting profile:`, error);
      throw error;
    }
  }

  /**
   * Partially update profile (merge with existing)
   */
  async updateProfile(wallet: string, updates: NetProfileUpdate): Promise<NetProfile> {
    console.log(`[NetProfile] Updating profile for ${wallet}`, updates);

    // Get existing profile
    let profile = await this.getProfile(wallet);

    if (!profile) {
      throw new Error(`Profile not found for wallet: ${wallet}`);
    }

    // Merge updates
    profile = {
      ...profile,
      ...updates,
      preferences: updates.preferences 
        ? { ...profile.preferences, ...updates.preferences }
        : profile.preferences,
      updatedAt: Date.now(),
    };

    // Save merged profile
    await this.upsertProfile(profile);

    return profile;
  }

  /**
   * Create new profile with defaults
   */
  async createProfile(wallet: string, agentId: string, initialData?: Partial<NetProfile>): Promise<NetProfile> {
    console.log(`[NetProfile] Creating new profile for ${wallet}`);

    const profile: NetProfile = {
      wallet: wallet.toLowerCase(),
      agentId,
      xp: '0',
      level: 1,
      lastSceneId: 'hq', // Default spawn
      lastPosition: { x: 0, y: 1, z: 5 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...initialData,
    };

    await this.upsertProfile(profile);

    return profile;
  }

  /**
   * Clear cache (useful for testing/logout)
   */
  clearCache() {
    this.cache.clear();
    console.log(`[NetProfile] Cache cleared`);
  }
}

// ================================
// SINGLETON INSTANCE
// ================================

export const netProfileClient = new NetProfileClient();
