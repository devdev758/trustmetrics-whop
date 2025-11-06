/**
 * Logout Route
 *
 * Clears session and redirects to home page
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/logout
 *
 * Logs out the current user by clearing their session
 */
export async function POST(_request: NextRequest) {
  const response = NextResponse.json({ success: true });

  // Clear session cookie
  response.cookies.delete('session');

  return response;
}

/**
 * GET /api/auth/logout
 *
 * Logs out the current user and redirects to home
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));

  // Clear session cookie
  response.cookies.delete('session');

  return response;
}
