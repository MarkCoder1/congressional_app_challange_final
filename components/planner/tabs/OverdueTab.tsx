// /components/planner/tabs/OverdueTab.tsx
"use client";

import { usePlanner } from "../PlannerProvider";
import { OverdueSection } from "../components/OverdueSection";
import { EmptyPlannerState } from "../components/EmptyPlannerState";
import { PlannerTask as LegacyPlannerTask } from "@/types/planner";

function toLegacyType(type: string): LegacyPlannerTask["type"] {
  if (type === "assignment") return "assignment";
  if (type === "practice") return "practice";
  if (type === "review") return "review";
  return "lesson";
}

export function OverdueTab() {
  const { plannerState, loading, error } = usePlanner();

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading overdue tasks...</div>;
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

  const tasks: LegacyPlannerTask[] = plannerState.overdue.tasks.map((task) => ({
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
  }));

  return <OverdueSection tasks={tasks} />;
}