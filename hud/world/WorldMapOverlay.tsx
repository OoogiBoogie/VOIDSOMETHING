/**
 * VOID PROTOCOL - WORLD MAP OVERLAY
 * 
 * Full-screen map overlay showing:
 * - Entire 40×40 parcel grid
 * - Player position with pulse animation
 * - Owned parcels highlighted
 * - District boundaries
 * - Click to teleport (future)
 * - ESC to close
 */

"use client"

import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useParcels, useMyParcels } from '@/services/world/useParcels'
import { useWorldEvent, PLAYER_MOVED } from '@/services/events/worldEvents'
import { GRID_SIZE, parcelIdToCoords, worldToParcel, DISTRICT_COLORS, DISTRICT_NAMES } from '@/world/WorldCoords'
import { voidTheme } from '@/ui/theme/voidTheme'

interface WorldMapOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function WorldMapOverlay({ isOpen, onClose }: WorldMapOverlayProps) {
  const { address } = useAccount()
  const { parcels } = useParcels()
  const { ownedParcels } = useMyParcels()
  
  const [playerParcelId, setPlayerParcelId] = useState<number | null>(null)
  const [hoveredParcelId, setHoveredParcelId] = useState<number | null>(null)
  
  // Listen to player movement
  useWorldEvent(PLAYER_MOVED, (data) => {
    setPlayerParcelId(data.parcelId)
  }, [])
  
  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  const hoveredParcel = hoveredParcelId !== null ? parcels[hoveredParcelId] : null
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      backdropFilter: 'blur(8px)',
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '32px',
          fontWeight: 700,
          color: voidTheme.colors.primary,
          textShadow: voidTheme.shadows.textGlow,
        }}>
          WORLD MAP
        </h1>
        
        <button
          onClick={onClose}
          style={{
            padding: '8px 20px',
            background: 'transparent',
            border: `2px solid ${voidTheme.colors.primary}`,
            borderRadius: '6px',
            color: voidTheme.colors.primary,
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = voidTheme.colors.primary
            e.currentTarget.style.color = voidTheme.colors.bgDeep
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = voidTheme.colors.primary
          }}
        >
          ESC TO CLOSE
        </button>
      </div>
      
      {/* Map Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '1200px',
        position: 'relative',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gap: '2px',
          padding: '20px',
          background: voidTheme.colors.panelBg,
          border: `2px solid ${voidTheme.colors.primary}`,
          borderRadius: '12px',
          boxShadow: voidTheme.shadows.glowLarge,
        }}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, id) => {
            const parcel = parcels[id]
            const isPlayer = id === playerParcelId
            const isOwned = ownedParcels.some(p => p.id === id)
            const isHovered = id === hoveredParcelId
            const isAvailable = parcel?.isAvailable ?? true
            
            const districtColor = DISTRICT_COLORS[parcel?.districtId as keyof typeof DISTRICT_COLORS || 'neutral']
            
            return (
              <div
                key={id}
                onMouseEnter={() => setHoveredParcelId(id)}
                onMouseLeave={() => setHoveredParcelId(null)}
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: isOwned 
                    ? voidTheme.colors.success
                    : isAvailable
                      ? `${districtColor}40`
                      : `${voidTheme.colors.textSecondary}60`,
                  border: isPlayer
                    ? `2px solid ${voidTheme.colors.primary}`
                    : isHovered
                      ? `2px solid ${voidTheme.colors.accent}`
                      : 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  boxShadow: isPlayer 
                    ? `0 0 20px ${voidTheme.colors.primary}`
                    : isHovered
                      ? `0 0 10px ${voidTheme.colors.accent}`
                      : 'none',
                  animation: isPlayer ? 'pulse 2s ease-in-out infinite' : 'none',
                }}
              />
            )
          })}
        </div>
        
        {/* Pulse animation keyframes */}
        <style>{`
          @keyframes pulse {
            0%, 100% {
              box-shadow: 0 0 20px ${voidTheme.colors.primary};
            }
            50% {
              box-shadow: 0 0 40px ${voidTheme.colors.primary}, 0 0 60px ${voidTheme.colors.primary}80;
            }
          }
        `}</style>
      </div>
      
      {/* Info Panel */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '40px',
        padding: '16px 32px',
        background: voidTheme.colors.panelBg,
        border: `1px solid ${voidTheme.colors.primary}40`,
        borderRadius: '8px',
        boxShadow: voidTheme.shadows.glow,
      }}>
        {/* Hovered Parcel Info */}
        {hoveredParcel && (
          <div style={{
            fontSize: '14px',
            color: voidTheme.colors.text,
          }}>
            <span style={{ color: voidTheme.colors.textSecondary }}>Parcel:</span>{' '}
            <span style={{ fontWeight: 700 }}>#{hoveredParcelId}</span>{' '}
            <span style={{ color: voidTheme.colors.textSecondary }}>({hoveredParcel.x}, {hoveredParcel.z})</span>{' '}
            •{' '}
            <span style={{ color: DISTRICT_COLORS[hoveredParcel.districtId as keyof typeof DISTRICT_COLORS] }}>
              {DISTRICT_NAMES[hoveredParcel.districtId as keyof typeof DISTRICT_NAMES]}
            </span>{' '}
            •{' '}
            <span style={{ 
              color: ownedParcels.some(p => p.id === hoveredParcelId!)
                ? voidTheme.colors.success
                : hoveredParcel.isAvailable
                  ? voidTheme.colors.primary
                  : voidTheme.colors.textSecondary
            }}>
              {ownedParcels.some(p => p.id === hoveredParcelId!) ? 'OWNED' : hoveredParcel.isAvailable ? 'AVAILABLE' : 'SOLD'}
            </span>
          </div>
        )}
        
        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: '20px',
          fontSize: '12px',
          color: voidTheme.colors.textSecondary,
        }}>
          {Object.entries(DISTRICT_COLORS).slice(0, 4).map(([district, color]) => (
            <div key={district} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                background: `${color}40`,
                border: `1px solid ${color}`,
                borderRadius: '2px',
              }} />
              <span>{district.toUpperCase()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: voidTheme.colors.success,
              borderRadius: '2px',
            }} />
            <span>YOUR PARCELS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              border: `2px solid ${voidTheme.colors.primary}`,
              borderRadius: '2px',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span>YOU</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to manage map overlay state
 */
export function useWorldMap() {
  const [isOpen, setIsOpen] = useState(false)
  
  // Open map with M key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm' && !isOpen) {
        setIsOpen(true)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])
  
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  }
}
