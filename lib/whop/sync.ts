/**
 * Whop Data Synchronization System
 *
 * Fetches data from Whop API, calculates metrics, and updates database
 */

import { prisma } from '@/lib/prisma';
import { WhopClient } from '@/lib/whop/client';
import { calculateTrustScore, getTier } from '@/lib/trustScore';
import type { MetricInput } from '@/lib/trustScore';

/**
 * Result of a sync operation
 */
export interface SyncResult {
  success: boolean;
  creatorId: string;
  trustScore?: number;
  tier?: string;
  error?: string;
  metricsId?: string;
}

/**
 * Whop company statistics (mocked structure - adjust based on actual API)
 */
interface WhopCompanyStats {
  totalMembers: number;
  activeMembers: number;
  newMembers30Days: number;
  churnedMembers30Days: number;
  avgEngagementRate: number;
  avgSatisfactionScore: number;
  totalRefunds: number;
  totalSales: number;
}

/**
 * Fetch company statistics from Whop API
 * This is a mock implementation - adjust based on actual Whop API structure
 */
async function fetchCompanyStats(
  client: WhopClient,
  companyId: string
): Promise<WhopCompanyStats> {
  // TODO: Replace with actual Whop API calls when available
  // For now, returning mock data for demonstration

  try {
    const _company = await client.getCompany(companyId);

    // Mock data - in production, these would come from actual API endpoints
    // Possible endpoints might include:
    // - /api/v5/companies/{id}/members
    // - /api/v5/companies/{id}/analytics
    // - /api/v5/companies/{id}/payments

    return {
      totalMembers: 150, // Mock: Total current members
      activeMembers: 120, // Mock: Active in last 30 days
      newMembers30Days: 25, // Mock: New members in last 30 days
      churnedMembers30Days: 10, // Mock: Cancelled in last 30 days
      avgEngagementRate: 6.5, // Mock: Average sessions per week
      avgSatisfactionScore: 4.2, // Mock: 1-5 scale
      totalRefunds: 5, // Mock: Total refunds
      totalSales: 100, // Mock: Total sales
    };
  } catch (error) {
    console.error('Error fetching company stats:', error);
    // Return default values on error
    return {
      totalMembers: 0,
      activeMembers: 0,
      newMembers30Days: 0,
      churnedMembers30Days: 0,
      avgEngagementRate: 0,
      avgSatisfactionScore: 3,
      totalRefunds: 0,
      totalSales: 1,
    };
  }
}

/**
 * Calculate derived metrics from Whop stats
 */
function calculateMetrics(stats: WhopCompanyStats): {
  metrics: MetricInput;
  rawMetrics: {
    totalMembers: number;
    retentionRate30: number;
    engagementRate: number;
  };
} {
  // Calculate 30-day retention rate
  const retentionRate30 =
    stats.totalMembers > 0
      ? (stats.totalMembers - stats.churnedMembers30Days) / stats.totalMembers
      : 0;

  // Calculate outcome rate (members who stay engaged)
  const outcomeRate =
    stats.totalMembers > 0 ? stats.activeMembers / stats.totalMembers : 0;

  // Calculate refund rate
  const refundRate =
    stats.totalSales > 0 ? stats.totalRefunds / stats.totalSales : 0;

  // Estimate response time (mock - would need actual data)
  const estimatedResponseTime = 3; // hours

  // Estimate content consistency (mock - would need actual data)
  const estimatedContentConsistency = 4; // posts per week

  const metrics: MetricInput = {
    outcomeRate: Math.min(Math.max(outcomeRate, 0), 1),
    satisfactionScore: Math.min(Math.max(stats.avgSatisfactionScore, 1), 5),
    engagementRate: Math.max(stats.avgEngagementRate, 0),
    retentionRate60: Math.min(Math.max(retentionRate30 * 0.9, 0), 1), // Estimate 60-day from 30-day
    responseTime: estimatedResponseTime,
    contentConsistency: estimatedContentConsistency,
    refundRate: Math.min(Math.max(refundRate, 0), 1),
  };

  return {
    metrics,
    rawMetrics: {
      totalMembers: stats.totalMembers,
      retentionRate30: Math.min(Math.max(retentionRate30, 0), 1),
      engagementRate: stats.avgEngagementRate,
    },
  };
}

/**
 * Synchronize creator data from Whop
 *
 * @param creatorId - The creator ID to sync
 * @returns Sync result with updated trust score
 */
export async function syncCreatorData(creatorId: string): Promise<SyncResult> {
  try {
    // Fetch creator from database
    const creator = await prisma.creator.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        whopId: true,
        name: true,
      },
    });

    if (!creator) {
      return {
        success: false,
        creatorId,
        error: 'Creator not found',
      };
    }

    // Initialize Whop client
    const client = new WhopClient(creatorId);
    await client.initialize();

    // Fetch user's companies
    const companies = await client.getUserCompanies();

    if (companies.length === 0) {
      return {
        success: false,
        creatorId,
        error: 'No companies found for creator',
      };
    }

    // Use first company for now
    // TODO: Allow creators to select which company to track
    const primaryCompany = companies[0];

    // Fetch company statistics
    const stats = await fetchCompanyStats(client, primaryCompany.id);

    // Calculate metrics
    const { metrics, rawMetrics } = calculateMetrics(stats);

    // Calculate trust score
    const trustScoreResult = calculateTrustScore(metrics);

    // Determine tier
    const tier = getTier(trustScoreResult.score);

    // Save metric record to database
    const metricRecord = await prisma.metric.create({
      data: {
        creatorId: creator.id,
        date: new Date(),
        totalMembers: rawMetrics.totalMembers,
        retentionRate30: rawMetrics.retentionRate30,
        engagementRate: rawMetrics.engagementRate,
        trustScore: trustScoreResult.score,
      },
    });

    // Update creator's trust score and tier
    await prisma.creator.update({
      where: { id: creatorId },
      data: {
        trustScore: trustScoreResult.score,
        tier,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      creatorId,
      trustScore: trustScoreResult.score,
      tier,
      metricsId: metricRecord.id,
    };
  } catch (error) {
    console.error('Sync error for creator', creatorId, ':', error);

    return {
      success: false,
      creatorId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Synchronize multiple creators
 *
 * @param creatorIds - Array of creator IDs to sync
 * @returns Array of sync results
 */
export async function syncMultipleCreators(
  creatorIds: string[]
): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  // Process creators sequentially to avoid rate limiting
  for (const creatorId of creatorIds) {
    const result = await syncCreatorData(creatorId);
    results.push(result);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * Sync all active creators
 *
 * @returns Summary of sync operation
 */
export async function syncAllCreators(): Promise<{
  total: number;
  success: number;
  failed: number;
  results: SyncResult[];
}> {
  // Fetch all creators with valid tokens
  const creators = await prisma.creator.findMany({
    where: {
      accessToken: {
        not: null,
      },
    },
    select: {
      id: true,
    },
  });

  const creatorIds = creators.map((c: (typeof creators)[number]) => c.id);
  const results = await syncMultipleCreators(creatorIds);

  const summary = {
    total: results.length,
    success: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  };

  return summary;
}
