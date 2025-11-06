/**
 * Milestone Detail Page
 *
 * Display milestone details and achievements feed
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SubmitAchievementForm } from '@/components/achievements/SubmitAchievementForm';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { ArrowLeft, Award, Users, TrendingUp } from 'lucide-react';

interface MilestonePageProps {
  params: {
    id: string;
  };
}

/**
 * Fetch milestone and achievements
 */
async function getMilestoneData(milestoneId: string, creatorId: string) {
  const [creator, milestone, achievements] = await Promise.all([
    prisma.creator.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
    prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        creatorId,
      },
      include: {
        _count: {
          select: {
            achievements: true,
          },
        },
      },
    }),
    prisma.achievement.findMany({
      where: {
        milestone: {
          id: milestoneId,
          creatorId,
        },
      },
      include: {
        member: {
          select: {
            id: true,
            whopMemberId: true,
            joinDate: true,
            status: true,
          },
        },
      },
      orderBy: {
        achievedAt: 'desc',
      },
    }),
  ]);

  return { creator, milestone, achievements };
}

/**
 * Milestone Detail Page Component
 */
export default async function MilestonePage({ params }: MilestonePageProps) {
  // Require authentication
  let session;
  try {
    session = await requireAuth();
  } catch (_error) {
    redirect('/api/auth/whop');
  }

  // Fetch data
  const { creator, milestone, achievements } = await getMilestoneData(
    params.id,
    session.creatorId
  );

  if (!creator || !milestone) {
    redirect('/dashboard/milestones');
  }

  const verifiedCount = achievements.filter(
    (a: (typeof achievements)[number]) => a.verified
  ).length;

  return (
    <DashboardLayout userName={creator.name} userEmail={creator.email}>
      <div className="space-y-8">
        {/* Back Button */}
        <Link
          href="/dashboard/milestones"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Milestones
        </Link>

        {/* Milestone Header */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {milestone.title}
              </h1>
              <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {milestone.category.charAt(0).toUpperCase() +
                  milestone.category.slice(1)}
              </span>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {milestone.description && (
            <p className="mb-6 text-gray-600">{milestone.description}</p>
          )}

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Achievements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {milestone._count.achievements}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {verifiedCount}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
              <Award className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {milestone._count.achievements - verifiedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Submit Form */}
          <div className="lg:col-span-1">
            <SubmitAchievementForm
              milestoneId={milestone.id}
              milestoneTitle={milestone.title}
            />
          </div>

          {/* Achievements Feed */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Achievements Feed
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Member achievements for this milestone
              </p>
            </div>

            {achievements.length > 0 ? (
              <div className="space-y-4">
                {achievements.map(
                  (achievement: (typeof achievements)[number]) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                    />
                  )
                )}
              </div>
            ) : (
              /* Empty State */
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Award className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No achievements yet
                </h3>
                <p className="text-sm text-gray-600">
                  Be the first to submit an achievement for this milestone!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
