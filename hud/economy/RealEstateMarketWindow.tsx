'use client';

import React, { useMemo } from 'react';
import { useParcelMarketState } from '@/state/parcelMarket/useParcelMarketState';
import { useParcelOwnership } from '@/world/economy/ownershipHooks';
import { useSelectionState } from '@/state/useSelectionState';
import { RealEstateEvent } from '@/world/economy/ownershipTypes';
import { formatEther } from 'viem';

/**
 * RealEstateMarketWindow
 * 
 * Marketplace view of all active parcel listings + recent transaction history.
 * Features:
 * - Browse all active listings across all districts
 * - Sort by price/district
 * - Jump to parcels on the map
 * - View recent activity feed
 * - See top districts by listing count
 */
export default function RealEstateMarketWindow() {
  const getAllActiveListings = useParcelMarketState((s) => s.getAllActiveListings);
  const getRecentEvents = useParcelMarketState((s) => s.getRecentEvents);
  const setActiveParcel = useSelectionState((s) => s.setActiveParcel);
  const setActiveDistrict = useSelectionState((s) => s.setActiveDistrict);
  
  const listings = getAllActiveListings();
  const recentEvents = getRecentEvents(10);
  
  // DEBUG: Log render with state snapshot
  console.log('[HUD] RealEstateMarketWindow render', {
    listingsCount: listings.length,
    recentEventsCount: recentEvents.length,
  });
  
  // District stats
  const districtStats = useMemo(() => {
    const stats = new Map<string, number>();
    listings.forEach(l => {
      const count = stats.get(l.districtId || 'unknown') || 0;
      stats.set(l.districtId || 'unknown', count + 1);
    });
    return Array.from(stats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [listings]);
  
  const handleJumpTo = (parcelId: number, districtId?: string) => {
    setActiveParcel(parcelId, districtId || null);
  };
  
  return (
    <div className="flex flex-col sm:flex-row h-full gap-2 sm:gap-3 p-2 sm:p-4 text-[10px] sm:text-xs font-mono">
      {/* LEFT: Active Listings Table */}
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-amber-400 font-bold tracking-wider text-xs sm:text-sm">ACTIVE LISTINGS</h3>
            <span className="px-1.5 py-0.5 sm:px-2 bg-yellow-500/20 border border-yellow-500/40 rounded text-yellow-400 text-[8px] sm:text-[9px] font-bold uppercase">
              TESTNET
            </span>
          </div>
          <span className="text-gray-500 text-[10px] sm:text-xs">{listings.length} parcels</span>
        </div>
        
        <div className="flex-1 overflow-x-auto overflow-y-auto border border-amber-900/30 bg-black/40 rounded">
          <table className="w-full min-w-[500px]">
            <thead className="sticky top-0 bg-black/80 border-b border-amber-900/30">
              <tr className="text-amber-500/70 text-left">
                <th className="p-1.5 sm:p-2 text-[10px] sm:text-xs">PARCEL</th>
                <th className="p-1.5 sm:p-2 text-[10px] sm:text-xs hidden sm:table-cell">DISTRICT</th>
                <th className="p-1.5 sm:p-2 text-[10px] sm:text-xs">PRICE</th>
                <th className="p-1.5 sm:p-2 text-[10px] sm:text-xs hidden sm:table-cell">OWNER</th>
                <th className="p-1.5 sm:p-2 text-[10px] sm:text-xs"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/20">
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-3 sm:p-4 text-center text-gray-500 text-[10px] sm:text-xs">
                    No active listings. Claim parcels to start trading.
                  </td>
                </tr>
              ) : (
                listings.map((listing) => (
                  <ListingRow
                    key={listing.parcelId}
                    listing={listing}
                    onJumpTo={handleJumpTo}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="text-amber-500/50 text-[9px] sm:text-[10px] px-2">
          ⚠ TESTNET SIMULATION · Off-chain state only
        </div>
      </div>
      
      {/* RIGHT: Stats + Activity Feed */}
      <div className="w-full sm:w-80 flex flex-col gap-2 sm:gap-3 max-h-[300px] sm:max-h-none">
        {/* Top Districts */}
        <div className="border border-amber-900/30 bg-black/40 rounded p-2 sm:p-3">
          <h4 className="text-amber-400 font-bold mb-1 sm:mb-2 text-[10px] sm:text-xs">TOP DISTRICTS</h4>
          <div className="space-y-1">
            {districtStats.length === 0 ? (
              <p className="text-gray-500 text-[9px] sm:text-[10px]">No listings yet</p>
            ) : (
              districtStats.map(([districtId, count]) => (
                <div
                  key={districtId}
                  className="flex justify-between items-center hover:bg-amber-900/10 p-1 rounded cursor-pointer"
                  onClick={() => setActiveDistrict(districtId as any)}
                >
                  <span className="text-amber-300 truncate text-[10px] sm:text-xs">{districtId}</span>
                  <span className="text-gray-400 text-[10px] sm:text-xs">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="flex-1 border border-amber-900/30 bg-black/40 rounded p-2 sm:p-3 overflow-y-auto min-h-0">
          <h4 className="text-amber-400 font-bold mb-1 sm:mb-2 text-[10px] sm:text-xs">RECENT ACTIVITY</h4>
          <div className="space-y-2">
            {recentEvents.length === 0 ? (
              <p className="text-gray-500 text-[9px] sm:text-[10px]">No activity yet</p>
            ) : (
              recentEvents.map((event) => (
                <ActivityItem key={event.id} event={event} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ListingRow - Single listing table row
 */
function ListingRow({
  listing,
  onJumpTo,
}: {
  listing: any;
  onJumpTo: (parcelId: number, districtId?: string) => void;
}) {
  const ownership = useParcelOwnership(listing.parcelId);
  
  return (
    <tr className="hover:bg-amber-900/10 transition-colors">
      <td className="p-1.5 sm:p-2 text-amber-300 text-[10px] sm:text-xs">#{listing.parcelId}</td>
      <td className="p-1.5 sm:p-2 text-gray-400 text-[10px] sm:text-xs hidden sm:table-cell truncate max-w-[100px]">
        {listing.districtId || '—'}
      </td>
      <td className="p-1.5 sm:p-2 text-green-400 font-semibold text-[10px] sm:text-xs whitespace-nowrap">
        {formatEther(listing.priceWei)} VOID
      </td>
      <td className="p-1.5 sm:p-2 text-gray-500 font-mono text-[9px] sm:text-[10px] hidden sm:table-cell">
        {ownership?.ownerAddress ? `${ownership.ownerAddress.slice(0, 6)}...${ownership.ownerAddress.slice(-4)}` : '—'}
      </td>
      <td className="p-1.5 sm:p-2">
        <button
          onClick={() => onJumpTo(listing.parcelId, listing.districtId)}
          className="px-2 py-1 h-7 sm:h-auto bg-amber-900/30 hover:bg-amber-900/50 text-amber-400 rounded text-[9px] sm:text-[10px] transition-colors flex items-center justify-center"
        >
          JUMP
        </button>
      </td>
    </tr>
  );
}

/**
 * ActivityItem - Single event in activity feed
 */
function ActivityItem({ event }: { event: RealEstateEvent }) {
  const getEventLabel = () => {
    switch (event.type) {
      case 'CLAIMED':
        return <span className="text-blue-400">CLAIMED</span>;
      case 'LISTED':
        return <span className="text-yellow-400">LISTED</span>;
      case 'CANCELED':
        return <span className="text-red-400">CANCELED</span>;
      case 'SOLD':
        return <span className="text-green-400">SOLD</span>;
      default:
        return <span className="text-gray-400">{event.type}</span>;
    }
  };
  
  const getEventDetails = () => {
    const formatPrice = (price: number | undefined) => {
      if (!price) return '0';
      return price.toFixed(2);
    };
    
    switch (event.type) {
      case 'CLAIMED':
        return `Parcel #${event.parcelId} claimed`;
      case 'LISTED':
        return `Parcel #${event.parcelId} listed for ${formatPrice(event.price)} VOID`;
      case 'CANCELED':
        return `Listing canceled for #${event.parcelId}`;
      case 'SOLD':
        return `Parcel #${event.parcelId} sold for ${formatPrice(event.price)} VOID`;
      default:
        return `Parcel #${event.parcelId}`;
    }
  };
  
  return (
    <div className="border-l-2 border-amber-900/30 pl-2 py-1">
      <div className="flex items-center gap-2 mb-1">
        {getEventLabel()}
        <span className="text-gray-600 text-[9px]">
          {new Date(event.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <p className="text-gray-400 text-[10px]">{getEventDetails()}</p>
      {event.type === 'SOLD' && event.counterpartyAddress && (
        <p className="text-gray-600 text-[9px] font-mono mt-1">
          → {event.counterpartyAddress.slice(0, 6)}...{event.counterpartyAddress.slice(-4)}
        </p>
      )}
    </div>
  );
}
