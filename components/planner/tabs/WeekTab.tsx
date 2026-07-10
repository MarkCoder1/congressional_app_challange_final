// /components/planner/tabs/WeekTab.tsx
"use client";

import { usePlanner } from "../PlannerProvider";
import { WeeklySummary } from "../components/WeeklySummary";
import { EmptyPlannerState } from "../components/EmptyPlannerState";

export function WeekTab() {
  const { data, loading } = usePlanner();

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading week overview...</div>;
  }

  if (!data) {
    return <EmptyPlannerState />;
  }

  return <WeeklySummary summary={data.week} />;
}