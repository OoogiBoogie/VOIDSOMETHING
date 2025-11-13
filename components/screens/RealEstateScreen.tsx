"use client";

import React, { useState } from 'react';
import { ChromePanel, ChromeButton } from '@/components/ui/chrome-panel';
import { Building2, Home, Key, TrendingUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMyParcels } from '@/services/world/useParcels';
import { useParcelProperties } from '@/services/world/useRealEstate';
import { DISTRICT_NAMES } from '@/world/WorldCoords';
import { useAccount } from 'wagmi';

/**
 * REAL ESTATE SCREEN
 * Property management: parcels, buildings, units, leases
 */

type RealEstateTab = 'parcels' | 'buildings' | 'units' | 'leases';

export function RealEstateScreen() {
  const [activeTab, setActiveTab] = useState<RealEstateTab>('parcels');

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-2 p-4 border-b border-[#00f0ff]/20 bg-black/40">
        <ChromeButton
          variant={activeTab === 'parcels' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('parcels')}
        >
          <Home className="w-4 h-4 mr-2" />
          My Parcels
        </ChromeButton>
        <ChromeButton
          variant={activeTab === 'buildings' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('buildings')}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Buildings
        </ChromeButton>
        <ChromeButton
          variant={activeTab === 'units' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('units')}
        >
          <Key className="w-4 h-4 mr-2" />
          Units
        </ChromeButton>
        <ChromeButton
          variant={activeTab === 'leases' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('leases')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Leases
        </ChromeButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'parcels' && <ParcelsView />}
        {activeTab === 'buildings' && <BuildingsView />}
        {activeTab === 'units' && <UnitsView />}
        {activeTab === 'leases' && <LeasesView />}
      </div>
    </div>
  );
}

// View Components
function ParcelsView() {
  const { address } = useAccount();
  const { ownedParcels, isLoading } = useMyParcels();
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold font-orbitron text-white">
          My Land Parcels
        </h3>
        <ChromePanel variant="glass" className="p-8 text-center">
          <p className="text-white/60">Loading parcels...</p>
        </ChromePanel>
      </div>
    );
  }
  
  if (!address || ownedParcels.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-orbitron text-white">
            My Land Parcels
          </h3>
          <ChromeButton>
            <Plus className="w-4 h-4 mr-2" />
            Browse Marketplace
          </ChromeButton>
        </div>

        <ChromePanel variant="glass" className="p-8 text-center">
          <Home className="w-16 h-16 mx-auto mb-4 text-white/30" />
          <h4 className="text-lg font-semibold text-white mb-2">
            No Parcels Owned
          </h4>
          <p className="text-sm text-white/60 mb-4">
            Start your VOID journey by acquiring your first parcel
          </p>
          <ChromeButton>
            Explore Available Land
          </ChromeButton>
        </ChromePanel>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-orbitron text-white">
          My Land Parcels ({ownedParcels.length})
        </h3>
        <ChromeButton>
          <Plus className="w-4 h-4 mr-2" />
          Browse Marketplace
        </ChromeButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ownedParcels.map(parcel => (
          <ParcelCard key={parcel.id} parcel={parcel} />
        ))}
      </div>
    </div>
  );
}

function ParcelCard({ parcel }: { parcel: any }) {
  const properties = useParcelProperties(parcel.id);
  
  return (
    <ChromePanel variant="glass" className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-lg font-bold text-white">
            Parcel #{parcel.id}
          </h4>
          <p className="text-xs text-white/60">
            {DISTRICT_NAMES[parcel.districtId as keyof typeof DISTRICT_NAMES]} • ({parcel.x}, {parcel.z})
          </p>
        </div>
        <div className="px-2 py-1 rounded bg-[#00f0ff]/20 text-[#00f0ff] text-xs font-mono">
          OWNED
        </div>
      </div>
      
      {properties.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-white/60 uppercase tracking-wider">
            Buildings ({properties.length})
          </p>
          {properties.map(prop => (
            <div
              key={prop.building.id}
              className="flex items-center justify-between p-2 rounded bg-black/40"
            >
              <span className="text-sm text-white">{prop.building.id}</span>
              <span className="text-xs text-[#00ff9d] font-mono">
                {prop.isOwned ? 'OWNED' : `${prop.listingPrice} VOID`}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <Building2 className="w-8 h-8 mx-auto mb-2 text-white/20" />
          <p className="text-xs text-white/40">No buildings yet</p>
          <ChromeButton variant="ghost" className="mt-2 text-xs">
            Construct Building
          </ChromeButton>
        </div>
      )}
    </ChromePanel>
  );
}

function BuildingsView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-orbitron text-white">
          My Buildings
        </h3>
        <ChromeButton>
          <Plus className="w-4 h-4 mr-2" />
          Construct Building
        </ChromeButton>
      </div>

      <ChromePanel variant="glass" className="p-8 text-center">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-white/30" />
        <h4 className="text-lg font-semibold text-white mb-2">
          No Buildings Yet
        </h4>
        <p className="text-sm text-white/60 mb-4">
          Purchase land first, then construct your building
        </p>
      </ChromePanel>
    </div>
  );
}

function UnitsView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-orbitron text-white">
          Leasable Units
        </h3>
        <ChromeButton>
          <Plus className="w-4 h-4 mr-2" />
          Create Unit
        </ChromeButton>
      </div>

      <ChromePanel variant="glass" className="p-8 text-center">
        <Key className="w-16 h-16 mx-auto mb-4 text-white/30" />
        <h4 className="text-lg font-semibold text-white mb-2">
          No Units Available
        </h4>
        <p className="text-sm text-white/60 mb-4">
          Build a building and subdivide it into leasable units
        </p>
      </ChromePanel>
    </div>
  );
}

function LeasesView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-orbitron text-white">
          Active Leases
        </h3>
        <ChromeButton>
          View Revenue
        </ChromeButton>
      </div>

      <ChromePanel variant="glass" className="p-8 text-center">
        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-white/30" />
        <h4 className="text-lg font-semibold text-white mb-2">
          No Active Leases
        </h4>
        <p className="text-sm text-white/60 mb-4">
          Create units and lease them to tenants to generate passive income
        </p>
      </ChromePanel>
    </div>
  );
}
