"use client";

import { GanttData, GanttTask } from "@/types/visuals";

function parseDay(input: string | Date): number {
  // Convert Date to string (e.g., "Day 1")
  let str = typeof input === "string" ? input : input.toString();
  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export function GanttChart({ data }: { data: GanttData }) {
  const tasks = data.tasks;
  // Convert start/end to day numbers
  const parsed = tasks.map(t => ({
    ...t,
    startDay: parseDay(t.start),
    endDay: parseDay(t.end),
  }));
  const minDay = Math.min(...parsed.map(t => t.startDay));
  const maxDay = Math.max(...parsed.map(t => t.endDay));
  const totalDays = maxDay - minDay + 1;

  const getLeft = (day: number) => ((day - minDay) / totalDays) * 100;
  const getWidth = (start: number, end: number) => ((end - start) / totalDays) * 100;

  return (
    <div className="space-y-4 overflow-x-auto">
      <h3 className="text-xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
        {data.title}
      </h3>
      <div className="min-w-[600px]">
        {/* Header timeline – show day numbers */}
        <div className="flex mb-2 text-xs text-muted-foreground">
          {Array.from({ length: totalDays }, (_, i) => (
            <div key={i} className="flex-1 text-center border-r border-border">
              Day {minDay + i}
            </div>
          ))}
        </div>
        {/* Tasks */}
        <div className="space-y-2">
          {parsed.map((task) => {
            const left = getLeft(task.startDay);
            const width = getWidth(task.startDay, task.endDay);
            return (
              <div key={task.id} className="relative h-8">
                <div className="absolute left-0 w-32 text-sm truncate text-foreground">
                  {task.name}
                </div>
                <div className="ml-32 h-full relative">
                  <div
                    className="absolute h-6 rounded bg-accent/70 hover:bg-accent transition-colors group"
                    style={{ left: `${left}%`, width: `${width}%`, top: "1px" }}
                  >
                    <div className="invisible group-hover:visible absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-1 rounded whitespace-nowrap">
                      {task.name}: {task.progress ?? 0}%
                    </div>
                    {task.progress !== undefined && (
                      <div
                        className="h-full bg-accent rounded"
                        style={{ width: `${task.progress}%` }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}