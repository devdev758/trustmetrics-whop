/**
 * Empty State Component
 *
 * Shown when creator has no metrics data yet
 */

'use client';

import { BarChart3, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <BarChart3 className="h-10 w-10 text-blue-600" />
        </div>

        {/* Heading */}
        <h2 className="mb-3 text-2xl font-bold text-gray-900">
          Welcome to TrustMetrics!
        </h2>
        <p className="mb-8 text-lg text-gray-600">
          You don't have any metrics data yet. Follow these steps to get
          started and build your trust score.
        </p>

        {/* Setup Instructions */}
        <div className="mx-auto mb-8 max-w-lg space-y-4 text-left">
          <div className="flex gap-4 rounded-lg bg-gray-50 p-4">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                1
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Connect Your Whop Account
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Already done! You're authenticated with Whop OAuth.
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </div>
            </div>
          </div>

          <div className="flex gap-4 rounded-lg bg-gray-50 p-4">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                2
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Set Up Data Collection
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Configure automatic data collection from your Whop company to
                track member engagement, retention, and satisfaction.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-lg bg-gray-50 p-4">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                3
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Wait for First Analysis
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Your first trust score will be calculated within 24 hours after
                initial data collection.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            className={cn(
              'rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium',
              'text-white hover:bg-blue-700 focus:outline-none focus:ring-2',
              'focus:ring-blue-500 focus:ring-offset-2'
            )}
          >
            Set Up Data Collection
          </button>
          <a
            href="#"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Learn More →
          </a>
        </div>
      </div>
    </div>
  );
}
