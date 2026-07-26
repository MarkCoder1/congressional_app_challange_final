// /components/task-workspace/StudentUnderstandingFeedback.tsx
"use client";

import { motion } from "framer-motion";
import { Brain, CheckCircle2, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";
import type { UnderstandingFeedback } from "@/lib/mockLearningData";

interface StudentUnderstandingFeedbackProps {
  feedback: UnderstandingFeedback;
}

export function StudentUnderstandingFeedback({ feedback }: StudentUnderstandingFeedbackProps) {
  const levelColors = {
    strong: {
      bg: "bg-green-50 dark:bg-green-950/20",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-700 dark:text-green-400",
      icon: CheckCircle2,
    },
    moderate: {
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-700 dark:text-blue-400",
      icon: AlertCircle,
    },
    needs_review: {
      bg: "bg-amber-50 dark:bg-amber-950/20",
      border: "border-amber-200 dark:border-amber-800",
      text: "text-amber-700 dark:text-amber-400",
      icon: AlertCircle,
    },
  };

  const colors = levelColors[feedback.level];
  const LevelIcon = colors.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 w-8 h-8 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center`}>
          <Brain size={16} className={colors.text} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${colors.text} mb-2 flex items-center gap-1.5`}>
            <LevelIcon size={14} />
            {feedback.label}
          </h4>

          {/* Strengths */}
          {feedback.strengths.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">Strengths</p>
              <div className="space-y-1">
                {feedback.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
                    <CheckCircle2 size={11} className="text-green-600 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Needs Review */}
          {feedback.needsReview.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">Needs Review</p>
              <div className="space-y-1">
                {feedback.needsReview.map((item, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
                    <ArrowRight size={11} className="text-amber-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="flex items-start gap-1.5 text-xs font-medium text-foreground mt-2 pt-2 border-t border-border/50">
            <Lightbulb size={11} className="text-accent shrink-0 mt-0.5" />
            <span>{feedback.recommendation}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}