/**
 * Stripe Client Library
 *
 * Initialize Stripe and provide helper functions
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

/**
 * Initialize Stripe with secret key
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

/**
 * Subscription tier pricing
 */
export const SUBSCRIPTION_TIERS = {
  bronze: {
    name: 'Bronze',
    priceId: process.env.STRIPE_BRONZE_PRICE_ID || 'price_bronze',
    price: 29,
    features: [
      'Trust Score tracking',
      'Basic analytics',
      'Public profile page',
      'Trust Badge',
      'Email support',
    ],
  },
  silver: {
    name: 'Silver',
    priceId: process.env.STRIPE_SILVER_PRICE_ID || 'price_silver',
    price: 79,
    features: [
      'Everything in Bronze',
      'Advanced analytics',
      'Milestone tracking',
      'Achievement verification',
      'Priority support',
      'Custom branding',
    ],
  },
  gold: {
    name: 'Gold',
    priceId: process.env.STRIPE_GOLD_PRICE_ID || 'price_gold',
    price: 199,
    features: [
      'Everything in Silver',
      'API access',
      'White-label solutions',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced security features',
    ],
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(
  creatorId: string,
  email: string,
  priceId: string,
  tier: SubscriptionTier
): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/billing`,
    customer_email: email,
    client_reference_id: creatorId,
    metadata: {
      creatorId,
      tier,
    },
    subscription_data: {
      metadata: {
        creatorId,
        tier,
      },
    },
  });

  return session;
}

/**
 * Create customer portal session
 */
export async function createCustomerPortalSession(
  customerId: string
): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/billing`,
  });

  return session;
}

/**
 * Get subscription by ID
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Failed to retrieve subscription:', error);
    return null;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
}

/**
 * Get customer by ID
 */
export async function getCustomer(
  customerId: string
): Promise<Stripe.Customer | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return null;
    }
    return customer as Stripe.Customer;
  } catch (error) {
    console.error('Failed to retrieve customer:', error);
    return null;
  }
}
