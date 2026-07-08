"use client";

import { ScheduledSession } from "@/types/schedule";
import { Clock, AlertCircle, CheckCircle, BookOpen } from "lucide-react";
import { useState } from "react";

interface ScheduleCardProps {
  session: ScheduledSession;
  onComplete?: (id: string) => void;
  onSkip?: (id: string) => void;
}

export function ScheduleCard({ session, onComplete, onSkip }: ScheduleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const priorityColors = {
    high: "border-l-4 border-red-500",
    medium: "border-l-4 border-yellow-500",
    low: "border-l-4 border-green-500",
  };

  const priorityLabels = {
    high: "🔴 High",
    medium: "🟡 Medium",
    low: "🟢 Low",
  };

  return (
    <div
      className={`bg-card rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition-all duration-200 ${priorityColors[session.priority]}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground truncate">
              {session.title}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{session.subject}</span>
            <span>•</span>
            <span className="capitalize">{session.type}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {session.durationMinutes}m
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground italic line-clamp-2">
            {session.reason}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary">
            {priorityLabels[session.priority]}
          </span>
          {isHovered && (
            <div className="flex gap-1">
              <button
                onClick={() => onComplete?.(session.taskId)}
                className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
                title="Complete"
              >
                <CheckCircle size={14} />
              </button>
              <button
                onClick={() => onSkip?.(session.taskId)}
                className="p-1 rounded hover:bg-yellow-100 text-yellow-600 transition-colors"
                title="Skip"
              >
                <AlertCircle size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}