/**
 * Global Land Inventory
 * Browse all 1,600 genesis parcels with filters, search, and multiple views
 * Xbox/PS1/Opium aesthetic with Chrome panels and CRT overlay
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useParcelsPage, useMyParcels, useParcelFilters } from '../../lib/land/hooks';
import { landRegistryAPI } from '../../lib/land/registry-api';
import { Parcel, ZoneType, ParcelStatus, LicenseType, TierType, DistrictType } from '../../lib/land/types';
import { formatEther } from 'viem';
import { ChromePanel, ChromeHeader, ChromeStat, ChromeButton } from '../ui/chrome-panel';
import { CRTOverlay } from '../ui/crt-overlay';
import { PS1MemoryCardView } from './ps1-memory-card-view';
import { X } from 'lucide-react';

type ViewMode = 'table' | 'grid' | 'map' | 'memory-card';

interface GlobalLandInventoryProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function GlobalLandInventory({ isOpen = true, onClose }: GlobalLandInventoryProps = {}) {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [crtEnabled, setCrtEnabled] = useState(true);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(500);

  const { parcels, isLoading, error, totalPages, totalParcels } = useParcelsPage(page, pageSize);
  const { parcelIds: myParcelIds } = useMyParcels() as { parcelIds: string[] };
  
  const { filters, setFilters, filteredParcels, statistics } = useParcelFilters(parcels);

  if (!isOpen) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <CRTOverlay enabled={crtEnabled} intensity={0.5} />
        <ChromePanel variant="liquid" className="w-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-cyan-400 mx-auto mb-4"></div>
            <ChromeHeader size="md" color="blue">LOADING</ChromeHeader>
            <p className="text-gray-400 font-mono uppercase tracking-wider">1,600 Genesis Parcels...</p>
          </div>
        </ChromePanel>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <CRTOverlay enabled={crtEnabled} intensity={0.5} />
        <ChromePanel variant="solid" className="w-96">
          <ChromeHeader size="md" color="red">ERROR</ChromeHeader>
          <p className="text-red-400 font-mono">{error.message}</p>
        </ChromePanel>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-auto">
      {/* CRT Overlay */}
      <CRTOverlay enabled={crtEnabled} intensity={0.5} />

      {/* Header */}
      <div className="border-b border-cyan-500/30 bg-black/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <ChromeHeader size="lg" color="purple">LAND REGISTRY</ChromeHeader>
              <p className="text-cyan-400 font-mono uppercase tracking-wider text-sm">
                VOID-GENESIS // 40×40 GRID // 1,600 PARCELS
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCrtEnabled(!crtEnabled)}
                className={`
                  px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider
                  transition-all duration-200
                  ${crtEnabled 
                    ? 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)]' 
                    : 'bg-white/5 text-gray-400 border-2 border-gray-600 hover:border-gray-500'
                  }
                `}
              >
                CRT: {crtEnabled ? 'ON' : 'OFF'}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500 rounded-lg text-red-400 hover:text-red-300 transition-colors shadow-[0_0_20px_rgba(255,0,50,0.3)]"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="container mx-auto px-4 py-6">
        <ChromePanel variant="liquid" glow={true}>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <ChromeStat label="TOTAL PARCELS" value={statistics.total} color="blue" />
            <ChromeStat label="FOR SALE" value={statistics.forSale} color="green" />
            <ChromeStat label="OWNED" value={statistics.owned} color="purple" />
            <ChromeStat label="WITH HOUSES" value={statistics.withHouses} color="pink" />
            <ChromeStat label="WITH BUSINESS" value={statistics.withBusinesses} color="red" />
            <ChromeStat label="PAGE" value={`${page}/${totalPages}`} color="blue" />
          </div>
        </ChromePanel>

        {/* Filters */}
        <ChromePanel variant="glass" glow={true} className="mt-6">
          <ChromeHeader size="sm" color="blue">FILTERS</ChromeHeader>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Zone Filter */}
            <div>
              <label className="block text-xs text-cyan-400 mb-2 uppercase tracking-wider font-mono">Zone</label>
              <select 
                className="w-full bg-black/50 border-2 border-cyan-500/30 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none transition-colors"
                value={filters.zone ?? ''}
                onChange={(e) => setFilters({ ...filters, zone: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">All Zones</option>
                <option value={ZoneType.PUBLIC}>Public (100 VOID)</option>
                <option value={ZoneType.RESIDENTIAL}>Residential (200 VOID)</option>
                <option value={ZoneType.COMMERCIAL}>Commercial (300 VOID)</option>
                <option value={ZoneType.PREMIUM}>Premium (500 VOID)</option>
                <option value={ZoneType.GLIZZY_WORLD}>Glizzy World (1000 VOID)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs text-cyan-400 mb-2 uppercase tracking-wider font-mono">Status</label>
              <select 
                className="w-full bg-black/50 border-2 border-cyan-500/30 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none transition-colors"
                value={filters.status ?? ''}
                onChange={(e) => setFilters({ ...filters, status: (e.target.value || null) as ParcelStatus | null })}
              >
                <option value="">All Status</option>
                <option value={ParcelStatus.FOR_SALE}>For Sale</option>
                <option value={ParcelStatus.OWNED}>Owned</option>
                <option value={ParcelStatus.DAO_OWNED}>DAO Owned</option>
              </select>
            </div>

            {/* Search by ID */}
            <div>
              <label className="block text-xs text-cyan-400 mb-2 uppercase tracking-wider font-mono">Search ID</label>
              <input 
                type="number"
                placeholder="0-1599"
                className="w-full bg-black/50 border-2 border-cyan-500/30 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none transition-colors"
                value={filters.searchId ?? ''}
                onChange={(e) => setFilters({ ...filters, searchId: e.target.value ? Number(e.target.value) : null })}
              />
            </div>

            {/* Quick Filters */}
            <div>
              <label className="block text-xs text-cyan-400 mb-2 uppercase tracking-wider font-mono">Quick</label>
              <div className="flex gap-2">
                <ChromeButton
                  variant="ghost"
                  className="!px-3 !py-2 !text-xs"
                  onClick={() => setFilters({ ...filters, hasHouse: true })}
                >
                  HOUSES
                </ChromeButton>
                <ChromeButton
                  variant="ghost"
                  className="!px-3 !py-2 !text-xs"
                  onClick={() => setFilters({ ...filters, hasLicense: true })}
                >
                  LICENSE
                </ChromeButton>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4">
            <ChromeButton
              variant="primary"
              onClick={() => setFilters({ zone: null, status: null, owner: null, searchId: null, hasHouse: null, hasLicense: null })}
            >
              CLEAR FILTERS
            </ChromeButton>
          </div>
        </ChromePanel>

        {/* Pagination Controls */}
        <ChromePanel variant="glass" glow={false} className="mt-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs text-cyan-400 uppercase tracking-wider font-mono">Page Size:</label>
              <select
                className="bg-black/50 border-2 border-cyan-500/30 rounded-lg px-3 py-1 text-sm font-mono text-white focus:border-cyan-400 focus:outline-none transition-colors"
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[100,250,500,1000].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <ChromeButton
              variant="ghost"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="!px-3 !py-2"
            >
              PREV
            </ChromeButton>
            <span className="text-sm text-cyan-300 font-mono">PAGE {page} / {totalPages}</span>
            <ChromeButton
              variant="ghost"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="!px-3 !py-2"
            >
              NEXT
            </ChromeButton>
          </div>
          <div className="text-xs text-cyan-400 font-mono">
            Showing {(page-1)*pageSize + 1}-{Math.min(page*pageSize,totalParcels)} of {totalParcels}
          </div>
          </div>
        </ChromePanel>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-4">
          <ChromeButton
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            onClick={() => setViewMode('table')}
            className="!px-4 !py-2"
          >
            TABLE
          </ChromeButton>
          <ChromeButton
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            onClick={() => setViewMode('grid')}
            className="!px-4 !py-2"
          >
            GRID
          </ChromeButton>
          <ChromeButton
            variant={viewMode === 'map' ? 'secondary' : 'ghost'}
            onClick={() => setViewMode('map')}
            className="!px-4 !py-2"
          >
            MAP
          </ChromeButton>
          <ChromeButton
            variant={viewMode === 'memory-card' ? 'secondary' : 'ghost'}
            onClick={() => setViewMode('memory-card')}
            className="!px-4 !py-2"
          >
            PS1 MEMORY
          </ChromeButton>
        </div>

        {/* Content */}
        {viewMode === 'memory-card' && (
          <PS1MemoryCardView
            parcels={filteredParcels}
            onSelectParcel={setSelectedParcel}
          />
        )}
        
        {viewMode === 'table' && (
          <ParcelTableView 
            parcels={filteredParcels} 
            myParcelIds={myParcelIds}
            onSelectParcel={setSelectedParcel}
            page={page}
            pageSize={pageSize}
          />
        )}
        {viewMode === 'grid' && (
          <ParcelGridView 
            parcels={filteredParcels}
            onSelectParcel={setSelectedParcel}
          />
        )}
        {viewMode === 'map' && (
          <ParcelMapView 
            parcels={filteredParcels}
            onSelectParcel={setSelectedParcel}
          />
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-6 p-4">
          <ChromeButton
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="!px-4 !py-2"
          >
            ← PREVIOUS
          </ChromeButton>
          <div className="flex items-center gap-2">
            <span className="text-cyan-300 font-mono">
              PAGE {page} OF {totalPages}
            </span>
            <span className="text-cyan-300/50 text-sm font-mono">
              ({statistics.total} PARCELS)
            </span>
          </div>
          <ChromeButton
            variant="secondary"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="!px-4 !py-2"
          >
            NEXT →
          </ChromeButton>
        </div>
      </div>

      {/* Parcel Detail Panel */}
      {selectedParcel && (
        <ParcelDetailPanel 
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    cyan: 'border-cyan-500/30 text-cyan-400',
    green: 'border-green-500/30 text-green-400',
    blue: 'border-blue-500/30 text-blue-400',
    purple: 'border-purple-500/30 text-purple-400',
    amber: 'border-amber-500/30 text-amber-400'
  };

  return (
    <div className={`bg-slate-900/50 border ${colors[color as keyof typeof colors]} rounded-lg p-4`}>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      <div className="text-sm opacity-70">{label}</div>
    </div>
  );
}

function ParcelTableView({ 
  parcels, 
  myParcelIds,
  onSelectParcel,
  page,
  pageSize
}: { 
  parcels: Parcel[]; 
  myParcelIds: string[];
  onSelectParcel: (parcel: Parcel) => void;
  page: number;
  pageSize: number;
}) {
  return (
    <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-cyan-400">ID</th>
              <th className="px-4 py-3 text-left text-cyan-400">Coords</th>
              <th className="px-4 py-3 text-left text-cyan-400">Zone</th>
              <th className="px-4 py-3 text-left text-cyan-400">Price</th>
              <th className="px-4 py-3 text-left text-cyan-400">Status</th>
              <th className="px-4 py-3 text-left text-cyan-400">Owner</th>
              <th className="px-4 py-3 text-left text-cyan-400">Features</th>
              <th className="px-4 py-3 text-left text-cyan-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map((parcel) => {
              const isMyParcel = myParcelIds.includes(parcel.parcelId);
              return (
                <tr 
                  key={parcel.parcelId} 
                  className={`border-t border-slate-700 hover:bg-slate-800/50 cursor-pointer ${isMyParcel ? 'bg-cyan-900/20' : ''}`}
                  onClick={() => onSelectParcel(parcel)}
                >
                  <td className="px-4 py-3">#{parcel.parcelId}</td>
                  <td className="px-4 py-3 text-cyan-300">({parcel.gridX}, {parcel.gridY})</td>
                  <td className="px-4 py-3">
                    <span className={getZoneColor(parcel.zone)}>
                      {landRegistryAPI.getZoneName(parcel.zone)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-green-400 font-mono">{formatEther(parcel.basePrice)} VOID</td>
                  <td className="px-4 py-3">
                    <span className={getStatusColor(parcel.status)}>
                      {parcel.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">
                    {parcel.owner ? `${parcel.owner.slice(0, 6)}...${parcel.owner.slice(-4)}` : 'None'}
                    {isMyParcel && <span className="ml-2 text-cyan-400">(You)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {parcel.hasHouse && <span className="text-purple-400 text-xs">🏠</span>}
                      {parcel.businessLicense !== LicenseType.NONE && (
                        <span className="text-amber-400 text-xs">
                          {landRegistryAPI.getLicenseName(parcel.businessLicense)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-sm">
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-4 text-center text-cyan-300 text-xs">
        Page {page} showing {parcels.length} parcels (page size {pageSize})
      </div>
    </div>
  );
}

function ParcelGridView({ parcels, onSelectParcel }: { parcels: Parcel[]; onSelectParcel: (parcel: Parcel) => void }) {
  return (
    <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4">
      <div className="grid grid-cols-40 gap-1">
        {Array.from({ length: 40 }, (_, y) => 
          Array.from({ length: 40 }, (_, x) => {
            const parcelId = `VOID-GENESIS-${y * 40 + x}`;
            const parcel = parcels.find(p => p.parcelId === parcelId);
            
            return (
              <div
                key={parcelId}
                className={`aspect-square cursor-pointer hover:scale-110 transition-transform ${getGridCellColor(parcel)}`}
                onClick={() => parcel && onSelectParcel(parcel)}
                title={parcel ? `${parcelId} - ${parcel.district}` : parcelId}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function ParcelMapView({ parcels, onSelectParcel }: { parcels: Parcel[]; onSelectParcel: (parcel: Parcel) => void }) {
  return (
    <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4">
      <p className="text-cyan-300 mb-4">Interactive map with hover details (100x100 grid)</p>
      <div className="relative aspect-square bg-slate-950 rounded">
        {parcels.map((parcel) => (
          <div
            key={parcel.parcelId}
            className="absolute hover:z-10"
            style={{
              left: `${parcel.gridX}%`,
              top: `${parcel.gridY}%`,
              width: '1%',
              height: '1%'
            }}
          >
            <div
              className={`w-full h-full ${getGridCellColor(parcel)} hover:scale-150 transition-transform cursor-pointer`}
              onClick={() => onSelectParcel(parcel)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ParcelDetailPanel({ parcel, onClose }: { parcel: Parcel; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <ChromePanel variant="solid" glow={true} className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <ChromeHeader size="lg" color="blue">
                PARCEL #{parcel.parcelId}
              </ChromeHeader>
              <p className="text-cyan-300/70 font-mono text-sm mt-2">COORDS: ({parcel.gridX}, {parcel.gridY})</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-cyan-400 hover:text-cyan-300 text-2xl border-2 border-red-500/50 hover:border-red-500 rounded p-1 transition-colors"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <ChromeStat label="TIER" value={parcel.tier} color="purple" />
            <ChromeStat label="DISTRICT" value={parcel.district} color="blue" />
            <ChromeStat label="PRICE" value={`${formatEther(parcel.basePrice)} VOID`} color="red" />
            <ChromeStat label="STATUS" value={parcel.status} color="blue" />
            <ChromeStat label="OWNER" value={parcel.owner ? `${parcel.owner.slice(0,6)}...${parcel.owner.slice(-4)}` : 'NONE'} color="blue" />
            <ChromeStat label="HOUSE" value={parcel.hasHouse ? 'YES' : 'NO'} color={parcel.hasHouse ? 'purple' : 'red'} />
          </div>

          <div className="flex gap-4">
            <ChromeButton variant="primary" className="flex-1 !py-3">
              BUY PARCEL
            </ChromeButton>
            <ChromeButton variant="secondary" className="flex-1 !py-3">
              BUILD HOUSE
            </ChromeButton>
            <ChromeButton variant="ghost" className="flex-1 !py-3">
              GET LICENSE
            </ChromeButton>
          </div>
        </div>
      </ChromePanel>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-cyan-300/70">{label}</div>
      <div className="text-white font-medium">{value}</div>
    </div>
  );
}

function getZoneColor(zone: ZoneType): string {
  const colors = {
    [ZoneType.PUBLIC]: 'text-gray-400',
    [ZoneType.RESIDENTIAL]: 'text-blue-400',
    [ZoneType.COMMERCIAL]: 'text-green-400',
    [ZoneType.PREMIUM]: 'text-purple-400',
    [ZoneType.GLIZZY_WORLD]: 'text-amber-400'
  };
  return colors[zone];
}

function getStatusColor(status: ParcelStatus): string {
  const colors = {
    [ParcelStatus.FOR_SALE]: 'text-green-400',
    [ParcelStatus.OWNED]: 'text-blue-400',
    [ParcelStatus.NOT_FOR_SALE]: 'text-gray-400',
    [ParcelStatus.DAO_OWNED]: 'text-purple-400',
    [ParcelStatus.RESTRICTED]: 'text-red-400'
  };
  return colors[status];
}

function getGridCellColor(parcel?: Parcel): string {
  if (!parcel) return 'bg-slate-800';
  
  const zoneColors = {
    [ZoneType.PUBLIC]: 'bg-gray-600',
    [ZoneType.RESIDENTIAL]: 'bg-blue-600',
    [ZoneType.COMMERCIAL]: 'bg-green-600',
    [ZoneType.PREMIUM]: 'bg-purple-600',
    [ZoneType.GLIZZY_WORLD]: 'bg-amber-600'
  };
  
  return zoneColors[parcel.zone];
}
