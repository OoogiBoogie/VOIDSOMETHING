"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console (in production, send to error tracking service)
    console.error("Global error boundary caught:", error)
  }, [error])

  return (
    <html>
      <body style={{ 
        margin: 0, 
        padding: "40px", 
        fontFamily: "system-ui, sans-serif", 
        background: "#0a0a0a", 
        color: "#8f3bff",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          maxWidth: "600px",
          textAlign: "center",
          border: "2px solid #8f3bff",
          borderRadius: "8px",
          padding: "40px",
          background: "rgba(143, 59, 255, 0.05)",
          boxShadow: "0 0 40px rgba(143, 59, 255, 0.3)",
        }}>
          <h2 style={{ 
            fontSize: "24px", 
            marginBottom: "16px",
            textShadow: "0 0 20px rgba(143, 59, 255, 0.8)",
          }}>
            VOID SYSTEM ERROR
          </h2>
          <p style={{ 
            color: "#09f0c8", 
            marginBottom: "24px",
            fontFamily: "monospace",
          }}>
            {error.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#8f3bff",
              color: "#000",
              border: "none",
              padding: "12px 32px",
              fontSize: "16px",
              fontWeight: "bold",
              borderRadius: "4px",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(143, 59, 255, 0.6)",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#09f0c8"
              e.currentTarget.style.boxShadow = "0 0 30px rgba(9, 240, 200, 0.8)"
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#8f3bff"
              e.currentTarget.style.boxShadow = "0 0 20px rgba(143, 59, 255, 0.6)"
            }}
          >
            RETRY CONNECTION
          </button>
          <p style={{ 
            marginTop: "24px", 
            fontSize: "12px", 
            color: "#666",
            fontFamily: "monospace",
          }}>
            Error ID: {error.digest || "UNKNOWN"}
          </p>
        </div>
      </body>
    </html>
  )
}
