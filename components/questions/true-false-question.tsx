"use client";

// /components/questions/true-false-question.tsx

import type { TrueFalseQuestion } from "@/types/question";
import { OptionButton } from "./option-button";

interface Props {
  question: TrueFalseQuestion;
  value: string;
  onChange: (value: string) => void;
}

export function TrueFalseQuestion({ question, value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {question.options.map((option) => (
        <OptionButton
          key={option.id}
          id={option.id}
          text={option.text}
          selected={value === option.id}
          onSelect={onChange}
          kind="tf"
        />
      ))}
    </div>
  );
}
