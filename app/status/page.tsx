"use client"

import { useEffect, useState } from "react"

interface StatusResponse {
  status: string
  message: string
  timestamp: string
  version: string
  services: Record<string, string>
}

export default function StatusPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/status")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        setStatus(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching status:", error)
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-black/50 backdrop-blur-lg border border-green-400/30 rounded-lg p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-400 mb-2">🌌 VOID METAVERSE</h1>
          <h2 className="text-xl text-cyan-300">System Status</h2>
        </div>

        {status ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-2xl font-bold text-green-400">
                {status.status.toUpperCase()}
              </span>
            </div>

            <div className="text-center text-gray-300">
              <p className="text-lg">{status.message}</p>
            </div>

            <div className="border-t border-green-400/20 pt-6">
              <h3 className="text-lg font-semibold text-cyan-300 mb-4">Services Status</h3>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(status.services).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between bg-gray-900/50 p-3 rounded border border-green-400/20"
                  >
                    <span className="text-gray-300 capitalize">{key}</span>
                    <span className="text-green-400 font-mono">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-green-400/20 pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Version:</span>
                  <span className="text-white ml-2 font-mono">{status.version}</span>
                </div>
                <div>
                  <span className="text-gray-400">Timestamp:</span>
                  <span className="text-white ml-2 font-mono text-xs">
                    {new Date(status.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <div
                className={`inline-flex items-center space-x-2 ${
                  status.status === "operational" ? "text-green-400" : "text-yellow-400"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-semibold">
                  {status.status === "operational"
                    ? "All Systems Operational"
                    : status.message}
                </span>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="text-red-400 mb-2">
              <svg
                className="w-12 h-12 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-lg font-semibold">Failed to load status information</p>
              <p className="text-sm text-gray-400 mt-2">Unable to connect to the status API</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-red-400">
            <p>No status data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
