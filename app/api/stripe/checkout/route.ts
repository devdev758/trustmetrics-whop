/**
 * Stripe Checkout API Route
 *
 * Create Stripe checkout session for subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import {
  createCheckoutSession,
  SUBSCRIPTION_TIERS,
  SubscriptionTier,
} from '@/lib/stripe/client';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/checkout
 *
 * Create Stripe checkout session
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { tier } = body;

    // Validate tier
    if (!tier || !SUBSCRIPTION_TIERS[tier as SubscriptionTier]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Get creator data
    const creator = await prisma.creator.findUnique({
      where: { id: session.creatorId },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Check if creator already has active subscription
    if (creator.stripeSubscriptionId) {
      return NextResponse.json(
        {
          error:
            'You already have an active subscription. Please manage it from the billing portal.',
        },
        { status: 400 }
      );
    }

    // Get price ID for tier
    const tierData = SUBSCRIPTION_TIERS[tier as SubscriptionTier];
    const priceId = tierData.priceId;

    // Create checkout session
    const checkoutSession = await createCheckoutSession(
      creator.id,
      creator.email,
      priceId,
      tier as SubscriptionTier
    );

    return NextResponse.json(
      {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
