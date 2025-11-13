/**
 * World Service
 * Handles player state, world interactions, chat, parties, and social features
 */

export interface PlayerPosition {
  x: number;
  y: number;
  z: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  message: string;
  channel: 'global' | 'local' | 'party' | 'dm';
  timestamp: Date;
}

export interface Party {
  id: string;
  name: string;
  leaderId: string;
  members: PartyMember[];
  maxSize: number;
  createdAt: Date;
}

export interface PartyMember {
  userId: string;
  username: string;
  avatarUrl?: string;
  joinedAt: Date;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
}

export interface WorldEntity {
  id: string;
  type: 'npc' | 'prop' | 'portal' | 'interactive';
  position: PlayerPosition;
  data: any;
}

class WorldService {
  private playerPosition: PlayerPosition = { x: 0, y: 1, z: 5 };
  private currentParty: Party | null = null;
  private chatHistory: ChatMessage[] = [];
  private friends: Friendship[] = [];

  /**
   * Get player's current position
   */
  async getPlayerPosition(): Promise<PlayerPosition> {
    return this.playerPosition;
  }

  /**
   * Update player position
   */
  async updatePlayerPosition(position: PlayerPosition): Promise<void> {
    this.playerPosition = position;
    
    // TODO: Send to backend for persistence
    // await fetch('/api/world/position', {
    //   method: 'POST',
    //   body: JSON.stringify(position),
    // });
  }

  /**
   * Teleport player to position
   */
  async teleportTo(position: PlayerPosition): Promise<void> {
    await this.updatePlayerPosition(position);
  }

  /**
   * Send chat message
   */
  async sendChatMessage(
    message: string,
    channel: ChatMessage['channel'] = 'global',
    recipientId?: string
  ): Promise<ChatMessage> {
    // TODO: Replace with actual API call
    const chatMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: 'current-user-id', // Get from authService
      username: 'CurrentUser',
      message,
      channel,
      timestamp: new Date(),
    };

    this.chatHistory.push(chatMessage);

    // TODO: Send via WebSocket for real-time
    // wsClient.send({ type: 'chat', data: chatMessage });

    return chatMessage;
  }

  /**
   * Get chat history
   */
  async getChatHistory(
    channel: ChatMessage['channel'] = 'global',
    limit: number = 50
  ): Promise<ChatMessage[]> {
    // TODO: Replace with actual API call
    return this.chatHistory
      .filter(msg => msg.channel === channel)
      .slice(-limit);
  }

  /**
   * Create party
   */
  async createParty(name: string, maxSize: number = 8): Promise<Party> {
    // TODO: Replace with actual API call
    const party: Party = {
      id: `party-${Date.now()}`,
      name,
      leaderId: 'current-user-id',
      members: [
        {
          userId: 'current-user-id',
          username: 'CurrentUser',
          joinedAt: new Date(),
        },
      ],
      maxSize,
      createdAt: new Date(),
    };

    this.currentParty = party;
    return party;
  }

  /**
   * Join party
   */
  async joinParty(partyId: string): Promise<Party> {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/world/party/${partyId}/join`, {
    //   method: 'POST',
    // });

    // Mock response
    if (this.currentParty && this.currentParty.id === partyId) {
      return this.currentParty;
    }

    throw new Error('Party not found');
  }

  /**
   * Leave party
   */
  async leaveParty(): Promise<void> {
    // TODO: Replace with actual API call
    this.currentParty = null;
  }

  /**
   * Get current party
   */
  async getCurrentParty(): Promise<Party | null> {
    return this.currentParty;
  }

  /**
   * Add friend
   */
  async addFriend(userId: string): Promise<Friendship> {
    // TODO: Replace with actual API call
    const friendship: Friendship = {
      id: `friend-${Date.now()}`,
      userId: 'current-user-id',
      friendId: userId,
      status: 'pending',
      createdAt: new Date(),
    };

    this.friends.push(friendship);
    return friendship;
  }

  /**
   * Accept friend request
   */
  async acceptFriend(friendshipId: string): Promise<Friendship> {
    // TODO: Replace with actual API call
    const friendship = this.friends.find(f => f.id === friendshipId);
    if (friendship) {
      friendship.status = 'accepted';
      return friendship;
    }
    throw new Error('Friendship not found');
  }

  /**
   * Remove friend
   */
  async removeFriend(friendshipId: string): Promise<void> {
    // TODO: Replace with actual API call
    this.friends = this.friends.filter(f => f.id !== friendshipId);
  }

  /**
   * Block user
   */
  async blockUser(userId: string): Promise<Friendship> {
    // TODO: Replace with actual API call
    const friendship: Friendship = {
      id: `block-${Date.now()}`,
      userId: 'current-user-id',
      friendId: userId,
      status: 'blocked',
      createdAt: new Date(),
    };

    this.friends.push(friendship);
    return friendship;
  }

  /**
   * Get friends list
   */
  async getFriends(): Promise<Friendship[]> {
    // TODO: Replace with actual API call
    return this.friends.filter(f => f.status === 'accepted');
  }

  /**
   * Get online friends
   */
  async getOnlineFriends(): Promise<Friendship[]> {
    // TODO: Replace with actual API call + online status
    return this.friends.filter(f => f.status === 'accepted');
  }

  /**
   * Get nearby entities
   */
  async getNearbyEntities(radius: number = 50): Promise<WorldEntity[]> {
    // TODO: Replace with actual API call
    return [];
  }

  /**
   * Interact with entity
   */
  async interactWithEntity(entityId: string): Promise<any> {
    // TODO: Replace with actual API call
    return { success: true, entityId };
  }

  /**
   * Get player state (for world initialization)
   */
  async getPlayerState(): Promise<any> {
    return {
      position: this.playerPosition,
      party: this.currentParty,
      friends: this.friends,
      chatHistory: this.chatHistory.slice(-50), // Last 50 messages
    };
  }

  /**
   * Subscribe to chat updates
   */
  subscribeToChat(callback: (message: ChatMessage) => void): () => void {
    // For now, return a no-op unsubscribe function
    // TODO: Implement WebSocket subscription
    return () => {};
  }

  /**
   * Subscribe to party updates
   */
  subscribeToParty(callback: (party: Party | null) => void): () => void {
    // For now, return a no-op unsubscribe function
    // TODO: Implement WebSocket subscription
    return () => {};
  }
}

// Export singleton instance
export const worldService = new WorldService();
