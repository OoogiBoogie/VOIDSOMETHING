"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, DollarSign, Smile, Maximize2 } from 'lucide-react';

interface BottomLeftClusterProps {
  nearbyUserCount: number;
  unreadProx: number;
  unreadGlobal: number;
}

type ChatChannel = 'prox' | 'global';

interface MockMessage {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

/**
 * BOTTOM-LEFT CLUSTER
 * Chat + Tipping interface
 * Prox/Global channels + message preview + input
 */
export function BottomLeftCluster({
  nearbyUserCount,
  unreadProx,
  unreadGlobal
}: BottomLeftClusterProps) {
  
  const [activeChannel, setActiveChannel] = useState<ChatChannel>('prox');
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock messages (TODO: Connect to real chat system)
  const [messages] = useState<MockMessage[]>([
    { id: '1', user: 'CryptoKnight', text: 'yo what\'s up', timestamp: new Date(Date.now() - 120000) },
    { id: '2', user: 'VoidExplorer', text: 'check out the casino', timestamp: new Date(Date.now() - 60000) },
    { id: '3', user: 'MetaBuilder', text: 'just minted a new parcel!', timestamp: new Date(Date.now() - 30000) }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    console.log('Send message:', message, 'to', activeChannel);
    setMessage('');
  };

  return (
    <div className="w-full max-w-md">
      <motion.div
        className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden"
        animate={{
          height: isExpanded ? 400 : 'auto'
        }}
      >
        {/* Channel Tabs + User Count */}
        <div className="flex items-center justify-between p-2 border-b border-white/10">
          <div className="flex gap-1">
            {/* PROX Tab */}
            <motion.button
              onClick={() => setActiveChannel('prox')}
              className={`relative px-4 py-1.5 rounded text-sm font-semibold transition-all ${
                activeChannel === 'prox'
                  ? 'text-cyan-300'
                  : 'text-white/50 hover:text-white/80'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              PROX
              {activeChannel === 'prox' && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                  layoutId="activeTab"
                />
              )}
              {unreadProx > 0 && activeChannel !== 'prox' && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full text-xs flex items-center justify-center text-black font-bold">
                  {unreadProx}
                </span>
              )}
            </motion.button>

            {/* GLOBAL Tab */}
            <motion.button
              onClick={() => setActiveChannel('global')}
              className={`relative px-4 py-1.5 rounded text-sm font-semibold transition-all ${
                activeChannel === 'global'
                  ? 'text-cyan-300'
                  : 'text-white/50 hover:text-white/80'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              GLOBAL
              {activeChannel === 'global' && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                  layoutId="activeTab"
                />
              )}
              {unreadGlobal > 0 && activeChannel !== 'global' && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full text-xs flex items-center justify-center text-black font-bold">
                  {unreadGlobal}
                </span>
              )}
            </motion.button>
          </div>

          {/* User Count */}
          <div className="text-xs text-white/60">
            👥 {activeChannel === 'prox' ? nearbyUserCount : 142} {activeChannel === 'prox' ? 'nearby' : 'online'}
          </div>
        </div>

        {/* Message Preview (last 3 messages) */}
        <div className="p-2 space-y-2 min-h-[120px] max-h-[200px] overflow-y-auto">
          <AnimatePresence>
            {messages.slice(-3).map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="group"
              >
                <div className="flex gap-2">
                  {/* PFP placeholder */}
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-white/90">{msg.user}</span>
                      <span className="text-xs text-white/40">
                        {getRelativeTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-white/80">{msg.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input Bar */}
        <div className="p-2 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type message..."
            className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />

          {/* Action Buttons */}
          <motion.button
            className="w-9 h-9 rounded bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center hover:from-green-400 hover:to-emerald-500 transition-all"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            title="Send Tip"
          >
            <DollarSign className="w-4 h-4 text-white" />
          </motion.button>

          <motion.button
            className="w-9 h-9 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Emotes"
          >
            <Smile className="w-4 h-4 text-white/80" />
          </motion.button>

          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-9 h-9 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Expand Chat"
          >
            <Maximize2 className="w-4 h-4 text-white/80" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function getRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
