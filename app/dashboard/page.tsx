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
import { SyncButton } from '@/components/dashboard/SyncButton';
import { BenchmarkComparison } from '@/components/dashboard/BenchmarkComparison';

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
  } catch (_error) {
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
  let creatorMetrics;
  if (hasMetrics) {
    creatorMetrics = {
      trustScore: creator.trustScore,
      retentionRate: latestMetric.retentionRate,
      engagementRate: latestMetric.engagementRate,
      responseTime: latestMetric.responseTime,
      refundRate: latestMetric.refundRate,
      outcomeRate: latestMetric.outcomeRate,
    };

    trustScoreResult = calculateTrustScore({
      outcomeRate: latestMetric.outcomeRate,
      satisfactionScore: latestMetric.satisfactionScore,
      engagementRate: latestMetric.engagementRate,
      retentionRate60: latestMetric.retentionRate,
      responseTime: latestMetric.responseTime,
      contentConsistency: latestMetric.contentQuality,
      refundRate: latestMetric.refundRate,
    });
  }

  return (
    <DashboardLayout userName={creator.name} userEmail={creator.email}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {creator.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              Here&apos;s an overview of your TrustMetrics performance
            </p>
          </div>
          <SyncButton />
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

            {/* Benchmark Comparison */}
            <BenchmarkComparison creatorMetrics={creatorMetrics} />

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
