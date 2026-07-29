// /components/task-workspace/LearningNavigation.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle2, BookOpen, Zap, Trophy, FileText } from "lucide-react";
import type { LearningStage, StageStatus } from "./types";

interface LearningNavigationProps {
  stages: StageStatus[];
  onStageClick?: (stage: LearningStage) => void;
}

const stageIcons: Record<LearningStage, typeof BookOpen> = {
  Learn: BookOpen,
  Practice: Zap,
  Master: Trophy,
  Assignment: FileText,
};

const stageLabels: Record<LearningStage, string> = {
  Learn: "Learn",
  Practice: "Practice",
  Master: "Master",
  Assignment: "Assignment",
};

export function LearningNavigation({ stages, onStageClick }: LearningNavigationProps) {
  return (
    <nav className="w-full bg-card border border-border rounded-xl p-1.5 shadow-xs">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {stages.map((stage, index) => {
          const Icon = stageIcons[stage.stage];
          const isActive = stage.current;
          const isFirst = index === 0;
          const isLast = index === stages.length - 1;

          return (
            <div key={stage.stage} className="flex items-center gap-1 flex-1 min-w-0">
              <button
                onClick={() => !stage.locked && onStageClick?.(stage.stage)}
                disabled={stage.locked}
                className={`
                  relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 w-full
                  ${isActive
                    ? "bg-accent text-white shadow-sm shadow-accent/20"
                    : stage.completed
                      ? "text-success dark:text-success hover:bg-success-tint dark:hover:bg-success/20"
                      : stage.locked
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }
                `}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <motion.span
                    layoutId="activeStage"
                    className="absolute inset-0 rounded-lg bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-2">
                  {stage.completed ? (
                    <CheckCircle2 size={15} className="shrink-0" />
                  ) : (
                    <Icon size={15} className="shrink-0" />
                  )}
                  <span className="truncate hidden sm:inline">{stageLabels[stage.stage]}</span>
                </span>
              </button>

              {/* Connector */}
              {!isLast && (
                <div className="hidden sm:block shrink-0 w-4 h-px bg-border last:hidden" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}