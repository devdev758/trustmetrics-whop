/**
 * Billing Content Component
 *
 * Client component for billing and subscription management
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CreditCard, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe/client';

interface BillingContentProps {
  creatorId: string;
  currentTier: string;
  subscriptionStatus: string;
  hasStripeCustomer: boolean;
}

export function BillingContent({
  currentTier,
  subscriptionStatus,
  hasStripeCustomer,
}: BillingContentProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  /**
   * Handle subscription checkout
   */
  const handleSubscribe = async (tier: string) => {
    setIsLoading(tier);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to start checkout'
      );
      setIsLoading(null);
    }
  };

  /**
   * Handle customer portal access
   */
  const handleManageBilling = async () => {
    setIsLoading('portal');

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      // Redirect to customer portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to open billing portal'
      );
      setIsLoading(null);
    }
  };

  const isActive = subscriptionStatus === 'active';
  const isPastDue = subscriptionStatus === 'past_due';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Billing & Subscription
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your subscription and billing settings
        </p>
      </div>

      {/* Current Plan */}
      {hasStripeCustomer && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Current Plan
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                You are currently on the{' '}
                <span className="font-semibold">
                  {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
                </span>{' '}
                plan
              </p>
            </div>
            <button
              onClick={handleManageBilling}
              disabled={isLoading === 'portal'}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading === 'portal' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Manage Billing
                </>
              )}
            </button>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                isActive
                  ? 'bg-green-100 text-green-800'
                  : isPastDue
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isActive
                    ? 'bg-green-600'
                    : isPastDue
                      ? 'bg-yellow-600'
                      : 'bg-gray-600'
                }`}
              />
              {subscriptionStatus.charAt(0).toUpperCase() +
                subscriptionStatus.slice(1).replace('_', ' ')}
            </span>
          </div>

          {isPastDue && (
            <div className="mt-4 rounded-lg bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                Your payment is past due. Please update your payment method to
                continue using TrustMetrics.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pricing Plans */}
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          {hasStripeCustomer ? 'Upgrade Your Plan' : 'Choose Your Plan'}
        </h2>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Bronze Tier */}
          <PricingCard
            tier="bronze"
            name={SUBSCRIPTION_TIERS.bronze.name}
            price={SUBSCRIPTION_TIERS.bronze.price}
            features={SUBSCRIPTION_TIERS.bronze.features}
            currentTier={currentTier}
            isLoading={isLoading === 'bronze'}
            onSubscribe={handleSubscribe}
            disabled={hasStripeCustomer}
          />

          {/* Silver Tier */}
          <PricingCard
            tier="silver"
            name={SUBSCRIPTION_TIERS.silver.name}
            price={SUBSCRIPTION_TIERS.silver.price}
            features={SUBSCRIPTION_TIERS.silver.features}
            currentTier={currentTier}
            isLoading={isLoading === 'silver'}
            onSubscribe={handleSubscribe}
            popular
            disabled={hasStripeCustomer}
          />

          {/* Gold Tier */}
          <PricingCard
            tier="gold"
            name={SUBSCRIPTION_TIERS.gold.name}
            price={SUBSCRIPTION_TIERS.gold.price}
            features={SUBSCRIPTION_TIERS.gold.features}
            currentTier={currentTier}
            isLoading={isLoading === 'gold'}
            onSubscribe={handleSubscribe}
            disabled={hasStripeCustomer}
          />
        </div>

        {hasStripeCustomer && (
          <p className="mt-6 text-center text-sm text-gray-600">
            To change your plan, please{' '}
            <button
              onClick={handleManageBilling}
              className="font-medium text-blue-600 hover:underline"
            >
              manage your billing
            </button>{' '}
            in the Stripe customer portal.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Pricing Card Component
 */
function PricingCard({
  tier,
  name,
  price,
  features,
  currentTier,
  isLoading,
  onSubscribe,
  popular = false,
  disabled = false,
}: {
  tier: string;
  name: string;
  price: number;
  features: readonly string[];
  currentTier: string;
  isLoading: boolean;
  onSubscribe: (tier: string) => void;
  popular?: boolean;
  disabled?: boolean;
}) {
  const isCurrent = currentTier === tier;

  return (
    <div
      className={`relative rounded-2xl border-2 bg-white p-8 shadow-sm ${
        popular
          ? 'border-blue-500'
          : isCurrent
            ? 'border-green-500'
            : 'border-gray-200'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4" />
            Most Popular
          </span>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-4 py-1 text-sm font-semibold text-white">
            <Check className="h-4 w-4" />
            Current Plan
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-5xl font-bold text-gray-900">${price}</span>
          <span className="text-gray-600">/month</span>
        </div>
      </div>

      <ul className="mb-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSubscribe(tier)}
        disabled={disabled || isLoading || isCurrent}
        className={`w-full rounded-lg px-6 py-3 text-center text-sm font-semibold transition-colors ${
          isCurrent
            ? 'cursor-not-allowed bg-green-100 text-green-800'
            : popular
              ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
              : 'border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </span>
        ) : isCurrent ? (
          'Current Plan'
        ) : disabled ? (
          'Manage in Portal'
        ) : (
          `Subscribe to ${name}`
        )}
      </button>
    </div>
  );
}
