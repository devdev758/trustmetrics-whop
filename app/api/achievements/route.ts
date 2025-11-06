/**
 * Achievements API Routes
 *
 * Handles achievement submission and retrieval
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import {
  uploadAchievementProof,
  isValidImageType,
} from '@/lib/supabase/storage';
import type { SessionData } from '@/types/whop';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for file upload

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
 * GET /api/achievements?milestoneId=xxx
 *
 * Get all achievements for a milestone
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

    const { searchParams } = new URL(request.url);
    const milestoneId = searchParams.get('milestoneId');

    if (!milestoneId) {
      return NextResponse.json(
        { error: 'milestoneId parameter is required' },
        { status: 400 }
      );
    }

    // Verify milestone belongs to creator
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        creatorId: session.creatorId,
      },
    });

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    // Fetch achievements
    const achievements = await prisma.achievement.findMany({
      where: {
        milestoneId,
      },
      include: {
        member: {
          select: {
            id: true,
            whopMemberId: true,
            joinDate: true,
            status: true,
          },
        },
      },
      orderBy: {
        achievedAt: 'desc',
      },
    });

    return NextResponse.json({ achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch achievements',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/achievements
 *
 * Submit a new achievement
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
    const { milestoneId, proofImage, mimeType, fileName, whopMemberId } = body;

    // Validate required fields
    if (!milestoneId) {
      return NextResponse.json(
        { error: 'milestoneId is required' },
        { status: 400 }
      );
    }

    // Verify milestone belongs to creator
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        creatorId: session.creatorId,
      },
    });

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    // Validate image if provided
    let proofUrl: string | null = null;
    if (proofImage) {
      if (!mimeType || !isValidImageType(mimeType)) {
        return NextResponse.json(
          { error: 'Invalid image type. Only JPEG, PNG, and WebP are allowed' },
          { status: 400 }
        );
      }

      try {
        proofUrl = await uploadAchievementProof(
          proofImage,
          fileName || 'proof',
          mimeType
        );
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        return NextResponse.json(
          {
            error: 'Failed to upload image',
            message:
              uploadError instanceof Error
                ? uploadError.message
                : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }

    // Get or create member
    let member;
    if (whopMemberId) {
      member = await prisma.member.upsert({
        where: {
          whopMemberId,
        },
        update: {},
        create: {
          creatorId: session.creatorId,
          whopMemberId,
          status: 'active',
        },
      });
    } else {
      // Create a default member for the creator (for testing/demo)
      member = await prisma.member.create({
        data: {
          creatorId: session.creatorId,
          whopMemberId: `demo-${Date.now()}`,
          status: 'active',
        },
      });
    }

    // Create achievement
    const achievement = await prisma.achievement.create({
      data: {
        memberId: member.id,
        milestoneId,
        proofUrl,
        verified: false,
      },
      include: {
        member: {
          select: {
            id: true,
            whopMemberId: true,
            joinDate: true,
            status: true,
          },
        },
        milestone: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        achievement,
        message: 'Achievement submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating achievement:', error);

    return NextResponse.json(
      {
        error: 'Failed to create achievement',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
