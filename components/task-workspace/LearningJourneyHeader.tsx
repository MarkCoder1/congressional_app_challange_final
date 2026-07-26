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
    <div className="w-full bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        <span className="flex items-center gap-2">
          <BookOpen size={14} />
          Task Journey
        </span>
      </h3>
      <div className="flex items-center gap-0 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filteredStages.map((stage, index) => {
          const Icon = stageIcons[stage.stage];
          const isLast = index === filteredStages.length - 1;

          return (
            <div key={stage.stage} className="flex items-center shrink-0">
              <button
                onClick={() => !stage.locked && onStageClick?.(stage.stage)}
                disabled={stage.locked}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200 min-w-0
                  ${stage.current
                    ? "bg-accent text-white shadow-md shadow-accent/25 ring-2 ring-accent/20"
                    : stage.completed
                      ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : stage.locked
                        ? "bg-muted text-muted-foreground/50 cursor-not-allowed opacity-60"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }
                `}
                title={stageDescriptions[stage.stage]}
              >
                {stage.completed ? (
                  <CheckCircle2 size={16} className="shrink-0" />
                ) : stage.current ? (
                  <Icon size={16} className="shrink-0" />
                ) : (
                  <Icon size={16} className="shrink-0" />
                )}
                <span className="hidden sm:inline whitespace-nowrap">{stage.stage}</span>
              </button>

              {/* Arrow connector */}
              {!isLast && (
                <div className="flex items-center mx-1 sm:mx-2">
                  <div className={`
                    w-4 sm:w-6 h-0.5 rounded-full
                    ${stage.completed ? "bg-green-400" : "bg-border"}
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