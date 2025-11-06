/**
 * Trust Score Calculation System for TrustMetrics
 *
 * This module provides functionality to calculate trust scores for creators
 * based on multiple performance metrics with weighted scoring.
 */

/**
 * Input metrics for trust score calculation
 *
 * @interface MetricInput
 * @property {number} outcomeRate - Success/outcome rate (0-1, where 1 = 100% success)
 * @property {number} satisfactionScore - Customer satisfaction score (1-5 scale)
 * @property {number} engagementRate - Average engagement rate (sessions per week)
 * @property {number} retentionRate60 - 60-day retention rate (0-1, where 1 = 100% retained)
 * @property {number} responseTime - Average response time in hours
 * @property {number} contentConsistency - Content posting frequency (posts per week)
 * @property {number} refundRate - Refund rate (0-1, where 1 = 100% refunds)
 */
export interface MetricInput {
  outcomeRate: number;
  satisfactionScore: number;
  engagementRate: number;
  retentionRate60: number;
  responseTime: number;
  contentConsistency: number;
  refundRate: number;
}

/**
 * Breakdown of individual metric scores
 *
 * @interface ScoreBreakdown
 * @property {number} outcome - Normalized outcome score (0-100)
 * @property {number} satisfaction - Normalized satisfaction score (0-100)
 * @property {number} engagement - Normalized engagement score (0-100)
 * @property {number} retention - Normalized retention score (0-100)
 * @property {number} response - Normalized response time score (0-100)
 * @property {number} content - Normalized content consistency score (0-100)
 * @property {number} refund - Normalized refund score (0-100)
 */
export interface ScoreBreakdown {
  outcome: number;
  satisfaction: number;
  engagement: number;
  retention: number;
  response: number;
  content: number;
  refund: number;
}

/**
 * Trust score calculation result
 *
 * @interface TrustScoreResult
 * @property {number} score - Final weighted trust score (0-100)
 * @property {ScoreBreakdown} breakdown - Individual metric scores
 */
export interface TrustScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
}

/**
 * Weights for each metric in the trust score calculation
 * Total must equal 100%
 */
const METRIC_WEIGHTS = {
  outcome: 0.3, // 30%
  satisfaction: 0.25, // 25%
  engagement: 0.2, // 20%
  retention: 0.15, // 15%
  response: 0.05, // 5%
  content: 0.03, // 3%
  refund: 0.02, // 2%
} as const;

/**
 * Normalization constants for each metric
 */
const NORMALIZATION = {
  // Outcome rate: already 0-1, multiply by 100
  outcomeMultiplier: 100,

  // Satisfaction: 1-5 scale, convert to 0-100
  satisfactionMin: 1,
  satisfactionMax: 5,

  // Engagement: Sessions per week, normalize based on expected range
  // We consider 10+ sessions/week as excellent (100 score)
  engagementMax: 10,

  // Retention: already 0-1, multiply by 100
  retentionMultiplier: 100,

  // Response time: Lower is better, we use inverse normalization
  // 0-1 hour = 100, 24+ hours = 0
  responseTimeMax: 24,

  // Content consistency: Posts per week, normalize based on expected range
  // We consider 7+ posts/week as excellent (100 score)
  contentMax: 7,

  // Refund rate: already 0-1, but lower is better so we invert
  refundMultiplier: 100,
} as const;

/**
 * Safely clamps a value between 0 and 100
 *
 * @param {number} value - The value to clamp
 * @returns {number} Clamped value between 0 and 100
 */
function clamp(value: number): number {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
}

/**
 * Normalizes outcome rate to 0-100 scale
 *
 * @param {number} outcomeRate - Outcome rate (0-1)
 * @returns {number} Normalized score (0-100)
 */
function normalizeOutcome(outcomeRate: number): number {
  return clamp(outcomeRate * NORMALIZATION.outcomeMultiplier);
}

/**
 * Normalizes satisfaction score to 0-100 scale
 *
 * @param {number} satisfactionScore - Satisfaction score (1-5)
 * @returns {number} Normalized score (0-100)
 */
function normalizeSatisfaction(satisfactionScore: number): number {
  const { satisfactionMin, satisfactionMax } = NORMALIZATION;
  const normalized =
    ((satisfactionScore - satisfactionMin) / (satisfactionMax - satisfactionMin)) *
    100;
  return clamp(normalized);
}

/**
 * Normalizes engagement rate to 0-100 scale
 *
 * @param {number} engagementRate - Sessions per week
 * @returns {number} Normalized score (0-100)
 */
function normalizeEngagement(engagementRate: number): number {
  const normalized = (engagementRate / NORMALIZATION.engagementMax) * 100;
  return clamp(normalized);
}

/**
 * Normalizes retention rate to 0-100 scale
 *
 * @param {number} retentionRate60 - 60-day retention rate (0-1)
 * @returns {number} Normalized score (0-100)
 */
function normalizeRetention(retentionRate60: number): number {
  return clamp(retentionRate60 * NORMALIZATION.retentionMultiplier);
}

/**
 * Normalizes response time to 0-100 scale (inverse - lower time is better)
 *
 * @param {number} responseTime - Response time in hours
 * @returns {number} Normalized score (0-100)
 */
function normalizeResponseTime(responseTime: number): number {
  if (responseTime <= 0) return 100;
  const normalized =
    (1 - responseTime / NORMALIZATION.responseTimeMax) * 100;
  return clamp(normalized);
}

/**
 * Normalizes content consistency to 0-100 scale
 *
 * @param {number} contentConsistency - Posts per week
 * @returns {number} Normalized score (0-100)
 */
function normalizeContent(contentConsistency: number): number {
  const normalized = (contentConsistency / NORMALIZATION.contentMax) * 100;
  return clamp(normalized);
}

/**
 * Normalizes refund rate to 0-100 scale (inverse - lower refund is better)
 *
 * @param {number} refundRate - Refund rate (0-1)
 * @returns {number} Normalized score (0-100)
 */
function normalizeRefund(refundRate: number): number {
  return clamp((1 - refundRate) * NORMALIZATION.refundMultiplier);
}

/**
 * Calculates a comprehensive trust score based on multiple metrics
 *
 * This function takes various performance metrics, normalizes them to a 0-100 scale,
 * applies weighted scoring, and returns a final trust score with detailed breakdown.
 *
 * @param {MetricInput} metrics - Input metrics for trust score calculation
 * @returns {TrustScoreResult} Trust score (0-100) and breakdown of individual metrics
 *
 * @example
 * const metrics = {
 *   outcomeRate: 0.85,
 *   satisfactionScore: 4.5,
 *   engagementRate: 8,
 *   retentionRate60: 0.75,
 *   responseTime: 2,
 *   contentConsistency: 5,
 *   refundRate: 0.05
 * };
 * const result = calculateTrustScore(metrics);
 * console.log(result.score); // e.g., 82.5
 * console.log(result.breakdown.outcome); // e.g., 85
 */
export function calculateTrustScore(metrics: MetricInput): TrustScoreResult {
  // Normalize each metric to 0-100 scale
  const breakdown: ScoreBreakdown = {
    outcome: normalizeOutcome(metrics.outcomeRate),
    satisfaction: normalizeSatisfaction(metrics.satisfactionScore),
    engagement: normalizeEngagement(metrics.engagementRate),
    retention: normalizeRetention(metrics.retentionRate60),
    response: normalizeResponseTime(metrics.responseTime),
    content: normalizeContent(metrics.contentConsistency),
    refund: normalizeRefund(metrics.refundRate),
  };

  // Calculate weighted score
  const score =
    breakdown.outcome * METRIC_WEIGHTS.outcome +
    breakdown.satisfaction * METRIC_WEIGHTS.satisfaction +
    breakdown.engagement * METRIC_WEIGHTS.engagement +
    breakdown.retention * METRIC_WEIGHTS.retention +
    breakdown.response * METRIC_WEIGHTS.response +
    breakdown.content * METRIC_WEIGHTS.content +
    breakdown.refund * METRIC_WEIGHTS.refund;

  // Round to 2 decimal places and ensure it's between 0-100
  const finalScore = clamp(Math.round(score * 100) / 100);

  return {
    score: finalScore,
    breakdown,
  };
}

/**
 * Determines the tier based on trust score
 *
 * @param {number} score - Trust score (0-100)
 * @returns {'platinum' | 'gold' | 'silver' | 'bronze'} Tier classification
 *
 * @example
 * getTier(95); // 'platinum'
 * getTier(75); // 'gold'
 * getTier(55); // 'silver'
 * getTier(35); // 'bronze'
 */
export function getTier(
  score: number
): 'platinum' | 'gold' | 'silver' | 'bronze' {
  if (score >= 90) return 'platinum';
  if (score >= 70) return 'gold';
  if (score >= 50) return 'silver';
  return 'bronze';
}
