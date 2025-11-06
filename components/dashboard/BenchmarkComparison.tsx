/**
 * Benchmark Comparison Component
 *
 * Display creator's metrics compared to category averages
 */

'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Users,
  Clock,
  Target,
  Loader2,
} from 'lucide-react';
import type {
  BenchmarkData,
  CreatorPercentile,
} from '@/lib/benchmarks/calculate';

interface BenchmarkComparisonProps {
  creatorMetrics: {
    trustScore: number;
    retentionRate: number;
    engagementRate: number;
    responseTime: number;
    refundRate: number;
    outcomeRate: number;
  };
}

interface BenchmarkResponse {
  benchmark: BenchmarkData;
  percentile: CreatorPercentile;
  category: string;
}

export function BenchmarkComparison({
  creatorMetrics,
}: BenchmarkComparisonProps) {
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBenchmarks() {
      try {
        const response = await fetch('/api/benchmarks');
        if (!response.ok) {
          throw new Error('Failed to fetch benchmarks');
        }
        const data = await response.json();
        setBenchmarkData(data);
      } catch (err) {
        console.error('Benchmark fetch error:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load benchmarks'
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchBenchmarks();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !benchmarkData) {
    return null; // Don't show benchmarks if there's an error
  }

  const { benchmark, percentile, category } = benchmarkData;

  const metrics = [
    {
      label: 'Trust Score',
      yourValue: creatorMetrics.trustScore,
      avgValue: benchmark.avgTrustScore,
      format: (v: number) => v.toFixed(1),
      icon: Award,
      lowerIsBetter: false,
    },
    {
      label: 'Retention Rate',
      yourValue: creatorMetrics.retentionRate * 100,
      avgValue: benchmark.avgRetentionRate * 100,
      format: (v: number) => `${v.toFixed(1)}%`,
      icon: Users,
      lowerIsBetter: false,
    },
    {
      label: 'Engagement Rate',
      yourValue: creatorMetrics.engagementRate * 100,
      avgValue: benchmark.avgEngagementRate * 100,
      format: (v: number) => `${v.toFixed(1)}%`,
      icon: TrendingUp,
      lowerIsBetter: false,
    },
    {
      label: 'Response Time',
      yourValue: creatorMetrics.responseTime,
      avgValue: benchmark.avgResponseTime,
      format: (v: number) => `${v.toFixed(1)}h`,
      icon: Clock,
      lowerIsBetter: true,
    },
    {
      label: 'Outcome Rate',
      yourValue: creatorMetrics.outcomeRate * 100,
      avgValue: benchmark.avgOutcomeRate * 100,
      format: (v: number) => `${v.toFixed(1)}%`,
      icon: Target,
      lowerIsBetter: false,
    },
    {
      label: 'Refund Rate',
      yourValue: creatorMetrics.refundRate * 100,
      avgValue: benchmark.avgRefundRate * 100,
      format: (v: number) => `${v.toFixed(1)}%`,
      icon: TrendingDown,
      lowerIsBetter: true,
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Category Benchmarks
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Your performance vs.{' '}
            <span className="font-medium">
              {category === 'all' ? 'all creators' : `${category} category`}
            </span>{' '}
            ({benchmark.sampleSize} creators)
          </p>
        </div>

        {/* Percentile Badge */}
        <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3">
          <Award
            className={`h-6 w-6 ${
              percentile.percentile >= 75
                ? 'text-green-600'
                : percentile.percentile >= 50
                  ? 'text-blue-600'
                  : 'text-gray-600'
            }`}
          />
          <div>
            <div className="text-sm font-medium text-gray-600">
              Your Ranking
            </div>
            <div
              className={`text-lg font-bold ${
                percentile.percentile >= 75
                  ? 'text-green-700'
                  : percentile.percentile >= 50
                    ? 'text-blue-700'
                    : 'text-gray-700'
              }`}
            >
              {percentile.rank}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Comparison */}
      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isAboveAvg = metric.lowerIsBetter
            ? metric.yourValue < metric.avgValue
            : metric.yourValue > metric.avgValue;
          const difference = metric.lowerIsBetter
            ? ((metric.avgValue - metric.yourValue) / metric.avgValue) * 100
            : ((metric.yourValue - metric.avgValue) / metric.avgValue) * 100;

          return (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    {metric.label}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    isAboveAvg ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isAboveAvg ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(difference).toFixed(1)}%
                </div>
              </div>

              {/* Visual Comparison Bar */}
              <div className="space-y-2">
                {/* Your Value */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">You</span>
                    <span className="font-bold text-gray-900">
                      {metric.format(metric.yourValue)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full ${
                        isAboveAvg
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{
                        width: `${Math.min(100, (metric.yourValue / Math.max(metric.yourValue, metric.avgValue)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Category Average */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category Avg</span>
                    <span className="font-medium text-gray-700">
                      {metric.format(metric.avgValue)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500"
                      style={{
                        width: `${Math.min(100, (metric.avgValue / Math.max(metric.yourValue, metric.avgValue)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Percentile Details */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Award className="h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">
              You&apos;re at the {percentile.percentile}th percentile
            </p>
            <p className="mt-1 text-blue-800">
              This means you&apos;re performing better than{' '}
              {percentile.percentile}% of creators in your category.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
