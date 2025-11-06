import { describe, it, expect } from 'vitest';
import { calculateTrustScore, getTier, type MetricInput } from '../trustScore';

describe('calculateTrustScore', () => {
  describe('Perfect Creator', () => {
    it('should score ~95-100 for a perfect creator', () => {
      const perfectMetrics: MetricInput = {
        outcomeRate: 0.95, // 95% success rate
        satisfactionScore: 5, // Perfect satisfaction
        engagementRate: 12, // High engagement (12 sessions/week)
        retentionRate60: 0.9, // 90% retention
        responseTime: 0.5, // 30 minutes response time
        contentConsistency: 8, // 8 posts/week
        refundRate: 0.01, // Only 1% refunds
      };

      const result = calculateTrustScore(perfectMetrics);

      expect(result.score).toBeGreaterThanOrEqual(95);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.breakdown.outcome).toBeGreaterThanOrEqual(90);
      expect(result.breakdown.satisfaction).toBe(100);
      expect(result.breakdown.engagement).toBe(100); // Capped at 100
      expect(result.breakdown.retention).toBeGreaterThanOrEqual(90);
      expect(result.breakdown.response).toBeGreaterThanOrEqual(95);
      expect(result.breakdown.content).toBe(100); // Capped at 100
      expect(result.breakdown.refund).toBeGreaterThanOrEqual(99);
    });

    it('should return platinum tier for perfect creator', () => {
      const perfectMetrics: MetricInput = {
        outcomeRate: 0.95,
        satisfactionScore: 5,
        engagementRate: 12,
        retentionRate60: 0.9,
        responseTime: 0.5,
        contentConsistency: 8,
        refundRate: 0.01,
      };

      const result = calculateTrustScore(perfectMetrics);
      const tier = getTier(result.score);

      expect(tier).toBe('platinum');
    });
  });

  describe('Poor Creator', () => {
    it('should score ~20-30 for a poor creator', () => {
      const poorMetrics: MetricInput = {
        outcomeRate: 0.3, // Only 30% success rate
        satisfactionScore: 2, // Poor satisfaction
        engagementRate: 1, // Very low engagement
        retentionRate60: 0.2, // Only 20% retention
        responseTime: 20, // Very slow response (20 hours)
        contentConsistency: 0.5, // Inconsistent content
        refundRate: 0.3, // High refund rate (30%)
      };

      const result = calculateTrustScore(poorMetrics);

      expect(result.score).toBeGreaterThanOrEqual(20);
      expect(result.score).toBeLessThanOrEqual(35);
      expect(result.breakdown.outcome).toBeLessThanOrEqual(35);
      expect(result.breakdown.satisfaction).toBeLessThanOrEqual(30);
      expect(result.breakdown.engagement).toBeLessThanOrEqual(15);
      expect(result.breakdown.retention).toBeLessThanOrEqual(25);
      expect(result.breakdown.response).toBeLessThanOrEqual(25);
      expect(result.breakdown.content).toBeLessThanOrEqual(10);
      expect(result.breakdown.refund).toBeLessThanOrEqual(75);
    });

    it('should return bronze tier for poor creator', () => {
      const poorMetrics: MetricInput = {
        outcomeRate: 0.3,
        satisfactionScore: 2,
        engagementRate: 1,
        retentionRate60: 0.2,
        responseTime: 20,
        contentConsistency: 0.5,
        refundRate: 0.3,
      };

      const result = calculateTrustScore(poorMetrics);
      const tier = getTier(result.score);

      expect(tier).toBe('bronze');
    });
  });

  describe('Average Creator', () => {
    it('should score ~60-70 for an average creator', () => {
      const averageMetrics: MetricInput = {
        outcomeRate: 0.65, // 65% success rate
        satisfactionScore: 3.5, // Average satisfaction
        engagementRate: 5, // Moderate engagement
        retentionRate60: 0.6, // 60% retention
        responseTime: 6, // 6 hours response time
        contentConsistency: 3, // 3 posts/week
        refundRate: 0.1, // 10% refund rate
      };

      const result = calculateTrustScore(averageMetrics);

      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.score).toBeLessThanOrEqual(72);
      expect(result.breakdown.outcome).toBeCloseTo(65, 0);
      expect(result.breakdown.satisfaction).toBeCloseTo(62.5, 0);
      expect(result.breakdown.engagement).toBe(50);
      expect(result.breakdown.retention).toBe(60);
      expect(result.breakdown.response).toBeCloseTo(75, 0);
      expect(result.breakdown.content).toBeCloseTo(42.86, 0);
      expect(result.breakdown.refund).toBe(90);
    });

    it('should return silver or gold tier for average creator', () => {
      const averageMetrics: MetricInput = {
        outcomeRate: 0.65,
        satisfactionScore: 3.5,
        engagementRate: 5,
        retentionRate60: 0.6,
        responseTime: 6,
        contentConsistency: 3,
        refundRate: 0.1,
      };

      const result = calculateTrustScore(averageMetrics);
      const tier = getTier(result.score);

      expect(['silver', 'gold']).toContain(tier);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values gracefully', () => {
      const zeroMetrics: MetricInput = {
        outcomeRate: 0,
        satisfactionScore: 1, // Minimum possible
        engagementRate: 0,
        retentionRate60: 0,
        responseTime: 0, // Best possible response
        contentConsistency: 0,
        refundRate: 0, // Best possible refund
      };

      const result = calculateTrustScore(zeroMetrics);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.breakdown.outcome).toBe(0);
      expect(result.breakdown.satisfaction).toBe(0);
      expect(result.breakdown.engagement).toBe(0);
      expect(result.breakdown.retention).toBe(0);
      expect(result.breakdown.response).toBe(100); // Zero response time is perfect
      expect(result.breakdown.content).toBe(0);
      expect(result.breakdown.refund).toBe(100); // Zero refunds is perfect
    });

    it('should handle maximum values correctly', () => {
      const maxMetrics: MetricInput = {
        outcomeRate: 1,
        satisfactionScore: 5,
        engagementRate: 100, // Extremely high
        retentionRate60: 1,
        responseTime: 100, // Very poor
        contentConsistency: 100, // Extremely high
        refundRate: 1, // 100% refunds (worst case)
      };

      const result = calculateTrustScore(maxMetrics);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.breakdown.outcome).toBe(100);
      expect(result.breakdown.satisfaction).toBe(100);
      expect(result.breakdown.engagement).toBe(100); // Capped
      expect(result.breakdown.retention).toBe(100);
      expect(result.breakdown.response).toBe(0); // Clamped to 0
      expect(result.breakdown.content).toBe(100); // Capped
      expect(result.breakdown.refund).toBe(0); // Worst refund rate
    });

    it('should handle negative values by clamping to 0', () => {
      const negativeMetrics: MetricInput = {
        outcomeRate: -0.5,
        satisfactionScore: 0, // Below minimum
        engagementRate: -10,
        retentionRate60: -0.3,
        responseTime: -5,
        contentConsistency: -2,
        refundRate: -0.1,
      };

      const result = calculateTrustScore(negativeMetrics);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.outcome).toBe(0);
      expect(result.breakdown.satisfaction).toBe(0);
      expect(result.breakdown.engagement).toBe(0);
      expect(result.breakdown.retention).toBe(0);
      expect(result.breakdown.response).toBe(100); // Negative becomes best
      expect(result.breakdown.content).toBe(0);
      expect(result.breakdown.refund).toBe(100); // Negative becomes best
    });

    it('should handle NaN values by treating them as 0', () => {
      const nanMetrics: MetricInput = {
        outcomeRate: NaN,
        satisfactionScore: NaN,
        engagementRate: NaN,
        retentionRate60: NaN,
        responseTime: NaN,
        contentConsistency: NaN,
        refundRate: NaN,
      };

      const result = calculateTrustScore(nanMetrics);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.outcome).toBe(0);
      expect(result.breakdown.satisfaction).toBe(0);
      expect(result.breakdown.engagement).toBe(0);
      expect(result.breakdown.retention).toBe(0);
      expect(result.breakdown.content).toBe(0);
    });

    it('should handle Infinity values by clamping', () => {
      const infinityMetrics: MetricInput = {
        outcomeRate: Infinity,
        satisfactionScore: Infinity,
        engagementRate: Infinity,
        retentionRate60: Infinity,
        responseTime: Infinity,
        contentConsistency: Infinity,
        refundRate: Infinity,
      };

      const result = calculateTrustScore(infinityMetrics);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      // All values should be clamped to valid ranges
      expect(result.breakdown.outcome).toBeLessThanOrEqual(100);
      expect(result.breakdown.satisfaction).toBeLessThanOrEqual(100);
      expect(result.breakdown.engagement).toBeLessThanOrEqual(100);
      expect(result.breakdown.retention).toBeLessThanOrEqual(100);
      expect(result.breakdown.response).toBeLessThanOrEqual(100);
      expect(result.breakdown.content).toBeLessThanOrEqual(100);
      expect(result.breakdown.refund).toBeLessThanOrEqual(100);
    });
  });

  describe('Weighted Scoring', () => {
    it('should apply correct weights to metrics', () => {
      // Test that outcome has the highest weight (30%)
      const highOutcomeMetrics: MetricInput = {
        outcomeRate: 1, // Perfect
        satisfactionScore: 1, // Worst
        engagementRate: 0, // Worst
        retentionRate60: 0, // Worst
        responseTime: 100, // Worst
        contentConsistency: 0, // Worst
        refundRate: 1, // Worst
      };

      const result = calculateTrustScore(highOutcomeMetrics);
      // With 30% weight and 100 score on outcome, should get at least 30 points
      expect(result.score).toBeGreaterThanOrEqual(30);
    });

    it('should produce different scores for different metric combinations', () => {
      const metrics1: MetricInput = {
        outcomeRate: 0.8,
        satisfactionScore: 4,
        engagementRate: 6,
        retentionRate60: 0.7,
        responseTime: 3,
        contentConsistency: 4,
        refundRate: 0.05,
      };

      const metrics2: MetricInput = {
        outcomeRate: 0.6,
        satisfactionScore: 5,
        engagementRate: 8,
        retentionRate60: 0.8,
        responseTime: 1,
        contentConsistency: 6,
        refundRate: 0.02,
      };

      const result1 = calculateTrustScore(metrics1);
      const result2 = calculateTrustScore(metrics2);

      expect(result1.score).not.toBe(result2.score);
    });
  });
});

describe('getTier', () => {
  it('should return platinum for scores >= 90', () => {
    expect(getTier(90)).toBe('platinum');
    expect(getTier(95)).toBe('platinum');
    expect(getTier(100)).toBe('platinum');
  });

  it('should return gold for scores >= 70 and < 90', () => {
    expect(getTier(70)).toBe('gold');
    expect(getTier(80)).toBe('gold');
    expect(getTier(89)).toBe('gold');
  });

  it('should return silver for scores >= 50 and < 70', () => {
    expect(getTier(50)).toBe('silver');
    expect(getTier(60)).toBe('silver');
    expect(getTier(69)).toBe('silver');
  });

  it('should return bronze for scores < 50', () => {
    expect(getTier(0)).toBe('bronze');
    expect(getTier(25)).toBe('bronze');
    expect(getTier(49)).toBe('bronze');
  });
});
