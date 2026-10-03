// /lib/ai/generateDiagnosticQuestions.ts
// Generates a topic-covering diagnostic question set using the existing Groq/AI
// infrastructure. Reuses the retry + JSON-repair helpers from
// generateTaskContent.ts (do NOT duplicate an AI provider) and normalizes the
// result through the shared Question Type Engine.
//
// Phase 3: the generator supports requesting a set of allowed question types
// (default: multiple-choice + true-false for the Diagnostic). It emits the
// shared structured Question schema (`prompt` + type-specific payload) so the
// frontend renders it with <QuestionRenderer /> and evaluates with
// evaluateQuestion().

import { ACTIVE_MODEL } from "./model";
import {
  createCompletionWithRetry,
  extractFailedGeneration,
  isJsonValidateError,
  parseGeneratedJson,
  MAX_COMPLETION_TOKENS,
} from "./generateTaskContent";
import type { ExamTopic } from "@/types/task";
import type { Question, QuestionType } from "@/types/question";
import { validateQuestions } from "@/lib/questions/validate";
import {
  DIAGNOSTIC_ALLOWED_TYPES,
  QUESTION_TYPE_REGISTRY,
  questionTypeLabel,
} from "@/lib/questions/registry";

export type { QuestionType };

interface GenerateInput {
  title: string;
  subject: string;
  description: string;
  difficulty?: string;
  topics: ExamTopic[];
}

export interface GenerateOptions {
  allowedTypes?: QuestionType[];
}

const MIN_TOTAL = 6;
const MAX_TOTAL = 10;

export function targetQuestionCount(topicCount: number): number {
  if (topicCount <= 0) return MIN_TOTAL;
  return Math.max(MIN_TOTAL, Math.min(MAX_TOTAL, topicCount * 2));
}

// Map a question type to its JSON schema snippet (used only to steer the AI).
function schemaForType(type: QuestionType): string {
  switch (type) {
    case "multiple-choice":
      return `{
  "id": "q1",
  "topicId": "<exact topic id>",
  "topic": "<topic name>",
  "prompt": "the question text",
  "type": "multiple-choice",
  "options": [
    { "id": "opt1", "text": "option text" },
    { "id": "opt2", "text": "option text" },
    { "id": "opt3", "text": "option text" },
    { "id": "opt4", "text": "option text" }
  ],
  "correctAnswer": "<id of the correct option>",
  "explanation": "short explanation"
}`;
    case "true-false":
      return `{
  "id": "q1",
  "topicId": "<exact topic id>",
  "topic": "<topic name>",
  "prompt": "the statement or question",
  "type": "true-false",
  "correctAnswer": "true | false",
  "explanation": "short explanation"
}`;
    case "multi-select":
      return `{ "id": "q1", "topicId": "<id>", "topic": "<name>", "prompt": "question", "type": "multi-select", "options": [{ "id": "a", "text": "..." }], "correctAnswers": ["a", "c"], "explanation": "..." }`;
    case "short-answer":
      return `{ "id": "q1", "topicId": "<id>", "topic": "<name>", "prompt": "question", "type": "short-answer", "acceptedAnswers": ["exact answer 1", "acceptable variant 2"], "explanation": "..." }`;
    case "fill-blank":
      return `{ "id": "q1", "topicId": "<id>", "topic": "<name>", "prompt": "instruction", "type": "fill-blank", "text": "The sentence with ___ blank.", "acceptedAnswers": ["answer"], "explanation": "..." }`;
    case "numeric":
      return `{ "id": "q1", "topicId": "<id>", "topic": "<name>", "prompt": "question", "type": "numeric", "correctAnswer": 12, "tolerance": 0, "explanation": "..." }`;
    case "matching":
      return `{ "id": "q1", "topicId": "<id>", "topic": "<name>", "prompt": "match instruction", "type": "matching", "leftItems": [{ "id": "l1", "text": "term" }], "rightItems": [{ "id": "r1", "text": "definition" }], "correctPairs": [{ "leftId": "l1", "rightId": "r1" }], "explanation": "..." }`;
    case "ordering":
      return `{ "id": "q1", "topicId": "<id>", "topic": "<name>", "prompt": "Put in correct order", "type": "ordering", "items": [{ "id": "s1", "text": "First step" }, { "id": "s2", "text": "Second step" }], "correctOrder": ["s1", "s2"], "explanation": "..." }`;
    case "categorization":
      return `{ "id": "q1", "topicId": "<id>", "topic": "<name>", "prompt": "Categorize", "type": "categorization", "categories": [{ "id": "c1", "text": "Group A" }], "items": [{ "id": "i1", "text": "Item 1" }], "correctCategories": { "i1": "c1" }, "explanation": "..." }`;
    case "drag-drop":
      return `{ "id": "q1", "topicId": "<id>", "topic": "<name>", "prompt": "Drag to zones", "type": "drag-drop", "items": [{ "id": "i1", "text": "Item" }], "dropZones": [{ "id": "z1", "text": "Zone" }], "correctPlacements": { "i1": "z1" }, "explanation": "..." }`;
    case "diagram-label":
      return `{ "id": "q1", "topicId": "<id>", "topic": "<name>", "prompt": "Label the parts of ...", "type": "diagram-label", "title": "Diagram Title", "aspectRatio": 1.6, "regions": [{ "id": "r1", "label": "Nucleus", "x": 30, "y": 20, "width": 20, "height": 15 }], "labels": [{ "id": "l1", "text": "Nucleus" }], "correctPlacements": { "l1": "r1" }, "explanation": "..." }`;
    case "graph":
      return `{ "id": "q1", "topicId": "<id>", "topic": "<name>", "prompt": "What is the slope / which point ...?", "type": "graph", "title": "Graph Title", "xLabel": "x", "yLabel": "y", "xMin": -10, "xMax": 10, "yMin": -10, "yMax": 10, "points": [{ "id": "p1", "x": 2, "y": 3, "label": "A" }], "lines": [{ "id": "ln1", "fromX": -5, "fromY": -5, "toX": 5, "toY": 5 }], "interaction": "select-point", "correctAnswer": "p1", "explanation": "..." }
  // For numeric graph questions use: "interaction": "numeric", "correctValue": 2, "tolerance": 0.5
  // For choose-graph use: "interaction": "choose-graph", "options": [{ "id": "a", "text": "Graph A: ..." }], "correctAnswer": "a"
  // For select-region use: "interaction": "select-region", "regions": [{ "id": "r1", "label": "Quadrant I", "x": 50, "y": 0, "width": 50, "height": 50 }], "correctAnswer": "r1"`;
    case "timeline":
      return `{ "id": "q1", "topicId": "<id>", "topic": "<name>", "prompt": "Put these events in chronological order", "type": "timeline", "events": [{ "id": "e1", "label": "Event A", "date": "1776", "detail": "Description" }], "correctOrder": ["e1", "e2"], "explanation": "..." }`;
    case "flowchart":
      return `{ "id": "q1", "topicId": "<id>", "topic": "<name>", "prompt": "Arrange the steps of ...", "type": "flowchart", "nodes": [{ "id": "n1", "text": "Ask a Question" }], "edges": [{ "from": "n1", "to": "n2" }], "correctOrder": ["n1", "n2"], "explanation": "..." }`;
    case "scenario":
      return `{ "id": "q1", "topicId": "<id>", "topic": "<name>", "prompt": "What should the student do next?", "type": "scenario", "context": "A student observes that ...", "evidence": [{ "id": "ev1", "title": "Observation", "kind": "text", "content": "The plant grew..." }], "options": [{ "id": "a", "text": "Option A" }], "correctAnswer": "a", "explanation": "..." }`;
    case "error-detection":
      return `{ "id": "q1", "topicId": "<id>", "topic": "<name>", "prompt": "Which step contains the error?", "type": "error-detection", "problem": "Solve: ...", "steps": [{ "id": "s1", "text": "Step 1: ..." }], "errorStepId": "s2", "fixExplanation": "Should be ...", "explanation": "..." }`;
    default:
      return `{ "id": "q1", "topicId": "<id>", "topic": "<name>", "prompt": "instruction", "type": "${type}", "explanation": "..." }`;
  }
}

function typeGuidance(allowed: QuestionType[]): string {
  return allowed
    .map(
      (t) =>
        `- "${t}" (${questionTypeLabel(t)}): pick this type when it best assesses the concept.\n` +
        `  JSON shape:\n${schemaForType(t)}`,
    )
    .join("\n\n");
}

function buildPrompt(
  input: GenerateInput,
  targetCount: number,
  topics: ExamTopic[],
  allowed: QuestionType[],
  constraints: string,
): string {
  const topicList = topics
    .map((t) => `- id: "${t.id}", name: "${t.name}"`)
    .join("\n");

  return `
 You are an expert examiner building a short diagnostic assessment for an upcoming exam.

 Exam title: "${input.title}"
 Subject: "${input.subject}"
 Description: "${input.description}"
 Difficulty: ${input.difficulty || "medium"}

 The diagnostic is meant to reveal what the student already knows about each topic so StudyFlow can focus their studying. It is NOT a full exam.

 Exam topics:
 ${topicList}

 ${constraints}

  Generate exactly ${targetCount} questions total, following these rules:
 1. EVERY exam topic above must be represented by at least one question. ${topics.length > 1 ? `Distribute the ${targetCount} questions as evenly as possible across the ${topics.length} topics (${Math.max(1, Math.floor(targetCount / topics.length))} to ${Math.ceil(targetCount / topics.length)} per topic).` : ""}
 2. You may ONLY use these question types: ${allowed.map((t) => `"${t}"`).join(", ")}.
 3. For a balanced diagnostic, you MUST use at least 4 different question types and cover at least 2 different categories (core: multiple-choice/multi-select/true-false/short-answer/fill-blank/numeric; interactive: matching/ordering/categorization/drag-drop; visual: diagram-label/graph/timeline/flowchart/scenario/error-detection). Do not generate all questions as the same type.
 4. Choose the question type based on the concept being assessed:
     - definition / simple fact -> true-false or multiple-choice
     - calculation -> numeric
     - term/definition match -> matching
     - process / sequence -> ordering, flowchart, or timeline
     - slope / trend / point / intercept / coordinate -> graph
     - historical chronology or dated events -> timeline
     - scientific or procedural process -> flowchart
     - anatomy / structure / diagram parts -> diagram-label
     - applied decision making / case study -> scenario
     - identifying a mistake / flawed reasoning -> error-detection
      Do not pick a type randomly — it must fit the concept. Do not use a visual type when it does not fit.
  5. Each question must be tagged with the exact topic "id" and topic "name" it tests, and must use the "prompt" field for the question text.
  6. Keep every question concise and directly related to the named topic.
  7. Provide a short 1-2 sentence explanation after each question.
  8. "correctAnswer" / "correctAnswers" / "acceptedAnswers" must reference real ids or accepted text exactly.
  9. NEVER generate React, HTML, JSX, SVG markup, or UI code. Return only structured JSON as described.
 10. For diagram-label: regions use x/y/width/height as 0-100 percentages of the diagram bounds. For graph: respect xMin/xMax/yMin/yMax and provide interaction plus correctAnswer/correctValue accordingly. Do not invent external images.

 Return ONLY valid JSON matching this exact structure (no extra text, no markdown):
 {
   "questions": [
     // one or more of the question objects described below
   ]
 }

 Allowed question type JSON shapes:
 ${typeGuidance(allowed)}

 Every "questions" array entry must conform to one of the shapes above.
 `;
}

/**
 * For a short diagnostic (6-10 Q), ensure variety: at least 3 categories and 4+ types.
 * If caller passes explicit allowedTypes, respect it. Otherwise, use a balanced set
 * derived from all implemented types (not just the legacy 2).
 */
function getBalancedDiagnosticTypes(targetCount: number): QuestionType[] {
  const allImplemented = Object.keys(QUESTION_TYPE_REGISTRY).filter(
    (t) => QUESTION_TYPE_REGISTRY[t as QuestionType].implemented,
  ) as QuestionType[];
  // For small diagnostics, use all but bias prompt toward variety; for larger, same.
  // We return all implemented so AI can choose appropriately, but we could also subset.
  // To ensure variety, we return all and add prompt requirement for 4+ types.
  return allImplemented;
}

/**
 * Generates a topic-covering diagnostic question set. Throws on hard failure so
 * the caller can surface "Couldn't prepare the diagnostic" — we never silently
 * substitute fake questions.
 */
export async function generateDiagnosticQuestions(
  input: GenerateInput,
  options?: GenerateOptions,
): Promise<Question[]> {
  const allowed = options?.allowedTypes?.length
    ? options.allowedTypes
    : getBalancedDiagnosticTypes(targetQuestionCount(input.topics.length));
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  const target = targetQuestionCount(input.topics.length);

  const collected: Question[] = [];
  const missingConstraints: string[] = [];

  for (let round = 0; round < 2; round++) {
    let remainingTopics: ExamTopic[];
    if (round === 0) {
      remainingTopics = input.topics;
    } else {
      const coveredTopicIds = new Set(collected.map((q) => q.topicId));
      remainingTopics = input.topics.filter((t) => !coveredTopicIds.has(t.id));
      if (remainingTopics.length === 0) break;
    }

    const prompt = buildPrompt(
      input,
      target,
      remainingTopics,
      allowed,
      missingConstraints.join("\n"),
    );

    let completion;
    try {
      completion = await createCompletionWithRetry({
        messages: [{ role: "user", content: prompt }],
        model: ACTIVE_MODEL,
        temperature: 0.4,
        max_completion_tokens: MAX_COMPLETION_TOKENS,
        response_format: { type: "json_object" },
      });
    } catch (error) {
      const rawFailed = extractFailedGeneration(error);
      if (rawFailed) {
        const salvaged = parseGeneratedJson(rawFailed);
        if (salvaged && typeof salvaged === "object") {
          const parsed = validateQuestions(
            (salvaged as Record<string, unknown>).questions,
            allowed,
          );
          mergeQuestions(collected, parsed.questions);
          break;
        }
      }
      console.error(
        "[generateDiagnosticQuestions] AI call failed",
        error instanceof Error ? error.message : error,
        isJsonValidateError(error) ? "(json_validate_failed)" : "",
      );
      throw error;
    }

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");
    const parsed = parseGeneratedJson(content) ?? JSON.parse(content);
    const normalized = validateQuestions(
      parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>).questions
        : null,
      allowed,
    );
    mergeQuestions(collected, normalized.questions);

    // Ensure we aren't missing topics after this round.
    const coveredTopicIds = new Set(collected.map((q) => q.topicId).filter(Boolean));
    const missing = input.topics.filter((t) => !coveredTopicIds.has(t.id) && t.id);
    if (missing.length === 0) break;
    missingConstraints.push(
      `Important: you omitted these topics — please include questions for: ${missing
        .map((t) => `"${t.name}"`)
        .join(", ")}.`,
    );
    if (round === 1 && missing.length > 0) {
      break;
    }
  }

  if (collected.length === 0) {
    throw new Error("AI returned no valid diagnostic questions");
  }

  return collected.slice(0, MAX_TOTAL);
}

function mergeQuestions(
  target: Question[],
  incoming: Question[],
): void {
  const seen = new Set(target.map((q) => q.id));
  for (const q of incoming) {
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    target.push(q);
  }
}
