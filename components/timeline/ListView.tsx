// /components/timeline/ListView.tsx
"use client";

import { useMemo } from "react";
import { TimelineTask } from "@/types/timeline";
import { TaskCard } from "./TaskCard";
import { groupTasksByDate, getDateLabel } from "@/lib/timeline";

interface ListViewProps {
  tasks: TimelineTask[];
}

export function ListView({ tasks }: ListViewProps) {
  const grouped = useMemo(() => {
    const groups = groupTasksByDate(tasks);
    const today = new Date().toISOString().split('T')[0];
    const todayGroup = groups.find(g => g.date === today);
    const pastGroups = groups.filter(g => g.date < today);
    const futureGroups = groups.filter(g => g.date > today);
    const unscheduled = groups.filter(g => !g.date);

    // Overdue → Today → Upcoming
    return [...pastGroups, ...(todayGroup ? [todayGroup] : []), ...futureGroups, ...unscheduled];
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tasks match the current filter</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.date || 'unscheduled'} className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              {group.date ? getDateLabel(group.date) : "Unscheduled"}
            </h3>
            <span className="text-xs text-muted-foreground">
              {group.tasks.length} task{group.tasks.length > 1 ? 's' : ''}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {group.tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}