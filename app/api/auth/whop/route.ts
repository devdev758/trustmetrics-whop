/**
 * Whop OAuth Initiation Route
 *
 * Redirects users to Whop OAuth authorization page
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/whop/client';
import type { OAuthState } from '@/types/whop';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/whop
 *
 * Initiates OAuth flow by redirecting to Whop authorization page
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const redirectAfterAuth = searchParams.get('redirect') || '/dashboard';

    // Create state parameter for CSRF protection
    const state: OAuthState = {
      redirect: redirectAfterAuth,
      timestamp: Date.now(),
      nonce: crypto.randomUUID(),
    };

    // Encode state as base64
    const stateParam = Buffer.from(JSON.stringify(state)).toString('base64url');

    // Get authorization URL
    const authUrl = getAuthorizationUrl(stateParam);

    // Store state in cookie for verification in callback
    const response = NextResponse.redirect(authUrl);
    response.cookies.set('oauth_state', stateParam, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('OAuth initiation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to initiate OAuth',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
