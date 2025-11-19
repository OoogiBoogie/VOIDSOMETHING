'use client';

/**
 * VOID WINDOW SHELL - Chrome-framed pop-out windows with hub theming
 */

import React from 'react';
import type { HubTheme } from '@/hud/theme';
import type { WindowType } from '@/hud/windowTypes';
import { getWindowLabel } from '@/hud/windowTypes';
import { X, Minimize2, Maximize2 } from 'lucide-react';

interface VoidWindowShellProps {
  windowType: WindowType;
  onClose: () => void;
  theme: HubTheme;
  children: React.ReactNode;
}

export default function VoidWindowShell({
  windowType,
  onClose,
  theme,
  children
}: VoidWindowShellProps) {
  const [isMinimized, setIsMinimized] = React.useState(false);

  return (
    <div 
      className={`
        fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        w-[70vw] h-[70vh]
        rounded-3xl overflow-hidden
        bg-black/90 backdrop-blur-3xl
        border-2
        shadow-2xl
        transition-all duration-500
        pointer-events-auto
        ${isMinimized ? 'h-16' : 'h-[70vh]'}
      `}
      style={{
        borderColor: theme.borderColor,
        boxShadow: `0 0 60px ${theme.borderColor}40, 0 0 120px ${theme.borderColor}20`
      }}
    >
      {/* Chrome title bar */}
      <div 
        className="relative h-16 px-6 flex items-center justify-between border-b"
        style={{ borderColor: `${theme.borderColor}40` }}
      >
        {/* Chrome spine glow */}
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.borderColor}, transparent)`
          }}
        />

        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ background: theme.borderColor }}
          />
          <h2 className="text-sm font-bold tracking-widest text-bio-silver">
            {getWindowLabel(windowType)}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className={`
              p-2 rounded-lg border transition-all duration-300
              hover:bg-bio-dark-bone/50
            `}
            style={{ borderColor: `${theme.borderColor}40` }}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-bio-silver" />
            ) : (
              <Minimize2 className="w-4 h-4 text-bio-silver" />
            )}
          </button>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg border transition-all duration-300
              hover:bg-red-500/20
            `}
            style={{ borderColor: `${theme.borderColor}40` }}
          >
            <X className="w-4 h-4 text-bio-silver hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* Window content */}
      {!isMinimized && (
        <div className="relative h-[calc(100%-4rem)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-bio-silver/30 p-6">
          {/* Chrome corner glows */}
          <div 
            className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 blur-3xl opacity-30"
            style={{ background: `radial-gradient(circle, ${theme.borderColor}, transparent 70%)` }}
          />
          <div 
            className="pointer-events-none absolute -bottom-10 -right-10 w-40 h-40 blur-3xl opacity-30"
            style={{ background: `radial-gradient(circle, ${theme.borderColor}, transparent 70%)` }}
          />

          <div className="relative">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
