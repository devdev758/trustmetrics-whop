/**
 * Creator Dashboard Page
 *
 * Main dashboard displaying trust score and metrics
 */

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { calculateTrustScore } from '@/lib/trustScore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TrustScoreCard } from '@/components/dashboard/TrustScoreCard';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { EmptyState } from '@/components/dashboard/EmptyState';

/**
 * Fetch creator data and latest metrics
 */
async function getDashboardData(creatorId: string) {
  // Fetch creator
  const creator = await prisma.creator.findUnique({
    where: { id: creatorId },
    select: {
      id: true,
      name: true,
      email: true,
      trustScore: true,
      tier: true,
      metrics: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  });

  if (!creator) {
    return null;
  }

  // Get latest metric
  const latestMetric = creator.metrics[0];

  return {
    creator,
    latestMetric,
  };
}

/**
 * Dashboard Page Component
 */
export default async function DashboardPage() {
  // Require authentication
  let session;
  try {
    session = await requireAuth();
  } catch (error) {
    redirect('/api/auth/whop');
  }

  // Fetch dashboard data
  const data = await getDashboardData(session.creatorId);

  if (!data) {
    redirect('/api/auth/whop');
  }

  const { creator, latestMetric } = data;

  // Check if creator has any metrics
  const hasMetrics = !!latestMetric;

  // Calculate trust score from latest metric if available
  let trustScoreResult;
  if (hasMetrics) {
    trustScoreResult = calculateTrustScore({
      outcomeRate: 0.85, // TODO: Get from actual metric data
      satisfactionScore: 4.2,
      engagementRate: latestMetric.engagementRate || 5,
      retentionRate60: latestMetric.retentionRate30 || 0.7, // Using 30-day as proxy for 60-day
      responseTime: 3,
      contentConsistency: 4,
      refundRate: 0.08,
    });
  }

  return (
    <DashboardLayout userName={creator.name} userEmail={creator.email}>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {creator.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of your TrustMetrics performance
          </p>
        </div>

        {/* Content */}
        {hasMetrics && trustScoreResult ? (
          <>
            {/* Trust Score Card */}
            <TrustScoreCard
              score={trustScoreResult.score}
              tier={creator.tier}
            />

            {/* Metrics Grid */}
            <MetricsGrid breakdown={trustScoreResult.breakdown} />

            {/* Last Updated */}
            <div className="text-center text-sm text-gray-500">
              Last updated:{' '}
              {new Date(latestMetric.updatedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </DashboardLayout>
  );
}
