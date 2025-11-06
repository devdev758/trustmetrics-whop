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

// Benchmark types
export interface BenchmarkData {
  id: string;
  category: string;
  date: Date;
  avgTrustScore: number;
  avgRetentionRate: number;
  avgEngagementRate: number;
  avgResponseTime: number;
  avgRefundRate: number;
  avgOutcomeRate: number;
  p25TrustScore: number;
  p50TrustScore: number;
  p75TrustScore: number;
  p90TrustScore: number;
  sampleSize: number;
}

export interface CreatorPercentile {
  trustScore: number;
  percentile: number;
  rank: string;
}

export interface BenchmarkResponse {
  benchmark: BenchmarkData;
  percentile: CreatorPercentile;
  category: string;
}

// Add more shared types here
