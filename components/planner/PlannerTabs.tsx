// /components/planner/PlannerTabs.tsx
"use client";

import { usePlanner } from "./PlannerProvider";

const tabs = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "calendar", label: "Calendar" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
  { id: "analytics", label: "Analytics" },
] as const;

export function PlannerTabs() {
  const { activeTab, setActiveTab } = usePlanner();

  return (
    <div className="flex flex-wrap gap-1 border-b border-border pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={
            "px-4 py-2 rounded-lg text-sm font-medium transition-all " +
            (activeTab === tab.id
              ? "bg-accent text-white shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary")
          }
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}