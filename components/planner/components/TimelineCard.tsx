// /components/planner/components/TimelineCard.tsx
"use client";

import Link from "next/link";
import { TimelineItem } from "@/types/planner";
import { Clock, BookOpen } from "lucide-react";

interface TimelineCardProps {
  item: TimelineItem;
  index: number;
}

export function TimelineCard({ item, index }: TimelineCardProps) {
  const priorityColors = {
    high: "border-l-4 border-red-500",
    medium: "border-l-4 border-yellow-500",
    low: "border-l-4 border-green-500",
  };

  const actionLabels = {
    study: "Study",
    practice: "Practice",
    review: "Review",
    research: "Research",
    write: "Write",
  };

  return (
    <Link href={`/task/${item.taskId}`} className="block">
      <div
        className={`bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all cursor-pointer group ${priorityColors[item.priority]}`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground capitalize">
                  {actionLabels[item.action]}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{item.duration}m</span>
              </div>
              <h4 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate mt-1">
                {item.title} {/* 👈 now shows the real task title */}
              </h4>
              <div className="mt-1 text-xs text-muted-foreground italic line-clamp-2">
                {item.reason}
              </div>
            </div>
            <div className="flex-shrink-0 ml-2">
              <Clock size={14} className="text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}