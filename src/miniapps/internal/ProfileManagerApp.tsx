/**
 * PROFILE MANAGER MINIAPP
 * 
 * Internal miniapp for editing user profile and preferences.
 * Manages Net Protocol on-chain profile.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useVoidRuntime } from '../MiniAppManager';
import { useNetProfile } from '@/hooks/useNetProfile';

/**
 * Profile Manager Miniapp Component
 * 
 * Allows users to edit their on-chain profile and preferences.
 */
export default function ProfileManagerApp() {
  const runtime = useVoidRuntime();
  const { profile, saveProfile, isLoading } = useNetProfile();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Load profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
    }
  }, [profile]);
  
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await saveProfile({
        displayName: displayName || undefined,
        bio: bio || undefined,
      });
      
      console.log('[ProfileManager] Profile saved successfully');
    } catch (error) {
      console.error('[ProfileManager] Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-black/90">
        <div className="text-cyan-400 font-mono">Loading profile...</div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-black/90">
      {/* Header */}
      <div className="px-4 py-3 border-b border-cyan-500/30">
        <h2 className="text-lg font-bold text-cyan-400 font-mono">
          PROFILE MANAGER
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Edit your on-chain identity
        </p>
      </div>
      
      {/* Profile Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Agent ID (Read-only) */}
        <div>
          <label className="block text-xs font-mono text-gray-400 mb-1">
            AGENT ID
          </label>
          <div className="px-3 py-2 bg-black/50 border border-gray-700 rounded font-mono text-sm text-gray-500">
            {runtime.netProfile?.agentId || 'N/A'}
          </div>
        </div>
        
        {/* Display Name */}
        <div>
          <label className="block text-xs font-mono text-gray-400 mb-1">
            DISPLAY NAME
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
            className="w-full px-3 py-2 bg-black/50 border border-cyan-500/30 rounded font-mono text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
            maxLength={50}
          />
        </div>
        
        {/* Bio */}
        <div>
          <label className="block text-xs font-mono text-gray-400 mb-1">
            BIO
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the VOID about yourself..."
            className="w-full px-3 py-2 bg-black/50 border border-cyan-500/30 rounded font-mono text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none"
            rows={4}
            maxLength={200}
          />
          <div className="text-xs text-gray-600 text-right mt-1">
            {bio.length}/200
          </div>
        </div>
        
        {/* Stats (Read-only) */}
        <div className="pt-4 border-t border-gray-800">
          <h3 className="text-sm font-mono text-gray-400 mb-3">STATS</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-black/50 border border-gray-800 rounded">
              <div className="text-xs text-gray-500 font-mono">XP</div>
              <div className="text-lg text-cyan-400 font-mono mt-1">
                {runtime.netProfile?.xp || '0'}
              </div>
            </div>
            <div className="p-3 bg-black/50 border border-gray-800 rounded">
              <div className="text-xs text-gray-500 font-mono">LEVEL</div>
              <div className="text-lg text-purple-400 font-mono mt-1">
                {runtime.netProfile?.level || 1}
              </div>
            </div>
            <div className="p-3 bg-black/50 border border-gray-800 rounded">
              <div className="text-xs text-gray-500 font-mono">TIER</div>
              <div className="text-lg text-yellow-400 font-mono mt-1">
                {runtime.xp?.tier || 'INITIATE'}
              </div>
            </div>
            <div className="p-3 bg-black/50 border border-gray-800 rounded">
              <div className="text-xs text-gray-500 font-mono">SCENE</div>
              <div className="text-lg text-green-400 font-mono mt-1">
                {runtime.netProfile?.lastSceneId || 'HQ'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer with Save Button */}
      <div className="px-4 py-3 border-t border-cyan-500/30">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded font-mono hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'SAVING TO CHAIN...' : 'SAVE PROFILE'}
        </button>
        <p className="text-xs text-gray-600 text-center mt-2 font-mono">
          Profile updates are written to Net Protocol
        </p>
      </div>
    </div>
  );
}
