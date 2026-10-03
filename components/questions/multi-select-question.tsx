"use client";

// /components/questions/multi-select-question.tsx

import type { MultiSelectQuestion } from "@/types/question";
import { OptionButton } from "./option-button";

interface Props {
  question: MultiSelectQuestion;
  value: string[];
  onChange: (value: string[]) => void;
}

export function MultiSelectQuestion({ question, value, onChange }: Props) {
  const selected = new Set(value);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  }

  return (
    <div>
      <p className="my-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Select all that apply
      </p>
      <div role="group" aria-label={question.prompt} className="space-y-2.5">
        {question.options.map((option) => (
          <OptionButton
            key={option.id}
            id={option.id}
            text={option.text}
            selected={selected.has(option.id)}
            onSelect={toggle}
            kind="multi"
          />
        ))}
      </div>
    </div>
  );
}
