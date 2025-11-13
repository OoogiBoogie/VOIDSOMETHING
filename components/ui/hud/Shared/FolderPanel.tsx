"use client"

import { AppFolderData } from "@/lib/app-folders"
import { motion, AnimatePresence } from "framer-motion"

interface FolderPanelProps {
  folder: AppFolderData | null
  isOpen: boolean
  onClose: () => void
  onAppClick: (appOnClick: () => void) => void
}

export function FolderPanel({ folder, isOpen, onClose, onAppClick }: FolderPanelProps) {
  if (!isOpen || !folder) return null

  return (
    <AnimatePresence>
      {/* Click Outside to Close */}
      <motion.div
        className="fixed inset-0 z-[9985]"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      />

      {/* Panel */}
      <motion.div
        className="fixed left-0 right-0 bottom-20 z-[9990] pointer-events-auto"
        initial={{ y: 400, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 400, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="max-w-6xl mx-auto px-6 pb-6">
          <div className="bg-[rgba(5,7,19,0.98)] backdrop-blur-[30px] border-2 rounded-t-3xl overflow-hidden shadow-[0_-8px_40px_rgba(0,0,0,0.7)]"
            style={{ borderColor: `${folder.color}80` }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 border-b-2 flex items-center justify-between"
              style={{
                background: `linear-gradient(135deg, ${folder.color}15, ${folder.color}08)`,
                borderColor: `${folder.color}40`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{folder.icon}</div>
                <div>
                  <h3
                    className="text-2xl font-bold font-[family-name:var(--font-orbitron)] tracking-wide"
                    style={{ color: folder.color }}
                  >
                    {folder.name}
                  </h3>
                  <p className="text-sm text-white/50 mt-0.5">
                    {folder.apps.length} {folder.apps.length === 1 ? "app" : "apps"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-white/50 flex items-center justify-center text-white/70 hover:text-white transition-all text-xl"
              >
                ✕
              </button>
            </div>

            {/* Apps Grid */}
            <div className="p-6 grid grid-cols-5 gap-4 max-h-[400px] overflow-y-auto">
              {folder.apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    onAppClick(app.onClick)
                    onClose()
                  }}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.12)] border-2 border-white/20 hover:border-white/40 transition-all duration-150 hover:scale-105"
                >
                  {/* App Icon */}
                  <div
                    className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.03)] group-hover:scale-110 transition-transform duration-150 shadow-lg"
                    style={{ borderColor: `${app.color}80` }}
                  >
                    {app.icon}
                  </div>

                  {/* App Name */}
                  <span
                    className="text-sm font-semibold text-center leading-tight"
                    style={{ color: app.color }}
                  >
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
