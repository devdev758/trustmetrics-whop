/**
 * Stripe Customer Portal API Route
 *
 * Create customer portal session for subscription management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { createCustomerPortalSession } from '@/lib/stripe/client';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/portal
 *
 * Create Stripe customer portal session
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

    // Get creator data
    const creator = await prisma.creator.findUnique({
      where: { id: session.creatorId },
      select: {
        id: true,
        stripeCustomerId: true,
      },
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    if (!creator.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Create customer portal session
    const portalSession = await createCustomerPortalSession(
      creator.stripeCustomerId
    );

    return NextResponse.json(
      {
        url: portalSession.url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Portal session creation error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create portal session',
      },
      { status: 500 }
    );
  }
}
