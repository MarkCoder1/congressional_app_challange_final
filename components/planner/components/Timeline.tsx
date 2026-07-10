// /components/planner/components/Timeline.tsx
"use client";

import { TimelineItem } from "@/types/planner";
import { TimelineCard } from "./TimelineCard";
import { Circle, Clock } from "lucide-react";

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  const sorted = [...items].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Clock size={16} className="text-muted-foreground" />
        Today's Timeline
      </h3>
      <div className="relative pl-6 border-l-2 border-border/50">
        {sorted.map((item, idx) => (
          <div key={item.taskId + item.startTime} className="relative mb-4">
            <div className="absolute -left-[22px] top-1.5">
              <Circle size={12} className="fill-accent stroke-accent" />
            </div>
            <TimelineCard item={item} index={idx} />
          </div>
        ))}
      </div>
    </div>
  );
}