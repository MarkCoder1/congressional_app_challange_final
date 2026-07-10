// /components/planner/components/WeeklySummary.tsx
"use client";

import { WeeklySummary as WeeklySummaryType } from "@/types/planner";

interface WeeklySummaryProps {
  summary: WeeklySummaryType;
}

export function WeeklySummary({ summary }: WeeklySummaryProps) {
  const workloadColor = {
    light: "bg-green-400",
    medium: "bg-yellow-400",
    heavy: "bg-orange-400",
    overloaded: "bg-red-500",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <span className="text-sm text-muted-foreground">Total Hours</span>
          <p className="text-2xl font-bold text-foreground">{summary.studyHours}h</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <span className="text-sm text-muted-foreground">Workload</span>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-3 h-3 rounded-full ${workloadColor[summary.workload]}`} />
            <span className="text-sm font-medium capitalize">{summary.workload}</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <span className="text-sm text-muted-foreground">Hardest Day</span>
          <p className="text-sm font-medium mt-1">
            {summary.hardestDay ? new Date(summary.hardestDay).toLocaleDateString("en-US", { weekday: "long" }) : "—"}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <span className="text-sm text-muted-foreground">Lightest Day</span>
          <p className="text-sm font-medium mt-1">
            {summary.lightestDay ? new Date(summary.lightestDay).toLocaleDateString("en-US", { weekday: "long" }) : "—"}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">Daily Breakdown</h3>
        <div className="grid grid-cols-7 gap-2">
          {summary.days.map((day) => (
            <div key={day.date} className="text-center">
              <div className="text-xs text-muted-foreground">
                {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="text-sm font-medium mt-1">{day.hours}h</div>
              <div className={`w-3 h-3 rounded-full mx-auto mt-1 ${workloadColor[day.workload]}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}