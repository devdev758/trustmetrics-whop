/**
 * Public Creator Profile Page
 *
 * Display creator's Trust Score, breakdown, and achievements
 * Optimized for sharing with OpenGraph meta tags
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getTier } from '@/lib/trustScore';
import { Award, TrendingUp, Users, ExternalLink } from 'lucide-react';

interface ProfilePageProps {
  params: {
    creatorId: string;
  };
}

/**
 * Fetch creator profile data
 */
async function getCreatorProfile(creatorId: string) {
  const creator = await prisma.creator.findUnique({
    where: { id: creatorId },
    select: {
      id: true,
      name: true,
      email: true,
      trustScore: true,
      tier: true,
      createdAt: true,
      metrics: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        select: {
          outcomeRate: true,
          satisfactionScore: true,
          engagementRate: true,
          retentionRate: true,
          responseTime: true,
          contentQuality: true,
          refundRate: true,
        },
      },
      milestones: {
        select: {
          id: true,
          title: true,
          category: true,
          _count: {
            select: {
              achievements: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
    },
  });

  if (!creator) {
    return null;
  }

  // Get recent achievements
  const achievements = await prisma.achievement.findMany({
    where: {
      milestone: {
        creatorId,
      },
    },
    include: {
      member: {
        select: {
          whopMemberId: true,
        },
      },
      milestone: {
        select: {
          title: true,
          category: true,
        },
      },
    },
    orderBy: {
      achievedAt: 'desc',
    },
    take: 10,
  });

  return { creator, achievements };
}

/**
 * Generate metadata for OpenGraph
 */
export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const data = await getCreatorProfile(params.creatorId);

  if (!data) {
    return {
      title: 'Creator Not Found',
    };
  }

  const { creator } = data;
  const score = creator.trustScore ?? 0;
  const tier = creator.tier ?? 'bronze';

  return {
    title: `${creator.name} - TrustMetrics Profile`,
    description: `${creator.name} has a Trust Score of ${score.toFixed(1)} (${tier.charAt(0).toUpperCase() + tier.slice(1)} tier). View their verified creator profile on TrustMetrics.`,
    openGraph: {
      title: `${creator.name} - Verified Creator`,
      description: `Trust Score: ${score.toFixed(1)} | ${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier`,
      type: 'profile',
      url: `/profile/${creator.id}`,
    },
    twitter: {
      card: 'summary',
      title: `${creator.name} - Verified Creator`,
      description: `Trust Score: ${score.toFixed(1)} | ${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier`,
    },
  };
}

/**
 * Get tier colors
 */
function getTierColors(tier: string) {
  switch (tier.toLowerCase()) {
    case 'gold':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        badge: 'bg-green-100',
      };
    case 'silver':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        badge: 'bg-blue-100',
      };
    case 'bronze':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        badge: 'bg-yellow-100',
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-800',
        badge: 'bg-gray-100',
      };
  }
}

/**
 * Calculate benchmark comparison
 */
function getBenchmark(score: number) {
  const avgScore = 75; // Platform average
  const diff = score - avgScore;
  const percentage = ((diff / avgScore) * 100).toFixed(1);

  if (diff > 0) {
    return {
      label: `${percentage}% above platform average`,
      color: 'text-green-600',
    };
  } else if (diff < 0) {
    return {
      label: `${Math.abs(parseFloat(percentage))}% below platform average`,
      color: 'text-red-600',
    };
  } else {
    return {
      label: 'At platform average',
      color: 'text-gray-600',
    };
  }
}

/**
 * Public Profile Page
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const data = await getCreatorProfile(params.creatorId);

  if (!data) {
    notFound();
  }

  const { creator, achievements } = data;
  const score = creator.trustScore ?? 0;
  const tier = creator.tier ?? 'bronze';
  const colors = getTierColors(tier);
  const benchmark = getBenchmark(score);
  const latestMetrics = creator.metrics[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 hover:text-gray-700"
            >
              TrustMetrics
            </Link>
            <Link
              href="/api/auth/whop"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="space-y-8">
          {/* Trust Score Card */}
          <div
            className={`rounded-xl border p-8 shadow-sm ${colors.bg} ${colors.border}`}
          >
            <div className="flex flex-col items-center text-center md:flex-row md:text-left">
              <div className="mb-6 flex-1 md:mb-0">
                <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {creator.name}
                  </h1>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${colors.badge} ${colors.text}`}
                  >
                    Verified
                  </span>
                </div>
                <p className="text-gray-600">
                  Member since{' '}
                  {new Date(creator.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="text-center">
                <div className="mb-2 text-6xl font-bold text-gray-900">
                  {score.toFixed(1)}
                </div>
                <div className={`mb-1 font-semibold ${colors.text}`}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
                </div>
                <div className={`text-sm ${benchmark.color}`}>
                  {benchmark.label}
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Breakdown */}
          {latestMetrics && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-gray-900">
                Performance Metrics
              </h2>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                  label="Outcome Rate"
                  value={latestMetrics.outcomeRate}
                  format="percentage"
                />
                <MetricCard
                  label="Satisfaction Score"
                  value={latestMetrics.satisfactionScore}
                  format="percentage"
                />
                <MetricCard
                  label="Engagement Rate"
                  value={latestMetrics.engagementRate}
                  format="percentage"
                />
                <MetricCard
                  label="Retention Rate"
                  value={latestMetrics.retentionRate}
                  format="percentage"
                />
                <MetricCard
                  label="Response Time"
                  value={latestMetrics.responseTime}
                  format="hours"
                />
                <MetricCard
                  label="Content Quality"
                  value={latestMetrics.contentQuality}
                  format="percentage"
                />
              </div>
            </div>
          )}

          {/* Recent Achievements */}
          {achievements.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Member Achievements
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{achievements.length} achievements</span>
                </div>
              </div>

              <div className="space-y-3">
                {achievements.map(
                  (achievement: (typeof achievements)[number]) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-4 rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                        <Award className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {achievement.milestone.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          Member {achievement.member.whopMemberId} •{' '}
                          {new Date(
                            achievement.achievedAt
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      {achievement.verified && (
                        <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                          <ExternalLink className="h-4 w-4" />
                          Verified
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Milestones */}
          {creator.milestones.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Active Milestones
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Community goals and achievements
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {creator.milestones.map(
                  (milestone: (typeof creator.milestones)[number]) => (
                    <div
                      key={milestone.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">
                          {milestone.title}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {milestone.category.charAt(0).toUpperCase() +
                            milestone.category.slice(1)}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {milestone._count.achievements} achievements
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Footer CTA */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center">
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              Want to build trust like {creator.name}?
            </h3>
            <p className="mb-6 text-gray-600">
              Join TrustMetrics and start tracking your creator performance
              today.
            </p>
            <Link
              href="/api/auth/whop"
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-gray-600">
          <p>
            Powered by{' '}
            <Link
              href="/"
              className="font-medium text-blue-600 hover:underline"
            >
              TrustMetrics
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({
  label,
  value,
  format,
}: {
  label: string;
  value: number;
  format: 'percentage' | 'hours';
}) {
  const displayValue =
    format === 'percentage'
      ? `${(value * 100).toFixed(1)}%`
      : `${value.toFixed(1)}h`;

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="mb-2 text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{displayValue}</div>
    </div>
  );
}
