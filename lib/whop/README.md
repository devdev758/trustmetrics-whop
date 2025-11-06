# Whop OAuth 2.0 Integration

This directory contains the Whop OAuth 2.0 authentication implementation for TrustMetrics.

## Overview

The authentication flow allows creators to sign in using their Whop accounts and grants TrustMetrics access to their profile and company data.

## Authentication Flow

1. **Initiation** (`/api/auth/whop`)
   - User clicks "Sign in with Whop"
   - Redirects to Whop OAuth authorization page
   - Creates state parameter for CSRF protection

2. **Authorization**
   - User authorizes the application on Whop
   - Whop redirects back to callback URL with authorization code

3. **Callback** (`/api/auth/whop/callback`)
   - Receives authorization code
   - Exchanges code for access and refresh tokens
   - Fetches user profile from Whop API
   - Creates/updates Creator in database
   - Establishes session with secure cookie
   - Redirects to dashboard

## Setup

### 1. Create Whop OAuth App

1. Go to [Whop Developer Dashboard](https://whop.com/apps)
2. Create a new OAuth application
3. Set the redirect URI to: `http://localhost:3000/api/auth/whop/callback` (or your production URL)
4. Note your Client ID and Client Secret

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
WHOP_CLIENT_ID=your_client_id_here
WHOP_CLIENT_SECRET=your_client_secret_here
WHOP_REDIRECT_URI=http://localhost:3000/api/auth/whop/callback
```

### 3. Update Database Schema

Run Prisma migration to add token fields to Creator model:

```bash
npm run db:push
```

## Usage

### Initiating OAuth Flow

Redirect users to `/api/auth/whop`:

```tsx
<a href="/api/auth/whop">Sign in with Whop</a>
```

With optional redirect parameter:

```tsx
<a href="/api/auth/whop?redirect=/settings">Sign in with Whop</a>
```

### Using the Whop Client

```typescript
import { WhopClient } from '@/lib/whop/client';

// In a server component or API route
const creatorId = 'creator_id_here';
const client = new WhopClient(creatorId);
await client.initialize();

// Get current user
const user = await client.getCurrentUser();

// Get user's companies
const companies = await client.getUserCompanies();

// Get specific company
const company = await client.getCompany('company_id');
```

### Session Management

```typescript
import { getSession, requireAuth } from '@/lib/auth/session';

// Get current session (returns null if not authenticated)
const session = await getSession();

// Require authentication (throws error if not authenticated)
const session = await requireAuth();

// Get current creator ID
const creatorId = await getCurrentCreatorId();
```

### Logout

```tsx
// Client-side logout
async function handleLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/';
}

// Or use the GET endpoint
<a href="/api/auth/logout">Sign out</a>
```

## Security Features

- **CSRF Protection**: State parameter prevents cross-site request forgery
- **Secure Cookies**: Session cookies are httpOnly and secure in production
- **Token Refresh**: Automatic token refresh when access token expires
- **Session Expiration**: Sessions expire after 30 days
- **State Validation**: Prevents replay attacks with timestamp validation

## Token Storage

⚠️ **Important**: In production, you should encrypt tokens before storing them in the database.

The current implementation stores tokens as plain text. Consider using encryption libraries like:
- [@47ng/cloak](https://github.com/47ng/cloak)
- [crypto-js](https://www.npmjs.com/package/crypto-js)

Example encryption implementation:

```typescript
import { encrypt, decrypt } from '@/lib/encryption';

// Before storing
accessToken: encrypt(tokens.access_token),
refreshToken: encrypt(tokens.refresh_token),

// Before using
const decryptedToken = decrypt(creator.accessToken);
```

## API Endpoints

### GET /api/auth/whop
Initiates OAuth flow by redirecting to Whop authorization page.

**Query Parameters:**
- `redirect` (optional): URL to redirect to after successful authentication

### GET /api/auth/whop/callback
Handles OAuth callback from Whop.

**Query Parameters:**
- `code`: Authorization code from Whop
- `state`: State parameter for CSRF protection
- `error` (optional): Error code if authorization failed
- `error_description` (optional): Human-readable error description

### GET|POST /api/auth/logout
Logs out the current user by clearing their session.

## Error Handling

Authentication errors are redirected to `/auth/error?error=<message>`.

Common errors:
- Missing OAuth parameters
- Invalid state parameter
- State expired
- Token exchange failed
- User profile fetch failed

## TypeScript Types

All types are defined in `/types/whop.ts`:
- `WhopTokens`: OAuth token response
- `WhopUser`: User profile data
- `WhopCompany`: Company/business data
- `SessionData`: Session information
- `OAuthState`: State parameter structure

## Scopes

The OAuth flow requests the following scopes:
- `openid`: OpenID Connect authentication
- `profile`: Access to user profile
- `email`: Access to user email
- `companies`: Access to user's companies
