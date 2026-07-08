"use client";

import { DailyPlan } from "@/types/schedule";
import { ScheduleCard } from "./ScheduleCard";

interface DailyScheduleProps {
  plan: DailyPlan;
  onComplete?: (id: string) => void;
  onSkip?: (id: string) => void;
}

export function DailySchedule({ plan, onComplete, onSkip }: DailyScheduleProps) {
  // Sort sessions by start time
  const sorted = [...plan.sessions].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            📅 {new Date(plan.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h2>
          <p className="text-sm text-muted-foreground">{plan.summary}</p>
        </div>
        {plan.focusTask && (
          <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">
            ⭐ Focus Task
          </span>
        )}
      </div>

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sessions scheduled for today.
          </div>
        ) : (
          sorted.map((session, idx) => (
            <ScheduleCard
              key={`${session.taskId}-${session.startTime}-${session.durationMinutes}-${idx}`}
              session={session}
              onComplete={onComplete}
              onSkip={onSkip}
            />
          ))
        )}
      </div>
    </div>
  );
}