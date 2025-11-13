"use client"

import { useState } from "react"
import { X, MapPin, Building2, Users, DollarSign, FileText, Zap } from "lucide-react"
import { Parcel, ParcelStatus, TierType, DistrictType, LicenseType } from "@/lib/land/types"
import { ChromePanel, ChromeHeader, ChromeStat, ChromeButton } from "../ui/chrome-panel"
import { landRegistryAPI } from "@/lib/land/registry-api"

interface BuildingDetailPanelProps {
  parcel: Parcel | null
  onClose: () => void
}

export function BuildingDetailPanel({ parcel, onClose }: BuildingDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'business' | 'lease'>('info')

  if (!parcel) return null

  const gridCoords = landRegistryAPI.parcelIdToCoords(parcel.parcelId)
  
  // Get tier color
  const getTierColor = (tier: TierType): string => {
    switch (tier) {
      case 'CORE': return '#ffd700' // Gold
      case 'RING': return '#c0c0c0' // Silver
      case 'FRONTIER': return '#cd7f32' // Bronze
      default: return '#6b7280'
    }
  }

  // Get district color
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

  // Get status badge
  const getStatusBadge = (status: ParcelStatus) => {
    switch (status) {
      case ParcelStatus.FOR_SALE:
        return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-mono rounded border border-amber-500/50">FOR SALE</span>
      case ParcelStatus.OWNED:
        return <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-mono rounded border border-cyan-500/50">OWNED</span>
      case ParcelStatus.DAO_OWNED:
        return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-mono rounded border border-purple-500/50">DAO OWNED</span>
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-mono rounded border border-gray-500/50">UNKNOWN</span>
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <ChromePanel variant="liquid" glow={true} className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-[#00f0ff]" />
            <div>
              <h2 className="text-2xl font-bold text-white font-orbitron">PARCEL {parcel.parcelId}</h2>
              <p className="text-sm text-gray-400 font-mono">Grid: ({gridCoords.x}, {gridCoords.y})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status and Tier/District Tags */}
        <div className="flex flex-wrap gap-3 mb-6">
          {getStatusBadge(parcel.status)}
          <span 
            className="px-3 py-1 text-xs font-mono rounded border"
            style={{ 
              backgroundColor: `${getTierColor(parcel.tier)}20`,
              color: getTierColor(parcel.tier),
              borderColor: `${getTierColor(parcel.tier)}80`
            }}
          >
            {parcel.tier} TIER
          </span>
          <span 
            className="px-3 py-1 text-xs font-mono rounded border"
            style={{ 
              backgroundColor: `${getDistrictColor(parcel.district)}20`,
              color: getDistrictColor(parcel.district),
              borderColor: `${getDistrictColor(parcel.district)}80`
            }}
          >
            {parcel.district} DISTRICT
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 font-mono text-sm transition-colors ${
              activeTab === 'info' 
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            INFO
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`px-4 py-2 font-mono text-sm transition-colors ${
              activeTab === 'business' 
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            BUSINESS
          </button>
          <button
            onClick={() => setActiveTab('lease')}
            className={`px-4 py-2 font-mono text-sm transition-colors ${
              activeTab === 'lease' 
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            LEASE
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ChromeStat label="PARCEL ID" value={parcel.parcelId} />
              <ChromeStat label="COORDINATES" value={`(${gridCoords.x}, ${gridCoords.y})`} />
              <ChromeStat label="TIER" value={parcel.tier} />
              <ChromeStat label="DISTRICT" value={parcel.district} />
              <ChromeStat label="BASE PRICE" value={`${Number(parcel.basePrice) / 1e18} ETH`} />
              <ChromeStat label="WORLD" value={parcel.worldId || 'VOID'} />
            </div>

            {parcel.owner && (
              <div className="mt-6 p-4 bg-gray-900/50 rounded border border-gray-700">
                <p className="text-xs text-gray-400 font-mono mb-1">OWNER</p>
                <p className="text-white font-mono text-sm break-all">{parcel.owner}</p>
              </div>
            )}

            {parcel.status === ParcelStatus.FOR_SALE && (
              <div className="mt-6">
                <ChromeButton variant="primary" className="w-full">
                  <DollarSign className="w-4 h-4 mr-2" />
                  PURCHASE PARCEL
                </ChromeButton>
              </div>
            )}
          </div>
        )}

        {activeTab === 'business' && (
          <div className="space-y-4">
            {parcel.businessLicense !== LicenseType.NONE ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 rounded border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-green-400" />
                    <p className="text-green-400 font-mono font-bold">BUSINESS ACTIVE</p>
                  </div>
                  <p className="text-sm text-gray-400">This parcel has an active business license.</p>
                </div>

                <ChromeStat label="LICENSE TYPE" value={parcel.businessLicense} />
                <ChromeStat label="REVENUE (24H)" value={`${Number(parcel.businessRevenue) / 1e18} ETH`} />

                <div className="mt-6">
                  <ChromeButton variant="secondary" className="w-full mb-3">
                    <Building2 className="w-4 h-4 mr-2" />
                    MANAGE BUSINESS
                  </ChromeButton>
                  <ChromeButton variant="ghost" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    VIEW ANALYTICS
                  </ChromeButton>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-mono mb-6">No business license registered</p>
                {parcel.status === ParcelStatus.OWNED && (
                  <ChromeButton variant="primary" className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    REGISTER BUSINESS
                  </ChromeButton>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'lease' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-mono mb-2">Leasing system coming soon</p>
              <p className="text-sm text-gray-500">Owner will be able to lease units to tenants</p>
            </div>

            {parcel.status === ParcelStatus.OWNED && (
              <div className="mt-6 p-4 bg-blue-500/10 rounded border border-blue-500/30">
                <p className="text-blue-400 font-mono text-sm mb-2">FUTURE FEATURE</p>
                <ul className="text-xs text-gray-400 space-y-1 font-mono">
                  <li>• Set lease rates per unit</li>
                  <li>• Manage tenant agreements</li>
                  <li>• Collect automated rent</li>
                  <li>• V4 revenue splits enforcement</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <ChromeButton variant="ghost" onClick={onClose} className="w-full">
            <X className="w-4 h-4 mr-2" />
            CLOSE
          </ChromeButton>
        </div>
      </ChromePanel>
    </div>
  )
}
