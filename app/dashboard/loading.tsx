/**
 * Dashboard Loading State
 *
 * Modern skeleton UI with better animations
 */

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SkeletonDashboard } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <DashboardLayout userName="Loading..." userEmail="">
      <SkeletonDashboard />
    </DashboardLayout>
  );
}
