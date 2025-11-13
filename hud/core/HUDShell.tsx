'use client';

/**
 * HUD SHELL - Entry point for HUD system
 * Loads VoidHudApp (V2 system with proper styling)
 */

import React from 'react';
import VoidHudApp from '../VoidHudApp';

export default function HUDShell() {
  return (
    <div className="fixed inset-0 z-50">
      <VoidHudApp />
    </div>
  );
}
