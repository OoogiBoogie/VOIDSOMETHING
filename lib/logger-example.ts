/**
 * EXAMPLE: API Route with Logging
 * 
 * This demonstrates how to integrate lib/logger.ts into API routes
 * for automatic request/response tracking.
 * 
 * File: app/api/example/route.ts (Next.js 15 App Router)
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger, timeAsync } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const start = performance.now();
  const endpoint = request.nextUrl.pathname;

  // Log incoming request
  logger.logRequest(endpoint, 'GET', {
    searchParams: Object.fromEntries(request.nextUrl.searchParams),
  });

  try {
    // Timed async operation
    const data = await timeAsync('Fetch database records', async () => {
      // Simulated database call
      await new Promise(resolve => setTimeout(resolve, 100));
      return { records: [], count: 0 };
    });

    // Log successful response
    const duration = Math.round(performance.now() - start);
    logger.logResponse(endpoint, 200, duration, {
      recordCount: data.count,
    });

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    // Log error response
    const duration = Math.round(performance.now() - start);
    logger.error(`API Error: ${endpoint}`, {
      endpoint,
      error: error as Error,
      duration,
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * EXAMPLE: Pages Router API Route with Logging
 * 
 * File: pages/api/example.ts (Next.js Pages Router)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withLogging } from '@/lib/logger';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Your API logic here
  res.status(200).json({ message: 'Success' });
}

// Wrap handler with automatic logging
export default withLogging(handler);
