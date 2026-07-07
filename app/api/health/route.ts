/**
 * GET /api/health
 * Simple health check endpoint
 */

import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}
