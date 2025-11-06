/**
 * TrustMetrics Landing Page
 */

import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { BarChart3, Shield, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  // Check if user is already authenticated
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-xl font-bold text-white">TM</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                TrustMetrics
              </span>
            </div>
            <Link
              href="/api/auth/whop"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Build Trust with Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}
              Community
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-600">
            TrustMetrics helps Whop creators measure and improve their community
            engagement, retention, and overall trust score.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/api/auth/whop"
              className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-medium text-white hover:bg-blue-700"
            >
              Get Started with Whop
            </Link>
            <a
              href="#features"
              className="rounded-lg border border-gray-300 bg-white px-8 py-4 text-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features */}
        <div
          id="features"
          className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Trust Score
            </h3>
            <p className="text-gray-600">
              Comprehensive score based on 7 key performance metrics to measure
              your community&apos;s trust.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Detailed Analytics
            </h3>
            <p className="text-gray-600">
              Track engagement, retention, satisfaction, and more with detailed
              breakdowns.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Growth Insights
            </h3>
            <p className="text-gray-600">
              Identify areas for improvement and track your progress over time.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Member Retention
            </h3>
            <p className="text-gray-600">
              Understand and improve member retention with actionable data.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to Build Trust?
          </h2>
          <p className="mb-8 text-lg text-blue-100">
            Join TrustMetrics today and start measuring what matters.
          </p>
          <Link
            href="/api/auth/whop"
            className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-medium text-blue-600 hover:bg-gray-100"
          >
            Sign In with Whop
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">
            © 2024 TrustMetrics. Building trust in creator communities.
          </p>
        </div>
      </footer>
    </div>
  );
}
