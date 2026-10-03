// /lib/questions/evaluate.ts
//
// Deterministic question evaluator. Given a structured Question and a student
// answer, it computes correctness programmatically — never via the AI. This is
// the single evaluation entry point for every question type and is reused by
// the Diagnostic (and future Practice / Review / Mock Exam / Master).

import type {
  Question,
  QuestionAnswer,
} from "@/types/question";
import {
  matchesAcceptedAnswer,
  parseNumeric,
} from "./normalize.ts";

export type EvaluationStatus = "correct" | "incorrect" | "partial";

export interface EvaluationResult {
  correct: boolean;
  score: number; // 0-100
  status: EvaluationStatus;
  feedback?: string;
}

function isCorrectAnswer(a: QuestionAnswer | undefined): boolean {
  return a !== undefined && a !== null && !(Array.isArray(a) && a.length === 0);
}

function fromScore(score: number, feedback?: string): EvaluationResult {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const status: EvaluationStatus =
    clamped >= 100 ? "correct" : clamped <= 0 ? "incorrect" : "partial";
  return { correct: status === "correct", score: clamped, status, feedback };
}

// ---- per-type scorers (each returns 0-100) ----

function scoreMultipleChoice(
  q: Extract<Question, { type: "multiple-choice" | "true-false" }>,
  answer: QuestionAnswer | undefined,
): number {
  return answer === q.correctAnswer ? 100 : 0;
}

function scoreMultiSelect(
  q: Extract<Question, { type: "multi-select" }>,
  answer: QuestionAnswer | undefined,
): number {
  if (!Array.isArray(answer) || answer.length === 0) return 0;
  const correctSet = new Set(q.correctAnswers);
  let correctSelected = 0;
  let wrongSelected = 0;
  for (const id of answer) {
    if (correctSet.has(id)) correctSelected += 1;
    else wrongSelected += 1;
  }
  // Perfect selection: every correct answer chosen, no extras.
  const allCorrect =
    correctSet.size === answer.length && wrongSelected === 0;
  if (allCorrect) return 100;
  const score =
    ((correctSelected - wrongSelected) / correctSet.size) * 100;
  return score;
}

function scoreShortAnswer(
  q: Extract<Question, { type: "short-answer" }>,
  answer: QuestionAnswer | undefined,
): number {
  if (typeof answer !== "string" || !answer.trim()) return 0;
  return matchesAcceptedAnswer(answer, q.acceptedAnswers, q.caseSensitive)
    ? 100
    : 0;
}

function scoreFillBlank(
  q: Extract<Question, { type: "fill-blank" }>,
  answer: QuestionAnswer | undefined,
): number {
  if (typeof answer !== "string" || !answer.trim()) return 0;
  return matchesAcceptedAnswer(answer, q.acceptedAnswers, q.caseSensitive)
    ? 100
    : 0;
}

function scoreNumeric(
  q: Extract<Question, { type: "numeric" }>,
  answer: QuestionAnswer | undefined,
): number {
  const value = typeof answer === "number" ? answer : parseNumeric(String(answer ?? ""));
  if (!Number.isFinite(value)) return 0;
  const tolerance = typeof q.tolerance === "number" ? q.tolerance : 0;
  return Math.abs(value - q.correctAnswer) <= tolerance ? 100 : 0;
}

function scoreMatching(
  q: Extract<Question, { type: "matching" }>,
  answer: QuestionAnswer | undefined,
): number {
  const map = isRecord(answer) ? answer : {};
  const total = q.correctPairs.length;
  if (total === 0) return 100;
  let matched = 0;
  for (const pair of q.correctPairs) {
    if (map[pair.leftId] === pair.rightId) matched += 1;
  }
  return (matched / total) * 100;
}

function scoreOrdering(
  q: Extract<Question, { type: "ordering" }>,
  answer: QuestionAnswer | undefined,
): number {
  const order = Array.isArray(answer) ? answer : [];
  const total = q.correctOrder.length;
  if (total === 0) return 100;
  // Exact match => perfect. Otherwise partial credit for items in position.
  if (order.length === total && order.every((v, i) => v === q.correctOrder[i])) {
    return 100;
  }
  let inPosition = 0;
  for (let i = 0; i < total; i += 1) {
    if (order[i] === q.correctOrder[i]) inPosition += 1;
  }
  return (inPosition / total) * 100;
}

function scoreCategorization(
  q: Extract<Question, { type: "categorization" }>,
  answer: QuestionAnswer | undefined,
): number {
  return scorePlacements(Object.keys(q.correctCategories), q.correctCategories, answer);
}

function scoreDragDrop(
  q: Extract<Question, { type: "drag-drop" }>,
  answer: QuestionAnswer | undefined,
): number {
  return scorePlacements(Object.keys(q.correctPlacements), q.correctPlacements, answer);
}

function scoreDiagramLabel(
  q: Extract<Question, { type: "diagram-label" }>,
  answer: QuestionAnswer | undefined,
): number {
  return scorePlacements(Object.keys(q.correctPlacements), q.correctPlacements, answer);
}

function scoreGraph(
  q: Extract<Question, { type: "graph" }>,
  answer: QuestionAnswer | undefined,
): number {
  if (q.interaction === "numeric") {
    const value = typeof answer === "number" ? answer : parseNumeric(String(answer ?? ""));
    if (!Number.isFinite(value)) return 0;
    const correct = typeof q.correctValue === "number" ? q.correctValue : NaN;
    if (!Number.isFinite(correct)) return 0;
    const tolerance = typeof q.tolerance === "number" ? q.tolerance : 0;
    return Math.abs(value - correct) <= tolerance ? 100 : 0;
  }
  if (typeof answer !== "string" || !answer.trim()) return 0;
  return answer === q.correctAnswer ? 100 : 0;
}

function scoreTimeline(
  q: Extract<Question, { type: "timeline" }>,
  answer: QuestionAnswer | undefined,
): number {
  const order = Array.isArray(answer) ? answer : [];
  const total = q.correctOrder.length;
  if (total === 0) return 100;
  if (order.length === total && order.every((v, i) => v === q.correctOrder[i])) return 100;
  let inPosition = 0;
  for (let i = 0; i < total; i += 1) {
    if (order[i] === q.correctOrder[i]) inPosition += 1;
  }
  return (inPosition / total) * 100;
}

function scoreFlowchart(
  q: Extract<Question, { type: "flowchart" }>,
  answer: QuestionAnswer | undefined,
): number {
  const order = Array.isArray(answer) ? answer : [];
  const total = q.correctOrder.length;
  if (total === 0) return 100;
  if (order.length === total && order.every((v, i) => v === q.correctOrder[i])) return 100;
  let inPosition = 0;
  for (let i = 0; i < total; i += 1) {
    if (order[i] === q.correctOrder[i]) inPosition += 1;
  }
  return (inPosition / total) * 100;
}

function scoreScenario(
  q: Extract<Question, { type: "scenario" }>,
  answer: QuestionAnswer | undefined,
): number {
  if (typeof answer !== "string" || !answer.trim()) return 0;
  return answer === q.correctAnswer ? 100 : 0;
}

function scoreErrorDetection(
  q: Extract<Question, { type: "error-detection" }>,
  answer: QuestionAnswer | undefined,
): number {
  if (typeof answer !== "string" || !answer.trim()) return 0;
  return answer === q.errorStepId ? 100 : 0;
}

function scorePlacements(
  keys: string[],
  correct: Record<string, string>,
  answer: QuestionAnswer | undefined,
): number {
  const map = isRecord(answer) ? answer : {};
  const total = keys.length;
  if (total === 0) return 100;
  let correctCount = 0;
  for (const key of keys) {
    if (map[key] === correct[key]) correctCount += 1;
  }
  return (correctCount / total) * 100;
}

function isRecord(v: unknown): v is Record<string, string> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

export function scoreQuestion(question: Question, answer: QuestionAnswer | undefined): number {
  switch (question.type) {
    case "multiple-choice":
    case "true-false":
      return scoreMultipleChoice(question, answer);
    case "multi-select":
      return scoreMultiSelect(question, answer);
    case "short-answer":
      return scoreShortAnswer(question, answer);
    case "fill-blank":
      return scoreFillBlank(question, answer);
    case "numeric":
      return scoreNumeric(question, answer);
    case "matching":
      return scoreMatching(question, answer);
    case "ordering":
      return scoreOrdering(question, answer);
    case "categorization":
      return scoreCategorization(question, answer);
    case "drag-drop":
      return scoreDragDrop(question, answer);
    case "diagram-label":
      return scoreDiagramLabel(question, answer);
    case "graph":
      return scoreGraph(question, answer);
    case "timeline":
      return scoreTimeline(question, answer);
    case "flowchart":
      return scoreFlowchart(question, answer);
    case "scenario":
      return scoreScenario(question, answer);
    case "error-detection":
      return scoreErrorDetection(question, answer);
    default:
      return 0;
  }
}

/**
 * Evaluate a structured question against a student answer. Returns a
 * deterministic correctness/score/status with an optional short feedback for
 * partial (non-AI) results. Does NOT use an LLM.
 */
export function evaluateQuestion(
  question: Question,
  answer: QuestionAnswer | undefined,
): EvaluationResult {
  if (!isCorrectAnswer(answer)) return fromScore(0);

  const base = fromScore(scoreQuestion(question, answer));

  // Only attach concise, deterministic feedback for partial results.
  if (base.status === "partial") {
    switch (question.type) {
      case "multi-select":
        base.feedback = "Some correct selections — check which options were also required.";
        break;
      case "matching": {
        const map = isRecord(answer) ? answer : {};
        const matched = question.correctPairs.filter(
          (p) => map[p.leftId] === p.rightId,
        ).length;
        base.feedback = `${matched} of ${question.correctPairs.length} matched correctly.`;
        break;
      }
      case "ordering": {
        const order = Array.isArray(answer) ? answer : [];
        const correctOrder = question.correctOrder;
        const inPosition = question.correctOrder.filter(
          (_, i) => order[i] === correctOrder[i],
        ).length;
        base.feedback = `${inPosition} of ${correctOrder.length} items are in the correct position.`;
        break;
      }
      case "categorization": {
        const map = isRecord(answer) ? answer : {};
        const correctCount = Object.keys(question.correctCategories).filter(
          (k) => map[k] === question.correctCategories[k],
        ).length;
        base.feedback = `${correctCount} of ${Object.keys(question.correctCategories).length} items placed correctly.`;
        break;
      }
      case "drag-drop": {
        const map = isRecord(answer) ? answer : {};
        const correctCount = Object.keys(question.correctPlacements).filter(
          (k) => map[k] === question.correctPlacements[k],
        ).length;
        base.feedback = `${correctCount} of ${Object.keys(question.correctPlacements).length} items placed correctly.`;
        break;
      }
      case "diagram-label": {
        const map = isRecord(answer) ? answer : {};
        const correctCount = Object.keys(question.correctPlacements).filter(
          (k) => map[k] === question.correctPlacements[k],
        ).length;
        base.feedback = `${correctCount} of ${Object.keys(question.correctPlacements).length} labels placed correctly.`;
        break;
      }
      case "timeline": {
        const order = Array.isArray(answer) ? answer : [];
        const correctOrder = question.correctOrder;
        const inPosition = question.correctOrder.filter(
          (_, i) => order[i] === correctOrder[i],
        ).length;
        base.feedback = `${inPosition} of ${correctOrder.length} events in the correct position.`;
        break;
      }
      case "flowchart": {
        const order = Array.isArray(answer) ? answer : [];
        const correctOrder = question.correctOrder;
        const inPosition = question.correctOrder.filter(
          (_, i) => order[i] === correctOrder[i],
        ).length;
        base.feedback = `${inPosition} of ${correctOrder.length} steps in the correct position.`;
        break;
      }
      default:
        break;
    }
  }

  return base;
}
