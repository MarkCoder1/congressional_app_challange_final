// /components/planner/tabs/UpcomingTab.tsx
"use client";

import { usePlanner } from "../PlannerProvider";
import { UpcomingSection } from "../components/UpcomingSection";
import { EmptyPlannerState } from "../components/EmptyPlannerState";

export function UpcomingTab() {
  const { data, loading } = usePlanner();

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading upcoming tasks...</div>;
  }

  if (!data) {
    return <EmptyPlannerState />;
  }

  return <UpcomingSection upcoming={data.upcoming} />;
}