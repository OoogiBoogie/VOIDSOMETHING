"use client";

import React, { useState } from 'react';
import { ChromePanel, ChromeButton } from '@/components/ui/chrome-panel';
import { Settings, User, Bell, Palette, Volume2, Shield } from 'lucide-react';
import { UserProfileEdit } from '@/components/user-profile-edit';

/**
 * SETTINGS SCREEN
 * Profile, preferences, notifications, accessibility
 */

type SettingsTab = 'profile' | 'display' | 'audio' | 'notifications' | 'privacy';

export function SettingsScreen() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-2 p-4 border-b border-[#00f0ff]/20 bg-black/40 overflow-x-auto">
        <ChromeButton
          variant={activeTab === 'profile' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('profile')}
          className="flex-shrink-0"
        >
          <User className="w-4 h-4 mr-2" />
          Profile
        </ChromeButton>
        <ChromeButton
          variant={activeTab === 'display' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('display')}
          className="flex-shrink-0"
        >
          <Palette className="w-4 h-4 mr-2" />
          Display
        </ChromeButton>
        <ChromeButton
          variant={activeTab === 'audio' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('audio')}
          className="flex-shrink-0"
        >
          <Volume2 className="w-4 h-4 mr-2" />
          Audio
        </ChromeButton>
        <ChromeButton
          variant={activeTab === 'notifications' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('notifications')}
          className="flex-shrink-0"
        >
          <Bell className="w-4 h-4 mr-2" />
          Notifications
        </ChromeButton>
        <ChromeButton
          variant={activeTab === 'privacy' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('privacy')}
          className="flex-shrink-0"
        >
          <Shield className="w-4 h-4 mr-2" />
          Privacy
        </ChromeButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'display' && <DisplaySettings />}
        {activeTab === 'audio' && <AudioSettings />}
        {activeTab === 'notifications' && <NotificationSettings />}
        {activeTab === 'privacy' && <PrivacySettings />}
      </div>
    </div>
  );
}

function ProfileSettings() {
  const [isEditing, setIsEditing] = useState(false);
  
  const mockProfile = {
    username: "Explorer",
    avatarUrl: "",
    bio: "",
    portfolio: ""
  };

  const handleSave = (profile: typeof mockProfile) => {
    console.log('Saving profile:', profile);
    setIsEditing(false);
    // TODO: Implement profile save logic
  };

  if (!isEditing) {
    return (
      <ChromePanel variant="glass" className="p-6">
        <h3 className="text-xl font-bold font-orbitron text-white mb-4">
          Profile Settings
        </h3>
        <ChromeButton onClick={() => setIsEditing(true)}>
          Edit Profile
        </ChromeButton>
      </ChromePanel>
    );
  }

  return (
    <div>
      <UserProfileEdit 
        profile={mockProfile}
        onSave={handleSave}
        onClose={() => setIsEditing(false)}
      />
    </div>
  );
}

function DisplaySettings() {
  return (
    <ChromePanel variant="glass" className="p-6">
      <h3 className="text-xl font-bold font-orbitron text-white mb-4">
        Display Settings
      </h3>
      <div className="space-y-4 text-white/80">
        <SettingRow label="CRT Overlay" value="Enabled" />
        <SettingRow label="Scanlines" value="Medium" />
        <SettingRow label="Theme" value="Dark Cyberpunk" />
        <SettingRow label="Animation Speed" value="Normal" />
      </div>
    </ChromePanel>
  );
}

function AudioSettings() {
  return (
    <ChromePanel variant="glass" className="p-6">
      <h3 className="text-xl font-bold font-orbitron text-white mb-4">
        Audio Settings
      </h3>
      <div className="space-y-4 text-white/80">
        <SettingRow label="Master Volume" value="80%" />
        <SettingRow label="Music Volume" value="60%" />
        <SettingRow label="SFX Volume" value="70%" />
        <SettingRow label="UI Sounds" value="Enabled" />
      </div>
    </ChromePanel>
  );
}

function NotificationSettings() {
  return (
    <ChromePanel variant="glass" className="p-6">
      <h3 className="text-xl font-bold font-orbitron text-white mb-4">
        Notification Settings
      </h3>
      <div className="space-y-4 text-white/80">
        <SettingRow label="New Messages" value="Enabled" />
        <SettingRow label="Land Sales" value="Enabled" />
        <SettingRow label="DAO Proposals" value="Enabled" />
        <SettingRow label="Business Activity" value="Enabled" />
      </div>
    </ChromePanel>
  );
}

function PrivacySettings() {
  return (
    <ChromePanel variant="glass" className="p-6">
      <h3 className="text-xl font-bold font-orbitron text-white mb-4">
        Privacy Settings
      </h3>
      <div className="space-y-4 text-white/80">
        <SettingRow label="Profile Visibility" value="Public" />
        <SettingRow label="Show Holdings" value="Yes" />
        <SettingRow label="Activity Status" value="Online" />
        <SettingRow label="Allow Messages" value="Friends Only" />
      </div>
    </ChromePanel>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
      <span className="font-medium">{label}</span>
      <span className="text-[#00f0ff]">{value}</span>
    </div>
  );
}
