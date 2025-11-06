/**
 * Milestones API Routes
 *
 * Handles CRUD operations for creator milestones
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { SessionData } from '@/types/whop';

export const dynamic = 'force-dynamic';

/**
 * Get session from cookies
 */
async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return null;
  }

  try {
    const sessionData: SessionData = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64url').toString('utf-8')
    );

    if (sessionData.expiresAt < Date.now()) {
      return null;
    }

    return sessionData;
  } catch {
    return null;
  }
}

/**
 * GET /api/milestones
 *
 * Get all milestones for authenticated creator
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get milestones with achievement counts
    const milestones = await prisma.milestone.findMany({
      where: {
        creatorId: session.creatorId,
      },
      include: {
        _count: {
          select: {
            achievements: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ milestones });
  } catch (error) {
    console.error('Error fetching milestones:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch milestones',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/milestones
 *
 * Create a new milestone
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, category } = body;

    // Validate required fields
    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      );
    }

    // Create milestone
    const milestone = await prisma.milestone.create({
      data: {
        creatorId: session.creatorId,
        title,
        description: description || null,
        category,
      },
      include: {
        _count: {
          select: {
            achievements: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        milestone,
        message: 'Milestone created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating milestone:', error);

    return NextResponse.json(
      {
        error: 'Failed to create milestone',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
