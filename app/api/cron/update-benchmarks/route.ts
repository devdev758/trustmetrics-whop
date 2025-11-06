/**
 * Update Benchmarks Cron Job
 *
 * Daily cron job to update benchmark data for all categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCategoryBenchmarks } from '@/lib/benchmarks/calculate';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/update-benchmarks
 *
 * Update benchmarks for all categories
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting benchmark update cron job...');

    // Get all distinct creator categories
    const creators = await prisma.creator.findMany({
      where: {
        trustScore: {
          gt: 0,
        },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    // Extract unique categories (excluding null)
    const categories = [
      ...new Set(
        creators.map(c => c.category).filter((cat): cat is string => !!cat)
      ),
      'all', // Always include 'all' category
    ];

    console.log(`Found ${categories.length} categories to update:`, categories);

    // Update benchmarks for each category
    const results = await Promise.allSettled(
      categories.map(async category => {
        console.log(`Updating benchmark for category: ${category}`);
        const benchmark = await calculateCategoryBenchmarks(category);
        return {
          category,
          sampleSize: benchmark.sampleSize,
          avgTrustScore: benchmark.avgTrustScore,
        };
      })
    );

    // Count successes and failures
    const successes = results.filter(r => r.status === 'fulfilled');
    const failures = results.filter(r => r.status === 'rejected');

    console.log(
      `Benchmark update complete: ${successes.length} succeeded, ${failures.length} failed`
    );

    return NextResponse.json(
      {
        success: true,
        message: `Updated ${successes.length} category benchmarks`,
        categories: successes.map(r =>
          r.status === 'fulfilled' ? r.value : null
        ),
        failed: failures.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Benchmark update cron error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update benchmarks',
      },
      { status: 500 }
    );
  }
}
