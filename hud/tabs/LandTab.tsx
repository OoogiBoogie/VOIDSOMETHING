'use client';

/**
 * LAND TAB - Land ownership, parcels, districts
 * Shows: current parcel, district info, owned land, economy
 * Actions: transfer, list on market, open map
 */

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';

import { useWorldEvent, PLAYER_MOVED, PARCEL_ENTERED } from '@/services/events/worldEvents';
import { cityWorldToParcel, getDistrict } from '@/world/WorldCoords';
import type { DistrictId } from '@/world/map/districts';

const WORLD_LAND = "0xC4559144b784A8991924b1389a726d68C910A206" as const;

interface LandTabProps {
  onClose?: () => void;
}

interface CurrentParcelData {
  x: number;
  z: number;
  parcelId: number;
  district: DistrictId;
}

export default function LandTab({ onClose }: LandTabProps) {
  
  const { address } = useAccount();
  const [currentParcel, setCurrentParcel] = useState<CurrentParcelData | null>(null);

  // Live ownerOf read
  const { data, error } = useReadContract({
    address: WORLD_LAND,
    abi: [
      { type: "function", name: "ownerOf", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "address" }] }
    ],
    functionName: "ownerOf",
    args: currentParcel !== null ? [BigInt(currentParcel.parcelId)] : undefined,
    query: { enabled: currentParcel !== null },
  });

  const [owner, setOwner] = useState<string | null>(null);

  useEffect(() => {
    if (error) setOwner(null);           // treat revert as unowned
    else if (data) setOwner(String(data));
  }, [data, error]);

  // Listen to player movement events
  useWorldEvent(PLAYER_MOVED, (eventData) => {
    const parcelCoords = cityWorldToParcel(eventData.position);
    const parcelId = eventData.parcelId;
    const district = getDistrict(parcelCoords);

    setCurrentParcel({
      x: parcelCoords.x,
      z: parcelCoords.z,
      parcelId,
      district,
    });
  }, []);

  useWorldEvent(PARCEL_ENTERED, (eventData) => {
    const parcelId = eventData.parcelInfo.id;
    const district = getDistrict(eventData.parcelInfo.coords);

    setCurrentParcel({
      x: eventData.parcelInfo.coords.x,
      z: eventData.parcelInfo.coords.z,
      parcelId,
      district,
    });
  }, []);

  // Helper functions
  const getDistrictName = (district: DistrictId): string => {
    const names: Record<DistrictId, string> = {
      HQ: 'PSX HQ',
      DEFI: 'DeFi District',
      CREATOR: 'Creator Quarter',
      DAO: 'DAO Plaza',
      AI: 'AI Nexus',
      SOCIAL: 'Social District',
      IDENTITY: 'Identity District',
      CENTRAL_EAST: 'Central East',
      CENTRAL_SOUTH: 'Central South',
    };
    return names[district] || 'Unknown Zone';
  };

  const getDistrictColor = (district: DistrictId): string => {
    const colors: Record<DistrictId, string> = {
      HQ: 'var(--void-text-tertiary)',
      DEFI: 'var(--void-neon-purple)',
      CREATOR: 'var(--void-neon-teal)',
      DAO: 'var(--void-neon-pink)',
      AI: 'var(--void-neon-blue)',
      SOCIAL: '#ff9d00',
      IDENTITY: '#00ff88',
      CENTRAL_EAST: 'var(--void-text-muted)',
      CENTRAL_SOUTH: 'var(--void-text-muted)',
    };
    return colors[district] || 'var(--void-text-tertiary)';
  };

  const getOwnershipStatus = (): { text: string; color: string; isOwned: boolean } => {
    if (!owner) {
      return { text: 'Unowned', color: 'var(--void-text-muted)', isOwned: false };
    }
    if (address && owner.toLowerCase() === address.toLowerCase()) {
      return { text: 'Owned by You 🟢', color: 'var(--void-accent-positive)', isOwned: true };
    }
    return {
      text: `Owned by ${owner.slice(0, 6)}...${owner.slice(-4)}`,
      color: 'var(--void-text-secondary)',
      isOwned: false,
    };
  };

  // Mock data for economy/districts (live data from contracts would require additional reads)
  const mockData = {
    economy: {
      landTax: 0.2,
      rentIncome: 0.5,
      totalOwned: 12,
      districtBonus: 1.2,
    },
    districts: [
      { name: 'DeFi District', ownership: 94, type: 'Active Yield Hubs (High APR)' },
      { name: 'Creator District', ownership: 72, type: 'NFT + mission-based XP farms' },
      { name: 'DAO District', ownership: 61, type: 'Governance-proposal area' },
      { name: 'AI District', ownership: 47, type: 'Training and computation nodes' },
    ],
    topHolders: [
      { address: '0x9b1E...', parcels: 32 },
      { address: '0x472C...', parcels: 18 },
      { address: 'YOU', parcels: 12 },
    ],
  };

  const ownershipStatus = getOwnershipStatus();
  const districtName = currentParcel ? getDistrictName(currentParcel.district) : 'Unknown';
  const districtColor = currentParcel ? getDistrictColor(currentParcel.district) : 'var(--void-text-tertiary)';

  if (!currentParcel) {
    return (
      <div className="p-6 font-mono text-sm space-y-6 text-bio-silver flex flex-col items-center justify-center h-full text-center">
        <div className="text-4xl mb-2">📍</div>
        <div className="text-lg font-bold text-void-purple uppercase tracking-wider">Land Tracking</div>
        <div className="text-sm text-bio-silver/60 max-w-md">
          Move your avatar to track parcel ownership.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 font-mono text-sm space-y-6 text-bio-silver">
      {/* Header */}
      <div className="border-b border-bio-silver/30 pb-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-2">
          📍 CURRENT PARCEL
        </div>
      </div>

      {/* Parcel Info */}
      <div className="p-4 border rounded-lg bg-black/40 space-y-3" style={{ borderColor: districtColor + '66' }}>
        <div className="text-[0.7rem] space-y-2">
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Location:</span>
            <span className="text-cyber-cyan font-bold">({currentParcel.x}, {currentParcel.z})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Parcel ID:</span>
            <span className="text-signal-green">{currentParcel.parcelId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">District:</span>
            <span className="font-bold" style={{ color: districtColor }}>{districtName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Owner:</span>
            <span className="text-bio-silver">{owner ? `${owner.slice(0, 10)}...` : 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bio-silver/60">Status:</span>
            <span style={{ color: ownershipStatus.color }}>
              {ownershipStatus.text}
            </span>
          </div>
        </div>
      </div>

      {/* Economy */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">Economy:</div>
        <div className="space-y-2 text-[0.7rem]">
          <div className="flex justify-between items-center p-2 bg-black/40 rounded border border-bio-silver/20">
            <span className="text-bio-silver/60">Land Tax:</span>
            <span className="text-red-400">{mockData.economy.landTax} VOID/hr (burned)</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/40 rounded border border-bio-silver/20">
            <span className="text-bio-silver/60">Rent Income:</span>
            <span className="text-signal-green">+{mockData.economy.rentIncome} VOID/hr</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/40 rounded border border-bio-silver/20">
            <span className="text-bio-silver/60">Total Owned:</span>
            <span className="text-cyber-cyan">{mockData.economy.totalOwned} Parcels</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/40 rounded border border-void-purple/40">
            <span className="text-bio-silver/60">District Bonuses:</span>
            <span className="text-void-purple">+{mockData.economy.districtBonus}% yield</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button className="py-2 px-3 bg-cyber-cyan/20 border border-cyber-cyan hover:bg-cyber-cyan/30 rounded text-cyber-cyan font-bold text-xs uppercase tracking-wider transition-all">
          Map
        </button>
        <button 
          disabled={!isConnected}
          className="py-2 px-3 bg-void-purple/20 border border-void-purple hover:bg-void-purple/30 rounded text-void-purple font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
        >
          Transfer
        </button>
        <button 
          disabled={!isConnected}
          className="py-2 px-3 bg-signal-green/20 border border-signal-green hover:bg-signal-green/30 rounded text-signal-green font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
        >
          List
        </button>
      </div>

      {/* District Grid */}
      <div className="border-t border-bio-silver/30 pt-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">🗺 DISTRICT GRID</div>
        <div className="space-y-2">
          {mockData.districts.map((district, i) => (
            <div key={i} className="p-3 bg-black/40 border border-bio-silver/20 rounded hover:border-void-purple/40 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[0.75rem] font-bold text-void-purple">{district.name}</span>
                <span className="text-[0.7rem] text-signal-green">{district.ownership}% owned</span>
              </div>
              <div className="h-1 bg-black/60 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-void-purple to-cyber-cyan"
                  style={{ width: `${district.ownership}%` }}
                />
              </div>
              <div className="text-[0.65rem] text-bio-silver/60">{district.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Economy Nodes */}
      <div className="border-t border-bio-silver/30 pt-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">Economy Nodes:</div>
        <div className="space-y-1 text-[0.7rem] text-bio-silver/80">
          <div>- <span className="text-void-purple">DeFi:</span> staking yields, liquidity routing</div>
          <div>- <span className="text-cyber-cyan">Creator:</span> mint economy</div>
          <div>- <span className="text-psx-blue">DAO:</span> proposal region</div>
          <div>- <span className="text-signal-green">AI:</span> cipher + signal bonuses</div>
        </div>
      </div>

      {/* Top Holders */}
      <div className="border-t border-bio-silver/30 pt-4">
        <div className="text-xs uppercase tracking-[0.3em] text-bio-silver/60 mb-3">Top Holders:</div>
        <div className="space-y-1 text-[0.7rem]">
          {mockData.topHolders.map((holder, i) => (
            <div key={i} className="flex justify-between items-center p-2 bg-black/40 rounded">
              <span className="text-bio-silver">{i + 1}. {holder.address}</span>
              <span className="text-cyber-cyan font-bold">{holder.parcels} parcels</span>
            </div>
          ))}
        </div>
      </div>

      {!isConnected && (
        <div className="p-3 bg-red-500/10 border border-red-500/40 rounded text-center text-[0.7rem] text-red-400">
          ⚠️ Connect wallet to manage land
        </div>
      )}
    </div>
  );
}
