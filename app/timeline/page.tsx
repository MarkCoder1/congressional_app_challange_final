// /app/planner/page.tsx
"use client";

import { PlannerProvider } from "@/components/planner/PlannerProvider";
import { PlannerLayout } from "@/components/planner/PlannerLayout";
import { TodayTab } from "@/components/planner/tabs/TodayTab";
import { WeekTab } from "@/components/planner/tabs/WeekTab";
import { CalendarTab } from "@/components/planner/tabs/CalendarTab";
import { UpcomingTab } from "@/components/planner/tabs/UpcomingTab";
import { OverdueTab } from "@/components/planner/tabs/OverdueTab";
import { AnalyticsTab } from "@/components/planner/tabs/AnalyticsTab";
import { usePlanner } from "@/components/planner/PlannerProvider";

function PlannerContent() {
  const { activeTab } = usePlanner();

  switch (activeTab) {
    case "today":
      return <TodayTab />;
    case "week":
      return <WeekTab />;
    case "calendar":
      return <CalendarTab />;
    case "upcoming":
      return <UpcomingTab />;
    case "overdue":
      return <OverdueTab />;
    case "analytics":
      return <AnalyticsTab />;
    default:
      return null;
  }
}

export default function PlannerPage() {
  return (
    <PlannerProvider>
      <PlannerLayout>
        <PlannerContent />
      </PlannerLayout>
    </PlannerProvider>
  );
}