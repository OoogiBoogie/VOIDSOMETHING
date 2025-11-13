/**
 * FULLSCREEN CHAT MODAL (Mobile)
 * 
 * Full-screen chat overlay for mobile landscape (ROAM) mode.
 * Provides complete chat experience when user taps the chat pill.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Users, MessageCircle, Shield } from 'lucide-react';

interface ChatMessage {
  id: string;
  hub?: string;
  type?: 'system' | 'user';
  username?: string;
  text: string;
  timestamp: number;
  channel: 'global' | 'nearby' | 'party';
}

interface ChatState {
  messages: ChatMessage[];
  activeChannel: 'global' | 'nearby' | 'party';
}

interface FullScreenChatModalProps {
  chatState: ChatState;
  onSendMessage: (text: string, channel: 'global' | 'nearby' | 'party') => void;
  onClose: () => void;
}

export function FullScreenChatModal({ chatState, onSendMessage, onClose }: FullScreenChatModalProps) {
  const [activeChannel, setActiveChannel] = useState<'global' | 'nearby' | 'party'>(chatState.activeChannel);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Filter messages by active channel
  const filteredMessages = chatState.messages.filter(
    (msg) => msg.channel === activeChannel
  );

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    onSendMessage(inputText, activeChannel);
    setInputText('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-void-gradient flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-black/80 border-b border-bio-silver/20 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-signal-green" />
          <h2 className="text-lg font-bold text-bio-silver">Chat</h2>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-black/60 border border-bio-silver/40 hover:border-signal-red/60 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-bio-silver/80" />
        </button>
      </div>

      {/* Channel Tabs */}
      <div className="px-4 py-2 bg-black/60 border-b border-bio-silver/10 flex gap-2">
        <ChannelTab
          icon={Users}
          label="GLOBAL"
          active={activeChannel === 'global'}
          onClick={() => setActiveChannel('global')}
        />
        <ChannelTab
          icon={MessageCircle}
          label="NEARBY"
          active={activeChannel === 'nearby'}
          onClick={() => setActiveChannel('nearby')}
        />
        <ChannelTab
          icon={Shield}
          label="PARTY"
          active={activeChannel === 'party'}
          onClick={() => setActiveChannel('party')}
        />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-bio-silver/40">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No messages in this channel</p>
              <p className="text-xs mt-1">Be the first to say something!</p>
            </div>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 bg-black/80 border-t border-bio-silver/20 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${activeChannel}...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-bio-silver/30 focus:border-signal-green/60 text-bio-silver text-sm placeholder:text-bio-silver/40 outline-none transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-signal-green/20 border border-signal-green/40 hover:bg-signal-green/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4 text-signal-green" />
            <span className="text-sm font-semibold text-signal-green">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface ChannelTabProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}

function ChannelTab({ icon: Icon, label, active, onClick }: ChannelTabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
        active
          ? 'bg-signal-green/20 border border-signal-green/40 text-signal-green'
          : 'bg-black/40 border border-bio-silver/20 text-bio-silver/60 hover:border-bio-silver/40'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    </button>
  );
}

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isSystem = message.type === 'system';
  const timestamp = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isSystem) {
    return (
      <div className="flex items-center justify-center">
        <div className="px-3 py-1.5 rounded-full bg-black/60 border border-void-purple/30 text-xs text-void-purple/80">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold text-signal-green">
          {message.username || 'Anonymous'}
        </span>
        <span className="text-xs text-bio-silver/40 font-mono">{timestamp}</span>
      </div>
      <div className="px-3 py-2 rounded-2xl bg-black/60 border border-bio-silver/20 text-sm text-bio-silver">
        {message.text}
      </div>
    </div>
  );
}
