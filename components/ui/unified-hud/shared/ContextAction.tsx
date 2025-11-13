"use client"

interface ContextActionProps {
  action?: {
    type: "talk" | "open" | "trade" | "enter" | "use"
    label: string
    key: string
  }
  onInteract?: () => void
}

export function ContextAction({ action, onInteract }: ContextActionProps) {
  if (!action) return null

  const getActionColor = () => {
    switch (action.type) {
      case "talk":
        return "#00FFA6"
      case "open":
        return "#33E7FF"
      case "trade":
        return "#FFD700"
      case "enter":
        return "#FF6B6B"
      default:
        return "#00FFA6"
    }
  }

  const color = getActionColor()

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9990] animate-bounce-in">
      <button
        onClick={onInteract}
        className="relative px-6 py-3 rounded-xl font-['Orbitron'] font-semibold text-sm transition-all duration-150 hover:scale-110"
        style={{
          background: `rgba(10, 10, 25, 0.85)`,
          backdropFilter: "blur(20px)",
          border: `2px solid ${color}`,
          color: color,
          boxShadow: `0 0 30px ${color}40, inset 0 0 20px ${color}20`,
        }}
      >
        {/* Glow Effect */}
        <div
          className="absolute inset-0 rounded-xl opacity-40 animate-pulse pointer-events-none"
          style={{
            boxShadow: `0 0 20px ${color}, inset 0 0 15px ${color}`,
          }}
        />

        {/* Content */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-black"
            style={{
              background: color,
              boxShadow: `0 0 10px ${color}`,
            }}
          >
            {action.key}
          </div>
          <span className="uppercase tracking-wider">{action.label}</span>
        </div>
      </button>

      <style jsx>{`
        @keyframes bounce-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  )
}
