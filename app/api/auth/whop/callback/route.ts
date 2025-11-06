/**
 * Whop OAuth Callback Route
 *
 * Handles OAuth callback from Whop, exchanges code for tokens,
 * creates/updates creator in database, and establishes session
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/whop/client';
import { prisma } from '@/lib/prisma';
import type { OAuthState, WhopUser, SessionData } from '@/types/whop';

export const dynamic = 'force-dynamic';

const WHOP_API_BASE = 'https://api.whop.com';

/**
 * Fetch user profile from Whop API
 */
async function fetchWhopUser(accessToken: string): Promise<WhopUser> {
  const response = await fetch(`${WHOP_API_BASE}/api/v5/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }

  return response.json();
}

/**
 * GET /api/auth/whop/callback
 *
 * Handles OAuth callback, exchanges code for tokens, and creates session
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Check for OAuth errors
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/auth/error?error=${encodeURIComponent(errorDescription || error)}`,
          request.url
        )
      );
    }

    // Validate required parameters
    if (!code || !stateParam) {
      return NextResponse.redirect(
        new URL('/auth/error?error=Missing OAuth parameters', request.url)
      );
    }

    // Verify state parameter (CSRF protection)
    const storedState = request.cookies.get('oauth_state')?.value;
    if (!storedState || storedState !== stateParam) {
      return NextResponse.redirect(
        new URL('/auth/error?error=Invalid state parameter', request.url)
      );
    }

    // Decode state to get redirect URL
    let state: OAuthState;
    try {
      state = JSON.parse(
        Buffer.from(stateParam, 'base64url').toString('utf-8')
      );
    } catch {
      return NextResponse.redirect(
        new URL('/auth/error?error=Invalid state format', request.url)
      );
    }

    // Verify state timestamp (prevent replay attacks)
    const stateAge = Date.now() - state.timestamp;
    if (stateAge > 10 * 60 * 1000) {
      // 10 minutes
      return NextResponse.redirect(
        new URL('/auth/error?error=State expired', request.url)
      );
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Fetch user profile
    const whopUser = await fetchWhopUser(tokens.access_token);

    // Calculate token expiry
    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    // Create or update creator in database
    // In production, tokens should be encrypted before storage
    const creator = await prisma.creator.upsert({
      where: { whopId: whopUser.id },
      update: {
        email: whopUser.email,
        name: whopUser.username,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: tokenExpiry,
        updatedAt: new Date(),
      },
      create: {
        whopId: whopUser.id,
        email: whopUser.email,
        name: whopUser.username,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: tokenExpiry,
        trustScore: 0,
        tier: 'bronze',
      },
    });

    // Create session data
    const sessionData: SessionData = {
      creatorId: creator.id,
      whopId: creator.whopId,
      email: creator.email,
      name: creator.name,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    // Encode session data
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString(
      'base64url'
    );

    // Redirect to dashboard with session cookie
    const redirectUrl = new URL(state.redirect || '/dashboard', request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Set session cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Clear OAuth state cookie
    response.cookies.delete('oauth_state');

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);

    return NextResponse.redirect(
      new URL(
        `/auth/error?error=${encodeURIComponent(
          error instanceof Error ? error.message : 'Authentication failed'
        )}`,
        request.url
      )
    );
  }
}
