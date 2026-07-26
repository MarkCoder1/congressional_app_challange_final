// /components/task-workspace/LearningStatusCard.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, TrendingUp, BarChart3, Plus, Minus, CheckSquare, RotateCcw, Sparkles } from "lucide-react";
import { NextRecommendedAction } from "./NextRecommendedAction";
import type { LessonProgressState, NextAction, LearningStage } from "./types";

interface LearningStatusCardProps {
  progressState: LessonProgressState;
  completedActivities: string[];
  remainingActivities: string[];
  nextAction: NextAction | null;
  estimatedMinutes?: number;
  onProgressAction: (action: "increase" | "decrease" | "complete" | "reset") => void;
  onStartAction: (tab: LearningStage) => void;
}

export function LearningStatusCard({
  progressState,
  completedActivities,
  remainingActivities,
  nextAction,
  estimatedMinutes = 120,
  onProgressAction,
  onStartAction,
}: LearningStatusCardProps) {
  const { progress } = progressState;
  const remainingMinutes = Math.max(0, Math.round(estimatedMinutes * (1 - progress / 100)));

  const currentStage = (() => {
    if (progress >= 100) return "Completed";
    if (!progressState.learnCompleted) return "Learn Mode";
    if (!progressState.practiceCompleted) return "Practice Mode";
    if (!progressState.masterCompleted) return "Master Mode";
    return "Completed";
  })();

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm">
      {/* Progress + Stage */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <BarChart3 size={12} />
            Progress
          </span>
          <span className="text-sm font-bold text-accent">{clampedProgress}%</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clampedProgress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {currentStage}
          </span>
          {remainingMinutes > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              ~{remainingMinutes}m left
            </span>
          )}
        </div>
      </div>

      {/* Journey indicator (compact) */}
      <div className="flex items-center gap-1 text-xs">
        <span className={`flex items-center gap-1 ${progressState.learnCompleted ? "text-green-600" : "text-muted-foreground"}`}>
          {progressState.learnCompleted ? <CheckCircle2 size={11} /> : <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
          Learn
        </span>
        <span className="text-muted-foreground/30 mx-1">→</span>
        <span className={`flex items-center gap-1 ${progressState.practiceCompleted ? "text-green-600" : progressState.learnCompleted ? "text-foreground" : "text-muted-foreground/50"}`}>
          {progressState.practiceCompleted ? <CheckCircle2 size={11} /> : <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
          Practice
        </span>
        <span className="text-muted-foreground/30 mx-1">→</span>
        <span className={`flex items-center gap-1 ${progressState.masterCompleted ? "text-green-600" : progressState.practiceCompleted ? "text-foreground" : "text-muted-foreground/50"}`}>
          {progressState.masterCompleted ? <CheckCircle2 size={11} /> : <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
          Master
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Next Action */}
      {nextAction && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles size={11} className="text-accent" />
            Next Step
          </p>
          <NextRecommendedAction
            nextAction={nextAction}
            onStartAction={onStartAction}
            practiceScore={progressState.practiceScore}
            masterScore={progressState.masterScore}
            learnCompleted={progressState.learnCompleted}
            practiceCompleted={progressState.practiceCompleted}
            masterCompleted={progressState.masterCompleted}
          />
        </div>
      )}

      {/* Completed / Remaining summary */}
      {(completedActivities.length > 0 || remainingActivities.length > 0) && (
        <div className="space-y-1 text-xs">
          {completedActivities.length > 0 && (
            <div className="text-green-700 dark:text-green-400 space-y-0.5">
              {completedActivities.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 size={10} />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          )}
          {remainingActivities.filter(a => !a.startsWith("✓")).length > 0 && progress < 100 && (
            <div className="text-muted-foreground space-y-0.5">
              {remainingActivities.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <TrendingUp size={10} />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Task Controls */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Task Controls</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onProgressAction("decrease")}
            disabled={clampedProgress <= 0}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs"
            title="Decrease progress"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => onProgressAction("increase")}
            disabled={clampedProgress >= 100}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs"
            title="Increase progress"
          >
            <Plus size={14} />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => onProgressAction("complete")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 hover:opacity-90 transition-opacity text-xs font-medium"
          >
            <CheckSquare size={12} />
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}