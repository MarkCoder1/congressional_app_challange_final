// /components/planner/tabs/UpcomingTab.tsx
"use client";

import { usePlanner } from "../PlannerProvider";
import { UpcomingSection } from "../components/UpcomingSection";
import { EmptyPlannerState } from "../components/EmptyPlannerState";
import { PlannerTask as LegacyPlannerTask } from "@/types/planner";

function toLegacyType(type: string): LegacyPlannerTask["type"] {
  if (type === "assignment") return "assignment";
  if (type === "practice") return "practice";
  if (type === "review") return "review";
  return "lesson";
}

export function UpcomingTab() {
  const { plannerState, loading, error } = usePlanner();

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading upcoming tasks...</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  if (!plannerState) {
    return <EmptyPlannerState />;
  }

  const upcoming = {
    tomorrow: plannerState.upcoming.tomorrow.tasks.map((task): LegacyPlannerTask => ({
      id: task.id,
      title: task.title,
      subject: task.subject,
      type: toLegacyType(task.type),
      progress: task.progress,
      deadline: task.deadline ?? undefined,
      estimatedMinutes: task.estimatedMinutes ?? 0,
      priority: task.priorityLevel,
      status: task.completed ? "completed" : task.isOverdue ? "overdue" : "pending",
      reason: task.reason,
    })),
    laterThisWeek: plannerState.upcoming.laterThisWeek.tasks.map((task): LegacyPlannerTask => ({
      id: task.id,
      title: task.title,
      subject: task.subject,
      type: toLegacyType(task.type),
      progress: task.progress,
      deadline: task.deadline ?? undefined,
      estimatedMinutes: task.estimatedMinutes ?? 0,
      priority: task.priorityLevel,
      status: task.completed ? "completed" : task.isOverdue ? "overdue" : "pending",
      reason: task.reason,
    })),
    nextWeek: plannerState.upcoming.nextWeek.tasks.map((task): LegacyPlannerTask => ({
      id: task.id,
      title: task.title,
      subject: task.subject,
      type: toLegacyType(task.type),
      progress: task.progress,
      deadline: task.deadline ?? undefined,
      estimatedMinutes: task.estimatedMinutes ?? 0,
      priority: task.priorityLevel,
      status: task.completed ? "completed" : task.isOverdue ? "overdue" : "pending",
      reason: task.reason,
    })),
    future: plannerState.upcoming.future.tasks.map((task): LegacyPlannerTask => ({
      id: task.id,
      title: task.title,
      subject: task.subject,
      type: toLegacyType(task.type),
      progress: task.progress,
      deadline: task.deadline ?? undefined,
      estimatedMinutes: task.estimatedMinutes ?? 0,
      priority: task.priorityLevel,
      status: task.completed ? "completed" : task.isOverdue ? "overdue" : "pending",
      reason: task.reason,
    })),
  };

  return <UpcomingSection upcoming={upcoming} />;
}