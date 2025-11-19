/**
 * VOID PROTOCOL - CURRENT PARCEL INFO PANEL
 * 
 * Live info panel showing:
 * - Current parcel player is standing on
 * - District assignment
 * - Owner address (via WorldLandTestnet.ownerOf)
 * - Ownership status (you/other/unowned)
 */

"use client"

import React, { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { useWorldEvent, PLAYER_MOVED, PARCEL_ENTERED } from '@/services/events/worldEvents'
import { cityWorldToParcel, getDistrict } from '@/world/WorldCoords'
import type { DistrictId } from '@/world/map/districts'
import { voidTheme } from '@/ui/theme/voidTheme'

const WORLD_LAND = "0xC4559144b784A8991924b1389a726d68C910A206" as const;

interface CurrentParcelData {
  x: number
  z: number
  parcelId: number
  district: DistrictId
}

export function CurrentParcelPanel() {
  const { address } = useAccount()
  const [currentParcel, setCurrentParcel] = useState<CurrentParcelData | null>(null)

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
  useWorldEvent(PLAYER_MOVED, (data) => {
    const parcelCoords = cityWorldToParcel(data.position)
    const parcelId = data.parcelId
    const district = getDistrict(parcelCoords)

    setCurrentParcel({
      x: parcelCoords.x,
      z: parcelCoords.z,
      parcelId,
      district,
    })
  }, [])

  useWorldEvent(PARCEL_ENTERED, (data) => {
    const parcelId = data.parcelInfo.id
    const district = getDistrict(data.parcelInfo.coords)

    setCurrentParcel({
      x: data.parcelInfo.coords.x,
      z: data.parcelInfo.coords.z,
      parcelId,
      district,
    })
  }, [])

  if (!currentParcel) {
    return (
      <div style={{
        padding: '12px',
        background: 'rgba(0, 0, 0, 0.5)',
        border: `1px solid ${voidTheme.colors.neonPurple}60`,
        borderRadius: '6px',
        fontSize: '12px',
        color: voidTheme.colors.textMuted,
      }}>
        <div style={{ fontWeight: 600, marginBottom: '4px', color: voidTheme.colors.neonPurple }}>
          📍 CURRENT PARCEL
        </div>
        <div>Waiting for position...</div>
      </div>
    )
  }

  const getDistrictColor = (district: DistrictId): string => {
    const colors: Record<DistrictId, string> = {
      HQ: voidTheme.colors.textTertiary,
      DEFI: voidTheme.colors.neonPurple,
      CREATOR: voidTheme.colors.neonTeal,
      DAO: voidTheme.colors.neonPink,
      AI: voidTheme.colors.neonBlue,
      SOCIAL: '#ff9d00',  // Orange
      IDENTITY: '#00ff88',  // Green
      CENTRAL_EAST: voidTheme.colors.textMuted,
      CENTRAL_SOUTH: voidTheme.colors.textMuted,
    }
    return colors[district] || voidTheme.colors.textTertiary
  }

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
    }
    return names[district] || 'Unknown Zone'
  }

  const getOwnershipStatus = (): { text: string; color: string } => {
    if (!owner) {
      return { text: 'Unowned', color: voidTheme.colors.textMuted }
    }
    if (address && owner.toLowerCase() === address.toLowerCase()) {
      return { text: 'Owned by you', color: voidTheme.colors.accentPositive }
    }
    return {
      text: `Owned by ${owner.slice(0, 6)}...${owner.slice(-4)}`,
      color: voidTheme.colors.textSecondary,
    }
  }

  const ownershipStatus = getOwnershipStatus()
  const districtColor = getDistrictColor(currentParcel.district)
  const districtName = getDistrictName(currentParcel.district)

  return (
    <div style={{
      padding: '12px',
      background: 'rgba(0, 0, 0, 0.6)',
      border: `2px solid ${districtColor}`,
      borderRadius: '6px',
      fontSize: '12px',
      fontFamily: 'monospace',
      boxShadow: `0 0 12px ${districtColor}40`,
    }}>
      {/* Header */}
      <div style={{
        fontWeight: 700,
        marginBottom: '8px',
        color: districtColor,
        fontSize: '13px',
        letterSpacing: '0.5px',
      }}>
        📍 CURRENT PARCEL
      </div>

      {/* Separator */}
      <div style={{
        height: '1px',
        background: `${districtColor}40`,
        marginBottom: '8px',
      }} />

      {/* Info Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: voidTheme.colors.textMuted }}>Parcel:</span>
          <span style={{ color: voidTheme.colors.textPrimary, fontWeight: 600 }}>
            ({currentParcel.x}, {currentParcel.z})
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: voidTheme.colors.textMuted }}>ID:</span>
          <span style={{ color: voidTheme.colors.textPrimary, fontWeight: 600 }}>
            #{currentParcel.parcelId}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: voidTheme.colors.textMuted }}>District:</span>
          <span style={{ color: districtColor, fontWeight: 600 }}>
            {districtName}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: voidTheme.colors.textMuted }}>Owner:</span>
          <span style={{
            color: owner ? voidTheme.colors.textPrimary : voidTheme.colors.textMuted,
            fontSize: '11px',
          }}>
            {owner || 'None'}
          </span>
        </div>

        <div style={{
          marginTop: '4px',
          padding: '6px 8px',
          background: `${ownershipStatus.color}20`,
          border: `1px solid ${ownershipStatus.color}60`,
          borderRadius: '4px',
          textAlign: 'center',
          color: ownershipStatus.color,
          fontWeight: 600,
          fontSize: '11px',
        }}>
          {ownershipStatus.text}
        </div>
      </div>
    </div>
  )
}
