"use client";

import { WeeklyPlan } from "@/types/schedule";
import { ScheduleCard } from "./ScheduleCard";

interface WeeklyScheduleProps {
  week: WeeklyPlan[];
  onComplete?: (id: string) => void;
  onSkip?: (id: string) => void;
}

export function WeeklySchedule({ week, onComplete, onSkip }: WeeklyScheduleProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">📆 Weekly Plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {week.map(day => (
          <div
            key={day.date}
            className={`bg-card rounded-xl border p-4 shadow-sm ${
              day.workload === "overloaded"
                ? "border-red-300 bg-red-50 dark:bg-red-950/20"
                : day.workload === "heavy"
                ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20"
                : "border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </h3>
              <span className="text-xs font-medium text-muted-foreground capitalize">
                {day.workload}
              </span>
            </div>

            <div className="space-y-2">
              {day.sessions.length === 0 ? (
                <div className="text-xs text-muted-foreground italic">No sessions</div>
              ) : (
                day.sessions.slice(0, 4).map((session, idx) => (
                  <ScheduleCard
                    key={`${session.taskId}-${session.startTime}-${session.durationMinutes}-${idx}`}
                    session={session}
                    onComplete={onComplete}
                    onSkip={onSkip}
                  />
                ))
              )}
              {day.sessions.length > 4 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{day.sessions.length - 4} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}