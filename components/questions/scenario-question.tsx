"use client";

// /components/questions/scenario-question.tsx
//
// Structured case presentation: context + optional evidence cards + options.
// Reuses the OptionButton pattern for selection.

import { FileText, Table2, ListChecks } from "lucide-react";
import { OptionButton } from "./option-button";
import type { ScenarioQuestion } from "@/types/question";

interface Props {
  question: ScenarioQuestion;
  value: string;
  onChange: (value: string) => void;
}

const EVIDENCE_ICON = {
  text: FileText,
  list: ListChecks,
  table: Table2,
} as const;

export function ScenarioQuestion({ question, value, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Context */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scenario</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">{question.context}</p>
      </div>

      {/* Evidence */}
      {question.evidence && question.evidence.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {question.evidence.map((ev) => {
            const Icon = EVIDENCE_ICON[ev.kind ?? "text"] ?? FileText;
            return (
              <div key={ev.id} className="rounded-xl border border-border bg-bg-sunken p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Icon size={14} className="text-muted-foreground" />
                  {ev.title && <p className="text-xs font-semibold text-foreground">{ev.title}</p>}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{ev.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Question prompt is rendered by the parent harness/page header; repeat here if needed for context */}
      <p className="text-sm font-medium text-foreground">{question.prompt}</p>

      {/* Options */}
      <div className="space-y-2" role="radiogroup" aria-label="Scenario options">
        {question.options.map((opt) => (
          <OptionButton key={opt.id} id={opt.id} text={opt.text} selected={value === opt.id} onSelect={onChange} />
        ))}
      </div>
    </div>
  );
}
