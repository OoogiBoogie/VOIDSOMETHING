"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Settings } from 'lucide-react';

interface TopRightClusterProps {
  playerPosition: { x: number; y: number; z: number };
  onSettingsClick: () => void;
}

/**
 * TOP-RIGHT CLUSTER
 * Mini-map (always visible) + Notifications + Settings
 */
export function TopRightCluster({
  playerPosition,
  onSettingsClick
}: TopRightClusterProps) {
  
  const [notificationCount] = useState(2); // TODO: Connect to real notifications

  return (
    <div className="flex flex-col items-end gap-3">
      {/* Mini Map */}
      <motion.div
        className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden"
        whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 255, 0.5)' }}
        style={{ width: 120, height: 120 }}
      >
        <div className="relative w-full h-full bg-gradient-to-br from-purple-900/20 to-pink-900/20">
          {/* Grid overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Player position indicator */}
          <motion.div
            className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-lg"
            style={{
              left: `${((playerPosition.x + 20) / 40) * 100}%`,
              top: `${((playerPosition.z + 20) / 40) * 100}%`,
              boxShadow: '0 0 10px rgba(0, 255, 255, 1)'
            }}
            animate={{
              scale: [1, 1.2, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: 2
            }}
          />

          {/* District markers (example) */}
          <div className="absolute" style={{ left: '30%', top: '30%' }}>
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full opacity-60" />
          </div>
          <div className="absolute" style={{ left: '70%', top: '50%' }}>
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full opacity-60" />
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-bold">Click to Expand</span>
          </div>
        </div>
      </motion.div>

      {/* Icons Row */}
      <div className="flex gap-2">
        {/* Notifications */}
        <motion.button
          className="relative w-10 h-10 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center hover:border-cyan-500/50 transition-colors"
          whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)' }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-5 h-5 text-white/80" />
          {notificationCount > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {notificationCount}
            </motion.div>
          )}
        </motion.button>

        {/* Settings */}
        <motion.button
          onClick={onSettingsClick}
          className="w-10 h-10 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center hover:border-cyan-500/50 transition-colors"
          whileHover={{ 
            scale: 1.1, 
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)',
            rotate: 45
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-5 h-5 text-white/80" />
        </motion.button>
      </div>
    </div>
  );
}
