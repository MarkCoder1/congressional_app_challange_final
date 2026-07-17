// /components/planner/components/AISummary.tsx
"use client";

interface AISummaryProps {
  summary: string;
}

export function AISummary({ summary }: AISummaryProps) {
  if (!summary) return null;
  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <p className="text-sm text-foreground/80 leading-relaxed">{summary}</p>
    </div>
  );
}