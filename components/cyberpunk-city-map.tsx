"use client"

import { useState } from "react"
import { DISTRICTS, type District } from "@/lib/districts"
import { propertyRegistry, type PropertyListing } from "@/lib/real-estate-system"
import { useTeleportSystem } from "@/lib/hooks/use-teleport-system"
import { X, Zap, MapPin, Lock, Plus, Minus, Building2, Home, Store, Shield } from "lucide-react"
import { useAccount } from "wagmi"
import { useVoidUnlocks } from "@/hooks/useVoidUnlocks"
import { useVoidScore } from "@/hooks/useVoidScore"

interface CyberpunkCityMapProps {
  playerPosition: { x: number; z: number }
  onTeleport: (x: number, z: number) => void
  onClose: () => void
}

export function CyberpunkCityMap({ playerPosition, onTeleport, onClose }: CyberpunkCityMapProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null)
  const [filterType, setFilterType] = useState<"all" | "residential" | "commercial">("all")
  const [zoomLevel, setZoomLevel] = useState(1)
  const teleportSystem = useTeleportSystem()
  const { address } = useAccount()
  const { checkAccess, nextZone } = useVoidUnlocks()
  const { voidScore } = useVoidScore()

  const mapSize = 4000
  const scale = 0.12 * zoomLevel

  // Map district IDs to zone IDs for unlock checking
  const getZoneIdForDistrict = (districtId: string): 'base_city' | 'district_2' | 'district_3' | 'district_4' | 'agency_hq' | 's_tier_sector' => {
    switch (districtId) {
      case 'spawn-zone':
      case 'residential-north':
        return 'base_city';
      case 'commercial-east':
      case 'social-plaza':
        return 'district_2';
      case 'defi-district':
      case 'entertainment-south':
        return 'district_3';
      case 'tech-sector':
      case 'luxury-district':
        return 'district_4';
      case 'industrial-zone':
        return 's_tier_sector';
      default:
        return 'base_city';
    }
  };

  const isDistrictLocked = (district: District): boolean => {
    const zoneId = getZoneIdForDistrict(district.id);
    return !checkAccess(zoneId);
  };

  const districtProperties = selectedDistrict
    ? propertyRegistry.getAllListings().filter((p) => {
        const inDistrict =
          p.building.x >= selectedDistrict.centerX - selectedDistrict.sizeX / 2 &&
          p.building.x <= selectedDistrict.centerX + selectedDistrict.sizeX / 2 &&
          p.building.z >= selectedDistrict.centerZ - selectedDistrict.sizeZ / 2 &&
          p.building.z <= selectedDistrict.centerZ + selectedDistrict.sizeZ / 2

        if (filterType === "residential") return inDistrict && p.building.type === "residential"
        if (filterType === "commercial")
          return inDistrict && (p.building.type === "commercial" || p.building.type === "mixed")
        return inDistrict
      })
    : []

  const getDistrictColor = (district: District) => {
    return district.color
  }

  const handleTeleport = async (district: District) => {
    if (!address) {
      alert("Please connect your wallet to teleport")
      return
    }

    const result = await teleportSystem.teleport({
      toDistrict: district.id,
      type: "instant",
    })

    if (result.success) {
      onTeleport(district.centerX, district.centerZ)
      onClose()
    } else {
      alert(result.error || "Teleport failed")
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm">
      <div className="relative w-full h-full flex flex-col">
        <div className="bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] border-b-4 border-[#06FFA5] px-6 py-4 shadow-[0_0_30px_rgba(6,255,165,0.5)]">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#06FFA5] via-[#00d4ff] to-[#06FFA5] font-mono tracking-tighter"
                style={{
                  textShadow: "0 0 30px rgba(6,255,165,0.8), 0 0 60px rgba(6,255,165,0.4)",
                }}
              >
                VOID CITY MAP
              </h1>
              <p className="text-sm text-[#06FFA5]/80 mt-2 font-mono font-bold tracking-wide">
                {selectedDistrict
                  ? `VIEWING ${selectedDistrict.name.toUpperCase()} • ${districtProperties.length} PROPERTIES`
                  : "SELECT A DISTRICT TO VIEW AVAILABLE PROPERTIES"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-[#06FFA5]/20 rounded-xl transition-all text-slate-400 hover:text-[#06FFA5] border-2 border-[#06FFA5]/40 shadow-[0_0_20px_rgba(6,255,165,0.3)]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative overflow-auto bg-slate-900">
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <button
                onClick={() => setZoomLevel(Math.min(zoomLevel + 0.3, 2.5))}
                className="w-12 h-12 flex items-center justify-center bg-slate-900/90 hover:bg-cyan-500/20 border-2 border-cyan-500/40 rounded-xl text-cyan-400 transition-all font-bold text-xl"
              >
                <Plus className="w-6 h-6" />
              </button>
              <button
                onClick={() => setZoomLevel(Math.max(zoomLevel - 0.3, 0.5))}
                className="w-12 h-12 flex items-center justify-center bg-slate-900/90 hover:bg-cyan-500/20 border-2 border-cyan-500/40 rounded-xl text-cyan-400 transition-all font-bold text-xl"
              >
                <Minus className="w-6 h-6" />
              </button>
            </div>

            <svg
              width={mapSize * scale}
              height={mapSize * scale}
              className="mx-auto my-8"
              style={{ imageRendering: "crisp-edges" }}
            >
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#0f172a" strokeWidth="1" opacity="0.4" />
                </pattern>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect width={mapSize * scale} height={mapSize * scale} fill="#020617" />
              <rect width={mapSize * scale} height={mapSize * scale} fill="url(#grid)" />

              {DISTRICTS.filter((d) => d.id !== "spawn-zone").map((district) => {
                const x = (mapSize / 2 + district.centerX - district.sizeX / 2) * scale
                const y = (mapSize / 2 + district.centerZ - district.sizeZ / 2) * scale
                const w = district.sizeX * scale
                const h = district.sizeZ * scale
                const isSelected = selectedDistrict?.id === district.id
                const locked = isDistrictLocked(district)

                return (
                  <g key={district.id}>
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill={locked ? "#666666" : district.color}
                      fillOpacity={locked ? 0.1 : (isSelected ? 0.35 : 0.15)}
                      stroke={locked ? "#666666" : district.color}
                      strokeWidth={isSelected ? 5 : 2.5}
                      strokeOpacity={locked ? 0.3 : (isSelected ? 1 : 0.6)}
                      className={locked ? "cursor-not-allowed" : "cursor-pointer transition-all hover:fill-opacity-30 hover:stroke-width-4"}
                      onClick={() => {
                        if (locked) {
                          alert(`Locked: Requires ${voidScore?.tier || 'higher'} tier to unlock`);
                        } else {
                          setSelectedDistrict(district);
                          setSelectedProperty(null);
                        }
                      }}
                      filter={isSelected ? "url(#glow)" : undefined}
                      rx="8"
                      ry="8"
                    />

                    {locked && (
                      <g>
                        <rect
                          x={x + w / 2 - 20}
                          y={y + h / 2 - 20}
                          width={40}
                          height={40}
                          fill="rgba(0,0,0,0.8)"
                          rx="8"
                        />
                        <text
                          x={x + w / 2}
                          y={y + h / 2 + 6}
                          textAnchor="middle"
                          fill="#999"
                          fontSize="24"
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          🔒
                        </text>
                      </g>
                    )}

                    <text
                      x={x + w / 2}
                      y={y + h / 2 - 10}
                      textAnchor="middle"
                      fill={locked ? "#666" : district.color}
                      fontSize={zoomLevel > 1.2 ? "18" : zoomLevel > 0.8 ? "14" : "11"}
                      fontWeight="bold"
                      className="pointer-events-none font-mono uppercase [text-shadow:_0_0_20px_rgb(0_0_0_/_100%),_0_0_10px_currentColor]"
                    >
                      {district.name}
                    </text>

                    <text
                      x={x + w / 2}
                      y={y + h / 2 + 12}
                      textAnchor="middle"
                      fill={district.color}
                      fillOpacity="0.8"
                      fontSize={zoomLevel > 1 ? "12" : "9"}
                      fontWeight="600"
                      className="pointer-events-none font-mono [text-shadow:_0_0_15px_rgb(0_0_0_/_100%)]"
                    >
                      {district.parcelCount} parcels
                    </text>

                    {district.requirements && (
                      <g transform={`translate(${x + 15}, ${y + 15})`}>
                        <circle cx="0" cy="0" r="16" fill="#ef4444" opacity="0.95" filter="url(#glow)" />
                        <text
                          x="0"
                          y="0"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="18"
                          className="pointer-events-none"
                        >
                          🔒
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}

              <g filter="url(#glow)">
                <rect
                  x={(mapSize / 2 - 100) * scale}
                  y={(mapSize / 2 - 100) * scale}
                  width={200 * scale}
                  height={200 * scale}
                  fill="#06FFA5"
                  fillOpacity="0.4"
                  stroke="#06FFA5"
                  strokeWidth="4"
                  rx="12"
                  ry="12"
                />
                <text
                  x={(mapSize / 2) * scale}
                  y={(mapSize / 2) * scale}
                  textAnchor="middle"
                  fill="#06FFA5"
                  fontSize="22"
                  fontWeight="bold"
                  className="font-mono [text-shadow:_0_0_25px_rgb(6_255_165_/_100%)]"
                >
                  PSX HQ
                </text>
              </g>

              <g
                transform={`translate(${(mapSize / 2 + playerPosition.x) * scale}, ${(mapSize / 2 + playerPosition.z) * scale})`}
                filter="url(#glow)"
              >
                <circle cx="0" cy="0" r="10" fill="#06FFA5" opacity="0.95" />
                <circle cx="0" cy="0" r="16" fill="none" stroke="#06FFA5" strokeWidth="3" opacity="0.7">
                  <animate attributeName="r" from="16" to="28" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.7" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>

              {selectedDistrict &&
                districtProperties.map((listing) => {
                  const px = (mapSize / 2 + listing.building.x) * scale
                  const py = (mapSize / 2 + listing.building.z) * scale
                  const pw = listing.building.width * scale * 0.8
                  const ph = listing.building.depth * scale * 0.8
                  const isPropertySelected = selectedProperty?.building.id === listing.building.id

                  return (
                    <g
                      key={listing.building.id}
                      onClick={() => setSelectedProperty(listing)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={px - pw / 2}
                        y={py - ph / 2}
                        width={pw}
                        height={ph}
                        fill={listing.building.forSale ? (listing.isOwned ? "#10b981" : "#f59e0b") : "#6b7280"}
                        fillOpacity={isPropertySelected ? 0.95 : 0.6}
                        stroke={isPropertySelected ? "#ffffff" : listing.building.forSale ? "#fbbf24" : "#9ca3af"}
                        strokeWidth={isPropertySelected ? 3 : 1.5}
                        filter={isPropertySelected ? "url(#glow)" : undefined}
                        className="transition-all hover:fill-opacity-85 hover:stroke-width-2"
                        rx="2"
                        ry="2"
                      />
                      {zoomLevel > 1.2 && (
                        <text
                          x={px}
                          y={py}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="white"
                          fontSize="7"
                          fontWeight="bold"
                          className="pointer-events-none [text-shadow:_0_0_8px_rgb(0_0_0_/_100%)]"
                        >
                          ${(listing.listingPrice / 1000).toFixed(0)}K
                        </text>
                      )}
                    </g>
                  )
                })}
            </svg>
          </div>

          <div className="w-[480px] bg-slate-900 border-l-2 border-cyan-500/30 p-6 overflow-y-auto">
            {selectedDistrict ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
                      {selectedDistrict.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedDistrict.description}</p>
                  </div>
                  {selectedDistrict.requirements && (
                    <div className="flex items-center gap-2 text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/40 font-mono">
                      <Lock className="w-3.5 h-3.5" />
                      <span className="font-bold">LOCKED</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {(["all", "residential", "commercial"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black transition-all font-mono uppercase ${
                        filterType === type
                          ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-black shadow-[0_0_20px_rgba(6,255,165,0.5)]"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-cyan-400 border border-slate-700"
                      }`}
                    >
                      {type === "all" ? "ALL TYPES" : type}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-800/50 rounded-xl p-5 border-2 border-cyan-500/20">
                  <div className="text-xs text-cyan-400 mb-4 font-mono font-bold tracking-wider">DISTRICT INFO</div>
                  <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                    <div>
                      <span className="text-slate-400 text-xs">Total Properties</span>
                      <div className="text-2xl font-black text-white mt-1">{districtProperties.length}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs">For Sale</span>
                      <div className="text-2xl font-black text-emerald-400 mt-1">
                        {districtProperties.filter((p) => p.building.forSale && !p.isOwned).length}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 text-xs">Price Range</span>
                      <div className="text-lg font-black text-cyan-400 mt-1">
                        ${Math.min(...districtProperties.map((p) => p.listingPrice), 999999).toLocaleString()} - $
                        {Math.max(...districtProperties.map((p) => p.listingPrice), 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-cyan-400 font-mono font-bold tracking-wider">AVAILABLE PROPERTIES</div>
                    <div className="text-xs text-slate-500 font-mono">{districtProperties.length} total</div>
                  </div>
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-slate-800/50">
                    {districtProperties.map((listing) => (
                      <button
                        key={listing.building.id}
                        onClick={() => setSelectedProperty(listing)}
                        className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                          selectedProperty?.building.id === listing.building.id
                            ? "bg-cyan-500/20 border-cyan-500 shadow-[0_0_20px_rgba(6,255,165,0.3)]"
                            : "bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {listing.building.type === "residential" ? (
                              <Home className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Store className="w-5 h-5 text-amber-400" />
                            )}
                            <span className="text-sm font-bold text-white uppercase font-mono">
                              {listing.building.type}
                            </span>
                          </div>
                          {listing.isOwned ? (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg font-mono font-bold border border-emerald-500/40">
                              OWNED
                            </span>
                          ) : listing.building.forSale ? (
                            <span className="text-xs bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg font-mono font-bold border border-amber-500/40">
                              FOR SALE
                            </span>
                          ) : (
                            <span className="text-xs bg-slate-500/20 text-slate-400 px-2.5 py-1 rounded-lg font-mono">
                              N/A
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Dimensions</span>
                            <span className="text-white font-bold">
                              {listing.building.width}×{listing.building.depth}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Price</span>
                            <span className="text-cyan-400 font-black text-lg">
                              ${listing.listingPrice.toLocaleString()}
                            </span>
                          </div>
                          {listing.monthlyIncome && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Monthly Income</span>
                              <span className="text-purple-400 font-bold">+${listing.monthlyIncome}/mo</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                    {districtProperties.length === 0 && (
                      <div className="text-center py-12 text-slate-500 text-sm">
                        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <div className="font-mono">No properties match your filter</div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedProperty && (
                  <div className="bg-slate-800/50 rounded-xl p-5 border-2 border-cyan-500/30">
                    <div className="text-xs text-cyan-400 mb-4 font-mono font-bold tracking-wider">
                      SELECTED PROPERTY
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-slate-400 mb-1 font-mono">Location Coordinates</div>
                        <div className="text-white font-mono text-sm font-bold">
                          [{selectedProperty.building.x}, {selectedProperty.building.z}]
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-2 font-mono">Purchase Price</div>
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                          ${selectedProperty.listingPrice.toLocaleString()}
                        </div>
                      </div>
                      {!selectedProperty.isOwned && selectedProperty.building.forSale && (
                        <button
                          onClick={() => {
                            alert(
                              `Purchase system coming soon!\n\nProperty: ${selectedProperty.building.id}\nPrice: $${selectedProperty.listingPrice.toLocaleString()}\nDistrict: ${selectedDistrict.name}`,
                            )
                          }}
                          className="w-full px-5 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black rounded-xl font-black text-sm transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] font-mono uppercase"
                        >
                          Buy Now
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleTeleport(selectedDistrict)}
                  disabled={!teleportSystem.canTeleport() || !address}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:from-slate-700 disabled:to-slate-600 text-white rounded-xl font-black transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] font-mono uppercase disabled:shadow-none"
                >
                  <Zap className="w-5 h-5" />
                  <span>Teleport Here (3 VOID)</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MapPin className="w-20 h-20 text-cyan-500/30 mb-6" />
                <p className="text-slate-400 text-lg font-mono font-bold">Select a District</p>
                <p className="text-slate-500 text-sm mt-3 max-w-xs font-mono">
                  Click any colored district on the map to view available properties and pricing
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
