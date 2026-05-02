"use client";

import { TimelineInput } from "@/lib/visualInputs";

function isTimelineInput(data: unknown): data is TimelineInput {
  if (!data || typeof data !== "object") return false;
  return Array.isArray((data as TimelineInput).events);
}

export function TimelineView({ data }: { data: unknown }) {
  if (!isTimelineInput(data) || data.events.length === 0) {
    return <p className="text-sm text-muted-foreground">Timeline data is invalid.</p>;
  }

  return (
    <div className="space-y-4">
      {data.events.map((event, idx) => (
        <div key={`${event.date}-${event.title}`} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-accent mt-2" />
            {idx < data.events.length - 1 ? <div className="w-px flex-1 bg-border min-h-10" /> : null}
          </div>
          <div className="rounded-lg border border-border p-3 flex-1">
            <p className="text-xs text-muted-foreground">{event.date}</p>
            <p className="font-semibold">{event.title}</p>
            <p className="text-sm text-muted-foreground">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
