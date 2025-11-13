'use client';

/**
 * CREATOR TAB - Mission creation and creator economy
 * Shows: creator rank, missions published, create mission interface
 * Actions: create mission, view completions
 */

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';

interface Mission {
  id: number;
  title: string;
  description: string;
  vxpReward: number;
  voidReward?: number;
  completions: number;
  hub: string;
}

interface CreatorTabProps {
  onClose?: () => void;
}

export default function CreatorTab({ onClose }: CreatorTabProps) {
  const { authenticated } = usePrivy();
  const { address } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    vxpReward: 0,
    voidReward: 0,
  });

  // Mock data - ready to replace with MissionRegistry hooks
  const mockCreatorData = {
    rank: 'Builder',
    level: 3,
    totalMissions: 24,
    totalVXPAwarded: 1240,
    missions: [
      { id: 1, title: 'Echo in the Grid', description: 'Complete first swap', vxpReward: 50, voidReward: 10, completions: 142, hub: 'WORLD' },
      { id: 2, title: 'Spread the Signal', description: 'Invite 3 friends', vxpReward: 25, completions: 89, hub: 'CREATOR' },
      { id: 3, title: 'Defend the Land Node', description: 'Buy a parcel in DeFi District', vxpReward: 100, voidReward: 5, completions: 34, hub: 'WORLD' },
      { id: 4, title: 'First Stake', description: 'Stake 100 VOID', vxpReward: 30, completions: 201, hub: 'DEFI' },
      { id: 5, title: 'DAO Initiate', description: 'Vote on your first proposal', vxpReward: 40, completions: 67, hub: 'DAO' },
    ] as Mission[],
  };

  const handleCreateMission = () => {
    // TODO: Wire to MissionRegistry.createMission()
    console.log('Create mission:', newMission);
    setShowCreateModal(false);
    setNewMission({ title: '', description: '', vxpReward: 0, voidReward: 0 });
  };

  if (!authenticated) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
        <div className="text-4xl mb-2">🎨</div>
        <div className="text-lg font-bold text-void-purple uppercase tracking-wider">Creator Hub</div>
        <div className="text-sm text-bio-silver/60 max-w-md">
          Connect with Privy to publish creator missions and earn from the network.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 font-mono text-sm space-y-6 text-bio-silver">
      {/* Header */}
      <div className="border-b border-bio-silver/30 pb-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-2">
          🎨 CREATOR HUB
        </div>
      </div>

      {/* Creator Status Card */}
      <div className="p-4 border border-void-purple/40 rounded-lg bg-black/40 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-bio-silver/60 uppercase tracking-wider">Creator Profile</div>
            <div className="text-lg font-bold text-void-purple">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-bio-silver/60">Creator Tier</div>
            <div className="text-lg font-bold text-signal-green">Level {mockCreatorData.level} – {mockCreatorData.rank}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-bio-silver/20">
          <div className="text-center">
            <div className="text-xl font-bold text-cyber-cyan">{mockCreatorData.totalMissions}</div>
            <div className="text-[0.65rem] text-bio-silver/60 uppercase">Missions</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-void-purple">{mockCreatorData.totalVXPAwarded}</div>
            <div className="text-[0.65rem] text-bio-silver/60 uppercase">vXP Awarded</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-signal-green">{mockCreatorData.missions.reduce((sum, m) => sum + m.completions, 0)}</div>
            <div className="text-[0.65rem] text-bio-silver/60 uppercase">Completions</div>
          </div>
        </div>
      </div>

      {/* Your Missions List */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60">Your Missions</div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1 bg-signal-green/20 border border-signal-green hover:bg-signal-green/30 rounded text-signal-green font-bold text-xs uppercase tracking-wider transition-all"
          >
            + Create Mission
          </button>
        </div>

        <div className="space-y-2">
          {mockCreatorData.missions.slice(0, 5).map((mission) => (
            <div key={mission.id} className="p-3 bg-black/40 border border-bio-silver/20 rounded hover:border-void-purple/40 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[0.75rem] font-bold text-void-purple">{mission.title}</div>
                  <div className="text-[0.65rem] text-bio-silver/60">{mission.description}</div>
                </div>
                <div className="text-[0.65rem] text-cyber-cyan px-2 py-0.5 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded">
                  {mission.hub}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-3 text-[0.7rem]">
                  <span className="text-signal-green">+{mission.vxpReward} vXP</span>
                  {mission.voidReward && <span className="text-void-purple">+{mission.voidReward} VOID</span>}
                </div>
                <div className="text-[0.7rem] text-bio-silver/60">
                  {mission.completions} completions
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Mission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-black/95 border border-void-purple/40 rounded-2xl shadow-[0_0_40px_rgba(124,0,255,0.4)]">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm uppercase tracking-[0.3em] text-void-purple">Create Mission</div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-bio-silver/60 hover:text-red-400 transition-colors text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-bio-silver/60 mb-1 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  value={newMission.title}
                  onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                  placeholder="Mission name..."
                  className="w-full px-3 py-2 bg-black/60 border border-bio-silver/30 rounded text-bio-silver text-sm focus:border-void-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-bio-silver/60 mb-1 uppercase tracking-wider">Description</label>
                <textarea
                  value={newMission.description}
                  onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                  placeholder="What must players do?"
                  rows={3}
                  className="w-full px-3 py-2 bg-black/60 border border-bio-silver/30 rounded text-bio-silver text-sm focus:border-void-purple focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-bio-silver/60 mb-1 uppercase tracking-wider">vXP Reward</label>
                  <input
                    type="number"
                    value={newMission.vxpReward}
                    onChange={(e) => setNewMission({ ...newMission, vxpReward: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-black/60 border border-bio-silver/30 rounded text-signal-green text-sm focus:border-signal-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-bio-silver/60 mb-1 uppercase tracking-wider">VOID Reward (optional)</label>
                  <input
                    type="number"
                    value={newMission.voidReward}
                    onChange={(e) => setNewMission({ ...newMission, voidReward: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-black/60 border border-bio-silver/30 rounded text-void-purple text-sm focus:border-void-purple focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-4 bg-black/60 border border-bio-silver/30 hover:border-bio-silver/60 rounded text-bio-silver font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMission}
                  disabled={!newMission.title || !newMission.vxpReward}
                  className="flex-1 py-2 px-4 bg-signal-green/20 border border-signal-green hover:bg-signal-green/30 rounded text-signal-green font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>

              <div className="p-2 bg-void-purple/10 border border-void-purple/30 rounded text-[0.65rem] text-bio-silver/60 text-center">
                ⚠️ Mission creation currently in beta (mock mode)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tools Section */}
      <div className="border-t border-bio-silver/30 pt-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">Creator Tools</div>
        <div className="space-y-2 text-[0.7rem] text-bio-silver/60">
          <div>→ <span className="text-cyber-cyan">Launch Creator Token</span> (Coming in Phase 3)</div>
          <div>→ <span className="text-void-purple">Enable Vault Payouts</span> (Royalty routing)</div>
          <div>→ <span className="text-signal-green">NFT Mintpad Integration</span> (ETA: Week 7)</div>
        </div>
      </div>
    </div>
  );
}
