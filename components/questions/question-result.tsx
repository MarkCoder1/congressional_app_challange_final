"use client";

// /components/questions/question-result.tsx
//
// Shared result feedback shown after evaluating a question. Conveys
// correct / incorrect / partial using colour AND an explicit status label, so
// it is never communicated by colour alone.

import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { EvaluationStatus } from "@/lib/questions/evaluate";

interface QuestionResultProps {
  status: EvaluationStatus;
  score: number;
  explanation?: string;
}

const CONFIG: Record<
  EvaluationStatus,
  { label: string; panel: string; badge: string; Icon: typeof CheckCircle2 }
> = {
  correct: {
    label: "Correct",
    panel: "border-success/20 bg-success-tint",
    badge: "badge-success",
    Icon: CheckCircle2,
  },
  incorrect: {
    label: "Incorrect",
    panel: "border-error/20 bg-error-tint",
    badge: "badge-destructive",
    Icon: XCircle,
  },
  partial: {
    label: "Partially Correct",
    panel: "border-reco-amber/25 bg-reco-tint",
    badge: "badge-warning",
    Icon: AlertTriangle,
  },
};

export function QuestionResult({ status, score, explanation }: QuestionResultProps) {
  const { label, panel, badge, Icon } = CONFIG[status];
  return (
    <div className={`mt-4 rounded-xl border-2 p-4 ${panel}`} role="status">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge}`}>
          <Icon size={14} /> {label}
        </span>
        <span className="text-sm font-semibold text-foreground">{score}%</span>
      </div>
      {explanation && (
        <p className="mt-3 text-sm leading-relaxed text-foreground/90">{explanation}</p>
      )}
    </div>
  );
}
