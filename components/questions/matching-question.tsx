"use client";

// /components/questions/matching-question.tsx
//
// Match each left item (term) to a right item (definition). Uses native
// <select> elements for full keyboard / screen-reader / touch support.
// Duplicate assignments are prevented: choosing a right item already used by
// another left item transfers the assignment.

import type { MatchingQuestion } from "@/types/question";

interface Props {
  question: MatchingQuestion;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

export function MatchingQuestion({ question, value, onChange }: Props) {
  const map = value ?? {};

  function assign(leftId: string, rightId: string) {
    const next = { ...map };
    if (rightId === "") {
      delete next[leftId];
      onChange(next);
      return;
    }
    // Transfer: if another left already uses this right, unassign it.
    for (const [otherLeft, otherRight] of Object.entries(next)) {
      if (otherLeft !== leftId && otherRight === rightId) {
        delete next[otherLeft];
      }
    }
    next[leftId] = rightId;
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {question.leftItems.map((left) => {
        const current = map[left.id] ?? "";
        return (
          <div
            key={left.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center"
          >
            <span className="flex-1 text-sm font-semibold text-foreground">
              {left.text}
            </span>
            <label className="sr-only">Match “{left.text}” to a definition</label>
            <select
              value={current}
              onChange={(e) => assign(left.id, e.target.value)}
              aria-label={`Match "${left.text}" to a definition`}
              className="w-full rounded-lg border border-border bg-bg-sunken px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-64"
            >
              <option value="">Select…</option>
              {question.rightItems.map((right) => (
                <option key={right.id} value={right.id}>
                  {right.text}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
