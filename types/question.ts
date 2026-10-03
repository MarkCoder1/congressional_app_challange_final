// /types/question.ts
//
// StudyFlow Reusable Question Type Engine — centralized schema.
//
// The AI decides WHAT type of question to generate (a `QuestionType`). StudyFlow
// decides HOW that type is rendered and evaluated. This file is the single
// source of truth for the question model so future features (Exam Preparation,
// Diagnostic, Practice, Review, Mock Exam, Master) share one architecture.
//
// Every question is serializable JSON so it can be produced by the AI and
// persisted alongside the task.

// ============================================================
// QUESTION TYPE UNION (single source of truth — do not duplicate)
// ============================================================
export type QuestionType =
  // ---- CORE (fully implemented in Phase 3) ----
  | "multiple-choice"
  | "multi-select"
  | "true-false"
  | "short-answer"
  | "fill-blank"
  | "numeric"
  // ---- INTERACTIVE (fully implemented in Phase 3) ----
  | "matching"
  | "ordering"
  | "categorization"
  | "drag-drop"
  // ---- VISUAL / FUTURE-READY (registered, deferred to Phase 4) ----
  | "diagram-label"
  | "graph"
  | "timeline"
  | "flowchart"
  | "scenario"
  | "error-detection";

export type QuestionDifficulty = "easy" | "medium" | "hard";

// ============================================================
// COMMON PROPERTIES
// ============================================================
export interface QuestionBase {
  id: string;
  type: QuestionType;
  topicId?: string;
  topic?: string;
  difficulty?: QuestionDifficulty;
  prompt: string;
  explanation?: string;
}

// ============================================================
// COMMON BUILDING BLOCKS
// ============================================================
export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionPair {
  id: string;
  text: string;
}

// ============================================================
// TYPE-SPECIFIC PAYLOADS
// ============================================================
export interface MultipleChoiceQuestion extends QuestionBase {
  type: "multiple-choice";
  options: QuestionOption[];
  correctAnswer: string; // id of the correct option
}

export interface MultiSelectQuestion extends QuestionBase {
  type: "multi-select";
  options: QuestionOption[];
  correctAnswers: string[]; // ids of all correct options
}

export interface TrueFalseQuestion extends QuestionBase {
  type: "true-false";
  options: QuestionOption[]; // typically [{true},{false}]
  correctAnswer: string; // id of the correct option ("true" | "false")
}

export interface ShortAnswerQuestion extends QuestionBase {
  type: "short-answer";
  placeholder?: string;
  // Deterministic matching. At least one must match (after normalization) for
  // a fully correct score. The student answer itself is graded by the
  // evaluator, never by the AI.
  acceptedAnswers: string[];
  caseSensitive?: boolean;
}

export interface FillBlankQuestion extends QuestionBase {
  type: "fill-blank";
  text: string; // the sentence, with blank(s) marked by ___
  acceptedAnswers: string[]; // one or more acceptable fill-ins
  caseSensitive?: boolean;
}

export interface NumericQuestion extends QuestionBase {
  type: "numeric";
  correctAnswer: number;
  tolerance?: number; // default 0
  unit?: string; // optional unit label shown to the student
}

export interface MatchingQuestion extends QuestionBase {
  type: "matching";
  leftItems: QuestionPair[];
  rightItems: QuestionPair[];
  correctPairs: { leftId: string; rightId: string }[];
}

export interface OrderingQuestion extends QuestionBase {
  type: "ordering";
  items: QuestionPair[];
  correctOrder: string[]; // ordered ids, first -> last
}

export interface CategorizationQuestion extends QuestionBase {
  type: "categorization";
  categories: QuestionPair[];
  items: QuestionPair[];
  correctCategories: Record<string, string>; // itemId -> categoryId
}

export interface DragDropQuestion extends QuestionBase {
  type: "drag-drop";
  items: QuestionPair[];
  dropZones: QuestionPair[];
  correctPlacements: Record<string, string>; // itemId -> zoneId
}

// ============================================================
// VISUAL TYPES (fully implemented in Phase 4)
// ============================================================

// ---- diagram-label ----
export interface DiagramRegion {
  id: string;
  // Human label describing the target region (e.g. "Nucleus").
  label: string;
  // Position/size as percentages (0-100) of the diagram bounds, so the layout
  // scales across screen sizes and never overflows.
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramLabelOption {
  id: string;
  text: string;
}

export interface DiagramLabelQuestion extends QuestionBase {
  type: "diagram-label";
  // Optional short figure caption rendered above the diagram.
  title?: string;
  // Aspect ratio (width/height) of the interactive diagram area. Used to keep
  // the region geometry consistent across viewport widths.
  aspectRatio?: number; // default ~1.5
  // Structured geometric diagram rendered as CSS/SVG (never an external image).
  regions: DiagramRegion[];
  labels: DiagramLabelOption[];
  // labelId -> regionId
  correctPlacements: Record<string, string>;
}

// ---- graph ----
export interface GraphPoint {
  id: string;
  x: number;
  y: number;
  label?: string;
  seriesId?: string;
}

export interface GraphSeries {
  id: string;
  name: string;
}

export interface GraphLine {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface GraphOption {
  id: string;
  text: string;
}

export type GraphInteraction =
  | "select-point" // click/select a labelled point -> answer is a point id
  | "select-region" // click within a labelled axis region -> answer is a region id
  | "numeric" // type a value -> answer is a number (with tolerance)
  | "choose-graph"; // pick the matching graph description -> answer is an option id

export interface GraphQuestion extends QuestionBase {
  type: "graph";
  title?: string;
  xLabel?: string;
  yLabel?: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  series?: GraphSeries[];
  points?: GraphPoint[];
  lines?: GraphLine[];
  interaction: GraphInteraction;
  // Regions are used with interaction "select-region" (name -> id).
  regions?: DiagramRegion[];
  // Options are used with interaction "choose-graph" (id -> text).
  options?: GraphOption[];
  // Correct answer for "select-point" / "select-region" / "choose-graph".
  correctAnswer?: string;
  // Correct value for "numeric" (with optional tolerance).
  correctValue?: number;
  tolerance?: number;
}

// ---- timeline ----
export interface TimelineEvent {
  id: string;
  label: string;
  date?: string;
  detail?: string;
}

export interface TimelineQuestion extends QuestionBase {
  type: "timeline";
  events: TimelineEvent[];
  // ordered event ids, first -> last
  correctOrder: string[];
}

// ---- flowchart ----
export interface FlowchartNode {
  id: string;
  text: string;
}
export interface FlowchartEdge {
  from: string;
  to: string;
}

export interface FlowchartQuestion extends QuestionBase {
  type: "flowchart";
  nodes: FlowchartNode[];
  edges?: FlowchartEdge[];
  // ordered node ids that complete/arrange the process
  correctOrder: string[];
}

// ---- scenario ----
export interface ScenarioEvidence {
  id: string;
  title?: string;
  kind?: "text" | "list" | "table";
  content: string;
}

export interface ScenarioQuestion extends QuestionBase {
  type: "scenario";
  context: string;
  evidence?: ScenarioEvidence[];
  options: { id: string; text: string }[];
  correctAnswer: string;
}

// ---- error-detection ----
export interface ProblemStep {
  id: string;
  text: string;
}

export interface ErrorDetectionQuestion extends QuestionBase {
  type: "error-detection";
  problem: string;
  steps: ProblemStep[];
  errorStepId: string;
  // Optional: explain what should have happened instead (not AI-graded).
  fixExplanation?: string;
}

// ============================================================
// QUESTION DISCRIMINATED UNION
// ============================================================
export type Question =
  | MultipleChoiceQuestion
  | MultiSelectQuestion
  | TrueFalseQuestion
  | ShortAnswerQuestion
  | FillBlankQuestion
  | NumericQuestion
  | MatchingQuestion
  | OrderingQuestion
  | CategorizationQuestion
  | DragDropQuestion
  | DiagramLabelQuestion
  | GraphQuestion
  | TimelineQuestion
  | FlowchartQuestion
  | ScenarioQuestion
  | ErrorDetectionQuestion;

// ============================================================
// ANSWER MODEL (serializable)
//
// Map of the value a student produces for each question type.
//   multiple-choice : string        (selected option id)
//   true-false      : string        ("true" | "false")
//   short-answer    : string
//   fill-blank      : string
//   numeric         : number
//   multi-select    : string[]      (selected option ids, any order)
//   ordering        : string[]      (ordered item ids)
//   matching        : Record<string,string>  (leftId -> rightId)
//   categorization  : Record<string,string>  (itemId -> categoryId)
//   drag-drop       : Record<string,string>  (itemId -> zoneId)
//   diagram-label   : Record<string,string>  (labelId -> regionId)
//   timeline        : string[]               (ordered event ids)
//   flowchart       : string[]               (ordered node ids)
//   graph           : string | number        (point/region/option id, or numeric value)
//   scenario        : string                 (selected option id)
//   error-detection : string                 (selected step id)
// ============================================================
export type QuestionAnswer =
  | string
  | number
  | string[]
  | Record<string, string>
  | null;

// Convenience mapping of the answer shape for each type. Used to type the
// renderer props and the evaluator for strongly-typed access.
export type AnswerForKey<Q extends Question> = Q extends { type: "numeric" }
  ? number
  : Q extends { type: "multi-select" | "ordering" | "timeline" | "flowchart" }
    ? string[]
    : Q extends { type: "matching" | "categorization" | "drag-drop" | "diagram-label" }
      ? Record<string, string>
      : string;
