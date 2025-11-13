/**
 * MINIAPP DOCK
 * 
 * Launcher button and modal trigger for MiniApp system.
 * Integrates with MiniAppLauncherModal for the actual app grid.
 */

'use client';

import React, { useState } from 'react';
import { Grid } from 'lucide-react';
import { MiniAppLauncherModal, useLauncherKeyboard } from './MiniAppLauncherModal';
import { useMiniAppManager } from './MiniAppManager';

/**
 * MiniApp Dock Button + Modal
 * 
 * Renders a dock button that opens the MiniApp launcher modal.
 */
export function MiniAppDock() {
  const [isOpen, setIsOpen] = useState(false);
  const { openMiniApp } = useMiniAppManager();

  // Keyboard shortcut handler (ESC to close)
  useLauncherKeyboard(isOpen, () => setIsOpen(false));

  return (
    <>
      {/* Dock Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative group px-4 py-2 rounded-xl bg-black/60 border border-bio-silver/40 hover:border-signal-green/60 flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(0,255,157,0.3)]"
      >
        <Grid className="w-5 h-5 text-bio-silver group-hover:text-signal-green transition-colors" />
        <span className="text-sm font-semibold text-bio-silver group-hover:text-signal-green transition-colors">
          Apps
        </span>
      </button>

      {/* Launcher Modal */}
      {isOpen && (
        <MiniAppLauncherModal
          onClose={() => setIsOpen(false)}
          onOpenApp={(appId) => {
            openMiniApp(appId);
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
}
