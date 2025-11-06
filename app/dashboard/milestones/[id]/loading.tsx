/**
 * Milestone Detail Loading State
 *
 * Skeleton UI shown while milestone detail page is loading
 */

export default function MilestoneDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
              <div className="space-y-2">
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
            <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button Skeleton */}
        <div className="mb-8 h-5 w-32 animate-pulse rounded bg-gray-200" />

        {/* Header Card Skeleton */}
        <div className="mb-8 h-64 animate-pulse rounded-xl bg-gray-200" />

        {/* Two Column Layout Skeleton */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-xl bg-gray-200 lg:col-span-1" />
          <div className="space-y-4 lg:col-span-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-xl bg-gray-200"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
