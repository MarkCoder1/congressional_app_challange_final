// /components/planner/components/WorkloadBreakdown.tsx
"use client";

import { TodayWorkloadState } from "@/lib/planner/plannerTypes";

interface WorkloadBreakdownProps {
  workload: TodayWorkloadState;
}

export function WorkloadBreakdown({ workload }: WorkloadBreakdownProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Today's Workload
      </h4>
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-2xl font-bold text-foreground">
          {workload.estimatedHours}h {workload.remainingMinutes > 0 ? `${workload.remainingMinutes}m` : ""}
        </span>
        <div className="flex flex-wrap gap-3 text-sm">
          {workload.typeCounts.assignment > 0 && (
            <span className="px-2 py-1 bg-accent/10 rounded-full text-accent">
              {workload.typeCounts.assignment} Assignment{workload.typeCounts.assignment > 1 ? 's' : ''}
            </span>
          )}
          {workload.typeCounts.lesson > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 rounded-full">
              {workload.typeCounts.lesson} Lesson{workload.typeCounts.lesson > 1 ? 's' : ''}
            </span>
          )}
          {workload.typeCounts.practice > 0 && (
            <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300 rounded-full">
              {workload.typeCounts.practice} Practice
            </span>
          )}
          {workload.typeCounts.review > 0 && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 rounded-full">
              {workload.typeCounts.review} Review
            </span>
          )}
        </div>
      </div>
    </div>
  );
}