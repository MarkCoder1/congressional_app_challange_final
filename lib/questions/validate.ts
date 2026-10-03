// /lib/questions/validate.ts
//
// Server-side validation for AI-generated question data. The AI returns raw
// JSON; this module checks it conforms to the structured Question schema before
// it reaches the frontend. Invalid questions are reported and dropped (never
// fabricated), and a controlled error surfaces instead of crashing the page.

import type { Question, QuestionType } from "@/types/question";
import { normalizeQuestion } from "./normalize.ts";
import { QUESTION_TYPE_REGISTRY } from "./registry.ts";

export const KNOWN_QUESTION_TYPES = Object.keys(
  QUESTION_TYPE_REGISTRY,
) as QuestionType[];

export interface QuestionValidation {
  question: Question | null;
  problems: string[];
}

/**
 * Validate a single raw AI question object. Returns the normalized Question
 * when valid, along with a list of human-readable problems (empty when valid).
 */
export function validateQuestion(
  raw: unknown,
  allowedTypes?: QuestionType[],
): QuestionValidation {
  const problems: string[] = [];

  if (!raw || typeof raw !== "object") {
    return { question: null, problems: ["Question is not an object"] };
  }
  const q = raw as Record<string, unknown>;

  if (typeof q.id !== "string" || !q.id.trim()) {
    problems.push("Missing or invalid id");
  }
  const type = typeof q.type === "string" ? q.type.toLowerCase() : "";
  if (!type) {
    problems.push("Missing type");
  } else if (!KNOWN_QUESTION_TYPES.includes(type as QuestionType)) {
    problems.push(`Unknown question type "${type}"`);
  } else if (allowedTypes && !allowedTypes.includes(type as QuestionType)) {
    problems.push(`Question type "${type}" is not allowed for this assessment`);
  }
  const prompt =
    typeof q.prompt === "string"
      ? q.prompt
      : typeof q.question === "string"
        ? q.question
        : "";
  if (!prompt.trim()) {
    problems.push("Missing question prompt");
  }

  const question = normalizeQuestion(raw);

  if (!question && problems.length === 0) {
    problems.push("Question payload does not satisfy its type's schema");
  }

  return { question, problems };
}

/**
 * Validate an array of raw AI questions, returning only the valid normalized
 * ones. Any problems are collected into `problems`. Does NOT fabricate data.
 */
export function validateQuestions(
  raw: unknown,
  allowedTypes?: QuestionType[],
): { questions: Question[]; problems: string[] } {
  if (!Array.isArray(raw)) {
    return { questions: [], problems: ["Expected an array of questions"] };
  }
  const questions: Question[] = [];
  const problems: string[] = [];
  for (const entry of raw) {
    const result = validateQuestion(entry, allowedTypes);
    if (result.question) {
      questions.push(result.question);
    }
    for (const p of result.problems) {
      problems.push(`Question ${(entry as Record<string, unknown>)?.["id"] ?? "?"}: ${p}`);
    }
  }
  return { questions, problems };
}
