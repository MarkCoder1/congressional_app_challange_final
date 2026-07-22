import type { PlannerTask } from "../../types";

export interface ReviewSchedule {
  nextReviewAt: string | null;
  interval: number;
  reason: string;
}

/**
 * Determine when a task should be reviewed next.
 *
 * Uses a simplified SM-2-like logic based on available data:
 *  - Mastery score (0-100) → determines base interval
 *  - Confidence (0-100) → adjusts interval
 *  - Previous reviews → longer intervals for more reviews
 *  - Difficulty → harder tasks = shorter intervals
 *
 * No actual SM-2 algorithm is implemented — this is heuristic only.
 * The engine updates `SpacedRepetitionData` on the task for later use.
 */
export function calculateNextReview(task: PlannerTask): ReviewSchedule {
  const mastery = task.metadata?.masteryScore;
  const confidence = task.confidence;
  const reviewCount = task.reviewCount ?? 0;
  const difficulty = task.difficulty;

  // ── 1. Base interval from mastery ──
  let baseInterval: number;
  if (mastery !== null && mastery !== undefined && Number.isFinite(mastery)) {
    if (mastery >= 90) baseInterval = 30;
    else if (mastery >= 80) baseInterval = 21;
    else if (mastery >= 70) baseInterval = 14;
    else if (mastery >= 60) baseInterval = 7;
    else if (mastery >= 50) baseInterval = 3;
    else baseInterval = 1; // < 50 → review tomorrow
  } else if (confidence !== null && confidence !== undefined && Number.isFinite(confidence)) {
    if (confidence >= 80) baseInterval = 21;
    else if (confidence >= 60) baseInterval = 14;
    else if (confidence >= 40) baseInterval = 7;
    else baseInterval = 2;
  } else {
    baseInterval = 7; // Default: review in a week
  }

  // ── 2. Adjust for confidence ──
  let confidenceMultiplier = 1;
  if (confidence !== null && confidence !== undefined && Number.isFinite(confidence)) {
    if (confidence >= 80) confidenceMultiplier = 1.5;
    else if (confidence >= 60) confidenceMultiplier = 1.0;
    else if (confidence >= 40) confidenceMultiplier = 0.7;
    else confidenceMultiplier = 0.4;
  }

  // ── 3. Previous reviews → increase interval ──
  const reviewMultiplier = Math.max(1, 1 + reviewCount * 0.3);

  // ── 4. Difficulty adjustment ──
  let difficultyMultiplier = 1;
  if (difficulty === "hard") difficultyMultiplier = 0.6;
  else if (difficulty === "easy") difficultyMultiplier = 1.4;
  else if (difficulty === "medium") difficultyMultiplier = 1;

  // ── Compute final interval ──
  const interval = Math.max(
    1,
    Math.round(baseInterval * confidenceMultiplier * reviewMultiplier * difficultyMultiplier),
  );

  // ── Build reason ──
  const masteryText = mastery !== null && mastery !== undefined ? `mastery ${Math.round(mastery)}` : "";
  const confidenceText = confidence !== null && confidence !== undefined ? `confidence ${Math.round(confidence)}` : "";
  const reviewText = reviewCount > 0 ? `${reviewCount} previous review(s)` : "no previous reviews";
  const parts = [masteryText, confidenceText, reviewText].filter(Boolean);
  const reason = `Next review in ${interval} day(s) — ${parts.join(", ")}`;

  // ── Compute next review date ──
  const now = new Date();
  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + interval);
  const nextReviewAt = nextDate.toISOString();

  return {
    nextReviewAt,
    interval,
    reason,
  };
}