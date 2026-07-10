// /components/planner/components/OverdueSection.tsx
"use client";

import { PlannerTask } from "@/types/planner";
import { AlertTriangle } from "lucide-react";

interface OverdueSectionProps {
  tasks: PlannerTask[];
}

export function OverdueSection({ tasks }: OverdueSectionProps) {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          Overdue Tasks
        </h3>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-2">No overdue tasks. Great job!</p>
        ) : (
          <div className="mt-3 space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.subject} • Deadline: {task.deadline}
                  </p>
                </div>
                <span className="text-xs font-medium text-red-500">{task.estimatedMinutes}m</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-foreground">Recovery Plan</h4>
        <p className="text-sm text-muted-foreground mt-2">
          Complete overdue tasks first to catch up. Consider rescheduling less urgent work.
        </p>
      </div>
    </div>
  );
}