// /lib/questions/registry.ts
//
// Central registry describing every QuestionType. Future phases add a question
// type by registering it here (and implementing its renderer + evaluator)
// without changing the core architecture.

import type { QuestionType } from "@/types/question";

export type QuestionCategory =
  | "core"
  | "interactive"
  | "visual";

export interface QuestionTypeInfo {
  label: string;
  implemented: boolean; // rendered & evaluated in the current phase
  category: QuestionCategory;
}

export const QUESTION_TYPE_REGISTRY: Record<QuestionType, QuestionTypeInfo> = {
  // ---- CORE ----
  "multiple-choice": { label: "Multiple Choice", implemented: true, category: "core" },
  "multi-select": { label: "Multi-Select", implemented: true, category: "core" },
  "true-false": { label: "True / False", implemented: true, category: "core" },
  "short-answer": { label: "Short Answer", implemented: true, category: "core" },
  "fill-blank": { label: "Fill in the Blank", implemented: true, category: "core" },
  numeric: { label: "Numeric", implemented: true, category: "core" },
  // ---- INTERACTIVE ----
  matching: { label: "Matching", implemented: true, category: "interactive" },
  ordering: { label: "Ordering", implemented: true, category: "interactive" },
  categorization: { label: "Categorization", implemented: true, category: "interactive" },
  "drag-drop": { label: "Drag & Drop", implemented: true, category: "interactive" },
  // ---- VISUAL (fully implemented in Phase 4) ----
  "diagram-label": { label: "Diagram Label", implemented: true, category: "visual" },
  graph: { label: "Graph", implemented: true, category: "visual" },
  timeline: { label: "Timeline", implemented: true, category: "visual" },
  flowchart: { label: "Flowchart", implemented: true, category: "visual" },
  scenario: { label: "Scenario", implemented: true, category: "visual" },
  "error-detection": { label: "Error Detection", implemented: true, category: "visual" },
};

export function isQuestionTypeImplemented(type: QuestionType): boolean {
  return QUESTION_TYPE_REGISTRY[type]?.implemented ?? false;
}

export function questionTypeLabel(type: QuestionType): string {
  return QUESTION_TYPE_REGISTRY[type]?.label ?? type;
}

// Question types the Diagnostic is allowed to generate in Phase 3 (it keeps the
// Phase 2 mix). Future phases pass a different allowedTypes set for Practice,
// Review, Mock Exam, etc.
export const DIAGNOSTIC_ALLOWED_TYPES: QuestionType[] = [
  "multiple-choice",
  "true-false",
];
