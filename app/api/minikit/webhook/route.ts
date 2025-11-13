// app/api/minikit/webhook/route.ts
// Webhook handler for Base Mini App events

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("[MiniKit Webhook] Event received:", {
      type: body.type,
      timestamp: new Date().toISOString(),
      data: body,
    });

    // Handle different event types
    switch (body.type) {
      case "app.opened":
        // User opened the app
        console.log("User opened VOID mini app:", body.userId);
        break;

      case "transaction.completed":
        // User completed an onchain transaction
        console.log("Transaction completed:", body.transactionHash);
        // Could trigger XP reward, achievement unlock, etc.
        break;

      case "zone.entered":
        // Custom event: User entered a new zone
        console.log("User entered zone:", body.zone);
        // Could send push notification to friends
        break;

      case "xp.earned":
        // Custom event: User earned XP
        console.log("XP earned:", body.amount);
        // Could trigger level-up notification
        break;

      default:
        console.log("Unknown event type:", body.type);
    }

    // Return success response
    return NextResponse.json({ 
      success: true,
      message: "Event processed",
    });

  } catch (error) {
    console.error("[MiniKit Webhook] Error:", error);
    
    return NextResponse.json(
      { success: false, error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

// Optional: Verify webhook signature for security
function verifyWebhookSignature(request: NextRequest): boolean {
  // Add signature verification logic here
  // Reference: https://docs.base.org/mini-apps/features/webhooks
  return true;
}
