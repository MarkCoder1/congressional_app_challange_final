// /components/planner/components/UpcomingSection.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PlannerTask } from "@/types/planner";

interface UpcomingSectionProps {
  upcoming: {
    tomorrow: PlannerTask[];
    laterThisWeek: PlannerTask[];
    nextWeek: PlannerTask[];
    future: PlannerTask[];
  };
}

export function UpcomingSection({ upcoming }: UpcomingSectionProps) {
  const [expanded, setExpanded] = useState({
    tomorrow: true,
    laterThisWeek: true,
    nextWeek: false,
    future: false,
  });

  const toggle = (key: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderGroup = (title: string, tasks: PlannerTask[], key: keyof typeof expanded) => (
    <div className="border-b border-border last:border-0 py-2">
      <button
        onClick={() => toggle(key)}
        className="w-full flex items-center justify-between text-left py-1"
      >
        <span className="text-sm font-medium text-foreground">{title}</span>
        {expanded[key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {expanded[key] && (
        <div className="mt-2 space-y-2">
          {tasks.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No tasks</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-secondary/30"
              >
                <span className="font-medium">{task.title}</span>
                <span className="text-muted-foreground">{task.estimatedMinutes}m</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-2">Upcoming</h3>
      {renderGroup("Tomorrow", upcoming.tomorrow, "tomorrow")}
      {renderGroup("Later This Week", upcoming.laterThisWeek, "laterThisWeek")}
      {renderGroup("Next Week", upcoming.nextWeek, "nextWeek")}
      {renderGroup("Future", upcoming.future, "future")}
    </div>
  );
}