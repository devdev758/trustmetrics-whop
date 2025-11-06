/**
 * Whop API Client
 *
 * Provides methods for interacting with the Whop API including
 * OAuth token management and API requests
 */

import { prisma } from '@/lib/prisma';
import type {
  WhopUser,
  WhopCompany,
  WhopTokens,
  WhopError,
} from '@/types/whop';

const WHOP_API_BASE = 'https://api.whop.com';
const WHOP_OAUTH_BASE = 'https://whop.com/oauth';

/**
 * Whop API Client for handling OAuth and API requests
 */
export class WhopClient {
  private creatorId: string;
  private accessToken?: string;
  private refreshToken?: string;
  private tokenExpiry?: Date;

  constructor(creatorId: string) {
    this.creatorId = creatorId;
  }

  /**
   * Initialize the client by loading tokens from the database
   */
  async initialize(): Promise<void> {
    const creator = await prisma.creator.findUnique({
      where: { id: this.creatorId },
      select: {
        accessToken: true,
        refreshToken: true,
        tokenExpiry: true,
      },
    });

    if (!creator) {
      throw new Error('Creator not found');
    }

    // In production, tokens should be decrypted here
    this.accessToken = creator.accessToken || undefined;
    this.refreshToken = creator.refreshToken || undefined;
    this.tokenExpiry = creator.tokenExpiry || undefined;
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    // If no tokens loaded, initialize first
    if (!this.accessToken) {
      await this.initialize();
    }

    // If token is still valid (with 5-minute buffer), return it
    if (
      this.accessToken &&
      this.tokenExpiry &&
      this.tokenExpiry.getTime() > Date.now() + 5 * 60 * 1000
    ) {
      return this.accessToken;
    }

    // Token expired or expiring soon, refresh it
    if (this.refreshToken) {
      await this.refreshAccessToken();
      return this.accessToken!;
    }

    throw new Error('No valid access token and unable to refresh');
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const clientId = process.env.WHOP_CLIENT_ID;
    const clientSecret = process.env.WHOP_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Missing Whop OAuth credentials');
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const response = await fetch(`${WHOP_OAUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error: WhopError = await response.json();
      throw new Error(
        `Token refresh failed: ${error.error_description || error.error}`
      );
    }

    const tokens: WhopTokens = await response.json();

    // Update tokens in memory
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    // Update tokens in database
    // In production, tokens should be encrypted before storage
    await prisma.creator.update({
      where: { id: this.creatorId },
      data: {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        tokenExpiry: this.tokenExpiry,
      },
    });
  }

  /**
   * Make an authenticated request to the Whop API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAccessToken();

    const response = await fetch(`${WHOP_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: WhopError = await response.json().catch(() => ({
        error: 'Unknown error',
        status_code: response.status,
      }));
      throw new Error(
        `Whop API error: ${error.error_description || error.error} (${response.status})`
      );
    }

    return response.json();
  }

  /**
   * Get the current authenticated user's profile
   */
  async getCurrentUser(): Promise<WhopUser> {
    return this.makeRequest<WhopUser>('/api/v5/me');
  }

  /**
   * Get a company/business by ID
   */
  async getCompany(companyId: string): Promise<WhopCompany> {
    return this.makeRequest<WhopCompany>(`/api/v5/companies/${companyId}`);
  }

  /**
   * Get user's companies
   */
  async getUserCompanies(): Promise<WhopCompany[]> {
    const response = await this.makeRequest<{ data: WhopCompany[] }>(
      '/api/v5/me/companies'
    );
    return response.data || [];
  }
}

/**
 * Exchange authorization code for access tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<WhopTokens> {
  const clientId = process.env.WHOP_CLIENT_ID;
  const clientSecret = process.env.WHOP_CLIENT_SECRET;
  const redirectUri = process.env.WHOP_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Whop OAuth credentials');
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const response = await fetch(`${WHOP_OAUTH_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error: WhopError = await response.json();
    throw new Error(
      `Token exchange failed: ${error.error_description || error.error}`
    );
  }

  return response.json();
}

/**
 * Get the Whop OAuth authorization URL
 */
export function getAuthorizationUrl(state?: string): string {
  const clientId = process.env.WHOP_CLIENT_ID;
  const redirectUri = process.env.WHOP_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('Missing Whop OAuth credentials');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email companies',
  });

  if (state) {
    params.append('state', state);
  }

  return `${WHOP_OAUTH_BASE}/authorize?${params.toString()}`;
}
