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
      bg: "bg-success-tint dark:bg-success/20",
      border: "border-success/20 dark:border-success/80",
      text: "text-success dark:text-success",
      icon: CheckCircle2,
    },
    moderate: {
      bg: "bg-primary-tint dark:bg-primary/20",
      border: "border-primary/20 dark:border-primary/80",
      text: "text-primary dark:text-primary",
      icon: AlertCircle,
    },
    needs_review: {
      bg: "bg-reco-tint dark:bg-reco-amber/20",
      border: "border-reco-amber/20 dark:border-reco-amber/80",
      text: "text-reco-amber dark:text-reco-amber",
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
                    <CheckCircle2 size={11} className="text-success shrink-0 mt-0.5" />
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
                    <ArrowRight size={11} className="text-reco-amber shrink-0 mt-0.5" />
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