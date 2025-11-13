'use client';

/**
 * PHONE WINDOW - COMMS · PHONE
 * Direct messaging system with conversation list + thread view
 * PHASE-3 PRIORITY 1 — WIRED TO NET PROTOCOL ✅
 */

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, AlertCircle, User, Clock, CheckCheck, Shield, X, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useDMConversations } from '@/hooks/useDMConversations';
import { useDMThread } from '@/hooks/useDMThread';
import { useVoidScore } from '@/hooks/useVoidScore';
import { useScoreEvents } from '@/hooks/useScoreEvents';
import { useVoidQuests } from '@/hooks/useVoidQuests';
import { emitVoidEvent } from '@/lib/events/voidEvents';

// ================================
// TYPES
// ================================

interface DMConversation {
  id: string;
  otherUser: {
    address: string;
    username?: string;
    avatar?: string;
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'S_TIER';
    online: boolean;
  };
  lastMessage: {
    from: string;
    text: string;
    timestamp: number;
  };
  unreadCount: number;
  canDM: boolean; // Mutual follow or tier requirement met
  blockReason?: string; // If canDM = false
}

interface DMMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  read: boolean;
}

// ================================
// MAIN COMPONENT
// ================================

export function PhoneWindow({ onClose }: { onClose: () => void }) {
  const { address: myAddress } = useAccount();

  // Wire to real hooks
  const {
    conversations,
    isLoading: isConversationsLoading,
    error: conversationsError,
    startConversation,
    refresh: refreshConversations,
  } = useDMConversations();

  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [input, setInput] = useState('');

  const {
    messages,
    isLoading: isThreadLoading,
    hasMore,
    error: threadError,
    sendMessage,
    loadMore,
    refresh: refreshThread,
  } = useDMThread(selectedConv);

  const { voidScore } = useVoidScore();
  const { sendDMXP } = useScoreEvents();
  const { incrementQuestProgress } = useVoidQuests();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Anti-spam calculation
  const dmsRemaining = voidScore?.dmMessagesRemaining ?? 20;
  const canSendDM = dmsRemaining > 0 && input.trim().length > 0;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!canSendDM || !selectedConv || !myAddress) return;

    const text = input.trim();
    setInput(''); // Clear immediately

    try {
      await sendMessage(text);
      
      // Grant XP for DM
      await sendDMXP();
      
      // Progress quests
      incrementQuestProgress('daily_social', 0); // Direct Connect quest
      
      // Emit event for notifications
      emitVoidEvent({
        type: 'SCORE_EVENT',
        address: myAddress,
        payload: {
          eventType: 'MESSAGE_DM',
          xpReward: 2,
          description: 'Sent direct message',
        },
      });
    } catch (error) {
      console.error('[PhoneWindow] Send failed:', error);
      setInput(text); // Restore on failure
      alert('Failed to send DM. Please try again.');
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Tier colors
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S_TIER':
        return 'from-amber-500 to-orange-500';
      case 'GOLD':
        return 'from-yellow-500 to-amber-500';
      case 'SILVER':
        return 'from-gray-300 to-gray-400';
      case 'BRONZE':
        return 'from-orange-700 to-orange-800';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  // Keyboard support
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/95 text-white font-mono border border-cyan-400/30">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-400/30 bg-cyan-950/20">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold tracking-wider text-cyan-300">DIRECT MESSAGES</h2>
        </div>

        {/* DM DAILY CAP */}
        <div className="flex items-center gap-3 text-xs">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded border ${
              dmsRemaining <= 5
                ? 'border-red-500/60 bg-red-500/10 text-red-400'
                : dmsRemaining <= 10
                ? 'border-amber-500/60 bg-amber-500/10 text-amber-400'
                : 'border-cyan-400/30 bg-cyan-950/20 text-cyan-300'
            }`}
          >
            <Send className="w-3 h-3" />
            <span>
              {(voidScore?.dmMessagesRemaining ?? 20) - dmsRemaining}/20 DMs today
            </span>
          </div>

          {dmsRemaining <= 5 && (
            <div className="flex items-center gap-1 text-red-400">
              <AlertCircle className="w-3 h-3" />
              <span>{dmsRemaining} left</span>
            </div>
          )}

          <button onClick={onClose} className="p-1 hover:bg-cyan-400/10 rounded transition-colors">
            <X className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT - Split panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL: Conversation list */}
        <div className="w-1/2 border-r border-cyan-400/30 flex flex-col">
          <div className="px-4 py-2 border-b border-cyan-400/20 bg-cyan-950/10">
            <p className="text-xs text-cyan-300/70">Conversations</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Loading State */}
            {isConversationsLoading && conversations.length === 0 && (
              <div className="flex items-center justify-center py-8 text-cyan-300/60">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-xs">Loading conversations...</span>
              </div>
            )}

            {/* Error State */}
            {conversationsError && (
              <div className="px-4 py-3 m-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <strong>Error</strong>
                </div>
                <p>{conversationsError}</p>
                <button
                  onClick={refreshConversations}
                  className="mt-2 underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isConversationsLoading && !conversationsError && conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <MessageCircle className="w-12 h-12 text-cyan-400/40 mb-3" />
                <h3 className="text-sm font-bold text-cyan-300/80 mb-1">No DMs yet</h3>
                <p className="text-xs text-cyan-300/60">Start a conversation to connect</p>
              </div>
            )}

            {/* Conversation List */}
            {conversations.map((conv) => {
              const displayAddress = conv.otherAddress.slice(0, 6) + '...' + conv.otherAddress.slice(-4);
              
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv.otherAddress)}
                  className={`w-full px-4 py-3 border-b border-cyan-400/10 hover:bg-cyan-400/5 transition-colors text-left ${
                    selectedConv === conv.otherAddress ? 'bg-cyan-400/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Conversation info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-cyan-300 truncate">
                          {displayAddress}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-cyan-500 text-black text-xs font-bold rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-cyan-300/60 truncate">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                      <p className="text-xs text-cyan-300/40 mt-0.5">
                        {formatTimestamp(conv.lastMessageTime)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: Active conversation */}
        {selectedConv ? (
          <div className="flex-1 flex flex-col">
            {/* Conversation header */}
            <div className="px-4 py-3 border-b border-cyan-400/30 bg-cyan-950/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-cyan-300">
                    {selectedConv.slice(0, 6)}...{selectedConv.slice(-4)}
                  </p>
                  <p className="text-xs text-gray-400">DM Thread</p>
                </div>
              </div>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Loading State */}
              {isThreadLoading && messages.length === 0 && (
                <div className="flex items-center justify-center py-8 text-cyan-300/60">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-xs">Loading messages...</span>
                </div>
              )}

              {/* Error State */}
              {threadError && (
                <div className="px-4 py-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <strong>Error</strong>
                  </div>
                  <p>{threadError}</p>
                  <button
                    onClick={refreshThread}
                    className="mt-2 underline hover:no-underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!isThreadLoading && !threadError && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="w-12 h-12 text-cyan-400/40 mb-3" />
                  <p className="text-sm text-cyan-300/60">No messages yet. Start the conversation!</p>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => {
                const isMe = msg.from === myAddress;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded ${
                        isMe ? 'bg-cyan-500/20 text-cyan-100' : 'bg-gray-700/30 text-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-400">{formatTimestamp(msg.timestamp)}</p>
                        {isMe && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Load More */}
              {hasMore && !isThreadLoading && (
                <div className="text-center py-2">
                  <button
                    onClick={loadMore}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Load older messages
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-cyan-400/30 bg-black/50">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    dmsRemaining === 0
                      ? 'Daily DM cap reached...'
                      : 'Type a message...'
                  }
                  disabled={dmsRemaining === 0}
                  className="flex-1 bg-gray-900/50 border border-cyan-400/30 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={2}
                />
                <button
                  onClick={handleSend}
                  disabled={!canSendDM}
                  className="px-4 py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Character counter */}
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">{input.length}/280</p>
                {dmsRemaining === 0 && (
                  <p className="text-xs text-red-400">Daily cap reached. Resets at midnight UTC.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
