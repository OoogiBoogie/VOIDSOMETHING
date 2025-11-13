'use client';

import React from 'react';

type ContextActionType = 'talk' | 'open' | 'trade' | 'enter' | 'use' | 'scan' | null;

interface ContextActionBarProps {
  type: ContextActionType;
  label?: string;
  keyBinding?: string;
  reward?: string;
}

export default function ContextActionBar({
  type,
  label,
  keyBinding = 'E',
  reward,
}: ContextActionBarProps) {
  if (!type) return null;

  const getActionColor = () => {
    switch (type) {
      case 'talk':
        return 'text-cyber-cyan';
      case 'open':
        return 'text-signal-green';
      case 'trade':
        return 'text-yellow-500';
      case 'enter':
        return 'text-void-purple';
      case 'use':
        return 'text-psx-blue';
      case 'scan':
        return 'text-orange-500';
      default:
        return 'text-bio-silver';
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-signal-green/40 via-cyber-cyan/30 to-void-purple/20 blur-sm rounded-full" />
        <div className="relative bg-black/60 backdrop-blur-2xl border border-bio-silver/30 rounded-full px-6 py-2 shadow-[0_0_20px_rgba(0,255,157,0.2)]">
          <div className="flex items-center gap-4 font-display text-sm uppercase tracking-[0.25em]">
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 bg-white/10 border border-white/20 rounded text-xs text-white">
                {keyBinding}
              </div>
              <span className={`${getActionColor()} font-bold`}>{type.toUpperCase()}</span>
            </div>
            
            {label && (
              <>
                <div className="w-px h-4 bg-bio-silver/30" />
                <span className="text-bio-silver">{label}</span>
              </>
            )}

            {reward && (
              <>
                <div className="w-px h-4 bg-bio-silver/30" />
                <span className="text-signal-green">(+{reward})</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
