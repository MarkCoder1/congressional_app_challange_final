"use client";

// /components/questions/error-detection-question.tsx
//
// Show a multi-step process/solution and let the student pick the step that
// contains the error. Primary correctness is the selected step id.

import type { ErrorDetectionQuestion } from "@/types/question";

interface Props {
  question: ErrorDetectionQuestion;
  value: string;
  onChange: (value: string) => void;
}

export function ErrorDetectionQuestion({ question, value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-bg-sunken p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Problem</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{question.problem}</p>
      </div>

      <ol className="space-y-2" aria-label="Steps">
        {question.steps.map((step, idx) => {
          const selected = value === step.id;
          return (
            <li key={step.id}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(step.id)}
                className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  selected ? "border-primary bg-accent/10" : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="min-w-0 flex-1 pt-0.5 text-sm leading-relaxed text-foreground">{step.text}</span>
                <span
                  aria-hidden="true"
                  className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${selected ? "border-primary bg-primary" : "border-muted-foreground/30"}`}
                >
                  {selected && <span className="mx-auto mt-[3px] block h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <p className="text-xs text-muted-foreground">Select the step that contains the error.</p>
    </div>
  );
}
