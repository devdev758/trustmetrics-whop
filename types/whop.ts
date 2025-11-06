/**
 * Whop API Type Definitions
 *
 * Types for Whop OAuth 2.0 authentication and API responses
 */

/**
 * OAuth token response from Whop
 */
export interface WhopTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number; // Seconds until expiration
  scope?: string;
}

/**
 * Whop user profile from /api/v5/me
 */
export interface WhopUser {
  id: string;
  email: string;
  username: string;
  profile_pic_url?: string;
  social_accounts?: {
    twitter?: string;
    discord?: string;
    instagram?: string;
  };
  created_at: number; // Unix timestamp
}

/**
 * Whop company/business profile from /api/v5/companies/{id}
 */
export interface WhopCompany {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  website_url?: string;
  category?: string;
  created_at: number; // Unix timestamp
  owner_id: string;
  members?: WhopCompanyMember[];
}

/**
 * Company member information
 */
export interface WhopCompanyMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: number; // Unix timestamp
}

/**
 * Whop API error response
 */
export interface WhopError {
  error: string;
  error_description?: string;
  status_code?: number;
}

/**
 * OAuth state parameter for CSRF protection
 */
export interface OAuthState {
  redirect?: string;
  timestamp: number;
  nonce: string;
}

/**
 * Session data stored in cookies
 */
export interface SessionData {
  creatorId: string;
  whopId: string;
  email: string;
  name: string;
  expiresAt: number; // Unix timestamp
}
