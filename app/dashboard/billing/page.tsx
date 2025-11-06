/**
 * Billing Dashboard Page
 *
 * Manage subscription and billing
 */

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { BillingContent } from '@/components/billing/BillingContent';

/**
 * Fetch creator billing data
 */
async function getCreatorBilling(creatorId: string) {
  const creator = await prisma.creator.findUnique({
    where: { id: creatorId },
    select: {
      id: true,
      name: true,
      email: true,
      tier: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      subscriptionStatus: true,
    },
  });

  return creator;
}

/**
 * Billing Page Component
 */
export default async function BillingPage() {
  // Require authentication
  let session;
  try {
    session = await requireAuth();
  } catch (_error) {
    redirect('/api/auth/whop');
  }

  // Fetch creator data
  const creator = await getCreatorBilling(session.creatorId);

  if (!creator) {
    redirect('/dashboard');
  }

  return (
    <DashboardLayout userName={creator.name} userEmail={creator.email}>
      <BillingContent
        creatorId={creator.id}
        currentTier={creator.tier}
        subscriptionStatus={creator.subscriptionStatus}
        hasStripeCustomer={!!creator.stripeCustomerId}
      />
    </DashboardLayout>
  );
}
