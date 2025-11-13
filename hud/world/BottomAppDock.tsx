'use client';

import React, { useState } from 'react';
import {
  Phone,
  Users,
  Shield,
  Radio,
  Music,
  Gamepad2,
  Map,
  Calendar,
  Trophy,
  Wallet,
  Lock,
  Settings,
  MessageSquare,
  Camera,
  ShoppingBag,
  Building2,
  FileText,
  Globe,
  Zap,
  MoreHorizontal,
} from 'lucide-react';

interface App {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

interface BottomAppDockProps {
  onAppClick: (appId: string) => void;
}

const APPS: App[] = [
  { id: 'phone', name: 'Phone', icon: Phone, color: 'text-signal-green' },
  { id: 'friends', name: 'Friends', icon: Users, color: 'text-cyber-cyan' },
  { id: 'guilds', name: 'Guilds', icon: Shield, color: 'text-void-purple' },
  { id: 'voice', name: 'Voice', icon: Radio, color: 'text-psx-blue' },
  { id: 'music', name: 'Music', icon: Music, color: 'text-pink-500' },
  { id: 'games', name: 'Games', icon: Gamepad2, color: 'text-orange-500' },
  { id: 'map', name: 'Map', icon: Map, color: 'text-yellow-500' },
  { id: 'events', name: 'Events', icon: Calendar, color: 'text-red-500' },
  { id: 'leaderboard', name: 'Leaderboard', icon: Trophy, color: 'text-yellow-400' },
  { id: 'wallet', name: 'Wallet', icon: Wallet, color: 'text-signal-green' },
  { id: 'vault', name: 'Vault', icon: Lock, color: 'text-cyan-400' },
];

const MORE_APPS: App[] = [
  { id: 'settings', name: 'Settings', icon: Settings, color: 'text-bio-silver' },
  { id: 'chat', name: 'Chat', icon: MessageSquare, color: 'text-signal-green' },
  { id: 'camera', name: 'Camera', icon: Camera, color: 'text-psx-blue' },
  { id: 'marketplace', name: 'Marketplace', icon: ShoppingBag, color: 'text-yellow-500' },
  { id: 'properties', name: 'Properties', icon: Building2, color: 'text-void-purple' },
  { id: 'docs', name: 'Docs', icon: FileText, color: 'text-bio-silver' },
  { id: 'browser', name: 'Browser', icon: Globe, color: 'text-cyber-cyan' },
  { id: 'powerups', name: 'Powerups', icon: Zap, color: 'text-orange-500' },
];

export default function BottomAppDock({ onAppClick }: BottomAppDockProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Chrome backing */}
        <div 
          className="absolute -inset-0.5 opacity-40 blur-sm rounded-2xl"
          style={{ background: 'linear-gradient(to right, var(--void-neon-teal), var(--void-neon-purple), var(--void-neon-pink))' }}
        />
        
        <div className="relative bg-black/60 backdrop-blur-2xl border border-bio-silver/30 rounded-2xl p-3 shadow-[0_0_30px_rgba(0,255,157,0.2)]">
          <div className="flex items-center gap-2">
            {/* Main Apps */}
            {APPS.map((app) => (
              <button
                key={app.id}
                onClick={() => onAppClick(app.id)}
                className="group relative w-12 h-12 rounded-xl bg-void-deep/50 border border-bio-silver/20 hover:border-signal-green/50 hover:bg-void-deep/80 transition-all hover:shadow-[0_0_20px_rgba(0,255,157,0.3)]"
                title={app.name}
              >
                {React.createElement(app.icon, { 
                  className: `w-5 h-5 ${app.color} group-hover:scale-110 transition-transform mx-auto`,
                  key: `icon-${app.id}`
                })}
              </button>
            ))}

            {/* Divider */}
            <div className="w-px h-10 bg-bio-silver/30 mx-1" />

            {/* More Button */}
            <button
              onClick={() => setShowMore(!showMore)}
              className={`relative w-12 h-12 rounded-xl bg-void-deep/50 border transition-all ${
                showMore
                  ? 'border-signal-green/50 bg-void-deep/80 shadow-[0_0_20px_rgba(0,255,157,0.3)]'
                  : 'border-bio-silver/20 hover:border-signal-green/50 hover:bg-void-deep/80'
              }`}
              title="More Apps"
            >
              <MoreHorizontal className={`w-5 h-5 ${showMore ? 'text-signal-green' : 'text-bio-silver'} mx-auto`} />
            </button>
          </div>

          {/* More Apps Popup */}
          {showMore && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-b from-signal-green/40 via-cyber-cyan/30 to-void-purple/20 blur-sm rounded-2xl" />
                <div className="relative bg-black/90 backdrop-blur-2xl border border-bio-silver/40 rounded-2xl p-4 shadow-[0_0_40px_rgba(0,255,157,0.3)]">
                  <div className="grid grid-cols-4 gap-3 w-[280px]">
                    {MORE_APPS.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => {
                          onAppClick(app.id);
                          setShowMore(false);
                        }}
                        className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-void-deep/30 border border-bio-silver/20 hover:border-signal-green/50 hover:bg-void-deep/60 transition-all hover:shadow-[0_0_15px_rgba(0,255,157,0.2)]"
                      >
                        {React.createElement(app.icon, {
                          className: `w-5 h-5 ${app.color} group-hover:scale-110 transition-transform`,
                          key: `more-icon-${app.id}`
                        })}
                        <span className="text-[0.6rem] text-bio-silver group-hover:text-white uppercase tracking-wider">
                          {app.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
