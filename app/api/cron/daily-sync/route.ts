/**
 * Daily Sync Cron Job Endpoint
 *
 * Scheduled endpoint to sync all creators' data daily
 * Should be called by a cron service (e.g., Vercel Cron, GitHub Actions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncAllCreators } from '@/lib/whop/sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max execution time

/**
 * GET /api/cron/daily-sync
 *
 * Sync all active creators' data
 * Requires CRON_SECRET in Authorization header for security
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      );
    }

    // Check Authorization header (Bearer token or simple secret)
    const providedSecret = authHeader?.replace('Bearer ', '');

    if (providedSecret !== cronSecret) {
      console.warn('Unauthorized cron job attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Execute sync for all creators
    console.log('Starting daily sync for all creators...');
    const startTime = Date.now();

    const summary = await syncAllCreators();

    const duration = Date.now() - startTime;

    console.log(
      `Daily sync completed in ${duration}ms:`,
      `${summary.success}/${summary.total} successful`
    );

    // Return summary
    return NextResponse.json({
      success: true,
      summary: {
        total: summary.total,
        successful: summary.success,
        failed: summary.failed,
        duration: `${duration}ms`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Daily sync error:', error);

    return NextResponse.json(
      {
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/daily-sync
 *
 * Alternative method for cron services that prefer POST
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
