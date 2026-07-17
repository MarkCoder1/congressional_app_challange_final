// /components/planner/tabs/WeekTab.tsx
"use client";

import { usePlanner } from "../PlannerProvider";
import { WeeklySummary } from "../components/WeeklySummary";
import { EmptyPlannerState } from "../components/EmptyPlannerState";
import { WeeklySummary as WeeklySummaryType } from "@/types/planner";

export function WeekTab() {
  const { plannerState, loading, error } = usePlanner();

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading week overview...</div>;
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

  const summary: WeeklySummaryType = {
    studyHours: plannerState.week.studyHours,
    workload: plannerState.week.workload,
    hardestDay: plannerState.week.hardestDay ?? "",
    lightestDay: plannerState.week.lightestDay ?? "",
    days: plannerState.week.days.map((day) => ({
      date: day.date,
      hours: day.hours,
      tasks: day.taskCount,
      workload: day.workload,
    })),
  };

  return <WeeklySummary summary={summary} />;
}