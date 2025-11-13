/**
 * HOOK: useDMThread
 * Manages individual DM thread messages
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { netClient, type NetMessage } from '@/lib/netClient';
import { NET_TOPICS, QUERY_LIMITS, shouldUseMockData } from '@/config/voidConfig';

export interface DMMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  txHash?: string;
}

export function useDMThread(otherAddress: string | null) {
  const { address } = useAccount();
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ================================
  // LOAD MESSAGES
  // ================================

  const loadMessages = useCallback(async () => {
    if (!address || !otherAddress) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (shouldUseMockData()) {
        // Mock DM thread
        const mockMessages: DMMessage[] = [
          {
            id: '1',
            from: otherAddress,
            to: address,
            text: 'Hey, saw your post about Zone 7 contracts',
            timestamp: Date.now() - 7200000,
          },
          {
            id: '2',
            from: address,
            to: otherAddress,
            text: 'Yeah, looking for reliable partners. You interested?',
            timestamp: Date.now() - 3600000,
          },
          {
            id: '3',
            from: otherAddress,
            to: address,
            text: 'Definitely. Let me show you my track record.',
            timestamp: Date.now() - 1800000,
          },
        ];
        setMessages(mockMessages);
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      // Real Net Protocol fetch
      const topic = NET_TOPICS.dm(address, otherAddress);
      const response = await netClient.fetchMessages({
        topic,
        limit: QUERY_LIMITS.messagesPerLoad,
      });

      const normalized = response.messages.map((msg) => ({
        id: msg.id,
        from: msg.from,
        to: msg.to!,
        text: msg.text,
        timestamp: msg.timestamp,
        txHash: msg.txHash,
      }));

      // Enforce max messages in view to prevent performance issues (DM cap: 50)
      const dmCap = 50; // Reasonable limit for DM threads
      const cappedMessages = normalized.slice(0, dmCap);
      setMessages(cappedMessages);
      setHasMore(response.hasMore && normalized.length >= QUERY_LIMITS.messagesPerLoad);
    } catch (err: any) {
      console.error('[useDMThread] Load error:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [address, otherAddress]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // ================================
  // LOAD MORE (PAGINATION)
  // ================================

  const loadMore = useCallback(async () => {
    if (!address || !otherAddress || !hasMore || isLoading) return;

    try {
      if (shouldUseMockData()) {
        setHasMore(false);
        return;
      }

      const oldestMessageId = messages[messages.length - 1]?.id;
      const topic = NET_TOPICS.dm(address, otherAddress);

      const response = await netClient.fetchMessages({
        topic,
        limit: QUERY_LIMITS.messagesPerLoad,
        before: oldestMessageId,
      });

      const normalized = response.messages.map((msg) => ({
        id: msg.id,
        from: msg.from,
        to: msg.to!,
        text: msg.text,
        timestamp: msg.timestamp,
        txHash: msg.txHash,
      }));

      setMessages((prev) => [...prev, ...normalized]);
      setHasMore(response.hasMore);
    } catch (err: any) {
      console.error('[useDMThread] Load more error:', err);
      setError(err.message || 'Failed to load more messages');
    }
  }, [address, otherAddress, messages, hasMore, isLoading]);

  // ================================
  // SEND MESSAGE
  // ================================

  const sendMessage = useCallback(
    async (text: string) => {
      if (!address || !otherAddress) {
        throw new Error('Wallet not connected or no recipient');
      }

      if (!text.trim()) {
        throw new Error('Message cannot be empty');
      }

      // Create optimistic message
      const optimisticMessage: DMMessage = {
        id: `optimistic_${Date.now()}`,
        from: address,
        to: otherAddress,
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
          topic: NET_TOPICS.dm(address, otherAddress),
          text: text.trim(),
          from: address,
          to: otherAddress,
          messageType: 'DM',
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
        console.error('[useDMThread] Send error:', err);
        // Revert optimistic update
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
        throw err;
      }
    },
    [address, otherAddress]
  );

  // ================================
  // REAL-TIME SUBSCRIPTION
  // ================================

  useEffect(() => {
    if (!address || !otherAddress || shouldUseMockData()) return;

    const topic = NET_TOPICS.dm(address, otherAddress);
    const unsubscribe = netClient.subscribeToTopic(topic, (newMessage) => {
      // Only add if not already in list
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === newMessage.id)) return prev;
        return [
          ...prev,
          {
            id: newMessage.id,
            from: newMessage.from,
            to: newMessage.to!,
            text: newMessage.text,
            timestamp: newMessage.timestamp,
            txHash: newMessage.txHash,
          },
        ];
      });
    });

    return unsubscribe;
  }, [address, otherAddress]);

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
