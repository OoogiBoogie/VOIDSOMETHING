/**
 * HOOK: useGlobalChatMessages
 * Manages global chat message history with Net Protocol integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { netClient, type NetMessage } from '@/lib/netClient';
import { NET_TOPICS, QUERY_LIMITS, shouldUseMockData } from '@/config/voidConfig';

export interface GlobalChatMessage {
  id: string;
  from: string;
  text: string;
  timestamp: number;
  txHash?: string;
}

export function useGlobalChatMessages() {
  const { address } = useAccount();
  const [messages, setMessages] = useState<GlobalChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ================================
  // LOAD INITIAL MESSAGES
  // ================================

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (shouldUseMockData()) {
        // Use mock data when Net Protocol disabled
        const mockMessages: GlobalChatMessage[] = [
          {
            id: '1',
            from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            text: 'Welcome to the VOID. Stay sharp.',
            timestamp: Date.now() - 3600000,
          },
          {
            id: '2',
            from: '0x1234567890123456789012345678901234567890',
            text: 'Anyone running contracts in Zone 7?',
            timestamp: Date.now() - 1800000,
          },
        ];
        setMessages(mockMessages);
        setHasMore(false);
        return;
      }

      // Real Net Protocol fetch
      const response = await netClient.fetchMessages({
        topic: NET_TOPICS.global,
        limit: QUERY_LIMITS.messagesPerLoad,
      });

      const normalized = response.messages.map((msg) => ({
        id: msg.id,
        from: msg.from,
        text: msg.text,
        timestamp: msg.timestamp,
        txHash: msg.txHash,
      }));

      // Enforce max messages in view to prevent performance issues
      const cappedMessages = normalized.slice(0, QUERY_LIMITS.maxMessagesInView);
      setMessages(cappedMessages);
      setHasMore(response.hasMore && normalized.length >= QUERY_LIMITS.messagesPerLoad);
    } catch (err: any) {
      console.error('[useGlobalChatMessages] Load error:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // ================================
  // LOAD MORE (PAGINATION)
  // ================================

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    try {
      if (shouldUseMockData()) {
        setHasMore(false);
        return;
      }

      const oldestMessageId = messages[messages.length - 1]?.id;
      const response = await netClient.fetchMessages({
        topic: NET_TOPICS.global,
        limit: QUERY_LIMITS.messagesPerLoad,
        before: oldestMessageId,
      });

      const normalized = response.messages.map((msg) => ({
        id: msg.id,
        from: msg.from,
        text: msg.text,
        timestamp: msg.timestamp,
        txHash: msg.txHash,
      }));

      setMessages((prev) => [...prev, ...normalized]);
      setHasMore(response.hasMore);
    } catch (err: any) {
      console.error('[useGlobalChatMessages] Load more error:', err);
      setError(err.message || 'Failed to load more messages');
    }
  }, [messages, hasMore, isLoading]);

  // ================================
  // SEND MESSAGE
  // ================================

  const sendMessage = useCallback(
    async (text: string) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!text.trim()) {
        throw new Error('Message cannot be empty');
      }

      // Create optimistic message
      const optimisticMessage: GlobalChatMessage = {
        id: `optimistic_${Date.now()}`,
        from: address,
        text: text.trim(),
        timestamp: Date.now(),
      };

      // Optimistic update
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        if (shouldUseMockData()) {
          // Mock delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
          // Replace optimistic with "confirmed" mock
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === optimisticMessage.id
                ? { ...msg, id: `msg_${Date.now()}` }
                : msg
            )
          );
          return;
        }

        // Real send via Net Protocol
        const { txHash, messageId } = await netClient.sendMessage({
          topic: NET_TOPICS.global,
          text: text.trim(),
          from: address,
          messageType: 'GLOBAL',
        });

        // Replace optimistic with real message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...msg, id: messageId, txHash }
              : msg
          )
        );
      } catch (err: any) {
        console.error('[useGlobalChatMessages] Send error:', err);
        // Revert optimistic update
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
        throw err;
      }
    },
    [address]
  );

  // ================================
  // REAL-TIME SUBSCRIPTION
  // ================================

  useEffect(() => {
    if (shouldUseMockData()) return;

    const unsubscribe = netClient.subscribeToTopic(NET_TOPICS.global, (newMessage) => {
      // Only add if not already in list (avoid duplicates)
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === newMessage.id)) return prev;
        return [
          ...prev,
          {
            id: newMessage.id,
            from: newMessage.from,
            text: newMessage.text,
            timestamp: newMessage.timestamp,
            txHash: newMessage.txHash,
          },
        ];
      });
    });

    return unsubscribe;
  }, []);

  return {
    messages,
    isLoading,
    hasMore,
    error,
    sendMessage,
    loadMore,
    refresh: loadMessages,
  };
}
