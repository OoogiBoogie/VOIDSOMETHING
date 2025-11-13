"use client"

import React, { useEffect, useState } from 'react';
import { HUDProvider, useHUD } from './HUDContext';
import HUDShell from './core/HUDShell';
import MobileWorldShell from './mobile/MobileWorldShell';
import GlobalWalletButton from './components/GlobalWalletButton';
import PerformanceMonitor from './components/PerformanceMonitor';
import type { LayoutMode } from './HUDTypes';

interface HUDRootContentProps {
  children?: React.ReactNode;
}

function HUDRootContent({ children }: HUDRootContentProps) {
  const { state, actions } = useHUD();

  console.log('🎮 HUDRootContent rendering - layoutMode:', state.layoutMode);

  // Detect layout mode on mount and resize
  useEffect(() => {
    const detectLayoutMode = (): LayoutMode => {
      if (typeof window === 'undefined') return 'pc';
      
      const width = window.innerWidth;
      if (width < 768) {
        // Mobile - default to lite, could check localStorage for roam preference
        return 'mobile-lite';
      }
      return 'pc';
    };

    const updateLayoutMode = () => {
      const mode = detectLayoutMode();
      if (mode !== state.layoutMode) {
        actions.setLayoutMode(mode);
      }
    };

    updateLayoutMode();
    window.addEventListener('resize', updateLayoutMode);
    return () => window.removeEventListener('resize', updateLayoutMode);
  }, [state.layoutMode, actions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hub shortcuts (only in PC mode)
      if (state.layoutMode === 'pc' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'w':
            actions.openHub('world');
            break;
          case 'c':
            actions.openHub('creator');
            break;
          case 'd':
            actions.openHub('defi');
            break;
          case 'g':
            actions.openHub('governance');
            break;
          case 'escape':
            actions.closeHub();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.layoutMode, actions]);

  // Render appropriate layout
  const renderLayout = () => {
    switch (state.layoutMode) {
      case 'pc':
        return (
          <div className="relative w-full h-screen">
            {children}
            <HUDShell />
            <GlobalWalletButton />
            <PerformanceMonitor />
          </div>
        );
      case 'mobile-lite':
      case 'mobile-roam':
        return (
          <div className="relative w-full h-screen">
            {children}
            <MobileWorldShell />
            <GlobalWalletButton />
            <PerformanceMonitor />
          </div>
        );
      default:
        return (
          <div className="relative w-full h-screen">
            {children}
            <HUDShell />
            <GlobalWalletButton />
            <PerformanceMonitor />
          </div>
        );
    }
  };

  return renderLayout();
}

interface HUDRootProps {
  children?: React.ReactNode;
  initialLayoutMode?: LayoutMode;
}

export function HUDRoot({ children, initialLayoutMode }: HUDRootProps) {
  return (
    <HUDProvider initialLayoutMode={initialLayoutMode}>
      <HUDRootContent>{children}</HUDRootContent>
    </HUDProvider>
  );
}
