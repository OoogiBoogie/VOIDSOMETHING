"use client"

import { useState } from "react"
import { AppFolderData } from "@/lib/app-folders"
import { useHUDState } from "@/lib/hud-state"

interface AppHubProps {
  folders: AppFolderData[]
  isOpen: boolean
  onClose: () => void
}

export function AppHub({ folders, isOpen, onClose }: AppHubProps) {
  const { openFolder, activeFolder } = useHUDState()
  const [selectedFolder, setSelectedFolder] = useState<AppFolderData | null>(null)

  if (!isOpen) return null

  const handleFolderClick = (folder: AppFolderData) => {
    setSelectedFolder(folder)
    openFolder(folder.id as any)
  }

  const handleAppClick = (appOnClick: () => void) => {
    appOnClick()
    onClose()
    setSelectedFolder(null)
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-[8px] z-[9990] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Main Hub */}
      <div className="fixed inset-0 z-[9995] flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          {/* Folder Grid or App List */}
          {!selectedFolder ? (
            // Show Folder Grid
            <div className="flex flex-col items-center gap-6">
              {/* Title */}
              <div className="text-center">
                <h2 className="text-3xl font-bold font-[family-name:var(--font-orbitron)] text-white tracking-wider">
                  APPS
                </h2>
                <p className="text-sm text-white/50 mt-1">Tap a folder to open</p>
              </div>

              {/* Folders */}
              <div className="grid grid-cols-4 gap-6">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleFolderClick(folder)}
                    className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/5 transition-all duration-150"
                  >
                    {/* Folder Icon Stack (iOS style) */}
                    <div className="relative w-20 h-20">
                      {/* Background glow for PROGRESS */}
                      {folder.glow && (
                        <div className="absolute inset-0 rounded-2xl bg-[#00FFA6]/20 blur-xl animate-pulse" />
                      )}

                      {/* Main Folder */}
                      <div
                        className={`
                          relative w-full h-full rounded-2xl border-2 transition-all duration-150
                          bg-gradient-to-br from-[rgba(10,10,25,0.9)] to-[rgba(10,10,25,0.7)]
                          backdrop-blur-[25px] group-hover:scale-110
                          ${folder.glow ? "border-[#00FFA6] shadow-[0_0_20px_rgba(0,255,166,0.5)]" : "border-white/20"}
                        `}
                        style={{
                          borderColor: folder.glow ? undefined : `${folder.color}40`,
                        }}
                      >
                        {/* Stacked Mini Icons Preview */}
                        <div className="absolute inset-2 grid grid-cols-2 gap-1">
                          {folder.apps.slice(0, 4).map((app, idx) => (
                            <div
                              key={app.id}
                              className="flex items-center justify-center text-lg opacity-60"
                            >
                              {app.icon}
                            </div>
                          ))}
                        </div>

                        {/* Main Folder Icon */}
                        <div className="absolute inset-0 flex items-center justify-center text-4xl">
                          {folder.icon}
                        </div>

                        {/* Badge */}
                        {folder.badge !== undefined && folder.badge > 0 && (
                          <div className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-[#FF6B6B] border-2 border-[#050713] shadow-lg">
                            <span className="text-[10px] font-bold text-white">
                              {folder.badge}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Folder Name */}
                    <span
                      className="text-sm font-medium font-[family-name:var(--font-orbitron)] tracking-wide"
                      style={{ color: folder.color }}
                    >
                      {folder.name}
                    </span>

                    {/* App Count */}
                    <span className="text-xs text-white/30">
                      {folder.apps.length} {folder.apps.length === 1 ? "app" : "apps"}
                    </span>
                  </button>
                ))}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all duration-150"
              >
                Close (ESC)
              </button>
            </div>
          ) : (
            // Show Apps in Selected Folder
            <div className="flex flex-col items-center gap-6 min-w-[400px]">
              {/* Folder Header */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all duration-150"
                >
                  ←
                </button>
                <div className="text-4xl">{selectedFolder.icon}</div>
                <div>
                  <h3
                    className="text-2xl font-bold font-[family-name:var(--font-orbitron)] tracking-wider"
                    style={{ color: selectedFolder.color }}
                  >
                    {selectedFolder.name}
                  </h3>
                  <p className="text-xs text-white/50">
                    {selectedFolder.apps.length} {selectedFolder.apps.length === 1 ? "app" : "apps"}
                  </p>
                </div>
              </div>

              {/* Apps Grid */}
              <div className="grid grid-cols-3 gap-4">
                {selectedFolder.apps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app.onClick)}
                    className="group flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-all duration-150"
                  >
                    {/* App Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl bg-gradient-to-br from-[rgba(10,10,25,0.9)] to-[rgba(10,10,25,0.7)] backdrop-blur-[25px] group-hover:scale-110 transition-all duration-150"
                      style={{ borderColor: `${app.color}60` }}
                    >
                      {app.icon}
                    </div>

                    {/* App Name */}
                    <span
                      className="text-xs font-medium text-center leading-tight"
                      style={{ color: app.color }}
                    >
                      {app.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
