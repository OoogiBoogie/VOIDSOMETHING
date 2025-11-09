/**
 * Global Land Inventory
 * Browse all 10,000 parcels with filters, search, and multiple views
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useParcelsPage, useMyParcels, useParcelFilters } from '../../lib/land/hooks';
import { landRegistryAPI } from '../../lib/land/registry-api';
import { Parcel, ZoneType, ParcelStatus, LicenseType } from '../../lib/land/types';
import { formatEther } from 'viem';

type ViewMode = 'table' | 'grid' | 'map';

export function GlobalLandInventory() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(500);

  const { parcels, isLoading, error, totalPages, totalParcels } = useParcelsPage(page, pageSize);
  const { parcelIds: myParcelIds } = useMyParcels();
  
  const { filters, setFilters, filteredParcels, statistics } = useParcelFilters(parcels);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-cyan-300">Loading 10,000 parcels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-400">
          <p className="text-xl">Error loading parcels</p>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/30 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Land Registry</h1>
          <p className="text-cyan-300/70">Browse all 10,000 parcels in VOID-1</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <StatCard label="Total Parcels" value={statistics.total} color="cyan" />
          <StatCard label="For Sale" value={statistics.forSale} color="green" />
          <StatCard label="Owned" value={statistics.owned} color="blue" />
          <StatCard label="With Houses" value={statistics.withHouses} color="purple" />
          <StatCard label="With Business" value={statistics.withBusinesses} color="amber" />
          <StatCard label="Page" value={page} color="cyan" />
        </div>

        {/* Filters */}
        <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Zone Filter */}
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Zone</label>
              <select 
                className="w-full bg-slate-800 border border-cyan-500/30 rounded px-3 py-2 text-white"
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
              <label className="block text-sm text-cyan-300 mb-2">Status</label>
              <select 
                className="w-full bg-slate-800 border border-cyan-500/30 rounded px-3 py-2 text-white"
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
              <label className="block text-sm text-cyan-300 mb-2">Search by ID</label>
              <input 
                type="number"
                placeholder="Parcel ID (0-9999)"
                className="w-full bg-slate-800 border border-cyan-500/30 rounded px-3 py-2 text-white"
                value={filters.searchId ?? ''}
                onChange={(e) => setFilters({ ...filters, searchId: e.target.value ? Number(e.target.value) : null })}
              />
            </div>

            {/* Quick Filters */}
            <div>
              <label className="block text-sm text-cyan-300 mb-2">Quick Filters</label>
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-sm"
                  onClick={() => setFilters({ ...filters, hasHouse: true })}
                >
                  With House
                </button>
                <button
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded text-sm"
                  onClick={() => setFilters({ ...filters, hasLicense: true })}
                >
                  With License
                </button>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm"
              onClick={() => setFilters({ zone: null, status: null, owner: null, searchId: null, hasHouse: null, hasLicense: null })}
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-cyan-300">Page Size:</label>
            <select
              className="bg-slate-800 border border-cyan-500/30 rounded px-2 py-1 text-sm"
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
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-2 bg-slate-700 disabled:opacity-40 hover:bg-slate-600 rounded"
            >Prev</button>
            <span className="text-sm text-cyan-300">Page {page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-2 bg-slate-700 disabled:opacity-40 hover:bg-slate-600 rounded"
            >Next</button>
          </div>
          <div className="text-xs text-cyan-400">
            Showing {(page-1)*pageSize + 1}-{Math.min(page*pageSize,totalParcels)} of {totalParcels}
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded ${viewMode === 'table' ? 'bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            onClick={() => setViewMode('table')}
          >
            Table View
          </button>
          <button
            className={`px-4 py-2 rounded ${viewMode === 'grid' ? 'bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </button>
          <button
            className={`px-4 py-2 rounded ${viewMode === 'map' ? 'bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            onClick={() => setViewMode('map')}
          >
            Map View
          </button>
        </div>

        {/* Content */}
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
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
          >
            ← Previous
          </button>
          <div className="flex items-center gap-2">
            <span className="text-cyan-300">
              Page {page} of {totalPages}
            </span>
            <span className="text-cyan-300/50 text-sm">
              ({statistics.total} parcels total)
            </span>
          </div>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
          >
            Next →
          </button>
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
  myParcelIds: number[];
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
                  <td className="px-4 py-3 text-green-400">{formatEther(parcel.zonePrice)} VOID</td>
                  <td className="px-4 py-3">
                    <span className={getStatusColor(parcel.status)}>
                      {parcel.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">
                    {parcel.ownerAddress ? `${parcel.ownerAddress.slice(0, 6)}...${parcel.ownerAddress.slice(-4)}` : 'None'}
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
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 100 }, (_, y) => 
          Array.from({ length: 100 }, (_, x) => {
            const parcelId = y * 100 + x;
            const parcel = parcels.find(p => p.parcelId === parcelId);
            
            return (
              <div
                key={parcelId}
                className={`aspect-square cursor-pointer hover:scale-110 transition-transform ${getGridCellColor(parcel)}`}
                onClick={() => parcel && onSelectParcel(parcel)}
                title={parcel ? `#${parcelId} - ${landRegistryAPI.getZoneName(parcel.zone)}` : `#${parcelId}`}
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
      <div className="bg-slate-900 border border-cyan-500 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-cyan-400">Parcel #{parcel.parcelId}</h2>
              <p className="text-cyan-300/70">Coordinates: ({parcel.gridX}, {parcel.gridY})</p>
            </div>
            <button onClick={onClose} className="text-cyan-400 hover:text-cyan-300 text-2xl">×</button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <InfoField label="Zone" value={landRegistryAPI.getZoneName(parcel.zone)} />
            <InfoField label="Price" value={`${formatEther(parcel.zonePrice)} VOID`} />
            <InfoField label="Status" value={parcel.status} />
            <InfoField label="Owner" value={parcel.ownerAddress || 'None'} />
            <InfoField label="Has House" value={parcel.hasHouse ? 'Yes' : 'No'} />
            <InfoField label="Business License" value={landRegistryAPI.getLicenseName(parcel.businessLicense)} />
          </div>

          <div className="flex gap-4">
            <button className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 rounded font-bold">
              Buy Parcel
            </button>
            <button className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded font-bold">
              Build House
            </button>
            <button className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 rounded font-bold">
              Get License
            </button>
          </div>
        </div>
      </div>
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
