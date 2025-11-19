/**
 * VOID PROTOCOL - LAND GRID WINDOW
 * 
 * Interactive 40×40 land parcel grid with:
 * - Real-time ownership status from blockchain
 * - Click to select parcels
 * - Current player position highlight
 * - Buy flow with VOID token approval
 * - District color coding
 */

"use client"

import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { toast } from 'sonner'
import { useParcels, useMyParcels, useLandStats } from '@/services/world/useParcels'
import { useWorldEvent, PARCEL_ENTERED } from '@/services/events/worldEvents'
import { GRID_SIZE, parcelIdToCoords } from '@/world/WorldCoords'
import type { DistrictId } from '@/world/map/districts'
import { voidTheme } from '@/ui/theme/voidTheme'
import { useParcelProperties } from '@/services/world/useRealEstate'
import { propertyRegistry } from '@/lib/real-estate-system'

/**
 * Get district display name from DistrictId
 */
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

/**
 * Get district color from DistrictId
 */
const getDistrictColor = (district: DistrictId): string => {
  const colors: Record<DistrictId, string> = {
    HQ: voidTheme.colors.textTertiary,
    DEFI: voidTheme.colors.neonPurple,
    CREATOR: voidTheme.colors.neonTeal,
    DAO: voidTheme.colors.neonPink,
    AI: voidTheme.colors.neonBlue,
    SOCIAL: '#ff9d00',
    IDENTITY: '#00ff88',
    CENTRAL_EAST: voidTheme.colors.textMuted,
    CENTRAL_SOUTH: voidTheme.colors.textMuted,
  };
  return colors[district] || voidTheme.colors.textTertiary;
};

/**
 * All district IDs for legend rendering
 */
const ALL_DISTRICTS: DistrictId[] = ['HQ', 'DEFI', 'CREATOR', 'DAO', 'AI', 'SOCIAL', 'IDENTITY', 'CENTRAL_EAST', 'CENTRAL_SOUTH'];

export function LandGridWindow() {
  const { address, isConnected } = useAccount()
  const { parcels, isLoading: parcelsLoading, refetch } = useParcels()
  const { ownedParcels } = useMyParcels()
  const { totalSold, pricePerParcel } = useLandStats()
  
  const [selectedParcelId, setSelectedParcelId] = useState<number | null>(null)
  const [currentParcelId, setCurrentParcelId] = useState<number | null>(null)
  const [isBuying, setIsBuying] = useState(false)
  
  // Listen to player movement events
  useWorldEvent(PARCEL_ENTERED, (data) => {
    setCurrentParcelId(data.parcelInfo.id)
  }, [])
  
  const selectedParcel = selectedParcelId !== null ? parcels[selectedParcelId] : null
  const isOwnedByMe = selectedParcelId !== null && ownedParcels.some(p => p.id === selectedParcelId)

  // Get properties on selected parcel
  const parcelProperties = useParcelProperties(selectedParcelId ?? -1)
  const selectedParcelProperties = selectedParcelId !== null ? parcelProperties : []
  
  const handleBuyParcel = async () => {
    if (!isConnected) {
      toast.error('Connect wallet first')
      return
    }
    
    if (selectedParcelId === null) {
      toast.error('Select a parcel first')
      return
    }
    
    if (!selectedParcel?.isAvailable) {
      toast.error('Parcel not available')
      return
    }
    
    setIsBuying(true)
    
    try {
      // TODO: Re-enable buyParcel once exported from useWorldLand
      // const result = await buyParcel(selectedParcelId)
      toast.error('Purchase feature temporarily disabled')
      
      // if (result.success) {
      //   toast.success(`Parcel #${selectedParcelId} purchased!`, {
      //     description: `Transaction: ${result.txHash?.slice(0, 10)}...`,
      //   })
      //   
      //   // Refetch parcels to update ownership
      //   refetch()
      // } else {
      //   toast.error(result.error || 'Purchase failed')
      // }
    } catch (error: any) {
      console.error('Buy parcel error:', error)
      toast.error(error.message || 'Purchase failed')
    } finally {
      setIsBuying(false)
    }
  }
  
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: voidTheme.colors.panelBg,
      border: `1px solid ${voidTheme.colors.primary}`,
      boxShadow: voidTheme.shadows.glow,
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '12px',
        borderBottom: `1px solid ${voidTheme.colors.primary}40`,
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: 700,
          color: voidTheme.colors.primary,
          textShadow: voidTheme.shadows.textGlow,
        }}>
          LAND GRID
        </h2>
        
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '12px',
          color: voidTheme.colors.textSecondary,
        }}>
          <span>Sold: {totalSold}/{GRID_SIZE * GRID_SIZE}</span>
          <span>•</span>
          <span>Price: {pricePerParcel} VOID</span>
        </div>
      </div>
      
      {/* Grid Container */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {parcelsLoading ? (
          <div style={{ color: voidTheme.colors.textSecondary }}>Loading parcels...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gap: '2px',
            width: 'fit-content',
            padding: '8px',
          }}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, id) => {
              const parcel = parcels[id]
              const coords = parcelIdToCoords(id)
              const isSelected = id === selectedParcelId
              const isCurrent = id === currentParcelId
              const isOwned = ownedParcels.some(p => p.id === id)
              const isAvailable = parcel?.isAvailable ?? true
              
              // Get property count on this parcel
              const propertyCount = propertyRegistry.getPropertiesOnParcel(id).length
              const hasBuildings = propertyCount > 0
              
              const districtColor = parcel?.districtId ? getDistrictColor(parcel.districtId as DistrictId) : voidTheme.colors.textTertiary
              
              return (
                <button
                  key={id}
                  onClick={() => setSelectedParcelId(id)}
                  style={{
                    width: '12px',
                    height: '12px',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    position: 'relative',
                    backgroundColor: isOwned 
                      ? voidTheme.colors.success
                      : isAvailable
                        ? `${districtColor}40`
                        : `${voidTheme.colors.textSecondary}60`,
                    outline: isSelected 
                      ? `2px solid ${voidTheme.colors.accent}`
                      : isCurrent
                        ? `2px solid ${voidTheme.colors.primary}`
                        : 'none',
                    outlineOffset: '1px',
                    transition: 'all 0.15s ease',
                    boxShadow: isCurrent 
                      ? `0 0 8px ${voidTheme.colors.primary}`
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.2)'
                    e.currentTarget.style.zIndex = '10'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.zIndex = '1'
                  }}
                  title={`Parcel #${id} (${coords.x},${coords.z})\n${parcel?.districtId || 'neutral'}\n${isOwned ? 'OWNED BY YOU' : isAvailable ? 'AVAILABLE' : 'SOLD'}${hasBuildings ? `\n${propertyCount} ${propertyCount === 1 ? 'building' : 'buildings'}` : ''}`}
                >
                  {/* Building indicator dot */}
                  {hasBuildings && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: voidTheme.colors.accent,
                      boxShadow: `0 0 4px ${voidTheme.colors.accent}`,
                    }} />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
      
      {/* Details Panel */}
      {selectedParcel && (
        <div style={{
          background: `${voidTheme.colors.primary}10`,
          border: `1px solid ${voidTheme.colors.primary}40`,
          borderRadius: '6px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: voidTheme.colors.text,
                marginBottom: '4px',
              }}>
                Parcel #{selectedParcelId}
              </div>
              <div style={{
                fontSize: '12px',
                color: voidTheme.colors.textSecondary,
              }}>
                {getDistrictName(selectedParcel.districtId as DistrictId)} • ({selectedParcel.x}, {selectedParcel.z})
              </div>
            </div>
            
            <div style={{
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              background: isOwnedByMe
                ? voidTheme.colors.success
                : selectedParcel.isAvailable
                  ? voidTheme.colors.primary
                  : voidTheme.colors.textSecondary,
              color: voidTheme.colors.bgDeep,
            }}>
              {isOwnedByMe ? 'OWNED' : selectedParcel.isAvailable ? 'AVAILABLE' : 'SOLD'}
            </div>
          </div>
          
          {/* Properties on this parcel */}
          {selectedParcelProperties.length > 0 && (
            <div style={{
              padding: '8px 0',
              borderTop: `1px solid ${voidTheme.colors.primary}20`,
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: voidTheme.colors.textSecondary,
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Buildings ({selectedParcelProperties.length})
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                {selectedParcelProperties.map(prop => (
                  <div
                    key={prop.building.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 8px',
                      background: `${voidTheme.colors.primary}08`,
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}
                  >
                    <span style={{ color: voidTheme.colors.text }}>
                      {prop.building.id}
                    </span>
                    <span style={{ 
                      color: prop.isOwned ? voidTheme.colors.success : voidTheme.colors.primary,
                      fontWeight: 600,
                    }}>
                      {prop.isOwned ? 'OWNED' : `${prop.listingPrice} VOID`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedParcel.isAvailable && !isOwnedByMe && isConnected && (
            <button
              onClick={handleBuyParcel}
              disabled={isBuying}
              style={{
                width: '100%',
                padding: '12px',
                background: isBuying
                  ? voidTheme.colors.textSecondary
                  : voidTheme.gradients.buttonPrimary,
                border: 'none',
                borderRadius: '6px',
                color: voidTheme.colors.bgDeep,
                fontSize: '14px',
                fontWeight: 700,
                cursor: isBuying ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isBuying ? 'none' : voidTheme.shadows.glow,
              }}
              onMouseEnter={(e) => {
                if (!isBuying) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = voidTheme.shadows.glowLarge
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = voidTheme.shadows.glow
              }}
            >
              {isBuying ? 'PURCHASING...' : `BUY FOR ${pricePerParcel} VOID`}
            </button>
          )}
          
          {!isConnected && (
            <div style={{
              padding: '12px',
              textAlign: 'center',
              color: voidTheme.colors.textSecondary,
              fontSize: '12px',
            }}>
              Connect wallet to purchase
            </div>
          )}
        </div>
      )}
      
      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        fontSize: '11px',
        color: voidTheme.colors.textSecondary,
        paddingTop: '8px',
        borderTop: `1px solid ${voidTheme.colors.primary}20`,
      }}>
        {ALL_DISTRICTS.map((district) => (
          <div key={district} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              background: `${getDistrictColor(district)}40`,
              border: `1px solid ${getDistrictColor(district)}`,
            }} />
            <span>{getDistrictName(district)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            background: voidTheme.colors.success,
          }} />
          <span>Your Parcels</span>
        </div>
      </div>
    </div>
  )
}
