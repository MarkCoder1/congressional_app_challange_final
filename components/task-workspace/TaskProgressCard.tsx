// /components/task-workspace/TaskProgressCard.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, TrendingUp, BarChart3 } from "lucide-react";
import type { LessonProgressState } from "./types";

interface TaskProgressCardProps {
  progressState: LessonProgressState;
  completedActivities: string[];
  remainingActivities: string[];
  estimatedMinutes?: number;
}

export function TaskProgressCard({
  progressState,
  completedActivities,
  remainingActivities,
  estimatedMinutes = 120,
}: TaskProgressCardProps) {
  const { progress } = progressState;

  const remainingMinutes = Math.max(
    0,
    Math.round(estimatedMinutes * (1 - progress / 100))
  );

  // Determine current stage label
  const currentStage = (() => {
    if (!progressState.learnCompleted) return "Learn Mode";
    if (!progressState.practiceCompleted) return "Practice Mode";
    if (!progressState.masterCompleted) return "Master Mode";
    return "Completed";
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <BarChart3 size={14} />
          Task Progress
        </h3>
        <span className="text-sm font-bold text-accent">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full"
        />
      </div>

      {/* Current Stage */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-secondary/50 rounded-xl">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <div>
          <span className="text-xs text-muted-foreground">Current</span>
          <p className="text-sm font-semibold text-foreground">{currentStage}</p>
        </div>
        {remainingMinutes > 0 && (
          <>
            <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={12} />
              <span>~{remainingMinutes} min left</span>
            </div>
          </>
        )}
      </div>

      {/* Completed Activities */}
      {completedActivities.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
            Completed
          </p>
          <div className="space-y-1.5">
            {completedActivities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs text-success dark:text-success"
              >
                <CheckCircle2 size={12} className="shrink-0" />
                <span>{activity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remaining Activities */}
      {remainingActivities.length > 0 && progress < 100 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
            Remaining
          </p>
          <div className="space-y-1.5">
            {remainingActivities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <TrendingUp size={12} className="shrink-0" />
                <span>{activity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}