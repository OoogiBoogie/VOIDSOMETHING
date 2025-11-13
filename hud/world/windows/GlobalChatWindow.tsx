'use client';

/**
 * GLOBAL CHAT WINDOW - COMMS · GLOBAL CHAT
 * Public chat room for all users
 * Anti-spam enforcement, rate limiting UI, optimistic sends
 * PHASE-3 PRIORITY 1 — WIRED TO NET PROTOCOL ✅
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Send, AlertCircle, Shield, Star, Loader2 } from 'lucide-react';
import { useGlobalChatMessages } from '@/hooks/useGlobalChatMessages';
import { useVoidScore } from '@/hooks/useVoidScore';
import { useScoreEvents } from '@/hooks/useScoreEvents';
import { useVoidQuests } from '@/hooks/useVoidQuests';
import { emitVoidEvent } from '@/lib/events/voidEvents';

interface GlobalChatWindowProps {
  onClose?: () => void;
}

export function GlobalChatWindow({ onClose }: GlobalChatWindowProps) {
  const { address } = useAccount();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Wire to real hooks
  const {
    messages,
    isLoading,
    hasMore,
    error,
    sendMessage,
    loadMore,
    refresh,
  } = useGlobalChatMessages();

  const { voidScore } = useVoidScore();
  const { sendMessageXP, firstDailyMessageXP } = useScoreEvents();
  const { incrementQuestProgress } = useVoidQuests();

  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);

  const DAILY_CAP = voidScore?.globalMessagesRemaining ?? 50;
  const messagesSentToday = DAILY_CAP - (voidScore?.globalMessagesRemaining ?? 50);
  const messagesRemaining = voidScore?.globalMessagesRemaining ?? 50;
  const canSend = messagesRemaining > 0 && input.trim().length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!canSend || !address) return;

    const text = input.trim();
    setInput(''); // Clear immediately for better UX

    try {
      await sendMessage(text);
      
      // Grant XP for message
      await sendMessageXP();
      
      // Grant first daily message bonus if applicable
      if (!hasSentFirstMessage) {
        await firstDailyMessageXP();
        setHasSentFirstMessage(true);
      }
      
      // Progress quests
      incrementQuestProgress('daily_messaging', 0); // Daily Chatter quest
      
      // Emit event for notifications
      emitVoidEvent({
        type: 'SCORE_EVENT',
        address,
        payload: {
          eventType: 'MESSAGE_GLOBAL',
          xpReward: hasSentFirstMessage ? 1 : 6, // 1 XP + 5 bonus
          description: hasSentFirstMessage ? 'Sent global message' : 'First message of the day!',
        },
      });
    } catch (error) {
      console.error('[GlobalChat] Send failed:', error);
      setInput(text); // Restore on failure
      alert('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Daily Cap Indicator */}
      <div className="pb-3 mb-3 border-b border-bio-silver/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
            <span className="text-sm text-bio-silver/80">Global Chat</span>
            <span className="text-xs text-bio-silver/50">
              {messages.length} messages
            </span>
          </div>

          <div className="flex items-center gap-2">
            {messagesRemaining <= 10 && messagesRemaining > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <AlertCircle className="w-3 h-3" />
                <span>{messagesRemaining} left</span>
              </div>
            )}
            {messagesRemaining === 0 && (
              <div className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span>Daily cap reached</span>
              </div>
            )}
            <div className="text-xs text-bio-silver/60 font-mono">
              {messagesSentToday}/{DAILY_CAP} today
            </div>
          </div>
        </div>

        {/* Cap Warning */}
        {messagesRemaining === 0 && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            <strong>Daily message cap reached (50/50 global).</strong> Resets at midnight UTC. 
            Upgrade your tier or stake more VOID to increase your cap.
          </div>
        )}
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-3">
        {/* Loading State */}
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center py-8 text-bio-silver/60">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading messages...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4" />
              <strong>Error</strong>
            </div>
            <p className="text-xs">{error}</p>
            <button
              onClick={refresh}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="w-16 h-16 text-void-purple/40 mb-3" />
            <h3 className="text-lg font-bold text-bio-silver/80 mb-1">No messages yet</h3>
            <p className="text-sm text-bio-silver/60">Be the first to say something in the VOID</p>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.from === address} />
        ))}

        {/* Load More */}
        {hasMore && !isLoading && (
          <div className="text-center py-2">
            <button
              onClick={loadMore}
              className="text-xs text-void-purple hover:underline"
            >
              Load older messages
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-3 border-t border-bio-silver/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              messagesRemaining === 0
                ? 'Daily cap reached...'
                : 'Type a message...'
            }
            disabled={messagesRemaining === 0}
            className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-bio-silver/30 text-bio-silver text-sm placeholder:text-bio-silver/40 focus:outline-none focus:border-void-purple/60 disabled:opacity-50 disabled:cursor-not-allowed"
            maxLength={280}
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`
              px-4 py-2 rounded-lg font-mono text-sm transition flex items-center gap-2
              ${canSend
                ? 'bg-void-purple/20 hover:bg-void-purple/30 border border-void-purple/40 text-void-purple'
                : 'bg-black/40 border border-bio-silver/20 text-bio-silver/40 cursor-not-allowed'
              }
            `}
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>

        {/* Character Count */}
        <div className="text-right text-xs text-bio-silver/50 mt-1">
          {input.length}/280
        </div>
      </div>
    </div>
  );
}

// ================================
// MESSAGE BUBBLE COMPONENT
// ================================

function MessageBubble({ 
  message, 
  isOwn 
}: { 
  message: { id: string; from: string; text: string; timestamp: number; txHash?: string }; 
  isOwn: boolean;
}) {
  // Display name formatting (future: fetch from off-chain profile storage)
  const displayName = message.from.slice(0, 6) + '...' + message.from.slice(-4);
  const tier = 'SILVER'; // Default tier until profile lookup available

  return (
    <div
      className={`
        flex gap-2 p-2 rounded-lg transition
        ${isOwn ? 'bg-void-purple/10 border-l-2 border-void-purple/60' : 'bg-black/20'}
      `}
    >
      {/* Avatar Placeholder */}
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
        ${getTierStyle(tier).bg}
        ${getTierStyle(tier).border}
        border
      `}>
        {message.from.slice(2, 4).toUpperCase()}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-sm font-semibold ${getTierStyle(tier).text}`}>
            {displayName}
          </span>
          <TierBadge tier={tier} />
          <span className="text-xs text-bio-silver/50">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <p className="text-sm text-bio-silver/90 leading-relaxed break-words">
          {message.text}
        </p>
      </div>
    </div>
  );
}

// Tier Badge Component

function TierBadge({ tier }: { tier: string }) {
  const style = getTierStyle(tier);
  
  return (
    <div className={`
      flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold uppercase
      ${style.bg} ${style.border} border
    `}>
      <Star className={`w-2.5 h-2.5 ${style.text}`} fill="currentColor" />
      <span className={style.text}>{tier === 'S_TIER' ? 'S' : tier[0]}</span>
    </div>
  );
}

// Helper Functions

function getTierStyle(tier: string) {
  switch (tier) {
    case 'S_TIER':
      return {
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/60',
        text: 'text-amber-500'
      };
    case 'GOLD':
      return {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/60',
        text: 'text-yellow-500'
      };
    case 'SILVER':
      return {
        bg: 'bg-gray-300/20',
        border: 'border-gray-300/60',
        text: 'text-gray-300'
      };
    default: // BRONZE
      return {
        bg: 'bg-orange-700/20',
        border: 'border-orange-700/60',
        text: 'text-orange-700'
      };
  }
}

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}
