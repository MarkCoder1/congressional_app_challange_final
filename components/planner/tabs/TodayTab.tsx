// /components/planner/tabs/TodayTab.tsx
"use client";

import { usePlanner } from "../PlannerProvider";
import { MissionCard } from "../components/MissionCard";
import { Timeline } from "../components/Timeline";
import { AICoach } from "../components/AICoach";
import { EmptyPlannerState } from "../components/EmptyPlannerState";

export function TodayTab() {
  const { data, loading } = usePlanner();

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading today's plan...</div>;
  }

  if (!data) {
    return <EmptyPlannerState />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <MissionCard mission={data.today.mission} />
        <Timeline items={data.today.timeline} />
      </div>
      <div className="space-y-6">
        <AICoach coach={data.coach} />
      </div>
    </div>
  );
}