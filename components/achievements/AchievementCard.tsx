/**
 * Achievement Card Component
 *
 * Displays individual achievement with proof image
 */

'use client';

import { useState } from 'react';
import { CheckCircle, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementCardProps {
  achievement: {
    id: string;
    proofUrl: string | null;
    achievedAt: Date | string;
    verified: boolean;
    member: {
      id: string;
      whopMemberId: string;
      joinDate: Date | string;
      status: string;
    };
  };
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const achievedDate = new Date(achievement.achievedAt);
  const memberJoinDate = new Date(achievement.member.joinDate);

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Member {achievement.member.whopMemberId.substring(0, 8)}...
              </p>
              <p className="text-xs text-gray-500">
                Member since{' '}
                {memberJoinDate.toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Verified Badge */}
          {achievement.verified && (
            <div
              className={cn(
                'inline-flex items-center gap-1 rounded-full',
                'bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800'
              )}
            >
              <CheckCircle className="h-3 w-3" />
              Verified
            </div>
          )}
        </div>

        {/* Proof Image */}
        {achievement.proofUrl && (
          <div className="mb-4">
            <button
              onClick={() => setIsImageExpanded(true)}
              className="group relative w-full overflow-hidden rounded-lg"
            >
              <img
                src={achievement.proofUrl}
                alt="Achievement proof"
                className="h-64 w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black opacity-0 transition-opacity group-hover:opacity-10" />
              <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                Click to enlarge
              </div>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            Achieved{' '}
            {achievedDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Image Modal */}
      {isImageExpanded && achievement.proofUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsImageExpanded(false)}
        >
          <div className="relative max-h-[90vh] max-w-5xl">
            <img
              src={achievement.proofUrl}
              alt="Achievement proof enlarged"
              className="max-h-[90vh] w-auto rounded-lg"
            />
            <button
              onClick={() => setIsImageExpanded(false)}
              className="absolute right-2 top-2 rounded-full bg-white p-2 text-gray-900 hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
