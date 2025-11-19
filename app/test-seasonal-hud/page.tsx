'use client';

import { useState } from 'react';
import styles from './page.module.css';

type WindowType = 'dashboard' | 'xp' | 'actions' | null;

// Lazy imports to prevent SSR issues
const loadComponents = async (type: WindowType) => {
  if (!type) return null;
  
  try {
    if (type === 'dashboard') {
      const { SeasonDashboard } = await import('@/hud/seasonal/SeasonDashboard');
      return SeasonDashboard;
    }
    if (type === 'xp') {
      const { SeasonalXPPanel } = await import('@/hud/seasonal/SeasonalXPPanel');
      return SeasonalXPPanel;
    }
    if (type === 'actions') {
      const { SeasonalActionsPanel } = await import('@/hud/seasonal/SeasonalActionsPanel');
      return SeasonalActionsPanel;
    }
  } catch (err) {
    console.error('Failed to load component:', err);
    return null;
  }
};

export default function TestSeasonalHUDPage() {
  const [activeWindow, setActiveWindow] = useState<WindowType>(null);
  const [Component, setComponent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleWindowOpen = async (type: WindowType) => {
    setError(null);
    setActiveWindow(type);
    
    const comp = await loadComponents(type);
    if (comp) {
      setComponent(() => comp);
    } else {
      setError(`Failed to load ${type} component`);
    }
  };

  const handleClose = () => {
    setActiveWindow(null);
    setComponent(null);
    setError(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🔥 Seasonal HUD Integration Test</h1>
        <p className={styles.subtitle}>Test all three seasonal window components</p>
      </div>

      <div className={styles.buttonGrid}>
        <button
          className={styles.button}
          onClick={() => handleWindowOpen('dashboard')}
        >
          📊 Season Dashboard
        </button>
        <button
          className={styles.button}
          onClick={() => handleWindowOpen('xp')}
        >
          ⭐ Seasonal XP Panel
        </button>
        <button
          className={styles.button}
          onClick={() => handleWindowOpen('actions')}
        >
          🔥 Burn Actions Panel
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          background: 'rgba(255,68,68,0.2)', 
          border: '2px solid #ff4444',
          borderRadius: '8px',
          color: '#ff4444',
          marginTop: '2rem',
          textAlign: 'center'
        }}>
          <p><strong>Error:</strong> {error}</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Check browser console for details
          </p>
        </div>
      )}

      {activeWindow && Component && (
        <div className={styles.windowOverlay}>
          <div className={styles.windowContainer}>
            <Component onClose={handleClose} />
            <button
              className={styles.closeButton}
              onClick={handleClose}
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

      <div className={styles.info}>
        <h3>✅ HUD Integration Complete</h3>
        <ul>
          <li><strong>SeasonDashboard:</strong> Season overview, time remaining, caps, zones</li>
          <li><strong>SeasonalXPPanel:</strong> Lifetime XP, seasonal XP, multipliers, airdrop weight</li>
          <li><strong>SeasonalActionsPanel:</strong> 5 burn actions with XP estimates</li>
        </ul>
        <p className={styles.note}>
          <strong>Feature Flag:</strong> Set <code>NEXT_PUBLIC_ENABLE_SEASONAL_BURN_UI=true</code> to enable in main HUD
        </p>
      </div>
    </div>
  );
}
