'use client';

/**
 * Retro Effects Context
 * 
 * Global toggle system for PS1/CRT/Xbox aesthetic
 * Preserves all hub theming logic - just adds optional visual layer
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RetroEffectsConfig {
  // Global enable/disable
  enabled: boolean;
  
  // Individual effect toggles
  crtOverlay: boolean;
  scanlines: boolean;
  noise: boolean;
  vignette: boolean;
  chromaticAberration: boolean;
  vhsGlitch: boolean;
  
  // Intensity settings
  intensity: 'light' | 'medium' | 'heavy';
  glitchFrequency: number; // ms between VHS glitches
}

interface RetroEffectsContextValue {
  config: RetroEffectsConfig;
  toggleRetro: () => void;
  toggleEffect: (effect: keyof Omit<RetroEffectsConfig, 'enabled' | 'intensity' | 'glitchFrequency'>) => void;
  setIntensity: (intensity: 'light' | 'medium' | 'heavy') => void;
  applyRetroClasses: (...classes: string[]) => string;
}

const RetroEffectsContext = createContext<RetroEffectsContextValue | undefined>(undefined);

const DEFAULT_CONFIG: RetroEffectsConfig = {
  enabled: false, // Start disabled - user can enable
  crtOverlay: true,
  scanlines: true,
  noise: true,
  vignette: true,
  chromaticAberration: true,
  vhsGlitch: true,
  intensity: 'heavy', // Make effects VERY visible
  glitchFrequency: 8000,
};

export function RetroEffectsProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<RetroEffectsConfig>(DEFAULT_CONFIG);

  const toggleRetro = () => {
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const toggleEffect = (effect: keyof Omit<RetroEffectsConfig, 'enabled' | 'intensity' | 'glitchFrequency'>) => {
    setConfig(prev => ({ ...prev, [effect]: !prev[effect] }));
  };

  const setIntensity = (intensity: 'light' | 'medium' | 'heavy') => {
    setConfig(prev => ({ ...prev, intensity }));
  };

  // Helper function: only apply retro classes if enabled
  const applyRetroClasses = (...classes: string[]) => {
    if (!config.enabled) return '';
    return classes.join(' ');
  };

  return (
    <RetroEffectsContext.Provider value={{ 
      config, 
      toggleRetro, 
      toggleEffect, 
      setIntensity,
      applyRetroClasses 
    }}>
      {children}
    </RetroEffectsContext.Provider>
  );
}

export function useRetroEffects() {
  const context = useContext(RetroEffectsContext);
  if (!context) {
    throw new Error('useRetroEffects must be used within RetroEffectsProvider');
  }
  return context;
}

/**
 * Optional hook - returns class string only if retro mode enabled
 * 
 * Usage:
 *   const retroClass = useRetroClass('dither-light', 'chrome-border');
 *   <div className={`base-classes ${retroClass}`}>
 */
export function useRetroClass(...classes: string[]) {
  const { config } = useRetroEffects();
  if (!config.enabled) return '';
  return classes.join(' ');
}

/**
 * Hook for component-specific retro styling
 * Returns object with enabled state + helper functions
 */
export function useRetroStyle() {
  const { config, applyRetroClasses } = useRetroEffects();
  
  return {
    enabled: config.enabled,
    intensity: config.intensity,
    apply: applyRetroClasses,
    
    // Preset combinations
    window: () => applyRetroClasses('xbox-rounded', 'chrome-border-thick', 'dither-light', 'scanlines-subtle'),
    panel: () => applyRetroClasses('xbox-rounded-sm', 'chrome-border', 'dither-light', 'y2k-gloss'),
    button: () => applyRetroClasses('xbox-rounded-sm', 'chrome-border', 'retro-button-hover'),
    text: () => applyRetroClasses('chromatic-text'),
    textGlitch: () => applyRetroClasses('chromatic-text', 'glitch-flicker'),
    achievement: () => applyRetroClasses('xbox-rounded', 'chrome-border-thick', 'xbox-achievement-glow', 'blade-slide-in-right'),
  };
}
