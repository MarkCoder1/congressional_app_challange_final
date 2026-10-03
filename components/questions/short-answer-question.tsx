"use client";

// /components/questions/short-answer-question.tsx

import { Input } from "@/components/ui/input";
import type { ShortAnswerQuestion } from "@/types/question";

interface Props {
  question: ShortAnswerQuestion;
  value: string;
  onChange: (value: string) => void;
}

export function ShortAnswerQuestion({ question, value, onChange }: Props) {
  return (
    <div>
      <Input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder ?? "Type your answer…"}
        aria-label="Your answer"
        className="max-w-md"
        autoComplete="off"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        You can phrase it in your own words; minor differences are accepted.
      </p>
    </div>
  );
}
