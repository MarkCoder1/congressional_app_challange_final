// /components/schedule/TaskCard.tsx
"use client";

import Link from "next/link";
import { ScheduledTask } from "@/types/schedule";
import { getSubjectColor } from "@/lib/timeline"; // ✅ now exists
import { Clock, Info, CheckCircle, AlertCircle, FileText, BookOpen } from "lucide-react";
import { useState } from "react";

// (remove the inline subjectColorMap – use getSubjectColor directly)

interface TaskCardProps {
  task: ScheduledTask;
  compact?: boolean;
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const subjectColor = getSubjectColor(task.subject);
  const isOverdue = task.status === "overdue";
  const isCompleted = task.progress >= 80;

  return (
    <Link href={`/task/${task.taskId}`}>
      <div className="group bg-card hover:bg-secondary/50 rounded-lg p-3 border border-border hover:border-accent/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {task.type === "assignment" ? (
                <FileText size={14} className="text-muted-foreground flex-shrink-0" />
              ) : (
                <BookOpen size={14} className="text-muted-foreground flex-shrink-0" />
              )}
              <span className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                {task.title}
              </span>
              {isOverdue && (
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              )}
              {isCompleted && (
                <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${subjectColor}`}>
                {task.subject}
              </span>
              <span className="text-[10px] text-muted-foreground capitalize">{task.type}</span>
            </div>
          </div>
          {!compact && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-semibold text-accent">{task.priorityScore}%</span>
              <span className="text-[10px] text-muted-foreground">priority</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-2 space-y-0.5">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isCompleted ? "bg-green-500" : "bg-accent"
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>

        {/* Time + Info */}
        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{task.estimatedTime}m</span>
          </div>
          {!compact && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowTooltip(!showTooltip);
              }}
              className="hover:text-foreground transition-colors"
            >
              <Info size={12} />
            </button>
          )}
        </div>

        {/* Tooltip for priority reason */}
        {showTooltip && !compact && (
          <div className="absolute z-10 bottom-full left-0 mb-1 w-64 p-2 bg-popover text-popover-foreground rounded-lg shadow-lg border border-border text-xs">
            <p className="font-medium">Why this priority?</p>
            <p className="mt-1">{task.priorityReason}</p>
          </div>
        )}
      </div>
    </Link>
  );
}