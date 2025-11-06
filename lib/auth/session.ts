/**
 * Session Management Utilities
 *
 * Functions for managing user sessions and authentication
 */

import { cookies } from 'next/headers';
import type { SessionData } from '@/types/whop';

/**
 * Get the current session from cookies
 *
 * @returns Session data if valid, null otherwise
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return null;
  }

  try {
    const sessionData: SessionData = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64url').toString('utf-8')
    );

    // Check if session is expired
    if (sessionData.expiresAt < Date.now()) {
      return null;
    }

    return sessionData;
  } catch {
    return null;
  }
}

/**
 * Get the current authenticated creator ID
 *
 * @returns Creator ID if authenticated, null otherwise
 */
export async function getCurrentCreatorId(): Promise<string | null> {
  const session = await getSession();
  return session?.creatorId || null;
}

/**
 * Verify that a user is authenticated
 *
 * @throws Error if not authenticated
 * @returns Session data
 */
export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();

  if (!session) {
    throw new Error('Authentication required');
  }

  return session;
}

/**
 * Clear the current session (logout)
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
