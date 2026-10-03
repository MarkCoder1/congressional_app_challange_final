// /lib/adaptive/engine.test.ts
// Deterministic unit tests for the adaptive learning engine.
// Run: node --test lib/adaptive/engine.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type { Question } from "@/types/question";
import {
  calculateMasteryScore,
  masteryLevelForScore,
  calculateTrend,
  calculatePriority,
  getNextLearningAction,
  selectNextQuestion,
  adaptDifficulty,
  createInitialAdaptiveState,
  recordAttempt,
  rankTopicsByPriority,
} from "./engine.ts";
import type { AdaptiveTopicState } from "@/types/task";

describe("mastery", () => {
  it("masteryLevelForScore thresholds", () => {
    assert.equal(masteryLevelForScore(0), "Needs Review");
    assert.equal(masteryLevelForScore(39), "Needs Review");
    assert.equal(masteryLevelForScore(40), "Developing");
    assert.equal(masteryLevelForScore(69), "Developing");
    assert.equal(masteryLevelForScore(70), "Strong");
    assert.equal(masteryLevelForScore(89), "Strong");
    assert.equal(masteryLevelForScore(90), "Mastered");
    assert.equal(masteryLevelForScore(100), "Mastered");
  });

  it("calculateMasteryScore: no attempts → 0", () => {
    assert.equal(calculateMasteryScore(0, 0, []), 0);
  });

  it("calculateMasteryScore: accuracy only when <3 attempts", () => {
    // 2 attempts, 1 correct = 50% accuracy, recent [100,0] should not weight heavily
    assert.equal(calculateMasteryScore(2, 1, [100, 0]), 50);
    assert.equal(calculateMasteryScore(1, 0, [0]), 0);
    assert.equal(calculateMasteryScore(1, 1, [100]), 100);
  });

  it("calculateMasteryScore: weighted with recent", () => {
    // 10 attempts, 5 correct = 50% accuracy, recent 4x100 => recentAvg 100, weighted 0.6*50+0.4*100=70
    const score = calculateMasteryScore(10, 5, [100, 100, 100, 100]);
    assert.equal(score, 70);
    // 10 attempts, 9 correct=90%, recent 0,0,0,0 => 0.6*90+0.4*0=54
    const score2 = calculateMasteryScore(10, 9, [0, 0, 0, 0]);
    assert.equal(score2, 54);
  });
});

describe("trend", () => {
  it("improving: 40→55→70→80", () => {
    // Represent as scores 0/100? Use numeric mastery-like scores.
    // Our calculateTrend expects scores 0-100; use directly.
    assert.equal(calculateTrend([40, 55, 70, 80]), "improving");
    assert.equal(calculateTrend([50, 60, 75, 80]), "improving");
  });

  it("declining: 90→80→60→45", () => {
    assert.equal(calculateTrend([90, 80, 60, 45]), "declining");
  });

  it("stable: flat", () => {
    assert.equal(calculateTrend([70, 72, 71, 70]), "stable");
    assert.equal(calculateTrend([60, 60, 60]), "stable");
  });

  it("insufficient data → stable", () => {
    assert.equal(calculateTrend([]), "stable");
    assert.equal(calculateTrend([100]), "stable");
    assert.equal(calculateTrend([50, 60]), "stable");
  });
});

describe("priority", () => {
  it("weak topic gets higher priority than strong", () => {
    const weak: AdaptiveTopicState = {
      topicId: "a",
      topic: "Quadratic",
      attempts: 5,
      correct: 1,
      accuracy: 20,
      masteryScore: 20,
      masteryLevel: "Needs Review",
      recentScores: [0, 0, 0, 100, 0],
      trend: "stable",
      priority: "medium",
      priorityScore: 0,
      reason: "",
      recommendedAction: "",
      nextAction: "review_concept",
      consecutiveMistakes: 1,
      explanation: "",
    };
    const strong: AdaptiveTopicState = {
      topicId: "b",
      topic: "Linear",
      attempts: 10,
      correct: 9,
      accuracy: 90,
      masteryScore: 90,
      masteryLevel: "Mastered",
      recentScores: [100, 100, 100, 100],
      trend: "stable",
      priority: "medium",
      priorityScore: 0,
      reason: "",
      recommendedAction: "",
      nextAction: "mastery_check",
      consecutiveMistakes: 0,
      explanation: "",
    };
    const pw = calculatePriority(weak);
    const ps = calculatePriority(strong);
    assert.equal(pw.priority, "high");
    assert.equal(ps.priority, "low");
    assert.ok(pw.priorityScore > ps.priorityScore);
  });

  it("repeated mistakes increases priority", () => {
    const base: AdaptiveTopicState = {
      topicId: "a",
      topic: "T",
      attempts: 5,
      correct: 3,
      accuracy: 60,
      masteryScore: 60,
      masteryLevel: "Developing",
      recentScores: [100, 0, 100, 0, 0],
      trend: "stable",
      priority: "medium",
      priorityScore: 0,
      reason: "",
      recommendedAction: "",
      nextAction: "practice_weak",
      consecutiveMistakes: 0,
      explanation: "",
    };
    const withStreak = { ...base, consecutiveMistakes: 3 };
    const pBase = calculatePriority(base);
    const pStreak = calculatePriority(withStreak);
    assert.ok(pStreak.priorityScore > pBase.priorityScore);
  });

  it("declining trend increases priority vs improving decreases", () => {
    const base: AdaptiveTopicState = {
      topicId: "a",
      topic: "T",
      attempts: 6,
      correct: 3,
      accuracy: 50,
      masteryScore: 50,
      masteryLevel: "Developing",
      recentScores: [100, 100, 0, 0],
      trend: "stable",
      priority: "medium",
      priorityScore: 0,
      reason: "",
      recommendedAction: "",
      nextAction: "practice_weak",
      consecutiveMistakes: 0,
      explanation: "",
    };
    const declining = calculatePriority({ ...base, trend: "declining" });
    const improving = calculatePriority({ ...base, trend: "improving" });
    const stable = calculatePriority({ ...base, trend: "stable" });
    assert.ok(declining.priorityScore > stable.priorityScore);
    assert.ok(stable.priorityScore > improving.priorityScore);
  });

  it("never attempted gets high priority", () => {
    const never: AdaptiveTopicState = {
      topicId: "x",
      topic: "Never",
      attempts: 0,
      correct: 0,
      accuracy: 0,
      masteryScore: 0,
      masteryLevel: "Needs Review",
      recentScores: [],
      trend: "stable",
      priority: "medium",
      priorityScore: 0,
      reason: "",
      recommendedAction: "",
      nextAction: "review_concept",
      consecutiveMistakes: 0,
      explanation: "",
    };
    const p = calculatePriority(never);
    assert.equal(p.priority, "high");
    assert.match(p.reason, /never attempted/);
  });
});

describe("next action", () => {
  it("weak → review_concept / practice_weak", () => {
    const state = createInitialAdaptiveState(
      [
        { id: "a", name: "Quadratic" },
        { id: "b", name: "Linear" },
      ],
      [
        { topicId: "a", topic: "Quadratic", accuracy: 20, attempted: 5, correct: 1 },
        { topicId: "b", topic: "Linear", accuracy: 90, attempted: 10, correct: 9 },
      ],
    );
    const action = getNextLearningAction(state);
    assert.ok(["review_concept", "practice_weak"].includes(action.action));
    assert.equal(action.topicId, "a");
  });

  it("strong → mixed or maintenance", () => {
    const state = createInitialAdaptiveState(
      [
        { id: "a", name: "Quadratic" },
        { id: "b", name: "Linear" },
      ],
      [
        { topicId: "a", topic: "Quadratic", accuracy: 95, attempted: 10, correct: 10 },
        { topicId: "b", topic: "Linear", accuracy: 92, attempted: 10, correct: 9 },
      ],
    );
    const action = getNextLearningAction(state);
    // All mastered/strong → should be mixed or mastery_check
    assert.ok(["practice_mixed", "mastery_check", "reinforce_strong"].includes(action.action));
  });

  it("no data → retake diagnostic", () => {
    const state = createInitialAdaptiveState([]);
    const action = getNextLearningAction(state, undefined, [{ id: "a", name: "T" }]);
    assert.equal(action.action, "retake_diagnostic");
  });
});

describe("question selection", () => {
  it("selects lowest mastery topic", () => {
    const topics = [
      { id: "a", name: "Quadratic" },
      { id: "b", name: "Linear" },
    ];
    const state = createInitialAdaptiveState(topics, [
      { topicId: "a", topic: "Quadratic", accuracy: 20, attempted: 5, correct: 1 },
      { topicId: "b", topic: "Linear", accuracy: 90, attempted: 10, correct: 9 },
    ]);
    const questions = [
      { id: "q1", type: "multiple-choice", topicId: "a", topic: "Quadratic", prompt: "q1", options: [{ id: "x", text: "x" }], correctAnswer: "x" } as unknown as Question,
      { id: "q2", type: "multiple-choice", topicId: "b", topic: "Linear", prompt: "q2", options: [{ id: "x", text: "x" }], correctAnswer: "x" } as unknown as Question,
    ];
    const res = selectNextQuestion({ topics, questions, state });
    assert.equal(res.topicId, "a");
    assert.equal(res.question?.id, "q1");
    assert.match(res.reason, /Quadratic|priority/i);
  });

  it("deterministic selection from pool", () => {
    const topics = [{ id: "a", name: "T" }];
    const state = createInitialAdaptiveState(topics, [{ topicId: "a", topic: "T", accuracy: 50, attempted: 2, correct: 1 }]);
    const questions = [
      { id: "q2", type: "multiple-choice", topicId: "a", topic: "T", prompt: "2", options: [{ id: "x", text: "x" }], correctAnswer: "x" } as unknown as Question,
      { id: "q1", type: "multiple-choice", topicId: "a", topic: "T", prompt: "1", options: [{ id: "x", text: "x" }], correctAnswer: "x" } as unknown as Question,
    ];
    const a = selectNextQuestion({ topics, questions, state });
    const b = selectNextQuestion({ topics, questions, state });
    assert.equal(a.question?.id, b.question?.id);
    // Should be sorted by id, so q1 first
    assert.equal(a.question?.id, "q1");
  });

  it("empty pool → null question with reason", () => {
    const topics = [{ id: "a", name: "T" }];
    const state = createInitialAdaptiveState(topics);
    const res = selectNextQuestion({ topics, questions: [], state });
    assert.equal(res.question, null);
    assert.ok(res.reason.length > 0);
  });
});

describe("difficulty adaptation", () => {
  it("strong → increase", () => {
    assert.equal(adaptDifficulty("easy", [100, 100, 100], 3), "medium");
    assert.equal(adaptDifficulty("medium", [90, 85, 95], 5), "hard");
    assert.equal(adaptDifficulty("hard", [100, 100, 100], 3), "hard"); // capped
  });

  it("weak → decrease", () => {
    assert.equal(adaptDifficulty("hard", [0, 20, 10], 3), "medium");
    assert.equal(adaptDifficulty("medium", [0, 0, 30], 3), "easy");
    assert.equal(adaptDifficulty("easy", [0, 0, 0], 3), "easy"); // floor
  });

  it("developing → maintain", () => {
    assert.equal(adaptDifficulty("medium", [60, 70, 65], 3), "medium");
    assert.equal(adaptDifficulty("easy", [50, 60], 2), "easy");
  });

  it("insufficient attempts → maintain", () => {
    assert.equal(adaptDifficulty("medium", [100], 1), "medium");
    assert.equal(adaptDifficulty(undefined, [], 0), "medium");
  });
});

describe("persistence via recordAttempt", () => {
  it("recordAttempt updates mastery and history", () => {
    let s = createInitialAdaptiveState([{ id: "a", name: "T" }]);
    assert.equal(s.topics["a"].attempts, 0);
    s = recordAttempt(s, {
      topicId: "a",
      topic: "T",
      questionId: "q1",
      questionType: "multiple-choice",
      correct: true,
      score: 100,
    });
    assert.equal(s.topics["a"].attempts, 1);
    assert.equal(s.topics["a"].correct, 1);
    assert.equal(s.history.length, 1);
    assert.equal(s.history[0].correct, true);

    s = recordAttempt(s, {
      topicId: "a",
      topic: "T",
      questionId: "q2",
      questionType: "multiple-choice",
      correct: false,
      score: 0,
    });
    assert.equal(s.topics["a"].attempts, 2);
    assert.equal(s.topics["a"].accuracy, 50);
    assert.equal(s.history.length, 2);
  });

  it("ranking respects priority", () => {
    const s = createInitialAdaptiveState(
      [
        { id: "a", name: "Quadratic" },
        { id: "b", name: "Linear" },
      ],
      [
        { topicId: "a", topic: "Quadratic", accuracy: 20, attempted: 5, correct: 1 },
        { topicId: "b", topic: "Linear", accuracy: 90, attempted: 10, correct: 9 },
      ],
    );
    const ranked = rankTopicsByPriority(s);
    assert.equal(ranked[0].topicId, "a");
    assert.equal(ranked[1].topicId, "b");
  });
});
