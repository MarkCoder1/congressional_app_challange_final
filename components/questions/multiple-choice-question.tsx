"use client";

// /components/questions/multiple-choice-question.tsx

import type { MultipleChoiceQuestion } from "@/types/question";
import { OptionButton } from "./option-button";

interface Props {
  question: MultipleChoiceQuestion;
  value: string;
  onChange: (value: string) => void;
}

export function MultipleChoiceQuestion({ question, value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label={question.prompt} className="space-y-2.5">
      {question.options.map((option) => (
        <OptionButton
          key={option.id}
          id={option.id}
          text={option.text}
          selected={value === option.id}
          onSelect={onChange}
          kind="single"
        />
      ))}
    </div>
  );
}
