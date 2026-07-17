// /components/planner/tabs/CalendarTab.tsx
"use client";

import { usePlanner } from "../PlannerProvider";
import { CalendarView } from "../components/CalendarView";
import { EmptyPlannerState } from "../components/EmptyPlannerState";
import type { PlannerState } from "@/lib/planner/plannerTypes";

export function CalendarTab() {
  const { selectedDate, setSelectedDate, plannerState, loading, error } = usePlanner();

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading calendar...</div>;
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

  const selectedDay = selectedDate
    ? plannerState.calendar.days.find((day: PlannerState["calendar"]["days"][number]) => day.date === selectedDate)
    : null;

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
            {selectedDay && selectedDay.tasks.length > 0 ? (
              <div className="space-y-2">
                {selectedDay.tasks.map((task: PlannerState["tasks"][number]) => (
                  <div key={task.id} className="rounded-lg border border-border bg-secondary/30 p-3">
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.subject} • {task.estimatedMinutes ?? 0}m
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks scheduled for this day.</p>
            )}
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