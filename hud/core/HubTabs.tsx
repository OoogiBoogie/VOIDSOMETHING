'use client';

import React from 'react';

interface HubTabsProps {
  hubs: readonly string[];
  active: string;
  onChange: (hub: string) => void;
}

export default function HubTabs({ hubs, active, onChange }: HubTabsProps) {
  return (
    <nav className="flex flex-wrap gap-2 text-xs font-mono uppercase tracking-[0.25em]">
      {hubs.map((hub) => {
        const isActive = hub === active;
        return (
          <button
            key={hub}
            onClick={() => onChange(hub)}
            className={`relative px-3 py-2 rounded-xl border transition-all ${
              isActive
                ? 'border-[#00FF9D]/80 bg-[#00FF9D]/15 text-[#00FF9D] hud-card-signal'
                : 'border-[#7C00FF]/40 bg-black/50 text-[#C7D8FF]/70 hover:border-[#00FF9D]/60 hover:text-[#00FF9D]'
            }`}
          >
            <span>{hub}</span>
            {isActive && (
              <span 
                className="absolute inset-x-4 -bottom-1 h-[2px] rounded-full"
                style={{
                  background: 'linear-gradient(to right, #00FF9D, #00D4FF, #7C00FF)'
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
