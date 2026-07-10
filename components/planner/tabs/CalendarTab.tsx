// /components/planner/tabs/CalendarTab.tsx
"use client";

import { usePlanner } from "../PlannerProvider";
import { CalendarView } from "../components/CalendarView";
import { EmptyPlannerState } from "../components/EmptyPlannerState";

export function CalendarTab() {
  const { selectedDate, setSelectedDate, data, loading } = usePlanner();

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading calendar...</div>;
  }

  if (!data) {
    return <EmptyPlannerState />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <CalendarView onSelectDate={setSelectedDate} selectedDate={selectedDate} />
      </div>
      <div className="space-y-4">
        {selectedDate ? (
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Tasks for {selectedDate}
            </h3>
            <p className="text-sm text-muted-foreground">No tasks scheduled for this day.</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Select a date to see tasks.</p>
          </div>
        )}
      </div>
    </div>
  );
}