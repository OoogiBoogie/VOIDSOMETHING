/**
 * MINIAPP LAUNCHER MODAL
 * 
 * Pop-out window that displays the MiniApp registry and allows users to open apps.
 * Triggered from the bottom dock "Apps" button.
 */

'use client';

import React from 'react';
import { X, Grid, ExternalLink } from 'lucide-react';
import { MINIAPP_REGISTRY } from './miniapps.registry';
import type { MiniAppDefinition } from './types';

interface MiniAppLauncherModalProps {
  onClose: () => void;
  onOpenApp: (appId: string) => void;
}

export function MiniAppLauncherModal({ onClose, onOpenApp }: MiniAppLauncherModalProps) {
  const categories = ['defi', 'social', 'gaming', 'utility', 'nft'] as const;
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-void-black/80 backdrop-blur-xl p-4">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-void-gradient border border-bio-silver/40 shadow-[0_0_60px_rgba(0,255,157,0.3)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bio-silver/20">
          <div className="flex items-center gap-3">
            <Grid className="w-6 h-6 text-signal-green" />
            <h2 className="text-xl font-bold text-bio-silver">MiniApp Launcher</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-black/60 border border-bio-silver/40 hover:border-signal-red/60 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-bio-silver/80" />
          </button>
        </div>

        {/* App Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {categories.map((category) => {
            const apps = MINIAPP_REGISTRY.filter((app) => app.category === category);
            if (apps.length === 0) return null;

            return (
              <div key={category} className="mb-8 last:mb-0">
                <h3 className="text-sm uppercase tracking-widest text-bio-silver/60 mb-4">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {apps.map((app) => (
                    <MiniAppCard
                      key={app.id}
                      app={app}
                      onOpen={() => {
                        onOpenApp(app.id);
                        onClose();
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* No apps fallback */}
          {MINIAPP_REGISTRY.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Grid className="w-16 h-16 text-bio-silver/30" />
              <p className="text-bio-silver/60 text-center">
                No MiniApps available yet.<br />
                Check back soon!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-bio-silver/20 flex items-center justify-between text-xs text-bio-silver/60">
          <div>
            {MINIAPP_REGISTRY.length} app{MINIAPP_REGISTRY.length !== 1 ? 's' : ''} available
          </div>
          <div>
            Press <kbd className="px-2 py-1 rounded bg-black/60 border border-bio-silver/20">ESC</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}

interface MiniAppCardProps {
  app: MiniAppDefinition;
  onOpen: () => void;
}

function MiniAppCard({ app, onOpen }: MiniAppCardProps) {
  return (
    <button
      onClick={onOpen}
      className="group relative rounded-2xl bg-black/60 border border-bio-silver/30 hover:border-signal-green/60 p-4 flex flex-col gap-3 transition-all hover:shadow-[0_0_20px_rgba(0,255,157,0.3)] hover:translate-y-[-2px]"
    >
      {/* Icon + Type badge */}
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-signal-green/20 via-cyber-cyan/20 to-void-purple/20 flex items-center justify-center text-3xl">
          {app.icon}
        </div>
        {app.type === 'external' && (
          <ExternalLink className="w-4 h-4 text-bio-silver/40 group-hover:text-cyber-cyan" />
        )}
      </div>

      {/* Name + Description */}
      <div className="flex flex-col items-start gap-1">
        <h4 className="text-sm font-semibold text-bio-silver group-hover:text-signal-green transition-colors">
          {app.name}
        </h4>
        <p className="text-xs text-bio-silver/60 text-left line-clamp-2">
          {app.description}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-2 text-xs text-bio-silver/50">
        {app.metadata?.version && <span>v{app.metadata.version}</span>}
        {app.metadata?.version && app.metadata?.author && <span>•</span>}
        {app.metadata?.author && <span>{app.metadata.author}</span>}
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-signal-green/0 via-cyber-cyan/0 to-void-purple/0 group-hover:from-signal-green/10 group-hover:via-cyber-cyan/10 group-hover:to-void-purple/10 pointer-events-none transition-all" />
    </button>
  );
}

// Keyboard shortcut handler (ESC to close)
export function useLauncherKeyboard(isOpen: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}
