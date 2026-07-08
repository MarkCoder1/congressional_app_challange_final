"use client";

import { ScheduledSession } from "@/types/schedule";
import { ScheduleCard } from "./ScheduleCard";

interface AgendaViewProps {
  sessions: ScheduledSession[];
  onComplete?: (id: string) => void;
  onSkip?: (id: string) => void;
}

export function AgendaView({ sessions, onComplete, onSkip }: AgendaViewProps) {
  // Group by date
  const grouped = sessions.reduce((acc, session) => {
    // Extract date from startTime – if startTime is just "HH:MM", we need a date.
    // We'll assume sessions come with a date in the object, but our current ScheduledSession doesn't have date.
    // Fallback: use today's date for all.
    const date = new Date().toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {} as Record<string, ScheduledSession[]>);

  // Sort sessions by start time within each group
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">📋 Agenda</h2>

      {Object.entries(grouped).map(([date, sessions]) => (
        <div key={date} className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>
          {sessions.map((session, idx) => (
            <ScheduleCard
              key={`${session.taskId}-${session.startTime}-${session.durationMinutes}-${idx}`}
              session={session}
              onComplete={onComplete}
              onSkip={onSkip}
            />
          ))}
        </div>
      ))}
    </div>
  );
}