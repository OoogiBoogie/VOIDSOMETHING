"use client"

import { useState, useEffect } from "react"
import { Megaphone, Briefcase, Users, Sparkles, ExternalLink } from "lucide-react"

interface AnnouncementItem {
  id: string
  type: "project" | "job" | "collab" | "event"
  title: string
  description: string
  link?: string
  urgent?: boolean
}

interface TopTickerProps {
  announcements: AnnouncementItem[]
}

export function TopTicker({ announcements }: TopTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused || announcements.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 6000) // Change every 6 seconds

    return () => clearInterval(interval)
  }, [isPaused, announcements.length])

  if (announcements.length === 0) return null

  const current = announcements[currentIndex]

  const getIcon = () => {
    switch (current.type) {
      case "project":
        return <Sparkles className="w-5 h-5" />
      case "job":
        return <Briefcase className="w-5 h-5" />
      case "collab":
        return <Users className="w-5 h-5" />
      case "event":
        return <Megaphone className="w-5 h-5" />
    }
  }

  const getColor = () => {
    switch (current.type) {
      case "project":
        return "#FFD700"
      case "job":
        return "#00FFA6"
      case "collab":
        return "#33E7FF"
      case "event":
        return "#FF6B6B"
    }
  }

  const color = getColor()

  return (
    <div
      className="fixed top-0 left-0 right-0 h-12 z-[9995] pointer-events-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background with gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0A0A19] via-[rgba(10,10,25,0.95)] to-[#0A0A19] backdrop-blur-md"
      />
      
      {/* Animated border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
        <div
          className="h-full animate-ticker-slide"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            width: "200%",
          }}
        />
      </div>

      {/* CRT scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, transparent 1px, transparent 2px)",
        }}
      />

      {/* Content */}
      <div className="relative h-full flex items-center px-6 gap-4">
        {/* Icon */}
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg animate-pulse"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {getIcon()}
        </div>

        {/* Urgent Badge */}
        {current.urgent && (
          <div className="px-2 py-1 rounded bg-[#FF6B6B]/20 border border-[#FF6B6B]/40 animate-pulse">
            <span className="text-[#FF6B6B] text-xs font-black">URGENT</span>
          </div>
        )}

        {/* Type Label */}
        <div
          className="px-3 py-1 rounded-full text-xs font-black tracking-wider"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {current.type.toUpperCase()}
        </div>

        {/* Title & Description */}
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm truncate mb-0.5">{current.title}</div>
          <div className="text-white/60 text-xs truncate">{current.description}</div>
        </div>

        {/* Link Button */}
        {current.link && (
          <a
            href={current.link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 hover:scale-105"
            style={{
              backgroundColor: `${color}20`,
              color,
              border: `1px solid ${color}40`,
            }}
          >
            LEARN MORE
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {/* Pagination Dots */}
        <div className="flex items-center gap-1.5">
          {announcements.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: idx === currentIndex ? color : "rgba(255,255,255,0.2)",
                width: idx === currentIndex ? "16px" : "8px",
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker-slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        .animate-ticker-slide {
          animation: ticker-slide 3s linear infinite;
        }
      `}</style>
    </div>
  )
}
