"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Hand, Smile } from 'lucide-react';

interface BottomRightClusterProps {
  onLiteModeClick: () => void;
  onInteract?: () => void;
  onEmote?: () => void;
  interactLabel?: string;
}

/**
 * BOTTOM-RIGHT CLUSTER
 * Action buttons: LITE mode toggle, Interact, Emotes
 */
export function BottomRightCluster({
  onLiteModeClick,
  onInteract,
  onEmote,
  interactLabel
}: BottomRightClusterProps) {
  
  return (
    <div className="flex flex-col gap-2">
      {/* LITE Mode Button (Primary Action) */}
      <motion.button
        onClick={onLiteModeClick}
        className="relative group w-14 h-14 bg-gradient-to-br from-[#7b00ff] to-[#ff0032] rounded-lg flex items-center justify-center overflow-hidden"
        whileHover={{ 
          scale: 1.1,
          boxShadow: '0 0 30px rgba(123, 0, 255, 0.6)'
        }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 0 15px rgba(123, 0, 255, 0.3)',
            '0 0 25px rgba(255, 0, 50, 0.4)',
            '0 0 15px rgba(123, 0, 255, 0.3)'
          ]
        }}
        transition={{ 
          boxShadow: { repeat: Infinity, duration: 3 }
        }}
      >
        <Smartphone className="w-6 h-6 text-white relative z-10" />
        
        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />

        {/* Tooltip */}
        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          LITE Mode (TAB)
        </div>
      </motion.button>

      {/* Interact Button (Context-sensitive) */}
      {onInteract && (
        <motion.button
          onClick={onInteract}
          className="relative group w-14 h-14 bg-black/80 backdrop-blur-md border border-cyan-500/50 rounded-lg flex items-center justify-center hover:bg-cyan-500/20 transition-colors"
          whileHover={{ 
            scale: 1.1,
            borderColor: 'rgba(0, 255, 255, 0.8)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)'
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <Hand className="w-6 h-6 text-cyan-300" />

          {/* Tooltip with action label */}
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {interactLabel || 'Interact'}
          </div>
        </motion.button>
      )}

      {/* Emotes Button */}
      {onEmote && (
        <motion.button
          onClick={onEmote}
          className="relative group w-14 h-14 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center hover:border-purple-500/50 hover:bg-purple-500/10 transition-colors"
          whileHover={{ 
            scale: 1.1,
            borderColor: 'rgba(168, 85, 247, 0.8)',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Smile className="w-6 h-6 text-white/80" />

          {/* Tooltip */}
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Emotes
          </div>
        </motion.button>
      )}
    </div>
  );
}
