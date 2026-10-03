// /lib/exam/spacedReview.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getBaseInterval,
  calculateNextReview,
  isReviewDue,
  daysOverdue,
  calculateReviewUrgency,
  SPACED_REVIEW_CONFIG,
} from "./spacedReview.ts";
import type { SpacedReviewState } from "../../types/task.ts";

describe("spacedReview - base intervals", () => {
  it("base intervals per mastery", () => {
    assert.equal(getBaseInterval("Needs Review"), 2);
    assert.equal(getBaseInterval("Developing"), 4);
    assert.equal(getBaseInterval("Strong"), 7);
    assert.equal(getBaseInterval("Mastered"), 14);
  });
});

describe("spacedReview - interval adaptation", () => {
  it("successful review increases interval", () => {
    const cur: SpacedReviewState = {
      topicId: "a",
      nextReviewAt: "2026-09-05",
      intervalDays: 4,
      reviewCount: 0,
      retentionScore: 50,
    };
    const next = calculateNextReview(cur, { score: 80, correct: true, masteryLevel: "Developing" }, "2026-09-05T10:00:00.000Z");
    assert.ok(next.intervalDays > cur.intervalDays);
    assert.equal(next.reviewCount, 1);
    assert.equal(next.retentionScore, 80);
  });

  it("poor review decreases interval", () => {
    const cur: SpacedReviewState = {
      topicId: "a",
      nextReviewAt: "2026-09-05",
      intervalDays: 7,
      reviewCount: 2,
      retentionScore: 80,
    };
    const next = calculateNextReview(cur, { score: 30, correct: false, masteryLevel: "Needs Review" }, "2026-09-05T10:00:00.000Z");
    assert.ok(next.intervalDays < cur.intervalDays);
    assert.equal(next.intervalDays, Math.max(1, Math.round(7 * SPACED_REVIEW_CONFIG.POOR_FACTOR)));
  });

  it("repeated successful reviews gradually increase", () => {
    let cur: SpacedReviewState = {
      topicId: "a",
      nextReviewAt: "2026-09-05",
      intervalDays: 2,
      reviewCount: 0,
      retentionScore: 50,
    };
    const scores = [80, 85, 90];
    let prev = cur.intervalDays;
    for (const s of scores) {
      cur = calculateNextReview(cur, { score: s, correct: true, masteryLevel: "Strong" }, "2026-09-05T10:00:00.000Z");
      assert.ok(cur.intervalDays >= prev);
      prev = cur.intervalDays;
    }
    assert.ok(cur.intervalDays > 2);
  });

  it("caps at MAX and MIN", () => {
    const curMax: SpacedReviewState = {
      topicId: "a",
      nextReviewAt: "2026-09-05",
      intervalDays: 30,
      reviewCount: 5,
      retentionScore: 90,
    };
    const nextMax = calculateNextReview(curMax, { score: 95, correct: true, masteryLevel: "Mastered" }, "2026-09-05T10:00:00.000Z");
    assert.equal(nextMax.intervalDays, SPACED_REVIEW_CONFIG.MAX_INTERVAL);

    const curMin: SpacedReviewState = {
      topicId: "a",
      nextReviewAt: "2026-09-05",
      intervalDays: 1,
      reviewCount: 0,
      retentionScore: 30,
    };
    const nextMin = calculateNextReview(curMin, { score: 10, correct: false, masteryLevel: "Needs Review" }, "2026-09-05T10:00:00.000Z");
    assert.equal(nextMin.intervalDays, 1);
  });
});

describe("spacedReview - due and urgency", () => {
  it("isReviewDue and daysOverdue", () => {
    const r: SpacedReviewState = { topicId: "a", nextReviewAt: "2026-09-10", intervalDays: 4, reviewCount: 1, retentionScore: 70 };
    assert.equal(isReviewDue(r, "2026-09-10"), true);
    assert.equal(isReviewDue(r, "2026-09-09"), false);
    assert.equal(isReviewDue(r, "2026-09-12"), true);
    assert.equal(daysOverdue(r, "2026-09-12"), 2);
    assert.equal(daysOverdue(r, "2026-09-10"), 0);
  });

  it("overdue review gets prioritized (higher urgency)", () => {
    const overdue: SpacedReviewState = { topicId: "a", nextReviewAt: "2026-09-01", intervalDays: 4, reviewCount: 1, retentionScore: 50 };
    const upcoming: SpacedReviewState = { topicId: "a", nextReviewAt: "2026-09-20", intervalDays: 4, reviewCount: 1, retentionScore: 50 };
    const uOver = calculateReviewUrgency(overdue, undefined, undefined, "2026-09-10");
    const uUp = calculateReviewUrgency(upcoming, undefined, undefined, "2026-09-10");
    assert.ok(uOver > uUp);
    assert.ok(uOver >= 20);
  });

  it("low mastery and declining increase urgency", () => {
    const r: SpacedReviewState = { topicId: "a", nextReviewAt: "2026-09-10", intervalDays: 4, reviewCount: 1, retentionScore: 50 };
    const lowMastery = { masteryLevel: "Needs Review", masteryScore: 20, trend: "declining", consecutiveMistakes: 3 } as any;
    const highMastery = { masteryLevel: "Mastered", masteryScore: 95, trend: "improving", consecutiveMistakes: 0 } as any;
    const uLow = calculateReviewUrgency(r, lowMastery, undefined, "2026-09-10");
    const uHigh = calculateReviewUrgency(r, highMastery, undefined, "2026-09-10");
    assert.ok(uLow > uHigh);
  });
});
