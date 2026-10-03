// /lib/exam/diagnostic.ts
// Deterministic evaluation + mastery classification for the Exam Diagnostic.
//
// Phase 2 rule: the correct answer is always present in the structured
// DiagnosticQuestion data, so correctness is computed programmatically — never
// by the AI — and the score/topic numbers are stable across refreshes.

import type {
  DiagnosticResult,
  DiagnosticTopicPerformance,
  ExamTopic,
  TopicMasteryLevel,
} from "../../types/task.ts";
import type { Question, QuestionAnswer } from "../../types/question.ts";
import { evaluateQuestion } from "../questions/evaluate.ts";

// Mastery classification (Phase 2 → Phase 5, deterministic and explainable):
//   90-100%  -> Mastered
//   70-89%   -> Strong
//   40-69%   -> Developing
//   0-39%    -> Needs Review
// Updated in Phase 5 to 4 levels (previously 3); existing 3-level data remains valid.
export function masteryForAccuracy(accuracy: number): TopicMasteryLevel {
  if (accuracy >= 90) return "Mastered";
  if (accuracy >= 70) return "Strong";
  if (accuracy >= 40) return "Developing";
  return "Needs Review";
}

export const TOPIC_STATUS_BY_MASTERY: Record<TopicMasteryLevel, ExamTopic["status"]> = {
  Mastered: "mastered",
  Strong: "strong",
  Developing: "developing",
  "Needs Review": "needs_work",
};

const MASTERY_RANK: Record<TopicMasteryLevel, number> = {
  Mastered: 0,
  Strong: 1,
  Developing: 2,
  "Needs Review": 3,
};

export interface ScoredDiagnostic {
  perQuestion: Map<
    string,
    { topicId: string; topic: string; isCorrect: boolean }
  >;
  overallScore: number;
  correctCount: number;
  totalQuestions: number;
  topicPerformance: DiagnosticTopicPerformance[];
  recommendedFocus: string;
}

export function scoreDiagnostic(
  questions: Question[],
  answers: Record<string, QuestionAnswer>,
): ScoredDiagnostic {
  const perQuestion = new Map<
    string,
    { topicId: string; topic: string; isCorrect: boolean }
  >();

  for (const q of questions) {
    const isCorrect = evaluateQuestion(q, answers?.[q.id]).correct;
    perQuestion.set(q.id, {
      topicId: q.topicId ?? "",
      topic: q.topic ?? "",
      isCorrect,
    });
  }

  const correctCount = [...perQuestion.values()].filter((r) => r.isCorrect)
    .length;
  const totalQuestions = questions.length;
  const overallScore = totalQuestions > 0
    ? Math.round((correctCount / totalQuestions) * 100)
    : 0;

  // Aggregate per topic, preserving original topic order wherever possible.
  const topicOrder = Array.from(
    new Set(questions.map((q) => q.topicId ?? "")),
  );
  const topicMap = new Map<
    string,
    { topic: string; attempted: number; correct: number; topics: ExamTopic[] }
  >();
  for (const q of questions) {
    const key = q.topicId ?? q.topic ?? "";
    const topicLabel = q.topic ?? key;
    if (!topicMap.has(key)) {
      topicMap.set(key, { topic: topicLabel, attempted: 0, correct: 0, topics: [] });
    }
    const entry = topicMap.get(key)!;
    entry.topic = topicLabel;
    entry.attempted += 1;
    if (perQuestion.get(q.id)?.isCorrect) entry.correct += 1;
  }

  const topicPerformance: DiagnosticTopicPerformance[] = topicOrder
    .map((topicId) => {
      const entry = topicMap.get(topicId);
      if (!entry) return null;
      const accuracy =
        entry.attempted > 0
          ? Math.round((entry.correct / entry.attempted) * 100)
          : 0;
      const mastery = masteryForAccuracy(accuracy);
      return {
        topicId,
        topic: entry.topic || topicId,
        attempted: entry.attempted,
        correct: entry.correct,
        accuracy,
        mastery,
        explanation: explanationForMastery(mastery, entry.topic || topicId),
        recommendedAction:
          recommendedActionFor(mastery, entry.topic || topicId),
      };
    })
    .filter((p): p is DiagnosticTopicPerformance => p !== null);

  const recommendedFocus = weakestTopic(topicPerformance);

  return {
    perQuestion,
    overallScore,
    correctCount,
    totalQuestions,
    topicPerformance,
    recommendedFocus,
  };
}

function explanationForMastery(
  mastery: TopicMasteryLevel,
  topic: string,
): string {
  switch (mastery) {
    case "Mastered":
      return `Excellent — you have mastered ${topic}. Keep it fresh with occasional review.`;
    case "Strong":
      return `You answered most questions about ${topic} correctly. Your understanding looks solid.`;
    case "Developing":
      return `You know part of ${topic}, but some important ideas need reinforcement.`;
    case "Needs Review":
      return `Several questions about ${topic} were missed. This area needs the most review.`;
  }
}

function recommendedActionFor(
  mastery: TopicMasteryLevel,
  topic: string,
): string {
  switch (mastery) {
    case "Mastered":
      return `Maintain your mastery of ${topic} with light mixed practice.`;
    case "Strong":
      return `Keep ${topic} fresh with light review before the exam.`;
    case "Developing":
      return `Review the core ideas of ${topic} and practise the concepts you missed.`;
    case "Needs Review":
      return `Start by re-learning the fundamentals of ${topic} before moving into advanced practice.`;
  }
}

// Pick the single weakest topic for the "Recommended Focus" recommendation.
// The ascending sort puts the strongest topic first, so the weakest is last.
// Ties are broken by highest mastery rank, then lowest accuracy, then fewer
// correct answers.
export function weakestTopic(
  topicPerformance: DiagnosticTopicPerformance[],
): string {
  if (topicPerformance.length === 0) return "";
  const sorted = [...topicPerformance].sort((a, b) => {
    if (MASTERY_RANK[a.mastery] !== MASTERY_RANK[b.mastery]) {
      return MASTERY_RANK[a.mastery] - MASTERY_RANK[b.mastery];
    }
    if (a.accuracy !== b.accuracy) return b.accuracy - a.accuracy;
    return b.correct - a.correct;
  });
  return sorted[sorted.length - 1].topic;
}

export function buildDiagnosticResult(
  questions: Question[],
  answers: Record<string, QuestionAnswer>,
  completedAt: string,
): DiagnosticResult {
  const scored = scoreDiagnostic(questions, answers);
  return {
    overallScore: scored.overallScore,
    correctCount: scored.correctCount,
    totalQuestions: scored.totalQuestions,
    topicPerformance: scored.topicPerformance,
    recommendedFocus: scored.recommendedFocus,
    completedAt,
  };
}
