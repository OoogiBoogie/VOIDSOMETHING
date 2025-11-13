/**
 * Auth Service
 * Handles wallet connection, user authentication, roles, and permissions
 */

import type { UserRole } from '@/hud/HUDTypes';

export interface UserProfile {
  id: string;
  walletAddress: string;
  username?: string;
  avatarUrl?: string;
  roles: UserRole[];
  createdAt: Date;
  lastActive: Date;
}

export interface WalletConnection {
  address: string;
  chainId: number;
  isConnected: boolean;
}

class AuthService {
  private currentUser: UserProfile | null = null;
  private walletConnection: WalletConnection | null = null;

  /**
   * Connect wallet (MetaMask, WalletConnect, etc.)
   */
  async connectWallet(): Promise<WalletConnection> {
    try {
      // TODO: Integrate with actual wallet provider (wagmi, ethers, etc.)
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });

        const chainId = await (window as any).ethereum.request({
          method: 'eth_chainId',
        });

        this.walletConnection = {
          address: accounts[0],
          chainId: parseInt(chainId, 16),
          isConnected: true,
        };

        // Auto-login or create user profile
        await this.loginWithWallet(accounts[0]);

        return this.walletConnection;
      }

      throw new Error('No wallet provider found');
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    this.walletConnection = null;
    this.currentUser = null;
    localStorage.removeItem('auth-user');
  }

  /**
   * Login with wallet address
   */
  async loginWithWallet(address: string): Promise<UserProfile> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   body: JSON.stringify({ address }),
      // });

      // Mock user profile (replace with API response)
      const user: UserProfile = {
        id: `user-${address.slice(0, 8)}`,
        walletAddress: address,
        username: `User ${address.slice(0, 6)}`,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
        roles: ['user', 'creator'], // TODO: Get from backend
        createdAt: new Date(),
        lastActive: new Date(),
      };

      this.currentUser = user;
      localStorage.setItem('auth-user', JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getUser(): Promise<UserProfile | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('auth-user');
      if (saved) {
        try {
          this.currentUser = JSON.parse(saved);
          return this.currentUser;
        } catch (error) {
          console.error('Failed to parse saved user:', error);
        }
      }
    }

    return null;
  }

  /**
   * Get user roles
   */
  async getUserRoles(): Promise<UserRole[]> {
    const user = await this.getUser();
    return user?.roles || ['guest'];
  }

  /**
   * Check if user has specific role
   */
  async hasRole(role: UserRole): Promise<boolean> {
    const roles = await this.getUserRoles();
    return roles.includes(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasAnyRole(roles: UserRole[]): Promise<boolean> {
    const userRoles = await this.getUserRoles();
    return userRoles.some(role => roles.includes(role));
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/user/profile', {
      //   method: 'PATCH',
      //   body: JSON.stringify(updates),
      // });

      if (this.currentUser) {
        this.currentUser = { ...this.currentUser, ...updates };
        localStorage.setItem('auth-user', JSON.stringify(this.currentUser));
      }

      return this.currentUser!;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }

  /**
   * Get wallet connection status
   */
  getWalletConnection(): WalletConnection | null {
    return this.walletConnection;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.walletConnection?.isConnected || false;
  }

  /**
   * Sign message with wallet
   */
  async signMessage(message: string): Promise<string> {
    if (!this.walletConnection) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await (window as any).ethereum.request({
        method: 'personal_sign',
        params: [message, this.walletConnection.address],
      });

      return signature;
    } catch (error) {
      console.error('Message signing failed:', error);
      throw error;
    }
  }

  /**
   * Verify ownership of wallet
   */
  async verifyWalletOwnership(): Promise<boolean> {
    try {
      const message = `Verify ownership of wallet at ${Date.now()}`;
      const signature = await this.signMessage(message);
      
      // TODO: Send to backend for verification
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   body: JSON.stringify({ message, signature }),
      // });

      return true; // Mock verification
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
