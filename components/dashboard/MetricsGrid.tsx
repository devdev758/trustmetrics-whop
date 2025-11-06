/**
 * Metrics Grid Component
 *
 * Displays all 7 trust metrics in a responsive grid with progress bars
 */

'use client';

import {
  Target,
  Heart,
  Users,
  UserCheck,
  Clock,
  Calendar,
  RefreshCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScoreBreakdown } from '@/lib/trustScore';

interface MetricsGridProps {
  breakdown: ScoreBreakdown;
}

interface MetricConfig {
  key: keyof ScoreBreakdown;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

const METRICS: MetricConfig[] = [
  {
    key: 'outcome',
    label: 'Outcome Achievement',
    description: 'Success rate in delivering promised results',
    icon: Target,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
  {
    key: 'satisfaction',
    label: 'Member Satisfaction',
    description: 'Customer satisfaction and feedback scores',
    icon: Heart,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-100',
  },
  {
    key: 'engagement',
    label: 'Engagement',
    description: 'Member activity and participation levels',
    icon: Users,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    key: 'retention',
    label: 'Retention',
    description: '60-day member retention rate',
    icon: UserCheck,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
  },
  {
    key: 'response',
    label: 'Response Time',
    description: 'Average time to respond to members',
    icon: Clock,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
  },
  {
    key: 'content',
    label: 'Content Consistency',
    description: 'Regular content delivery and updates',
    icon: Calendar,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-100',
  },
  {
    key: 'refund',
    label: 'Refund Rate',
    description: 'Low refund requests indicate satisfaction',
    icon: RefreshCcw,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
  },
];

/**
 * Get color for progress bar based on score
 */
function getProgressColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Individual metric card
 */
function MetricCard({
  metric,
  score,
}: {
  metric: MetricConfig;
  score: number;
}) {
  const Icon = metric.icon;
  const progressColor = getProgressColor(score);

  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className={cn('rounded-lg p-2.5', metric.iconBg)}>
          <Icon className={cn('h-5 w-5', metric.iconColor)} />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {score.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500">/ 100</div>
        </div>
      </div>

      {/* Metric Info */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">{metric.label}</h3>
        <p className="mt-1 text-sm text-gray-600">{metric.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Performance</span>
          <span className="font-medium text-gray-900">{score.toFixed(1)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn('h-full rounded-full transition-all', progressColor)}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-3 flex items-center gap-1.5">
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            score >= 80
              ? 'bg-green-500'
              : score >= 60
                ? 'bg-blue-500'
                : score >= 40
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
          )}
        />
        <span className="text-xs font-medium text-gray-600">
          {score >= 80
            ? 'Excellent'
            : score >= 60
              ? 'Good'
              : score >= 40
                ? 'Fair'
                : 'Needs Work'}
        </span>
      </div>
    </div>
  );
}

export function MetricsGrid({ breakdown }: MetricsGridProps) {
  return (
    <div>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Performance Metrics
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Detailed breakdown of your trust score components
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {METRICS.map(metric => (
          <MetricCard
            key={metric.key}
            metric={metric}
            score={breakdown[metric.key]}
          />
        ))}
      </div>
    </div>
  );
}
