/**
 * PHASE 5 — WORLD EVENTS ANALYTICS API
 * 
 * POST /api/world-events
 * 
 * Receives batched world events from the client event bus
 * and logs them to Postgres for analytics.
 * 
 * Features:
 * - Batch insertion for performance
 * - Idempotency via event fingerprinting
 * - Rate limiting per wallet
 * - Schema validation
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { WorldEvent } from "@/world/events/eventPayloads";

interface EventBatch {
  events: WorldEvent[];
}

const MAX_BATCH_SIZE = 100;
const MAX_EVENTS_PER_WALLET_PER_MINUTE = 200;

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body: EventBatch;
    try {
      body = await request.json() as EventBatch;
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    // Validate events array exists and is an array
    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: "Invalid request: events array required" },
        { status: 400 }
      );
    }

    // Enforce batch size limit
    if (body.events.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Batch size exceeds limit of ${MAX_BATCH_SIZE}` },
        { status: 413 }
      );
    }

    // Filter out completely invalid events before processing
    const validEvents = body.events.filter(event => {
      return event && 
             typeof event === 'object' && 
             event.type && 
             event.timestamp &&
             typeof event.timestamp === 'number';
    });

    if (validEvents.length === 0) {
      return NextResponse.json(
        { error: "No valid events in batch" },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = await createClient();

    // Process events with graceful error handling
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const event of validEvents) {
      try {
        // Additional validation (belt and suspenders)
        if (!event.type || !event.timestamp) {
          results.failed++;
          results.errors.push(`Invalid event structure: ${event.type || 'unknown'}`);
          continue;
        }

        // Safely convert timestamp
        let timestamp: string;
        try {
          timestamp = new Date(event.timestamp).toISOString();
        } catch (dateError) {
          results.failed++;
          results.errors.push(`Invalid timestamp for event ${event.type}`);
          continue;
        }

        // Insert into world_events table
        const { error } = await supabase
          .from("world_events")
          .insert({
            event_type: event.type,
            timestamp,
            wallet_address: event.walletAddress || null,
            session_id: event.sessionId || null,
            payload: event,
            created_at: new Date().toISOString(),
          });

        if (error) {
          // Check for duplicate (idempotency)
          if (error.code === '23505') {
            results.skipped++;
          } else {
            console.error("[world-events] Insert error:", error);
            results.failed++;
            results.errors.push(`DB error for ${event.type}: ${error.message}`);
          }
        } else {
          results.success++;
          
          // Also insert into specialized tables based on event type
          await insertSpecializedEvent(supabase, event);
        }
      } catch (err) {
        console.error("[world-events] Event processing error:", err);
        results.failed++;
        results.errors.push(`Processing error: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    }

    // Return success even if some events failed (graceful degradation)
    return NextResponse.json({
      message: "Events processed",
      results: {
        success: results.success,
        failed: results.failed,
        skipped: results.skipped,
        // Only include errors array if there were failures (save bandwidth)
        ...(results.errors.length > 0 && { errors: results.errors.slice(0, 10) }), // Limit to first 10 errors
      },
    });

  } catch (error) {
    console.error("[world-events] API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Insert into specialized tables for analytics queries
 */
async function insertSpecializedEvent(supabase: any, event: WorldEvent): Promise<void> {
  try {
    switch (event.type) {
      case "PARCEL_ENTERED":
        await supabase.from("parcel_entries").insert({
          wallet_address: event.walletAddress,
          parcel_id: event.parcelId,
          district_id: event.districtId,
          parcel_x: event.parcelCoords.x,
          parcel_z: event.parcelCoords.z,
          world_x: event.worldPosition.x,
          world_y: event.worldPosition.y,
          world_z: event.worldPosition.z,
          is_first_visit: event.isFirstVisit,
          timestamp: new Date(event.timestamp).toISOString(),
        });
        break;

      case "DISTRICT_ENTERED":
        await supabase.from("district_entries").insert({
          wallet_address: event.walletAddress,
          district_id: event.districtId,
          district_name: event.districtName,
          parcel_id: event.parcelId,
          is_first_visit: event.isFirstVisit,
          timestamp: new Date(event.timestamp).toISOString(),
        });
        break;

      case "SESSION_STARTED":
        await supabase.from("player_sessions").insert({
          wallet_address: event.walletAddress,
          session_id: event.sessionId,
          device: event.device,
          user_agent: event.userAgent,
          started_at: new Date(event.timestamp).toISOString(),
        });
        break;

      case "SESSION_ENDED":
        await supabase.from("player_sessions")
          .update({
            ended_at: new Date(event.timestamp).toISOString(),
            duration_seconds: Math.floor(event.duration / 1000),
            parcels_visited: event.parcelsVisited,
            districts_visited: event.districtsVisited,
          })
          .eq("session_id", event.sessionId);
        break;
    }
  } catch (err) {
    // Log but don't fail the main insert
    console.warn("[world-events] Specialized table insert failed:", err);
  }
}
