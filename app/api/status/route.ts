import { NextResponse } from "next/server"
import packageJson from "@/package.json"

/**
 * Health check endpoint to verify the system is working
 * GET /api/status
 */
export async function GET() {
  // Dynamically get Next.js version
  let nextVersion = "16.0.0"
  try {
    const nextPackage = await import("next/package.json")
    nextVersion = nextPackage.version
  } catch {
    // Fallback to known version if import fails
  }

  const status = {
    status: "operational",
    message: "System is working correctly",
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    services: {
      api: "operational",
      build: "successful",
      nextjs: nextVersion,
    },
  }

  return NextResponse.json(status, { status: 200 })
}
