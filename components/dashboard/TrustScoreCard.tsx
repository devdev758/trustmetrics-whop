/**
 * Trust Score Card Component
 *
 * Displays the creator's overall trust score with color-coded tier badge
 */

'use client';

import { Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustScoreCardProps {
  score: number;
  tier: string;
}

/**
 * Get color scheme based on trust score
 */
function getScoreColors(score: number) {
  if (score >= 85) {
    return {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      scoreText: 'text-green-600',
      badge: 'bg-green-100 text-green-800',
      ring: 'ring-green-500',
      label: 'Gold',
    };
  } else if (score >= 75) {
    return {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      scoreText: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-800',
      ring: 'ring-blue-500',
      label: 'Silver',
    };
  } else if (score >= 65) {
    return {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      scoreText: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-800',
      ring: 'ring-yellow-500',
      label: 'Bronze',
    };
  } else {
    return {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      scoreText: 'text-red-600',
      badge: 'bg-red-100 text-red-800',
      ring: 'ring-red-500',
      label: 'Needs Improvement',
    };
  }
}

export function TrustScoreCard({ score, tier: _tier }: TrustScoreCardProps) {
  const colors = getScoreColors(score);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border-2 p-8 shadow-lg transition-all duration-300 hover:shadow-2xl',
        colors.bg,
        colors.border
      )}
    >
      {/* Background Pattern */}
      <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white opacity-10" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-24 w-24 rounded-full bg-white opacity-10" />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className={cn('text-lg font-semibold', colors.text)}>
              Your Trust Score
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Based on 7 key performance metrics
            </p>
          </div>
          <div className={cn('rounded-lg p-2', colors.badge)}>
            <Award className="h-6 w-6" />
          </div>
        </div>

        {/* Score Display */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                'text-6xl font-bold tracking-tight',
                colors.scoreText
              )}
            >
              {score.toFixed(1)}
            </span>
            <span className="text-2xl font-medium text-gray-500">/100</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                colors.ring.replace('ring-', 'bg-')
              )}
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
        </div>

        {/* Tier Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5',
                'text-sm font-medium',
                colors.badge
              )}
            >
              <TrendingUp className="h-4 w-4" />
              {colors.label} Tier
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {score >= 85
              ? 'Excellent performance!'
              : score >= 75
                ? 'Great work, keep it up!'
                : score >= 65
                  ? 'Room for improvement'
                  : 'Focus on key metrics'}
          </p>
        </div>
      </div>
    </div>
  );
}
