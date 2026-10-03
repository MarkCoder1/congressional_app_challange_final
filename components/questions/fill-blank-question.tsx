"use client";

// /components/questions/fill-blank-question.tsx
//
// Renders the sentence with each `___` blank replaced by a text input. There is
// only a single blank for the Phase 3 schema, so the whole answer is one string.

import { Input } from "@/components/ui/input";
import type { FillBlankQuestion } from "@/types/question";

interface Props {
  question: FillBlankQuestion;
  value: string;
  onChange: (value: string) => void;
}

export function FillBlankQuestion({ question, value, onChange }: Props) {
  const blankCount = (question.text.match(/_{3,}/g) ?? []).length;
  return (
    <div className="text-base leading-relaxed text-foreground">
      {blankCount > 1 ? (
        <p className="text-sm text-muted-foreground">
          This reference sheet supports one blank for now — the blank is shown
          below.
        </p>
      ) : null}
      <RenderWithBlank text={question.text} value={value ?? ""} onChange={onChange} />
      <p className="mt-2 text-xs text-muted-foreground">
        Type the missing word or value in the blank.
      </p>
    </div>
  );
}

function RenderWithBlank({
  text,
  value,
  onChange,
}: {
  text: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const parts = text.split(/(_{3,})/g);
  // Render the first real blank as an inline input; collapse any extras.
  const firstBlankIndex = parts.findIndex((part) => /_{3,}/.test(part));
  return (
    <p className="leading-relaxed">
      {parts.map((part, i) => {
        if (!/_{3,}/.test(part)) return <span key={i}>{part}</span>;
        if (i !== firstBlankIndex) return <span key={i}>&nbsp;_____</span>;
        return (
          <Input
            key={i}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Fill in the blank"
            className="mx-1 inline-block w-40 align-baseline"
          />
        );
      })}
    </p>
  );
}
