"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Grid3x3, Home } from "lucide-react"
import { Parcel, TierType, DistrictType, ParcelStatus } from "@/lib/land/types"
import { ChromeButton } from "../ui/chrome-panel"

interface PS1MemoryCardViewProps {
  parcels: Parcel[]
  onSelectParcel?: (parcel: Parcel) => void
  onClose?: () => void
}

const PARCELS_PER_PAGE = 15 // 3x5 grid like PS1 memory card

export function PS1MemoryCardView({ parcels, onSelectParcel, onClose }: PS1MemoryCardViewProps) {
  const [currentPage, setCurrentPage] = useState(0)
  
  const totalPages = Math.ceil(parcels.length / PARCELS_PER_PAGE)
  const startIndex = currentPage * PARCELS_PER_PAGE
  const currentParcels = parcels.slice(startIndex, startIndex + PARCELS_PER_PAGE)
  
  // Fill empty slots to maintain 3x5 grid
  const gridParcels = [...currentParcels]
  while (gridParcels.length < PARCELS_PER_PAGE) {
    gridParcels.push(null as any)
  }

  const getTierIcon = (tier: TierType): string => {
    switch (tier) {
      case 'CORE': return '⬛' // Solid block
      case 'RING': return '▣' // Square with dots
      case 'FRONTIER': return '□' // Empty square
      default: return '?'
    }
  }

  const getDistrictColor = (district: DistrictType): string => {
    switch (district) {
      case 'GAMING': return '#ef4444'
      case 'BUSINESS': return '#3b82f6'
      case 'SOCIAL': return '#ec4899'
      case 'DEFI': return '#10b981'
      case 'RESIDENTIAL': return '#8b5cf6'
      case 'DAO': return '#9333ea'
      case 'PUBLIC': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusColor = (status: ParcelStatus): string => {
    switch (status) {
      case ParcelStatus.FOR_SALE: return '#fbbf24'
      case ParcelStatus.OWNED: return '#00ff88'
      case ParcelStatus.DAO_OWNED: return '#ff00ff'
      default: return '#6b7280'
    }
  }

  const formatParcelId = (parcelId: string): string => {
    // "VOID-GENESIS-0" -> "VG-000"
    const parts = parcelId.split('-')
    const num = parts[parts.length - 1].padStart(3, '0')
    return `VG-${num}`
  }

  const getBlockSize = (parcel: Parcel | null): number => {
    if (!parcel) return 1
    // Size based on tier
    switch (parcel.tier) {
      case 'CORE': return 3
      case 'RING': return 2
      case 'FRONTIER': return 1
      default: return 1
    }
  }

  return (
    <div className="w-full h-full bg-[#1a1a1a] p-8 relative overflow-hidden">
      {/* PS1 CRT Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
        }} />
      </div>

      {/* Header */}
      <div className="relative z-10 mb-8 border-b-2 border-[#ff0032] pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white font-orbitron mb-1 tracking-wider">
              MEMORY CARD
            </h2>
            <p className="text-sm text-gray-400 font-mono">LAND STORAGE DEVICE</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#00f0ff] font-mono">{parcels.length}</p>
            <p className="text-xs text-gray-400 font-mono">BLOCKS USED</p>
          </div>
        </div>
      </div>

      {/* Page Info */}
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-[#00f0ff]" />
          <p className="text-sm font-mono text-gray-300">
            PAGE {currentPage + 1} / {totalPages}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs font-mono text-gray-400">
            {startIndex + 1}-{Math.min(startIndex + PARCELS_PER_PAGE, parcels.length)} of {parcels.length}
          </p>
        </div>
      </div>

      {/* 3x5 Grid */}
      <div className="relative z-10 grid grid-cols-3 gap-4 mb-8">
        {gridParcels.map((parcel, index) => {
          if (!parcel) {
            return (
              <div
                key={`empty-${index}`}
                className="aspect-[3/4] border-2 border-dashed border-gray-700 rounded-lg bg-black/40 flex items-center justify-center"
              >
                <p className="text-gray-600 text-xs font-mono">EMPTY</p>
              </div>
            )
          }

          const blockSize = getBlockSize(parcel)
          const districtColor = getDistrictColor(parcel.district)
          const statusColor = getStatusColor(parcel.status)

          return (
            <button
              key={parcel.parcelId}
              onClick={() => onSelectParcel?.(parcel)}
              className="aspect-[3/4] border-2 rounded-lg bg-gradient-to-b from-gray-900 to-black relative overflow-hidden group hover:scale-105 transition-transform duration-200"
              style={{
                borderColor: districtColor,
                boxShadow: `0 0 20px ${districtColor}40`
              }}
            >
              {/* Block Icon (top) */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-center">
                <div 
                  className="text-4xl opacity-80"
                  style={{ color: districtColor }}
                >
                  {getTierIcon(parcel.tier)}
                </div>
              </div>

              {/* Parcel ID */}
              <div className="absolute top-14 left-0 right-0 text-center">
                <p className="text-xs font-mono font-bold text-white tracking-wider">
                  {formatParcelId(parcel.parcelId)}
                </p>
              </div>

              {/* Tier Label */}
              <div className="absolute top-20 left-0 right-0 text-center">
                <p className="text-[10px] font-mono text-gray-400 uppercase">
                  {parcel.tier}
                </p>
              </div>

              {/* District Badge */}
              <div className="absolute bottom-12 left-2 right-2">
                <div 
                  className="text-center py-1 rounded text-[10px] font-mono font-bold tracking-wide"
                  style={{
                    backgroundColor: `${districtColor}20`,
                    color: districtColor,
                    border: `1px solid ${districtColor}60`
                  }}
                >
                  {parcel.district.slice(0, 4)}
                </div>
              </div>

              {/* Block Size Indicator */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: i < blockSize ? districtColor : '#333',
                      opacity: i < blockSize ? 1 : 0.3
                    }}
                  />
                ))}
              </div>

              {/* Status Dot */}
              <div 
                className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: statusColor }}
              />

              {/* Hover Glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200"
                style={{
                  background: `radial-gradient(circle at center, ${districtColor}, transparent)`
                }}
              />
            </button>
          )
        })}
      </div>

      {/* Navigation Controls */}
      <div className="relative z-10 flex items-center justify-between border-t-2 border-gray-800 pt-6">
        <ChromeButton
          variant="secondary"
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          PREV
        </ChromeButton>

        {onClose && (
          <ChromeButton
            variant="ghost"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            EXIT
          </ChromeButton>
        )}

        <ChromeButton
          variant="secondary"
          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage === totalPages - 1}
          className="flex items-center gap-2"
        >
          NEXT
          <ChevronRight className="w-4 h-4" />
        </ChromeButton>
      </div>

      {/* PS1 Branding */}
      <div className="relative z-10 mt-6 text-center">
        <p className="text-xs font-mono text-gray-600 tracking-widest">
          PlayStation®VOID Memory Card (8MB)
        </p>
      </div>
    </div>
  )
}
