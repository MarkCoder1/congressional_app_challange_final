// /components/planner/tabs/OverdueTab.tsx
"use client";

import { usePlanner } from "../PlannerProvider";
import { OverdueSection } from "../components/OverdueSection";
import { EmptyPlannerState } from "../components/EmptyPlannerState";

export function OverdueTab() {
  const { data, loading } = usePlanner();

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading overdue tasks...</div>;
  }

  if (!data) {
    return <EmptyPlannerState />;
  }

  return <OverdueSection tasks={data.overdue} />;
}