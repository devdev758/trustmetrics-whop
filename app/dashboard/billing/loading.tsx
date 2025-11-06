/**
 * Billing Page Loading State
 */

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function BillingLoading() {
  return (
    <DashboardLayout userName="Loading..." userEmail="">
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div>
          <div className="mb-2 h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-96 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Plans Skeleton */}
        <div className="grid gap-8 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-2xl bg-gray-200"
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
