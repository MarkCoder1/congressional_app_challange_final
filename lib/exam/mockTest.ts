// /lib/exam/mockTest.ts
// Deterministic mock test scoring, reusing diagnostic evaluation logic.

import type { MockTestResult, DiagnosticTopicPerformance } from "../../types/task.ts";
import type { Question, QuestionAnswer } from "../../types/question.ts";
import { evaluateQuestion } from "../questions/evaluate.ts";
import { masteryForAccuracy } from "./diagnostic.ts";

export interface ScoredMockTest {
  overallScore: number;
  correctCount: number;
  totalQuestions: number;
  topicPerformance: DiagnosticTopicPerformance[];
  strengths: string[];
  weaknesses: string[];
}

export function scoreMockTest(
  questions: Question[],
  answers: Record<string, QuestionAnswer>,
): ScoredMockTest {
  const perQuestion = new Map<string, { topicId: string; topic: string; correct: boolean; score: number }>();
  for (const q of questions) {
    const ev = evaluateQuestion(q, answers[q.id]);
    perQuestion.set(q.id, {
      topicId: q.topicId ?? q.topic ?? "",
      topic: q.topic ?? q.topicId ?? "General",
      correct: ev.correct,
      score: ev.score,
    });
  }

  const correctCount = [...perQuestion.values()].filter((v) => v.correct).length;
  const totalQuestions = questions.length;
  const overallScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Aggregate per topic
  const topicOrder = Array.from(new Set(questions.map((q) => q.topicId ?? q.topic ?? "")));
  const topicMap = new Map<string, { topic: string; attempted: number; correct: number }>();
  for (const q of questions) {
    const key = q.topicId ?? q.topic ?? "";
    const label = q.topic ?? key;
    if (!topicMap.has(key)) topicMap.set(key, { topic: label, attempted: 0, correct: 0 });
    const e = topicMap.get(key)!;
    e.topic = label;
    e.attempted += 1;
    if (perQuestion.get(q.id)?.correct) e.correct += 1;
  }

  const topicPerformance: DiagnosticTopicPerformance[] = topicOrder
    .map((tid) => {
      const e = topicMap.get(tid);
      if (!e) return null;
      const accuracy = e.attempted > 0 ? Math.round((e.correct / e.attempted) * 100) : 0;
      const mastery = masteryForAccuracy(accuracy);
      return {
        topicId: tid,
        topic: e.topic,
        attempted: e.attempted,
        correct: e.correct,
        accuracy,
        mastery,
        explanation:
          mastery === "Mastered"
            ? `Excellent mastery of ${e.topic}.`
            : mastery === "Strong"
              ? `Strong understanding of ${e.topic}.`
              : mastery === "Developing"
                ? `Developing understanding of ${e.topic}.`
                : `Needs review for ${e.topic}.`,
        recommendedAction:
          mastery === "Mastered"
            ? `Maintain ${e.topic} with light review.`
            : mastery === "Strong"
              ? `Light review for ${e.topic}.`
              : `Focus practice on ${e.topic}.`,
      };
    })
    .filter((p): p is DiagnosticTopicPerformance => p !== null);

  const strengths = topicPerformance
    .filter((p) => p.mastery === "Mastered" || p.mastery === "Strong")
    .sort((a, b) => b.accuracy - a.accuracy)
    .map((p) => p.topic);

  const weaknesses = topicPerformance
    .filter((p) => p.mastery === "Needs Review" || p.mastery === "Developing")
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((p) => p.topic);

  return {
    overallScore,
    correctCount,
    totalQuestions,
    topicPerformance,
    strengths,
    weaknesses,
  };
}

export function buildMockTestResult(
  questions: Question[],
  answers: Record<string, QuestionAnswer>,
  completedAt: string,
): MockTestResult {
  const scored = scoreMockTest(questions, answers);
  return {
    overallScore: scored.overallScore,
    correctCount: scored.correctCount,
    totalQuestions: scored.totalQuestions,
    topicPerformance: scored.topicPerformance,
    strengths: scored.strengths,
    weaknesses: scored.weaknesses,
    completedAt,
  };
}
