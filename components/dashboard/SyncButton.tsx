/**
 * Sync Button Component
 *
 * Allows users to manually trigger data synchronization
 */

'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsSyncing(true);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Sync failed');
      }

      // Show success toast
      toast.success('Data synchronized successfully!', {
        description: `Trust Score: ${data.trustScore?.toFixed(1)} | Tier: ${data.tier}`,
      });

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Sync error:', error);

      // Show error toast
      toast.error('Failed to sync data', {
        description:
          error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-gray-300',
        'bg-white px-4 py-2 text-sm font-medium text-gray-700',
        'hover:bg-gray-50 focus:outline-none focus:ring-2',
        'focus:ring-blue-500 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50'
      )}
    >
      <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
      {isSyncing ? 'Syncing...' : 'Sync Data'}
    </button>
  );
}
