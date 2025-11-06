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

// Add more shared types here
