"use client";

// /components/questions/numeric-question.tsx
//
// A number input. The answer delivered upward is a number when the field is
// valid, or undefined when empty.

import { Input } from "@/components/ui/input";
import { parseNumeric } from "@/lib/questions/normalize";
import type { NumericQuestion } from "@/types/question";

interface Props {
  question: NumericQuestion;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export function NumericQuestion({ question, value, onChange }: Props) {
  const text = value === undefined ? "" : String(value);
  return (
    <div>
      <div className="flex max-w-xs items-center gap-2">
        <Input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw.trim() === "") {
              onChange(undefined);
              return;
            }
            const n = parseNumeric(raw);
            if (Number.isFinite(n)) onChange(n);
            // ignore non-numeric input while typing
          }}
          placeholder="e.g. 42"
          aria-label="Your numerical answer"
          className="text-base"
        />
        {question.unit && (
          <span className="shrink-0 text-sm font-medium text-muted-foreground">
            {question.unit}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Enter a number{typeof question.tolerance === "number" && question.tolerance > 0
          ? ` (within ${question.tolerance} of the exact value)`
          : ""}.
      </p>
    </div>
  );
}
