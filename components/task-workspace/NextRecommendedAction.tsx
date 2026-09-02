// /components/task-workspace/NextRecommendedAction.tsx
"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target, Zap, Trophy, BookOpen, FileText } from "lucide-react";
import { getAdaptiveNextAction } from "@/lib/mockLearningData";
import type { LearningStage, NextAction } from "./types";

interface NextRecommendedActionProps {
  nextAction: NextAction | null;
  onStartAction: (tab: LearningStage) => void;
  practiceScore?: number;
  masterScore?: number;
  learnCompleted?: boolean;
  practiceCompleted?: boolean;
  masterCompleted?: boolean;
}

const actionIcons: Record<LearningStage, typeof Sparkles> = {
  Learn: BookOpen,
  Practice: Zap,
  Master: Trophy,
  Assignment: FileText,
};

export function NextRecommendedAction({
  nextAction,
  onStartAction,
  practiceScore,
  masterScore,
  learnCompleted,
  practiceCompleted,
  masterCompleted,
}: NextRecommendedActionProps) {
  // Use adaptive next action if we have learning state
  const adaptiveAction = practiceScore !== undefined || masterScore !== undefined
    ? getAdaptiveNextAction(
      learnCompleted ?? false,
      practiceCompleted ?? false,
      masterCompleted ?? false,
      practiceScore,
      masterScore
    )
    : null;

  const displayAction = adaptiveAction || nextAction;

  if (!displayAction) return null;

  const ActionIcon = actionIcons[displayAction.targetTab] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="w-full bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-4 sm:p-6 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <Sparkles size={18} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
            Your Next Step
          </p>

          <p className="text-sm sm:text-base font-bold text-foreground mb-3">
            {displayAction.label}
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => onStartAction(displayAction.targetTab)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-200 shadow-sm shadow-accent/20 hover:shadow-md hover:shadow-accent/30 active:scale-[0.98]"
            >
              <ActionIcon size={15} />
              {displayAction.action}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
