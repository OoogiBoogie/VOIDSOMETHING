/**
 * HOOK: useDMConversations
 * Manages list of DM conversations with last message preview
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { netClient, type NetMessage } from '@/lib/netClient';
import { NET_TOPICS, shouldUseMockData } from '@/config/voidConfig';

export interface DMConversation {
  id: string;
  otherAddress: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

export function useDMConversations() {
  const { address } = useAccount();
  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================================
  // LOAD CONVERSATIONS
  // ================================

  const loadConversations = useCallback(async () => {
    if (!address) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (shouldUseMockData()) {
        // Mock conversations
        const mockConversations: DMConversation[] = [
          {
            id: '1',
            otherAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            lastMessage: 'Check out this new contract opportunity',
            lastMessageTime: Date.now() - 3600000,
            unreadCount: 2,
          },
          {
            id: '2',
            otherAddress: '0x1234567890123456789012345678901234567890',
            lastMessage: 'Thanks for the help earlier!',
            lastMessageTime: Date.now() - 7200000,
            unreadCount: 0,
          },
        ];
        setConversations(mockConversations);
        setIsLoading(false);
        return;
      }

      // TODO: Real implementation
      // Need to:
      // 1. Query Net Protocol indexer for all topics matching void:dm:{address}:* or void:dm:*:{address}
      // 2. Get last message for each topic
      // 3. Sort by lastMessageTime
      // 4. Calculate unread counts (requires read receipt tracking)

      // For now: Return empty
      setConversations([]);
    } catch (err: any) {
      console.error('[useDMConversations] Load error:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ================================
  // START NEW CONVERSATION
  // ================================

  const startConversation = useCallback(
    (otherAddress: string) => {
      if (!address) return;

      // Check if conversation already exists
      const existing = conversations.find((c) => c.otherAddress === otherAddress);
      if (existing) return existing;

      // Create new conversation (optimistic)
      const newConversation: DMConversation = {
        id: NET_TOPICS.dm(address, otherAddress),
        otherAddress,
        lastMessage: '',
        lastMessageTime: Date.now(),
        unreadCount: 0,
      };

      setConversations((prev) => [newConversation, ...prev]);
      return newConversation;
    },
    [address, conversations]
  );

  return {
    conversations,
    isLoading,
    error,
    startConversation,
    refresh: loadConversations,
  };
}
