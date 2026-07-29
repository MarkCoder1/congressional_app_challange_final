// /components/task-workspace/LearningJourneyHeader.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Lock, LucideIcon, BookOpen, Zap, Trophy, FileText } from "lucide-react";
import type { LearningStage, StageStatus } from "./types";

interface LearningJourneyHeaderProps {
  stages: StageStatus[];
  onStageClick?: (stage: LearningStage) => void;
}

const stageIcons: Record<LearningStage, LucideIcon> = {
  Learn: BookOpen,
  Practice: Zap,
  Master: Trophy,
  Assignment: FileText,
};

const stageDescriptions: Record<LearningStage, string> = {
  Learn: "Understand the concept",
  Practice: "Apply your knowledge",
  Master: "Check your understanding",
  Assignment: "Complete your work",
};

export function LearningJourneyHeader({ stages, onStageClick }: LearningJourneyHeaderProps) {
  const filteredStages = stages.filter((s) => s.stage !== "Assignment" || true);

  return (
    <div className="w-full bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        <span className="flex items-center gap-2">
          <BookOpen size={14} />
          Task Journey
        </span>
      </h3>
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
        {filteredStages.map((stage, index) => {
          const Icon = stageIcons[stage.stage];
          const isLast = index === filteredStages.length - 1;

          return (
            <div key={stage.stage} className="flex items-center shrink-0">
              <button
                onClick={() => !stage.locked && onStageClick?.(stage.stage)}
                disabled={stage.locked}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200 min-w-0
                  ${stage.current
                    ? "bg-accent text-white shadow-sm shadow-accent/25"
                    : stage.completed
                      ? "bg-success-tint dark:bg-success/20 text-success dark:text-success border border-success/20 dark:border-success/80"
                      : stage.locked
                        ? "bg-muted text-muted-foreground/50 cursor-not-allowed opacity-60"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }
                `}
                title={stageDescriptions[stage.stage]}
              >
                {stage.completed ? (
                  <CheckCircle2 size={15} className="shrink-0" />
                ) : (
                  <Icon size={15} className="shrink-0" />
                )}
                <span className="hidden sm:inline whitespace-nowrap">{stage.stage}</span>
              </button>

              {/* Arrow connector */}
              {!isLast && (
                <div className="flex items-center mx-1 sm:mx-1.5">
                  <div className={`
                    w-3 sm:w-5 h-px rounded-full
                    ${stage.completed ? "bg-success" : "bg-border"}
                  `} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
