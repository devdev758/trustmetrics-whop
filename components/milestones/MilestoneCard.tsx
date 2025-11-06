/**
 * Milestone Card Component
 *
 * Displays individual milestone with achievement count and actions
 */

'use client';

import { Award, Edit2, Trash2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MilestoneCardProps {
  milestone: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    createdAt: Date | string;
    _count?: {
      achievements: number;
    };
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * Get category icon and color
 */
function getCategoryConfig(category: string) {
  const configs: Record<
    string,
    { icon: typeof Award; color: string; bg: string }
  > = {
    engagement: {
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    revenue: {
      icon: Award,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    retention: {
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    community: {
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  };

  return (
    configs[category.toLowerCase()] || {
      icon: Award,
      color: 'text-gray-600',
      bg: 'bg-gray-100',
    }
  );
}

export function MilestoneCard({
  milestone,
  onEdit,
  onDelete,
}: MilestoneCardProps) {
  const config = getCategoryConfig(milestone.category);
  const Icon = config.icon;
  const achievementCount = milestone._count?.achievements || 0;

  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={cn('rounded-lg p-2.5', config.bg)}>
            <Icon className={cn('h-5 w-5', config.color)} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
            <p className="mt-0.5 text-sm text-gray-500">
              {milestone.category.charAt(0).toUpperCase() +
                milestone.category.slice(1)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <button
              onClick={() => onEdit(milestone.id)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Edit milestone"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(milestone.id)}
              className="rounded-lg p-2 text-gray-400 hover:bg-red-100 hover:text-red-600"
              title="Delete milestone"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {milestone.description && (
        <p className="mb-4 text-sm text-gray-600">{milestone.description}</p>
      )}

      {/* Achievement Count */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            {achievementCount}{' '}
            {achievementCount === 1 ? 'Achievement' : 'Achievements'}
          </span>
        </div>

        <span className="text-xs text-gray-500">
          Created{' '}
          {new Date(milestone.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}
