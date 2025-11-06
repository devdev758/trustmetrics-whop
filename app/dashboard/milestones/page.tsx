/**
 * Milestones Dashboard Page
 *
 * Display and manage creator milestones
 */

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CreateMilestoneForm } from '@/components/milestones/CreateMilestoneForm';
import { MilestoneCard } from '@/components/milestones/MilestoneCard';
import { Award } from 'lucide-react';

/**
 * Fetch milestones for creator
 */
async function getMilestones(creatorId: string) {
  const [creator, milestones] = await Promise.all([
    prisma.creator.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
    prisma.milestone.findMany({
      where: { creatorId },
      include: {
        _count: {
          select: {
            achievements: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  return { creator, milestones };
}

/**
 * Milestones Page Component
 */
export default async function MilestonesPage() {
  // Require authentication
  let session;
  try {
    session = await requireAuth();
  } catch (error) {
    redirect('/api/auth/whop');
  }

  // Fetch milestones
  const { creator, milestones } = await getMilestones(session.creatorId);

  if (!creator) {
    redirect('/api/auth/whop');
  }

  return (
    <DashboardLayout userName={creator.name} userEmail={creator.email}>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Milestones</h1>
          <p className="mt-2 text-gray-600">
            Track and manage member achievements and milestones
          </p>
        </div>

        {/* Create Milestone Form */}
        <CreateMilestoneForm />

        {/* Milestones List */}
        {milestones.length > 0 ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Milestones
              </h2>
              <span className="text-sm text-gray-500">
                {milestones.length}{' '}
                {milestones.length === 1 ? 'milestone' : 'milestones'}
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {milestones.map(milestone => (
                <MilestoneCard key={milestone.id} milestone={milestone} />
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white px-6 py-16">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Award className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No milestones yet
              </h3>
              <p className="mb-6 text-sm text-gray-600">
                Create your first milestone to start tracking member achievements
                and building community engagement.
              </p>
              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <p>📊 Track member progress</p>
                <p>🏆 Reward achievements</p>
                <p>📈 Boost engagement</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {milestones.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600">Total Milestones</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {milestones.length}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600">Total Achievements</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {milestones.reduce(
                  (sum, m) => sum + (m._count?.achievements || 0),
                  0
                )}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600">Most Popular</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {milestones.length > 0
                  ? milestones.reduce((prev, curr) =>
                      (curr._count?.achievements || 0) >
                      (prev._count?.achievements || 0)
                        ? curr
                        : prev
                    ).title
                  : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
