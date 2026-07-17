// /components/planner/tabs/AnalyticsTab.tsx
"use client";

import { usePlanner } from "../PlannerProvider";
import { EmptyPlannerState } from "../components/EmptyPlannerState";
import type { PlannerState } from "@/lib/planner/plannerTypes";

export function AnalyticsTab() {
  const { plannerState, loading, error } = usePlanner();

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading analytics...</div>;
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

  const { analytics } = plannerState;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <span className="text-sm text-muted-foreground">Completion Rate</span>
          <p className="text-2xl font-bold text-foreground">{analytics.completionRate}%</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <span className="text-sm text-muted-foreground">Total Study Hours</span>
          <p className="text-2xl font-bold text-foreground">{analytics.totalStudyHours}h</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <span className="text-sm text-muted-foreground">Streak</span>
          <p className="text-2xl font-bold text-foreground">
            {analytics.streak ?? "—"} days
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">Subject Distribution</h3>
        <div className="space-y-2">
          {analytics.subjectDistribution.map((item: PlannerState["analytics"]["subjectDistribution"][number]) => (
            <div key={item.subject} className="flex items-center gap-2">
              <span className="w-24 text-sm text-muted-foreground">{item.subject}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{
                    width: `${(item.hours / Math.max(1, analytics.totalStudyHours)) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-12 text-right">
                {item.hours}h
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">Productivity Trend</h3>
        <div className="flex items-end gap-2 h-24">
          {analytics.productivityTrendValues.map((val: number, idx: number) => (
            <div
              key={idx}
              className="flex-1 bg-accent/30 rounded-t"
              style={{ height: `${Math.min(100, val)}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}