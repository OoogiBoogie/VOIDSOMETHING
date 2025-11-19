'use client';

/**
 * INVENTORY TAB - Land deeds, artifacts, and cosmetics
 * Shows: owned parcels, artifacts, cosmetics, teleport actions
 * Live Reads: WorldLandTestnet.tokensOfOwner(address)
 */

import React, { useState } from 'react';
import { useAccount } from 'wagmi';


interface LandParcel {
  id: number;
  x: number;
  y: number;
  district: string;
  taxPerHour: number;
  rentPerHour: number;
}

interface Artifact {
  id: number;
  name: string;
  type: 'Consumable' | 'Equipment' | 'Key' | 'Lore';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  description: string;
}

interface Cosmetic {
  id: number;
  name: string;
  slot: 'Avatar' | 'Trail' | 'Emote' | 'Title';
  unlocked: boolean;
  equipped: boolean;
}

interface InventoryTabProps {
  onClose?: () => void;
}

export default function InventoryTab({ onClose }: InventoryTabProps) {
  
  const { address } = useAccount();
  const [activeSection, setActiveSection] = useState<'land' | 'artifacts' | 'cosmetics'>('land');

  // Mock land parcels - replace with WorldLandTestnet.tokensOfOwner(address)
  const mockLandParcels: LandParcel[] = [
    { id: 615, x: 20, y: 15, district: 'DeFi District', taxPerHour: 0.2, rentPerHour: 0.5 },
    { id: 742, x: 22, y: 18, district: 'DeFi District', taxPerHour: 0.2, rentPerHour: 0.4 },
    { id: 890, x: -5, y: 8, district: 'Creator Hub', taxPerHour: 0.1, rentPerHour: 0.3 },
    { id: 1024, x: 0, y: 0, district: 'DAO Plaza', taxPerHour: 0.15, rentPerHour: 0.8 },
    { id: 1520, x: 30, y: -12, district: 'AI Nexus', taxPerHour: 0.3, rentPerHour: 0.6 },
  ];

  // Mock artifacts - ready for backend integration
  const mockArtifacts: Artifact[] = [
    {
      id: 1,
      name: 'Signal Amplifier',
      type: 'Equipment',
      rarity: 'Rare',
      description: '+10% XP gain for 1 hour when equipped',
    },
    {
      id: 2,
      name: 'The Pact Fragment',
      type: 'Lore',
      rarity: 'Epic',
      description: 'A piece of the cipher. 1/12 collected.',
    },
    {
      id: 3,
      name: 'VOID Elixir',
      type: 'Consumable',
      rarity: 'Common',
      description: 'Restores 50 VOID instantly. Single use.',
    },
    {
      id: 4,
      name: 'District Access Key',
      type: 'Key',
      rarity: 'Legendary',
      description: 'Grants access to restricted DAO vault.',
    },
  ];

  // Mock cosmetics - ready for cosmetics unlock system
  const mockCosmetics: Cosmetic[] = [
    { id: 1, name: 'Neon Trail', slot: 'Trail', unlocked: true, equipped: true },
    { id: 2, name: 'Signal Avatar', slot: 'Avatar', unlocked: true, equipped: false },
    { id: 3, name: 'Wave Emote', slot: 'Emote', unlocked: true, equipped: false },
    { id: 4, name: 'Agent Title', slot: 'Title', unlocked: true, equipped: true },
    { id: 5, name: 'Cyber Halo', slot: 'Avatar', unlocked: false, equipped: false },
    { id: 6, name: 'Data Stream Trail', slot: 'Trail', unlocked: false, equipped: false },
  ];

  const handleTeleport = (parcelId: number, x: number, y: number) => {
    // TODO: Trigger worldEvents.emit('PLAYER_TELEPORT', { x, y })
    console.log(`Teleport to parcel ${parcelId} at (${x}, ${y})`);
  };

  const handleEquipCosmetic = (cosmeticId: number) => {
    // TODO: Send to backend cosmetics API
    console.log('Equip cosmetic:', cosmeticId);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-bio-silver';
      case 'Rare': return 'text-cyber-cyan';
      case 'Epic': return 'text-void-purple';
      case 'Legendary': return 'text-signal-green';
      default: return 'text-bio-silver';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'border-bio-silver/30';
      case 'Rare': return 'border-cyber-cyan/40';
      case 'Epic': return 'border-void-purple/40';
      case 'Legendary': return 'border-signal-green/40';
      default: return 'border-bio-silver/20';
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
        <div className="text-4xl mb-2">🎒</div>
        <div className="text-lg font-bold text-cyber-cyan uppercase tracking-wider">Inventory & Assets</div>
        <div className="text-sm text-bio-silver/60 max-w-md">
          Connect with Privy to view your land deeds, artifacts, and cosmetics.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 font-mono text-sm space-y-6 text-bio-silver">
      {/* Header */}
      <div className="border-b border-bio-silver/30 pb-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-2">
          🎒 YOUR INVENTORY
        </div>
        <div className="text-[0.7rem] text-bio-silver/50">
          Address: {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveSection('land')}
          className={`flex-1 py-2 px-3 rounded font-bold text-[0.7rem] uppercase tracking-wider transition-all ${
            activeSection === 'land'
              ? 'bg-signal-green/30 border border-signal-green text-signal-green shadow-[0_0_10px_rgba(0,255,127,0.3)]'
              : 'bg-black/40 border border-bio-silver/20 text-bio-silver/60 hover:text-bio-silver'
          }`}
        >
          Land Deeds ({mockLandParcels.length})
        </button>
        <button
          onClick={() => setActiveSection('artifacts')}
          className={`flex-1 py-2 px-3 rounded font-bold text-[0.7rem] uppercase tracking-wider transition-all ${
            activeSection === 'artifacts'
              ? 'bg-void-purple/30 border border-void-purple text-void-purple shadow-[0_0_10px_rgba(124,0,255,0.3)]'
              : 'bg-black/40 border border-bio-silver/20 text-bio-silver/60 hover:text-bio-silver'
          }`}
        >
          Artifacts ({mockArtifacts.length})
        </button>
        <button
          onClick={() => setActiveSection('cosmetics')}
          className={`flex-1 py-2 px-3 rounded font-bold text-[0.7rem] uppercase tracking-wider transition-all ${
            activeSection === 'cosmetics'
              ? 'bg-cyber-cyan/30 border border-cyber-cyan text-cyber-cyan shadow-[0_0_10px_rgba(0,255,255,0.3)]'
              : 'bg-black/40 border border-bio-silver/20 text-bio-silver/60 hover:text-bio-silver'
          }`}
        >
          Cosmetics ({mockCosmetics.filter(c => c.unlocked).length}/{mockCosmetics.length})
        </button>
      </div>

      {/* Land Deeds Section */}
      {activeSection === 'land' && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {mockLandParcels.length === 0 ? (
            <div className="p-6 text-center text-bio-silver/60 text-sm">
              No land owned. Visit the Land tab to purchase parcels.
            </div>
          ) : (
            mockLandParcels.map((parcel) => (
              <div
                key={parcel.id}
                className="p-4 bg-black/40 border border-signal-green/40 rounded hover:border-signal-green/60 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-[0.75rem] font-bold text-signal-green mb-1">
                      Parcel #{parcel.id}
                    </div>
                    <div className="text-[0.65rem] text-bio-silver/60">
                      Coordinates: ({parcel.x}, {parcel.y})
                    </div>
                    <div className="text-[0.65rem] text-cyber-cyan mt-1">{parcel.district}</div>
                  </div>
                  <button
                    onClick={() => handleTeleport(parcel.id, parcel.x, parcel.y)}
                    className="py-1.5 px-3 bg-signal-green/20 border border-signal-green hover:bg-signal-green/30 rounded text-signal-green font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Teleport
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[0.7rem]">
                  <div className="p-2 bg-black/40 border border-bio-silver/20 rounded">
                    <div className="text-bio-silver/60 text-[0.6rem]">Tax/Hour</div>
                    <div className="text-void-purple font-bold">{parcel.taxPerHour} VOID</div>
                  </div>
                  <div className="p-2 bg-black/40 border border-bio-silver/20 rounded">
                    <div className="text-bio-silver/60 text-[0.6rem]">Rent/Hour</div>
                    <div className="text-signal-green font-bold">{parcel.rentPerHour} VOID</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Artifacts Section */}
      {activeSection === 'artifacts' && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {mockArtifacts.length === 0 ? (
            <div className="p-6 text-center text-bio-silver/60 text-sm">
              No artifacts found. Complete missions to discover artifacts.
            </div>
          ) : (
            mockArtifacts.map((artifact) => (
              <div
                key={artifact.id}
                className={`p-4 bg-black/40 border rounded hover:border-opacity-60 transition-all ${getRarityBorder(artifact.rarity)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[0.75rem] font-bold ${getRarityColor(artifact.rarity)}`}>
                        {artifact.name}
                      </span>
                      <span className="text-[0.6rem] px-2 py-0.5 bg-black/60 border border-bio-silver/30 rounded text-bio-silver/60">
                        {artifact.type}
                      </span>
                    </div>
                    <div className="text-[0.65rem] text-bio-silver/60 mb-2">
                      {artifact.description}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-[0.7rem] font-bold uppercase tracking-wider ${getRarityColor(artifact.rarity)}`}>
                    {artifact.rarity}
                  </span>
                  {artifact.type === 'Equipment' && (
                    <button className="py-1 px-3 bg-void-purple/20 border border-void-purple hover:bg-void-purple/30 rounded text-void-purple font-bold text-xs uppercase tracking-wider transition-all">
                      Equip
                    </button>
                  )}
                  {artifact.type === 'Consumable' && (
                    <button className="py-1 px-3 bg-signal-green/20 border border-signal-green hover:bg-signal-green/30 rounded text-signal-green font-bold text-xs uppercase tracking-wider transition-all">
                      Use
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Cosmetics Section */}
      {activeSection === 'cosmetics' && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {mockCosmetics.map((cosmetic) => (
            <div
              key={cosmetic.id}
              className={`p-4 bg-black/40 border rounded transition-all ${
                cosmetic.unlocked
                  ? cosmetic.equipped
                    ? 'border-cyber-cyan/40 bg-cyber-cyan/10'
                    : 'border-bio-silver/20 hover:border-bio-silver/40'
                  : 'border-bio-silver/10 opacity-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[0.75rem] font-bold ${cosmetic.unlocked ? 'text-cyber-cyan' : 'text-bio-silver/40'}`}>
                      {cosmetic.unlocked ? cosmetic.name : '???'}
                    </span>
                    <span className="text-[0.6rem] px-2 py-0.5 bg-black/60 border border-bio-silver/30 rounded text-bio-silver/60">
                      {cosmetic.slot}
                    </span>
                  </div>
                  {cosmetic.equipped && (
                    <div className="text-[0.65rem] text-cyber-cyan">✓ Currently Equipped</div>
                  )}
                  {!cosmetic.unlocked && (
                    <div className="text-[0.65rem] text-bio-silver/40">🔒 Locked - Complete missions to unlock</div>
                  )}
                </div>

                {cosmetic.unlocked && !cosmetic.equipped && (
                  <button
                    onClick={() => handleEquipCosmetic(cosmetic.id)}
                    className="py-1.5 px-3 bg-cyber-cyan/20 border border-cyber-cyan hover:bg-cyber-cyan/30 rounded text-cyber-cyan font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Equip
                  </button>
                )}
                {cosmetic.unlocked && cosmetic.equipped && (
                  <button
                    onClick={() => handleEquipCosmetic(cosmetic.id)}
                    className="py-1.5 px-3 bg-black/60 border border-bio-silver/30 hover:bg-black/80 rounded text-bio-silver/60 font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Unequip
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Stats */}
      <div className="border-t border-bio-silver/30 pt-4">
        <div className="grid grid-cols-3 gap-3 text-center text-[0.7rem]">
          <div>
            <div className="text-signal-green font-bold">{mockLandParcels.length}</div>
            <div className="text-bio-silver/60">Parcels Owned</div>
          </div>
          <div>
            <div className="text-void-purple font-bold">{mockArtifacts.length}</div>
            <div className="text-bio-silver/60">Artifacts</div>
          </div>
          <div>
            <div className="text-cyber-cyan font-bold">
              {mockCosmetics.filter(c => c.unlocked).length}/{mockCosmetics.length}
            </div>
            <div className="text-bio-silver/60">Cosmetics</div>
          </div>
        </div>
      </div>
    </div>
  );
}
