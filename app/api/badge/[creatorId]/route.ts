/**
 * Badge API Route
 *
 * Returns embeddable HTML badge for creator's Trust Score
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

interface BadgeParams {
  params: {
    creatorId: string;
  };
}

/**
 * Get badge colors based on tier
 */
function getBadgeColors(tier: string) {
  switch (tier.toLowerCase()) {
    case 'gold':
      return {
        bg: '#10b981',
        text: '#ffffff',
        icon: '⭐',
      };
    case 'silver':
      return {
        bg: '#3b82f6',
        text: '#ffffff',
        icon: '🥈',
      };
    case 'bronze':
      return {
        bg: '#f59e0b',
        text: '#ffffff',
        icon: '🥉',
      };
    default:
      return {
        bg: '#6b7280',
        text: '#ffffff',
        icon: '✓',
      };
  }
}

/**
 * GET /api/badge/[creatorId]
 *
 * Returns HTML badge for embedding
 */
export async function GET(
  _request: NextRequest,
  { params }: BadgeParams
): Promise<NextResponse> {
  try {
    const { creatorId } = params;

    // Fetch creator data
    const creator = await prisma.creator.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        name: true,
        trustScore: true,
        tier: true,
      },
    });

    if (!creator) {
      // Return not found badge
      const html = generateNotFoundBadge();
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Generate badge HTML
    const html = generateBadgeHTML(creator);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Badge generation error:', error);

    const html = generateErrorBadge();
    return new NextResponse(html, {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}

/**
 * Generate badge HTML with inline styles
 */
function generateBadgeHTML(creator: {
  id: string;
  name: string;
  trustScore: number | null;
  tier: string | null;
}) {
  const score = creator.trustScore ?? 0;
  const tier = creator.tier ?? 'bronze';
  const colors = getBadgeColors(tier);

  // Use relative URL for profile link
  const profileUrl = `/profile/${creator.id}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trust Badge</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80px;
    }
    .badge {
      display: flex;
      align-items: center;
      gap: 12px;
      background: ${colors.bg};
      color: ${colors.text};
      padding: 12px 16px;
      border-radius: 8px;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      width: 200px;
      height: 80px;
    }
    .badge:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .badge-icon {
      font-size: 32px;
      line-height: 1;
    }
    .badge-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .badge-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.9;
    }
    .badge-tier {
      font-size: 14px;
      font-weight: 700;
    }
    .badge-score {
      font-size: 20px;
      font-weight: 800;
      line-height: 1;
    }
  </style>
</head>
<body>
  <a href="${profileUrl}" target="_parent" class="badge">
    <div class="badge-icon">${colors.icon}</div>
    <div class="badge-content">
      <div class="badge-label">Verified Creator</div>
      <div class="badge-tier">${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier</div>
      <div class="badge-score">${score.toFixed(1)}</div>
    </div>
  </a>
</body>
</html>`;
}

/**
 * Generate not found badge
 */
function generateNotFoundBadge() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trust Badge</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80px;
    }
    .badge {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e5e7eb;
      color: #6b7280;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      width: 200px;
      height: 80px;
    }
  </style>
</head>
<body>
  <div class="badge">Creator Not Found</div>
</body>
</html>`;
}

/**
 * Generate error badge
 */
function generateErrorBadge() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trust Badge</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80px;
    }
    .badge {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fecaca;
      color: #991b1b;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      width: 200px;
      height: 80px;
    }
  </style>
</head>
<body>
  <div class="badge">Badge Error</div>
</body>
</html>`;
}
