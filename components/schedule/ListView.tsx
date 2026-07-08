// /components/schedule/ListView.tsx
"use client";

import { ScheduledTask } from "@/types/schedule";
import { TaskCard } from "./TaskCard";

interface ListViewProps {
  tasks: ScheduledTask[];
}

export function ListView({ tasks }: ListViewProps) {
  // Sort by priority descending
  const sorted = [...tasks].sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">All Tasks by Priority</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map(task => (
          <TaskCard key={task.taskId} task={task} compact={false} />
        ))}
      </div>
    </div>
  );
}