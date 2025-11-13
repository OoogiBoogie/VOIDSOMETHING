'use client';

/**
 * SETTINGS TAB - HUD configuration and preferences
 * Shows: layout toggles, audio settings, intro reset, debug mode
 * Uses: localStorage for UI-only settings (not wallet/auth)
 */

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface SettingsTabProps {
  onClose?: () => void;
}

export default function SettingsTab({ onClose }: SettingsTabProps) {
  const { authenticated } = usePrivy();

  // Audio settings (localStorage allowed for UI prefs)
  const [masterVolume, setMasterVolume] = useState(70);
  const [sfxVolume, setSfxVolume] = useState(60);
  const [musicVolume, setMusicVolume] = useState(50);
  const [muteAll, setMuteAll] = useState(false);

  // HUD Layout settings
  const [showMinimap, setShowMinimap] = useState(true);
  const [showEconStrip, setShowEconStrip] = useState(true);
  const [showFPS, setShowFPS] = useState(false);
  const [debugOverlay, setDebugOverlay] = useState(false);
  const [crtEffect, setCrtEffect] = useState(true);
  const [scanlines, setScanlines] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('void-hud-settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setMasterVolume(parsed.masterVolume ?? 70);
          setSfxVolume(parsed.sfxVolume ?? 60);
          setMusicVolume(parsed.musicVolume ?? 50);
          setMuteAll(parsed.muteAll ?? false);
          setShowMinimap(parsed.showMinimap ?? true);
          setShowEconStrip(parsed.showEconStrip ?? true);
          setShowFPS(parsed.showFPS ?? false);
          setDebugOverlay(parsed.debugOverlay ?? false);
          setCrtEffect(parsed.crtEffect ?? true);
          setScanlines(parsed.scanlines ?? true);
        } catch (e) {
          console.error('Failed to parse settings:', e);
        }
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    if (typeof window !== 'undefined') {
      const settings = {
        masterVolume,
        sfxVolume,
        musicVolume,
        muteAll,
        showMinimap,
        showEconStrip,
        showFPS,
        debugOverlay,
        crtEffect,
        scanlines,
      };
      localStorage.setItem('void-hud-settings', JSON.stringify(settings));
      console.log('Settings saved to localStorage');
    }
  };

  const handleResetIntro = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('void-intro-seen');
      console.log('Intro reset - will show on next page load');
    }
  };

  const handleResetAll = () => {
    if (typeof window !== 'undefined') {
      if (confirm('Reset all settings to defaults?')) {
        localStorage.removeItem('void-hud-settings');
        localStorage.removeItem('void-intro-seen');
        // Reset to defaults
        setMasterVolume(70);
        setSfxVolume(60);
        setMusicVolume(50);
        setMuteAll(false);
        setShowMinimap(true);
        setShowEconStrip(true);
        setShowFPS(false);
        setDebugOverlay(false);
        setCrtEffect(true);
        setScanlines(true);
        console.log('All settings reset to defaults');
      }
    }
  };

  const buildInfo = {
    version: 'v0.6.2-alpha',
    chain: 'Base Sepolia',
    chainId: 84532,
    hudVersion: 'PSX VOID · Multi-Tab v2',
    buildDate: '2024-01-15',
  };

  return (
    <div className="p-6 font-mono text-sm space-y-6 text-bio-silver">
      {/* Header */}
      <div className="border-b border-bio-silver/30 pb-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-2">
          ⚙️ HUD CONFIGURATION
        </div>
        <div className="text-[0.7rem] text-bio-silver/50">
          Customize your VOID experience
        </div>
      </div>

      {/* Audio Settings */}
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-[0.3em] text-cyber-cyan mb-3">
          🔊 Audio Settings
        </div>

        {/* Mute All Toggle */}
        <div className="flex items-center justify-between p-3 bg-black/40 border border-bio-silver/20 rounded">
          <span className="text-[0.75rem] text-bio-silver">Mute All Audio</span>
          <button
            onClick={() => setMuteAll(!muteAll)}
            className={`w-12 h-6 rounded-full transition-all ${
              muteAll ? 'bg-void-purple' : 'bg-bio-silver/30'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                muteAll ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Volume Sliders */}
        <div className="space-y-3 opacity-${muteAll ? '40' : '100'}">
          {/* Master Volume */}
          <div className="p-3 bg-black/40 border border-bio-silver/20 rounded">
            <div className="flex justify-between mb-2">
              <span className="text-[0.7rem] text-bio-silver">Master Volume</span>
              <span className="text-[0.7rem] text-cyber-cyan font-bold">{masterVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              disabled={muteAll}
              className="w-full h-2 bg-bio-silver/20 rounded-lg appearance-none cursor-pointer"
              style={{
                accentColor: 'var(--cyber-cyan)',
              }}
            />
          </div>

          {/* SFX Volume */}
          <div className="p-3 bg-black/40 border border-bio-silver/20 rounded">
            <div className="flex justify-between mb-2">
              <span className="text-[0.7rem] text-bio-silver">SFX Volume</span>
              <span className="text-[0.7rem] text-signal-green font-bold">{sfxVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sfxVolume}
              onChange={(e) => setSfxVolume(Number(e.target.value))}
              disabled={muteAll}
              className="w-full h-2 bg-bio-silver/20 rounded-lg appearance-none cursor-pointer"
              style={{
                accentColor: 'var(--signal-green)',
              }}
            />
          </div>

          {/* Music Volume */}
          <div className="p-3 bg-black/40 border border-bio-silver/20 rounded">
            <div className="flex justify-between mb-2">
              <span className="text-[0.7rem] text-bio-silver">Music Volume</span>
              <span className="text-[0.7rem] text-void-purple font-bold">{musicVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={musicVolume}
              onChange={(e) => setMusicVolume(Number(e.target.value))}
              disabled={muteAll}
              className="w-full h-2 bg-bio-silver/20 rounded-lg appearance-none cursor-pointer"
              style={{
                accentColor: 'var(--void-purple)',
              }}
            />
          </div>
        </div>
      </div>

      {/* HUD Layout */}
      <div className="space-y-3">
        <div className="text-xs uppercase tracking-[0.3em] text-void-purple mb-3">
          🖥️ HUD Layout
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 bg-black/40 border border-bio-silver/20 rounded">
            <span className="text-[0.7rem] text-bio-silver">Show Minimap</span>
            <button
              onClick={() => setShowMinimap(!showMinimap)}
              className={`w-10 h-5 rounded-full transition-all ${
                showMinimap ? 'bg-signal-green' : 'bg-bio-silver/30'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  showMinimap ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-black/40 border border-bio-silver/20 rounded">
            <span className="text-[0.7rem] text-bio-silver">Econ Strip</span>
            <button
              onClick={() => setShowEconStrip(!showEconStrip)}
              className={`w-10 h-5 rounded-full transition-all ${
                showEconStrip ? 'bg-signal-green' : 'bg-bio-silver/30'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  showEconStrip ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-black/40 border border-bio-silver/20 rounded">
            <span className="text-[0.7rem] text-bio-silver">Show FPS</span>
            <button
              onClick={() => setShowFPS(!showFPS)}
              className={`w-10 h-5 rounded-full transition-all ${
                showFPS ? 'bg-signal-green' : 'bg-bio-silver/30'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  showFPS ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-black/40 border border-bio-silver/20 rounded">
            <span className="text-[0.7rem] text-bio-silver">Debug Overlay</span>
            <button
              onClick={() => setDebugOverlay(!debugOverlay)}
              className={`w-10 h-5 rounded-full transition-all ${
                debugOverlay ? 'bg-cyber-cyan' : 'bg-bio-silver/30'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  debugOverlay ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Effects */}
      <div className="space-y-3">
        <div className="text-xs uppercase tracking-[0.3em] text-signal-green mb-3">
          ✨ Visual Effects
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 bg-black/40 border border-bio-silver/20 rounded">
            <span className="text-[0.7rem] text-bio-silver">CRT Effect</span>
            <button
              onClick={() => setCrtEffect(!crtEffect)}
              className={`w-10 h-5 rounded-full transition-all ${
                crtEffect ? 'bg-void-purple' : 'bg-bio-silver/30'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  crtEffect ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-black/40 border border-bio-silver/20 rounded">
            <span className="text-[0.7rem] text-bio-silver">Scanlines</span>
            <button
              onClick={() => setScanlines(!scanlines)}
              className={`w-10 h-5 rounded-full transition-all ${
                scanlines ? 'bg-void-purple' : 'bg-bio-silver/30'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  scanlines ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={saveSettings}
          className="py-2 px-3 bg-signal-green/20 border border-signal-green hover:bg-signal-green/30 rounded text-signal-green font-bold text-xs uppercase tracking-wider transition-all"
        >
          Save Settings
        </button>
        <button
          onClick={handleResetIntro}
          className="py-2 px-3 bg-cyber-cyan/20 border border-cyber-cyan hover:bg-cyber-cyan/30 rounded text-cyber-cyan font-bold text-xs uppercase tracking-wider transition-all"
        >
          Reset Intro
        </button>
        <button
          onClick={handleResetAll}
          className="py-2 px-3 bg-void-purple/20 border border-void-purple hover:bg-void-purple/30 rounded text-void-purple font-bold text-xs uppercase tracking-wider transition-all"
        >
          Reset All
        </button>
      </div>

      {/* Build Info */}
      <div className="border-t border-bio-silver/30 pt-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">
          📦 Build Information
        </div>
        <div className="p-4 bg-black/40 border border-bio-silver/20 rounded space-y-2 text-[0.7rem]">
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Version</span>
            <span className="text-cyber-cyan font-bold">{buildInfo.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">HUD Type</span>
            <span className="text-void-purple font-bold">{buildInfo.hudVersion}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Network</span>
            <span className="text-signal-green font-bold">{buildInfo.chain}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Chain ID</span>
            <span className="text-bio-silver font-bold">{buildInfo.chainId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Build Date</span>
            <span className="text-bio-silver/60">{buildInfo.buildDate}</span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="border-t border-bio-silver/30 pt-3">
        <div className="text-[0.65rem] text-bio-silver/50 text-center">
          Settings are stored locally in your browser. Wallet/auth handled by Privy.
        </div>
      </div>
    </div>
  );
}
