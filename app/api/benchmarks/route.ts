/**
 * Benchmarks API Route
 *
 * Fetch benchmark data for a creator's category
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import {
  getLatestBenchmark,
  calculateCreatorPercentile,
  calculateCategoryBenchmarks,
} from '@/lib/benchmarks/calculate';

export const dynamic = 'force-dynamic';

/**
 * GET /api/benchmarks
 *
 * Get benchmark data for authenticated creator's category
 */
export async function GET(_request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get creator data
    const creator = await prisma.creator.findUnique({
      where: { id: session.creatorId },
      select: {
        id: true,
        category: true,
        trustScore: true,
      },
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Use 'all' category if creator doesn't have a specific category
    const category = creator.category || 'all';

    // Get latest benchmark for category
    let benchmark = await getLatestBenchmark(category);

    // If no benchmark exists, calculate it
    if (!benchmark) {
      benchmark = await calculateCategoryBenchmarks(category);
    }

    // Calculate creator's percentile rank
    const percentileData = calculateCreatorPercentile(
      creator.trustScore,
      benchmark
    );

    return NextResponse.json(
      {
        benchmark,
        percentile: percentileData,
        category,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Benchmark fetch error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch benchmarks',
      },
      { status: 500 }
    );
  }
}
