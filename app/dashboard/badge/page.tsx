/**
 * Badge Dashboard Page
 *
 * Manage and preview embeddable Trust Badge
 */

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { BadgePreview } from '@/components/badge/BadgePreview';
import { Award, Shield, TrendingUp } from 'lucide-react';

/**
 * Fetch creator data for badge
 */
async function getCreatorData(creatorId: string) {
  const creator = await prisma.creator.findUnique({
    where: { id: creatorId },
    select: {
      id: true,
      name: true,
      email: true,
      trustScore: true,
      tier: true,
    },
  });

  return creator;
}

/**
 * Badge Dashboard Page Component
 */
export default async function BadgePage() {
  // Require authentication
  let session;
  try {
    session = await requireAuth();
  } catch (_error) {
    redirect('/api/auth/whop');
  }

  // Fetch creator data
  const creator = await getCreatorData(session.creatorId);

  if (!creator) {
    redirect('/dashboard');
  }

  const score = creator.trustScore ?? 0;
  const tier = creator.tier ?? 'bronze';

  return (
    <DashboardLayout userName={creator.name} userEmail={creator.email}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trust Badge</h1>
          <p className="mt-2 text-gray-600">
            Embed your Trust Badge on your Whop store to build credibility with
            potential customers
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Trust Score</div>
              <div className="text-2xl font-bold text-gray-900">
                {score.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Tier</div>
              <div className="text-2xl font-bold text-gray-900">
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="text-2xl font-bold text-gray-900">Active</div>
            </div>
          </div>
        </div>

        {/* Badge Preview and Instructions */}
        <BadgePreview creatorId={creator.id} creatorName={creator.name} />

        {/* Benefits Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Why Use Trust Badges?
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">
                  Build Trust
                </h3>
                <p className="text-sm text-gray-600">
                  Show potential customers your verified Trust Score and build
                  credibility instantly
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">
                  Increase Conversions
                </h3>
                <p className="text-sm text-gray-600">
                  Customers are more likely to purchase from creators with
                  verified trust scores
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">Stand Out</h3>
                <p className="text-sm text-gray-600">
                  Differentiate yourself from other creators with a professional
                  trust badge
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">
                  Auto-Updates
                </h3>
                <p className="text-sm text-gray-600">
                  Badge automatically reflects your latest Trust Score - no need
                  to update manually
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Designs */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Badge Tier Designs
          </h2>

          <p className="mb-6 text-sm text-gray-600">
            Your badge design changes automatically based on your Trust Score
            tier. Here&apos;s what each tier looks like:
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Gold Tier */}
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6 text-center">
              <div className="mb-4 text-4xl">⭐</div>
              <h3 className="mb-2 font-semibold text-gray-900">Gold Tier</h3>
              <p className="mb-4 text-sm text-gray-600">
                Trust Score 85.0 - 100.0
              </p>
              <div className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white">
                <span>Green Badge</span>
              </div>
            </div>

            {/* Silver Tier */}
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6 text-center">
              <div className="mb-4 text-4xl">🥈</div>
              <h3 className="mb-2 font-semibold text-gray-900">Silver Tier</h3>
              <p className="mb-4 text-sm text-gray-600">
                Trust Score 75.0 - 84.9
              </p>
              <div className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                <span>Blue Badge</span>
              </div>
            </div>

            {/* Bronze Tier */}
            <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6 text-center">
              <div className="mb-4 text-4xl">🥉</div>
              <h3 className="mb-2 font-semibold text-gray-900">Bronze Tier</h3>
              <p className="mb-4 text-sm text-gray-600">
                Trust Score 65.0 - 74.9
              </p>
              <div className="inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white">
                <span>Yellow Badge</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
