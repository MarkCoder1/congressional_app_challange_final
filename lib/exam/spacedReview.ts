// /lib/exam/spacedReview.ts
// Deterministic spaced-review engine. Heuristic, not scientific forgetting curve.

import type { SpacedReviewState, AdaptiveTopicState, TopicMasteryLevel } from "../../types/task.ts";

export const SPACED_REVIEW_CONFIG = {
  BASE_INTERVALS: {
    "Needs Review": 2,
    Developing: 4,
    Strong: 7,
    Mastered: 14,
  } as Record<TopicMasteryLevel, number>,
  MAX_INTERVAL: 30,
  MIN_INTERVAL: 1,
  SUCCESS_FACTOR: 1.8,
  POOR_FACTOR: 0.6,
  SUCCESS_THRESHOLD: 70,
  POOR_THRESHOLD: 50,
} as const;

export function getBaseInterval(level: TopicMasteryLevel): number {
  return SPACED_REVIEW_CONFIG.BASE_INTERVALS[level] ?? 4;
}

function addDays(dateStr: string, days: number): string {
  // dateStr is YYYY-MM-DD or ISO, we handle both
  const d = new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a.includes("T") ? a : a + "T00:00:00");
  const db = new Date(b.includes("T") ? b : b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / (1000 * 3600 * 24));
}

/**
 * Calculate next review state after a review session.
 * - Successful (score >=70): interval increases.
 * - Poor (<50): interval decreases.
 * - Otherwise stays.
 * - RetentionScore is updated to recent score.
 */
export function calculateNextReview(
  current: SpacedReviewState,
  performance: { score: number; correct: boolean; masteryLevel: TopicMasteryLevel },
  nowIso: string,
): SpacedReviewState {
  const nowDate = nowIso.split("T")[0];
  let interval = current.intervalDays || getBaseInterval(performance.masteryLevel);

  if (performance.score >= SPACED_REVIEW_CONFIG.SUCCESS_THRESHOLD) {
    // Successful: increase interval, at least +1
    interval = Math.min(
      SPACED_REVIEW_CONFIG.MAX_INTERVAL,
      Math.max(interval + 1, Math.round(interval * SPACED_REVIEW_CONFIG.SUCCESS_FACTOR)),
    );
  } else if (performance.score < SPACED_REVIEW_CONFIG.POOR_THRESHOLD) {
    interval = Math.max(
      SPACED_REVIEW_CONFIG.MIN_INTERVAL,
      Math.round(interval * SPACED_REVIEW_CONFIG.POOR_FACTOR),
    );
    if (interval < 1) interval = 1;
  }
  // else keep interval

  // If mastery changed, blend towards base interval (adaptive heuristic)
  const base = getBaseInterval(performance.masteryLevel);
  // Slight nudge: if mastery dropped to Needs Review, shorten a bit
  if (performance.masteryLevel === "Needs Review" && interval > base + 2) {
    interval = Math.max(base, interval - 1);
  }

  return {
    topicId: current.topicId,
    lastReviewedAt: nowIso,
    nextReviewAt: addDays(nowDate, interval),
    intervalDays: interval,
    reviewCount: current.reviewCount + 1,
    retentionScore: performance.score,
  };
}

export function createInitialReview(
  topicId: string,
  masteryLevel: TopicMasteryLevel,
  nowIso: string,
): SpacedReviewState {
  const interval = getBaseInterval(masteryLevel);
  const nowDate = nowIso.split("T")[0];
  return {
    topicId,
    lastReviewedAt: undefined,
    nextReviewAt: addDays(nowDate, interval),
    intervalDays: interval,
    reviewCount: 0,
    retentionScore: 50,
  };
}

export function isReviewDue(review: SpacedReviewState, nowDate: string): boolean {
  if (!review.nextReviewAt) return false;
  return daysBetween(review.nextReviewAt, nowDate) >= 0 || review.nextReviewAt <= nowDate;
}

export function isReviewOverdue(review: SpacedReviewState, nowDate: string): boolean {
  if (!review.nextReviewAt) return false;
  return daysBetween(review.nextReviewAt, nowDate) > 0;
}

export function daysOverdue(review: SpacedReviewState, nowDate: string): number {
  if (!review.nextReviewAt) return 0;
  const d = daysBetween(review.nextReviewAt, nowDate);
  return d > 0 ? d : 0;
}

/**
 * Review urgency score 0-100 for scheduling.
 * - Overdue: +20 plus 2 per extra day overdue
 * - Due today: +15
 * - Low mastery: +10 if Needs Review, +5 if Developing
 * - Declining trend: +8
 * - Exam within 7 days & mastery<70: +10
 */
export function calculateReviewUrgency(
  review: SpacedReviewState,
  adaptiveTopic: AdaptiveTopicState | undefined,
  examDate: string | undefined,
  nowDate: string,
): number {
  let score = 0;
  const overdue = daysOverdue(review, nowDate);
  if (overdue > 0) {
    score += 20 + Math.min(15, overdue * 2);
  } else if (review.nextReviewAt === nowDate) {
    score += 15;
  } else if (review.nextReviewAt && daysBetween(nowDate, review.nextReviewAt) === 1) {
    score += 5; // due tomorrow
  }

  if (adaptiveTopic) {
    if (adaptiveTopic.masteryLevel === "Needs Review") score += 10;
    else if (adaptiveTopic.masteryLevel === "Developing") score += 5;

    if (adaptiveTopic.trend === "declining") score += 8;
    else if (adaptiveTopic.trend === "improving") score -= 3;

    if (adaptiveTopic.consecutiveMistakes >= 2) score += 5;
  }

  if (examDate) {
    const days = daysBetween(nowDate, examDate);
    if (days >= 0 && days <= 7 && (adaptiveTopic?.masteryScore ?? 100) < 70) score += 10;
    else if (days >= 0 && days <= 14 && (adaptiveTopic?.masteryScore ?? 100) < 80) score += 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
