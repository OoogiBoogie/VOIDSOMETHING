'use client';

/**
 * MINIMAL HUD V2 TEST - Step by step diagnostic
 */

import React from 'react';

export default function MinimalHudTest() {
  console.log('🎮 MinimalHudTest rendering...');
  
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-bio-silver text-center space-y-4">
        <h1 className="text-4xl font-bold">VOID HUD V2 - Minimal Test</h1>
        <p className="text-bio-silver/60">If you see this, React is working</p>
        
        <div className="mt-8 p-4 border border-bio-silver/20 rounded">
          <p className="text-sm">Next step: Load VoidHudApp</p>
        </div>
      </div>
    </div>
  );
}
