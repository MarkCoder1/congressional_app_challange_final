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
    <div className="w-full max-w-md bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm overflow-hidden">
      {/* Progress + Stage */}
      <div>
        <div className="flex items-center justify-between mb-2 gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 shrink-0">
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
        <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {currentStage}
          </span>
          {remainingMinutes > 0 && (
            <span className="flex items-center gap-1 shrink-0">
              <Clock size={10} />
              ~{remainingMinutes}m left
            </span>
          )}
        </div>
      </div>

      {/* Learning Journey */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
          <Sparkles size={12} className="text-accent" />
          Learning Journey
        </p>
        <div className="flex items-center flex-wrap gap-1 sm:gap-1.5 text-xs">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md shrink-0 ${
            progressState.learnCompleted
              ? "bg-success/10 text-success"
              : currentStage === "Learn Mode"
                ? "bg-accent/10 text-accent font-medium"
                : "text-muted-foreground/50"
          }`}>
            {progressState.learnCompleted ? <CheckCircle2 size={11} /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
            Learn
          </div>
          <span className="text-muted-foreground/20 shrink-0">→</span>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md shrink-0 ${
            progressState.practiceCompleted
              ? "bg-success/10 text-success"
              : currentStage === "Practice Mode"
                ? "bg-accent/10 text-accent font-medium"
                : progressState.learnCompleted
                  ? "text-foreground"
                  : "text-muted-foreground/50"
          }`}>
            {progressState.practiceCompleted ? <CheckCircle2 size={11} /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
            Practice
          </div>
          <span className="text-muted-foreground/20 shrink-0">→</span>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md shrink-0 ${
            progressState.masterCompleted
              ? "bg-success/10 text-success"
              : currentStage === "Master Mode"
                ? "bg-accent/10 text-accent font-medium"
                : progressState.practiceCompleted
                  ? "text-foreground"
                  : "text-muted-foreground/50"
          }`}>
            {progressState.masterCompleted ? <CheckCircle2 size={11} /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
            Master
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Next Action */}
      {nextAction && (
        <div className="min-w-0">
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
        <div className="space-y-1 text-xs min-w-0">
          {completedActivities.length > 0 && (
            <div className="text-success dark:text-success space-y-0.5 min-w-0">
              {completedActivities.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5 min-w-0">
                  <CheckCircle2 size={10} className="shrink-0" />
                  <span className="truncate">{a}</span>
                </div>
              ))}
            </div>
          )}
          {remainingActivities.filter(a => !a.startsWith("✓")).length > 0 && progress < 100 && (
            <div className="text-muted-foreground space-y-0.5 min-w-0">
              {remainingActivities.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5 min-w-0">
                  <TrendingUp size={10} className="shrink-0" />
                  <span className="truncate">{a}</span>
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
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          <CheckSquare size={11} />
          Quick Actions
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
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
          </div>
          <button
            onClick={() => onProgressAction("complete")}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success-tint dark:bg-success/20 text-success dark:text-success hover:opacity-90 transition-opacity text-xs font-medium shrink-0"
          >
            <CheckSquare size={12} />
            Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
}