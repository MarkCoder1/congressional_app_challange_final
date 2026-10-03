// /lib/adaptive/fixtures.ts
// Deterministic fixtures for unit tests and dev harness.
// Each helper builds an AdaptiveState for a specific scenario.

import type { ExamTopic } from "@/types/task";
import { createInitialAdaptiveState, recordAttempt } from "./engine";
import type { AdaptiveState } from "@/types/task";

const TOPICS: ExamTopic[] = [
  { id: "t-a", name: "Quadratic Equations" },
  { id: "t-b", name: "Linear Functions" },
  { id: "t-c", name: "Geometry" },
];

function seedState(attemptsByTopic: Record<string, { correct: number; total: number }>): AdaptiveState {
  const perf = Object.entries(attemptsByTopic).map(([topicId, v]) => {
    const topic = TOPICS.find((t) => t.id === topicId)?.name ?? topicId;
    const accuracy = v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0;
    return { topicId, topic, accuracy, attempted: v.total, correct: v.correct };
  });
  return createInitialAdaptiveState(TOPICS, perf);
}

export function weakTopicFixture(): AdaptiveState {
  // Topic A 20% (1/5), Topic B 90% (9/10)
  return seedState({ "t-a": { correct: 1, total: 5 }, "t-b": { correct: 9, total: 10 }, "t-c": { correct: 5, total: 10 } });
}

export function strongTopicFixture(): AdaptiveState {
  // All strong, one weaker
  return seedState({ "t-a": { correct: 9, total: 10 }, "t-b": { correct: 9, total: 10 }, "t-c": { correct: 10, total: 10 } });
}

export function improvingFixture(): AdaptiveState {
  let s = createInitialAdaptiveState(TOPICS);
  // Use recordAttempt to build history with increasing correctness
  const seq = [false, false, true, false, true, true, true, true]; // 5/8 ~62% but recent 4/4=100%
  for (let i = 0; i < seq.length; i++) {
    s = recordAttempt(s, {
      topicId: "t-a",
      topic: "Quadratic Equations",
      questionId: `q-a-${i}`,
      questionType: "multiple-choice",
      correct: seq[i],
      score: seq[i] ? 100 : 0,
    });
  }
  return s;
}

export function decliningFixture(): AdaptiveState {
  let s = createInitialAdaptiveState(TOPICS);
  // Declining: start strong then drop
  const seq = [true, true, true, true, false, false, true, false, false]; // recent mostly false
  for (let i = 0; i < seq.length; i++) {
    s = recordAttempt(s, {
      topicId: "t-a",
      topic: "Quadratic Equations",
      questionId: `q-a-${i}`,
      questionType: "multiple-choice",
      correct: seq[i],
      score: seq[i] ? 100 : 0,
    });
  }
  return s;
}

export function repeatedMistakesFixture(): AdaptiveState {
  let s = seedState({ "t-a": { correct: 3, total: 5 }, "t-b": { correct: 8, total: 10 } });
  // Add 3 consecutive mistakes on t-a
  for (let i = 0; i < 3; i++) {
    s = recordAttempt(s, {
      topicId: "t-a",
      topic: "Quadratic Equations",
      questionId: `q-mistake-${i}`,
      questionType: "multiple-choice",
      correct: false,
      score: 0,
    });
  }
  return s;
}

export function mixedPerformanceFixture(): AdaptiveState {
  let s = createInitialAdaptiveState(TOPICS);
  // Mixed: t-a 50%, t-b 75%, t-c 30%
  const data: Record<string, boolean[]> = {
    "t-a": [true, false, true, false],
    "t-b": [true, true, false, true],
    "t-c": [false, false, true, false],
  };
  for (const [tid, seq] of Object.entries(data)) {
    const topicName = TOPICS.find((t) => t.id === tid)?.name ?? tid;
    seq.forEach((correct, i) => {
      s = recordAttempt(s, {
        topicId: tid,
        topic: topicName,
        questionId: `q-${tid}-${i}`,
        questionType: "multiple-choice",
        correct,
        score: correct ? 100 : 0,
      });
    });
  }
  return s;
}

export function allTopics(): ExamTopic[] {
  return TOPICS;
}
