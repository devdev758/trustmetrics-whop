/**
 * Global TypeScript type definitions for TrustMetrics
 */

// Example: User type
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Example: API Response type
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Badge types
export interface BadgeData {
  creatorId: string;
  creatorName: string;
  trustScore: number;
  tier: 'gold' | 'silver' | 'bronze';
  embedCode: string;
  profileUrl: string;
}

// Add more shared types here
