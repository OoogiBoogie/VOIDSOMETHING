"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileHUDLite } from './mobile-hud-lite';
import { MobileRoamView } from './mobile-roam-view';

/**
 * MOBILE MODE MANAGER
 * Unified component that manages switching between LITE and ROAM modes
 * Shares state between modes for seamless transitions
 */

export type MobileMode = 'lite' | 'roam';

interface MobileModeManagerProps {
  // Initial mode
  initialMode?: MobileMode;
  
  // Player state
  playerPosition: { x: number; z: number };
  currentZone?: any;
  
  // User info
  userProfile?: any;
  voidBalance?: number;
  psxBalance?: number;
  
  // LITE mode callbacks
  onOpenFullMenu?: () => void;
  onMapOpen?: () => void;
  onQuestOpen?: () => void;
  onRealEstateOpen?: () => void;
  onPowerUpOpen?: () => void;
  onPledgeOpen?: () => void;
  onSKUMarketOpen?: () => void;
  
  // ROAM mode callbacks
  onQuickAction?: (action: string) => void;
  
  // Mode change callback
  onModeChange?: (mode: MobileMode) => void;
}

export function MobileModeManager({
  initialMode = 'lite',
  playerPosition,
  currentZone,
  userProfile,
  voidBalance = 0,
  psxBalance = 0,
  onOpenFullMenu,
  onMapOpen,
  onQuestOpen,
  onRealEstateOpen,
  onPowerUpOpen,
  onPledgeOpen,
  onSKUMarketOpen,
  onQuickAction,
  onModeChange,
}: MobileModeManagerProps) {
  const [mode, setMode] = useState<MobileMode>(initialMode);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);

  // Notify parent of mode changes
  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  const handleModeToggle = () => {
    setMode(prev => prev === 'lite' ? 'roam' : 'lite');
  };

  // Shared state handlers
  const handleParcelSelect = (parcelId: string | null) => {
    setSelectedParcelId(parcelId);
  };

  return (
    <AnimatePresence mode="wait">
      {mode === 'lite' ? (
        <motion.div
          key="lite-mode"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed inset-0 z-40"
        >
          <MobileHUDLite
            userProfile={userProfile}
            playerPosition={playerPosition}
            currentZone={currentZone}
            voidBalance={voidBalance}
            psxBalance={psxBalance}
            onOpenFullMenu={onOpenFullMenu || (() => {})}
            onToggleMode={handleModeToggle}
            onMapOpen={onMapOpen}
            onQuestOpen={onQuestOpen}
            onRealEstateOpen={onRealEstateOpen}
            onPowerUpOpen={onPowerUpOpen}
            onPledgeOpen={onPledgeOpen}
            onSKUMarketOpen={onSKUMarketOpen}
          />
        </motion.div>
      ) : (
        <motion.div
          key="roam-mode"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed inset-0 z-40"
        >
          <MobileRoamView
            playerPosition={playerPosition}
            currentZone={currentZone}
            selectedParcelId={selectedParcelId}
            onParcelSelect={handleParcelSelect}
            onToggleMode={handleModeToggle}
            onQuickAction={onQuickAction}
            userProfile={userProfile}
            voidBalance={voidBalance}
            psxBalance={psxBalance}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * USAGE EXAMPLE:
 * 
 * ```tsx
 * import { MobileModeManager } from '@/components/mobile-mode-manager';
 * 
 * function MyApp() {
 *   const [mobileMode, setMobileMode] = useState<'lite' | 'roam'>('lite');
 *   
 *   return (
 *     <div>
 *       {isMobile && (
 *         <MobileModeManager
 *           initialMode={mobileMode}
 *           playerPosition={{ x: 20, z: 20 }}
 *           currentZone={currentZone}
 *           userProfile={userProfile}
 *           voidBalance={50000}
 *           psxBalance={100000}
 *           onModeChange={(mode) => setMobileMode(mode)}
 *           onMapOpen={() => setMapOpen(true)}
 *           // ... other callbacks
 *         />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
