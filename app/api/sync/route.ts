/**
 * Manual Sync API Endpoint
 *
 * Allows authenticated creators to manually trigger data synchronization
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { syncCreatorData } from '@/lib/whop/sync';
import type { SessionData } from '@/types/whop';

export const dynamic = 'force-dynamic';

/**
 * Get session from cookies
 */
async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return null;
  }

  try {
    const sessionData: SessionData = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64url').toString('utf-8')
    );

    // Check if session is expired
    if (sessionData.expiresAt < Date.now()) {
      return null;
    }

    return sessionData;
  } catch {
    return null;
  }
}

/**
 * POST /api/sync
 *
 * Manually trigger data synchronization for authenticated creator
 */
export async function POST(_request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Trigger sync for the authenticated creator
    const result = await syncCreatorData(session.creatorId);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Sync failed',
          message: result.error || 'Unknown error',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      trustScore: result.trustScore,
      tier: result.tier,
      metricsId: result.metricsId,
      message: 'Data synchronized successfully',
    });
  } catch (error) {
    console.error('Sync API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
