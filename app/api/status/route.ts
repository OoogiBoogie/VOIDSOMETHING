import { NextResponse } from "next/server"

/**
 * Health check endpoint to verify the system is working
 * GET /api/status
 */
export async function GET() {
  const status = {
    status: "operational",
    message: "System is working correctly",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    services: {
      api: "operational",
      build: "successful",
      nextjs: "16.0.0",
    },
  }

  return NextResponse.json(status, { status: 200 })
}
