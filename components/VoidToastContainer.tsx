/**
 * TOAST NOTIFICATION COMPONENT
 * Displays XP gains, tier upgrades, quest completions, zone unlocks
 */

'use client';

import React, { useEffect, useState } from 'react';
import { X, Star, TrendingUp, Trophy, MapPin } from 'lucide-react';
import { onVoidEvent, type VoidEvent } from '@/lib/events/voidEvents';

interface Toast {
  id: string;
  type: 'XP_GAINED' | 'TIER_UP' | 'QUEST_COMPLETED' | 'ZONE_UNLOCKED';
  message: string;
  details?: string;
  timestamp: number;
}

export function VoidToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Listen for SCORE_EVENT → XP_GAINED toasts
    const unsubScoreEvent = onVoidEvent('SCORE_EVENT', (event) => {
      const toast: Toast = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'XP_GAINED',
        message: `+${event.payload.xpReward} XP`,
        details: event.payload.description,
        timestamp: Date.now(),
      };
      addToast(toast);
    });

    // Listen for QUEST_COMPLETE
    const unsubQuestComplete = onVoidEvent('QUEST_COMPLETE', (event) => {
      const toast: Toast = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'QUEST_COMPLETED',
        message: 'Quest Completed!',
        details: event.payload.questTitle,
        timestamp: Date.now(),
      };
      addToast(toast);
    });

    // Listen for TIER_CHANGE
    const unsubTierChange = onVoidEvent('TIER_CHANGE', (event) => {
      const toast: Toast = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'TIER_UP',
        message: `Tier Up!`,
        details: `${event.payload.oldTier} → ${event.payload.newTier}`,
        timestamp: Date.now(),
      };
      addToast(toast);
    });

    // Listen for ZONE_UNLOCK
    const unsubZoneUnlock = onVoidEvent('ZONE_UNLOCK', (event) => {
      const toast: Toast = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'ZONE_UNLOCKED',
        message: 'Zone Unlocked!',
        details: event.payload.zoneName,
        timestamp: Date.now(),
      };
      addToast(toast);
    });

    return () => {
      unsubScoreEvent();
      unsubQuestComplete();
      unsubTierChange();
      unsubZoneUnlock();
    };
  }, []);

  const addToast = (toast: Toast) => {
    setToasts((prev) => [...prev, toast]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeToast(toast.id);
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'XP_GAINED':
        return <Star className="w-4 h-4" />;
      case 'TIER_UP':
        return <TrendingUp className="w-4 h-4" />;
      case 'QUEST_COMPLETED':
        return <Trophy className="w-4 h-4" />;
      case 'ZONE_UNLOCKED':
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getColor = (type: Toast['type']) => {
    switch (type) {
      case 'XP_GAINED':
        return 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/40 text-emerald-400';
      case 'TIER_UP':
        return 'from-void-purple/20 to-psx-blue/20 border-void-purple/40 text-void-purple';
      case 'QUEST_COMPLETED':
        return 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400';
      case 'ZONE_UNLOCKED':
        return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto
            bg-gradient-to-r ${getColor(toast.type)}
            backdrop-blur-md border rounded-lg px-4 py-3
            shadow-lg shadow-black/50
            animate-in slide-in-from-right duration-300
            min-w-[250px] max-w-[350px]
          `}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 flex-1">
              <div className="mt-0.5">{getIcon(toast.type)}</div>
              <div className="flex-1">
                <div className="text-sm font-bold">{toast.message}</div>
                {toast.details && (
                  <div className="text-xs opacity-80 mt-0.5">{toast.details}</div>
                )}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
