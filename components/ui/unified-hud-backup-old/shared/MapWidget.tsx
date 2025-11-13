"use client"

interface MapWidgetProps {
  playerPosition: { x: number; z: number }
  playerRotation: number
  districts?: Array<{
    id: string
    name: string
    color: string
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
  }>
  pois?: Array<{
    id: string
    type: "hq" | "market" | "mission" | "land" | "chat"
    position: { x: number; z: number }
  }>
  compact?: boolean
  onClick?: () => void
}

export function MapWidget({
  playerPosition,
  playerRotation,
  districts = [],
  pois = [],
  compact = false,
  onClick,
}: MapWidgetProps) {
  const size = compact ? 120 : 200
  const scale = compact ? 0.5 : 1

  const getPoiIcon = (type: string) => {
    switch (type) {
      case "hq":
        return "🏠"
      case "market":
        return "💎"
      case "mission":
        return "☆"
      case "land":
        return "🏠"
      case "chat":
        return "💬"
      default:
        return "○"
    }
  }

  return (
    <div
      className="fixed top-4 right-4 z-[9990] cursor-pointer transition-all duration-150 hover:scale-105"
      style={{ width: `${size}px`, height: `${size}px` }}
      onClick={onClick}
    >
      <div
        className="relative w-full h-full rounded-2xl border overflow-hidden"
        style={{
          background: "rgba(10, 10, 25, 0.75)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(0, 255, 166, 0.3)",
          boxShadow: "0 0 20px rgba(0, 255, 166, 0.15)",
        }}
      >
        {/* Grid Background */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00FFA6" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-grid)" />
        </svg>

        {/* Districts */}
        {districts.slice(0, 3).map((district, i) => (
          <div
            key={district.id}
            className="absolute border"
            style={{
              left: `${20 + i * 25}%`,
              top: `${20 + i * 15}%`,
              width: "20%",
              height: "20%",
              borderColor: district.color,
              background: `${district.color}15`,
              opacity: 0.6,
            }}
          />
        ))}

        {/* POIs */}
        {pois.slice(0, 4).map((poi, i) => (
          <div
            key={poi.id}
            className="absolute text-xs animate-pulse"
            style={{
              left: `${30 + i * 20}%`,
              top: `${30 + i * 15}%`,
              filter: "drop-shadow(0 0 3px #00FFA6)",
            }}
          >
            {getPoiIcon(poi.type)}
          </div>
        ))}

        {/* Player Marker (Center) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: "radial-gradient(circle, #00FFA6, #00CC85)",
              boxShadow: "0 0 10px rgba(0, 255, 166, 0.8)",
            }}
          />
          {/* Direction Arrow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full"
            style={{
              width: 0,
              height: 0,
              borderLeft: "3px solid transparent",
              borderRight: "3px solid transparent",
              borderBottom: "6px solid #00FFA6",
              filter: "drop-shadow(0 0 3px #00FFA6)",
              transform: `translateX(-50%) translateY(-100%) rotate(${playerRotation}deg)`,
            }}
          />
        </div>

        {/* Compass */}
        <div className="absolute top-1 left-1 text-[10px] font-['Orbitron'] font-bold text-[#00FFA6]">N</div>
        <div className="absolute bottom-1 right-1 text-[10px] font-['Orbitron'] font-bold text-gray-600">S</div>

        {/* Pulse Ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-[#00FFA6] opacity-30 animate-ping-slow" />
      </div>

      <style jsx>{`
        @keyframes ping-slow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.1;
            transform: scale(1.05);
          }
        }
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}
