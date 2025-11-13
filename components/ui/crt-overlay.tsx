'use client';

interface CRTOverlayProps {
  enabled?: boolean;
}

export function CRTOverlay({ enabled = true }: CRTOverlayProps) {
  if (!enabled) return null;

  return (
    <>
      {/* Very subtle scanlines */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9999]"
        style={{
          background: `repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.015) 0px, rgba(0, 0, 0, 0.015) 1px, transparent 1px, transparent 2px)`,
          opacity: 0.4
        }}
      />
      {/* Subtle vignette */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9998]"
        style={{
          background: `radial-gradient(ellipse at center, transparent 65%, rgba(0, 0, 0, 0.2) 100%)`
        }}
      />
      {/* Very light cyan/blue glow */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9997]"
        style={{
          boxShadow: `inset 0 0 120px rgba(127, 167, 255, 0.02)`
        }}
      />
    </>
  )
}