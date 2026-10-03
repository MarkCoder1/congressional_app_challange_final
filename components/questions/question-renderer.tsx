"use client";

// /components/questions/question-renderer.tsx
//
// Central routing layer for the Question Type Engine.
//
//   AI  ->  Question  ->  <QuestionRenderer />  ->  <TypeQuestion />  ->  answer
//
// The renderer inspects `question.type` and renders the matching component. It
// is the ONLY place that branches on question type; feature UIs (Diagnostic,
// Practice, etc.) render questions through this component and never scatter
// type checks.
//
import type {
  Question,
  QuestionAnswer,
} from "@/types/question";
import { MultipleChoiceQuestion } from "./multiple-choice-question";
import { MultiSelectQuestion } from "./multi-select-question";
import { TrueFalseQuestion } from "./true-false-question";
import { ShortAnswerQuestion } from "./short-answer-question";
import { FillBlankQuestion } from "./fill-blank-question";
import { NumericQuestion } from "./numeric-question";
import { MatchingQuestion } from "./matching-question";
import { OrderingQuestion } from "./ordering-question";
import { CategorizationQuestion } from "./categorization-question";
import { DragDropQuestion } from "./drag-drop-question";
import { DiagramLabelQuestion } from "./diagram-label-question";
import { GraphQuestion } from "./graph-question";
import { TimelineQuestion } from "./timeline-question";
import { FlowchartQuestion } from "./flowchart-question";
import { ScenarioQuestion } from "./scenario-question";
import { ErrorDetectionQuestion } from "./error-detection-question";

export interface QuestionRendererProps {
  question: Question;
  value: QuestionAnswer;
  onChange: (value: QuestionAnswer) => void;
  disabled?: boolean;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  disabled,
}: QuestionRendererProps) {
  if (disabled) return <UnsupportedFallback label="Answering is disabled right now." />;

  switch (question.type) {
    case "multiple-choice":
      return (
        <MultipleChoiceQuestion
          question={question}
          value={typeof value === "string" ? value : ""}
          onChange={(v) => onChange(v)}
        />
      );
    case "multi-select":
      return (
        <MultiSelectQuestion
          question={question}
          value={Array.isArray(value) ? value : []}
          onChange={(v) => onChange(v)}
        />
      );
    case "true-false":
      return (
        <TrueFalseQuestion
          question={question}
          value={typeof value === "string" ? value : ""}
          onChange={(v) => onChange(v)}
        />
      );
    case "short-answer":
      return (
        <ShortAnswerQuestion
          question={question}
          value={typeof value === "string" ? value : ""}
          onChange={(v) => onChange(v)}
        />
      );
    case "fill-blank":
      return (
        <FillBlankQuestion
          question={question}
          value={typeof value === "string" ? value : ""}
          onChange={(v) => onChange(v)}
        />
      );
    case "numeric":
      return (
        <NumericQuestion
          question={question}
          value={typeof value === "number" ? value : undefined}
          onChange={(v) => onChange(v ?? null)}
        />
      );
    case "matching":
      return (
        <MatchingQuestion
          question={question}
          value={isStringRecord(value) ? value : {}}
          onChange={(v) => onChange(v)}
        />
      );
    case "ordering":
      return (
        <OrderingQuestion
          question={question}
          value={Array.isArray(value) ? value : []}
          onChange={(v) => onChange(v)}
        />
      );
    case "categorization":
      return (
        <CategorizationQuestion
          question={question}
          value={isStringRecord(value) ? value : {}}
          onChange={(v) => onChange(v)}
        />
      );
    case "drag-drop":
      return (
        <DragDropQuestion
          question={question}
          value={isStringRecord(value) ? value : {}}
          onChange={(v) => onChange(v)}
        />
      );
    case "diagram-label":
      return (
        <DiagramLabelQuestion
          question={question}
          value={isStringRecord(value) ? value : {}}
          onChange={(v) => onChange(v)}
        />
      );
    case "graph":
      return (
        <GraphQuestion
          question={question}
          value={value ?? null}
          onChange={(v) => onChange(v)}
        />
      );
    case "timeline":
      return (
        <TimelineQuestion
          question={question}
          value={Array.isArray(value) ? value : []}
          onChange={(v) => onChange(v)}
        />
      );
    case "flowchart":
      return (
        <FlowchartQuestion
          question={question}
          value={Array.isArray(value) ? value : []}
          onChange={(v) => onChange(v)}
        />
      );
    case "scenario":
      return (
        <ScenarioQuestion
          question={question}
          value={typeof value === "string" ? value : ""}
          onChange={(v) => onChange(v)}
        />
      );
    case "error-detection":
      return (
        <ErrorDetectionQuestion
          question={question}
          value={typeof value === "string" ? value : ""}
          onChange={(v) => onChange(v)}
        />
      );
    default:
      return (
        <UnsupportedFallback
          label={questionTypeLabelFor(question)}
        />
      );
  }
}

function isStringRecord(v: unknown): v is Record<string, string> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function questionTypeLabelFor(question: Question): string {
  const labels: Record<string, string> = {
    "diagram-label": "Diagram Label",
    graph: "Graph",
    timeline: "Timeline",
    flowchart: "Flowchart",
    scenario: "Scenario",
    "error-detection": "Error Detection",
  };
  return labels[question.type] ?? question.type;
}

function UnsupportedFallback({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-bg-sunken p-6 text-center">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Interactive question type coming soon.
      </p>
    </div>
  );
}
