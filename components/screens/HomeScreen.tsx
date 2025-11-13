"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, TrendingUp, Users, DollarSign,
  Calendar, MessageSquare, Trophy, Zap
} from 'lucide-react';
import { ChromePanel, ChromeStat } from '@/components/ui/chrome-panel';

/**
 * HOME / HUB SCREEN
 * Main dashboard with activity feed, stats, and quick actions
 */

export function HomeScreen() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Banner */}
      <ChromePanel variant="liquid" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-orbitron text-white mb-2">
              Welcome to the VOID
            </h2>
            <p className="text-sm text-white/60 font-mono">
              Your personal command center for all PSX-VOID activities
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff0032] to-[#7b00ff] animate-pulse" />
          </div>
        </div>
      </ChromePanel>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ChromeStat
          label="Total Land Owned"
          value="0"
        />
        <ChromeStat
          label="Active Businesses"
          value="0"
        />
        <ChromeStat
          label="VOID Balance"
          value="0.00 VOID"
        />
        <ChromeStat
          label="Total Revenue"
          value="0.00 ETH"
        />
      </div>

      {/* Activity Feed & Recent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <ChromePanel variant="glass" className="lg:col-span-2 p-6">
          <h3 className="text-lg font-bold font-orbitron text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00f0ff]" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <ActivityItem
              icon={<Calendar className="w-4 h-4" />}
              title="Welcome to PSX-VOID"
              description="Your journey in the VOID begins now"
              time="Just now"
            />
          </div>
        </ChromePanel>

        {/* Quick Actions */}
        <ChromePanel variant="solid" className="p-6">
          <h3 className="text-lg font-bold font-orbitron text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <QuickActionButton
              icon={<Activity className="w-4 h-4" />}
              label="Browse Land"
            />
            <QuickActionButton
              icon={<Users className="w-4 h-4" />}
              label="Visit Marketplace"
            />
            <QuickActionButton
              icon={<MessageSquare className="w-4 h-4" />}
              label="Join Community"
            />
            <QuickActionButton
              icon={<Trophy className="w-4 h-4" />}
              label="View Leaderboard"
            />
          </div>
        </ChromePanel>
      </div>
    </div>
  );
}

// Helper Components
function ActivityItem({ 
  icon, 
  title, 
  description, 
  time 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  time: string;
}) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#00f0ff]/30 transition-all"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff0032]/20 to-[#7b00ff]/20 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="text-xs text-white/60">{description}</p>
      </div>
      <span className="text-[10px] text-white/40 font-mono whitespace-nowrap">{time}</span>
    </motion.div>
  );
}

function QuickActionButton({ 
  icon, 
  label 
}: { 
  icon: React.ReactNode; 
  label: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#00f0ff]/30 hover:bg-white/10 transition-all"
    >
      <div className="text-[#00f0ff]">{icon}</div>
      <span className="text-sm font-medium text-white">{label}</span>
    </motion.button>
  );
}
