/**
 * Stripe Webhook API Route
 *
 * Handle Stripe webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/webhook
 *
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Webhook handler failed',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const creatorId = session.metadata?.creatorId;
  const tier = session.metadata?.tier;

  if (!creatorId) {
    console.error('No creatorId in checkout session metadata');
    return;
  }

  // Get subscription details
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

  if (!subscriptionId) {
    console.error('No subscription ID in checkout session');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update creator with subscription details
  await prisma.creator.update({
    where: { id: creatorId },
    data: {
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      tier: tier || 'bronze',
    },
  });

  console.log(
    `Subscription created for creator ${creatorId}: ${subscriptionId}`
  );
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const creatorId = subscription.metadata?.creatorId;

  if (!creatorId) {
    // Try to find creator by customer ID
    const creator = await prisma.creator.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    });

    if (!creator) {
      console.error('No creator found for subscription update');
      return;
    }

    await updateCreatorSubscription(creator.id, subscription);
  } else {
    await updateCreatorSubscription(creatorId, subscription);
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const creatorId = subscription.metadata?.creatorId;

  if (!creatorId) {
    // Try to find creator by customer ID
    const creator = await prisma.creator.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    });

    if (!creator) {
      console.error('No creator found for subscription deletion');
      return;
    }

    await prisma.creator.update({
      where: { id: creator.id },
      data: {
        subscriptionStatus: 'canceled',
        tier: 'bronze', // Downgrade to free tier
      },
    });

    console.log(`Subscription canceled for creator ${creator.id}`);
  } else {
    await prisma.creator.update({
      where: { id: creatorId },
      data: {
        subscriptionStatus: 'canceled',
        tier: 'bronze', // Downgrade to free tier
      },
    });

    console.log(`Subscription canceled for creator ${creatorId}`);
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!subscriptionId) {
    console.error('No subscription ID in failed payment invoice');
    return;
  }

  const creator = await prisma.creator.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!creator) {
    console.error('No creator found for failed payment');
    return;
  }

  await prisma.creator.update({
    where: { id: creator.id },
    data: {
      subscriptionStatus: 'past_due',
    },
  });

  console.log(`Payment failed for creator ${creator.id}`);
}

/**
 * Update creator subscription details
 */
async function updateCreatorSubscription(
  creatorId: string,
  subscription: Stripe.Subscription
) {
  const tier = subscription.metadata?.tier || 'bronze';

  await prisma.creator.update({
    where: { id: creatorId },
    data: {
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      tier,
    },
  });

  console.log(`Subscription updated for creator ${creatorId}`);
}
