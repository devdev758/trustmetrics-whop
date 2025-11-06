/**
 * Badge Page Loading State
 */

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function BadgeLoading() {
  return (
    <DashboardLayout userName="Loading..." userEmail="">
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div>
          <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-96 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>

        {/* Preview Skeleton */}
        <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
      </div>
    </DashboardLayout>
  );
}
