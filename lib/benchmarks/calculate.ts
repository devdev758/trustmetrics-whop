/**
 * Benchmark Calculation Library
 *
 * Calculate category benchmarks and percentiles
 */

import { prisma } from '@/lib/prisma';

export interface BenchmarkData {
  id: string;
  category: string;
  date: Date;
  avgTrustScore: number;
  avgRetentionRate: number;
  avgEngagementRate: number;
  avgResponseTime: number;
  avgRefundRate: number;
  avgOutcomeRate: number;
  p25TrustScore: number;
  p50TrustScore: number;
  p75TrustScore: number;
  p90TrustScore: number;
  sampleSize: number;
}

export interface CreatorPercentile {
  trustScore: number;
  percentile: number;
  rank: string; // e.g., "Top 15%"
}

/**
 * Calculate percentile value from sorted array
 */
function calculatePercentile(
  sortedValues: number[],
  percentile: number
): number {
  if (sortedValues.length === 0) return 0;

  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (lower === upper) {
    return sortedValues[lower];
  }

  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

/**
 * Calculate creator's percentile rank
 */
export function calculateCreatorPercentile(
  creatorScore: number,
  benchmark: BenchmarkData
): CreatorPercentile {
  // Determine percentile based on trust score
  let percentile = 50; // Default to median

  if (creatorScore >= benchmark.p90TrustScore) {
    percentile =
      90 +
      ((creatorScore - benchmark.p90TrustScore) /
        (100 - benchmark.p90TrustScore)) *
        10;
  } else if (creatorScore >= benchmark.p75TrustScore) {
    percentile =
      75 +
      ((creatorScore - benchmark.p75TrustScore) /
        (benchmark.p90TrustScore - benchmark.p75TrustScore)) *
        15;
  } else if (creatorScore >= benchmark.p50TrustScore) {
    percentile =
      50 +
      ((creatorScore - benchmark.p50TrustScore) /
        (benchmark.p75TrustScore - benchmark.p50TrustScore)) *
        25;
  } else if (creatorScore >= benchmark.p25TrustScore) {
    percentile =
      25 +
      ((creatorScore - benchmark.p25TrustScore) /
        (benchmark.p50TrustScore - benchmark.p25TrustScore)) *
        25;
  } else {
    percentile = (creatorScore / benchmark.p25TrustScore) * 25;
  }

  percentile = Math.max(0, Math.min(100, percentile));

  // Generate rank string
  const rank =
    percentile >= 90
      ? `Top ${(100 - percentile).toFixed(0)}%`
      : percentile >= 75
        ? `Top ${(100 - percentile).toFixed(0)}%`
        : percentile >= 50
          ? `Above Average`
          : `Below Average`;

  return {
    trustScore: creatorScore,
    percentile: Math.round(percentile),
    rank,
  };
}

/**
 * Calculate category benchmarks
 */
export async function calculateCategoryBenchmarks(
  category: string
): Promise<BenchmarkData> {
  // Query all creators in category with their latest metrics
  const creators = await prisma.creator.findMany({
    where:
      category === 'all'
        ? {}
        : {
            category: {
              equals: category,
              mode: 'insensitive',
            },
          },
    select: {
      id: true,
      trustScore: true,
      metrics: {
        orderBy: {
          date: 'desc',
        },
        take: 1,
        select: {
          retentionRate: true,
          engagementRate: true,
          responseTime: true,
          refundRate: true,
          outcomeRate: true,
        },
      },
    },
  });

  // Filter creators with metrics
  const creatorsWithMetrics = creators.filter(
    c => c.metrics.length > 0 && c.trustScore > 0
  );

  const sampleSize = creatorsWithMetrics.length;

  // If no creators, return empty benchmark
  if (sampleSize === 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const emptyBenchmark = await prisma.benchmark.upsert({
      where: {
        category_date: {
          category,
          date: today,
        },
      },
      update: {
        sampleSize: 0,
      },
      create: {
        category,
        date: today,
        sampleSize: 0,
      },
    });

    return emptyBenchmark;
  }

  // Calculate averages
  const avgTrustScore =
    creatorsWithMetrics.reduce(
      (sum: number, c: (typeof creatorsWithMetrics)[number]) =>
        sum + c.trustScore,
      0
    ) / sampleSize;

  const avgRetentionRate =
    creatorsWithMetrics.reduce(
      (sum: number, c: (typeof creatorsWithMetrics)[number]) =>
        sum + (c.metrics[0]?.retentionRate || 0),
      0
    ) / sampleSize;

  const avgEngagementRate =
    creatorsWithMetrics.reduce(
      (sum: number, c: (typeof creatorsWithMetrics)[number]) =>
        sum + (c.metrics[0]?.engagementRate || 0),
      0
    ) / sampleSize;

  const avgResponseTime =
    creatorsWithMetrics.reduce(
      (sum: number, c: (typeof creatorsWithMetrics)[number]) =>
        sum + (c.metrics[0]?.responseTime || 0),
      0
    ) / sampleSize;

  const avgRefundRate =
    creatorsWithMetrics.reduce(
      (sum: number, c: (typeof creatorsWithMetrics)[number]) =>
        sum + (c.metrics[0]?.refundRate || 0),
      0
    ) / sampleSize;

  const avgOutcomeRate =
    creatorsWithMetrics.reduce(
      (sum: number, c: (typeof creatorsWithMetrics)[number]) =>
        sum + (c.metrics[0]?.outcomeRate || 0),
      0
    ) / sampleSize;

  // Calculate percentiles for trust score
  const trustScores = creatorsWithMetrics
    .map((c: (typeof creatorsWithMetrics)[number]) => c.trustScore)
    .sort((a, b) => a - b);

  const p25TrustScore = calculatePercentile(trustScores, 25);
  const p50TrustScore = calculatePercentile(trustScores, 50);
  const p75TrustScore = calculatePercentile(trustScores, 75);
  const p90TrustScore = calculatePercentile(trustScores, 90);

  // Get today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Upsert benchmark record
  const benchmark = await prisma.benchmark.upsert({
    where: {
      category_date: {
        category,
        date: today,
      },
    },
    update: {
      avgTrustScore,
      avgRetentionRate,
      avgEngagementRate,
      avgResponseTime,
      avgRefundRate,
      avgOutcomeRate,
      p25TrustScore,
      p50TrustScore,
      p75TrustScore,
      p90TrustScore,
      sampleSize,
    },
    create: {
      category,
      date: today,
      avgTrustScore,
      avgRetentionRate,
      avgEngagementRate,
      avgResponseTime,
      avgRefundRate,
      avgOutcomeRate,
      p25TrustScore,
      p50TrustScore,
      p75TrustScore,
      p90TrustScore,
      sampleSize,
    },
  });

  return benchmark;
}

/**
 * Get latest benchmark for category
 */
export async function getLatestBenchmark(
  category: string
): Promise<BenchmarkData | null> {
  const benchmark = await prisma.benchmark.findFirst({
    where: { category },
    orderBy: {
      date: 'desc',
    },
  });

  return benchmark;
}

/**
 * Get all categories with benchmarks
 */
export async function getAllCategories(): Promise<string[]> {
  const benchmarks = await prisma.benchmark.findMany({
    select: {
      category: true,
    },
    distinct: ['category'],
  });

  return benchmarks.map(b => b.category);
}
