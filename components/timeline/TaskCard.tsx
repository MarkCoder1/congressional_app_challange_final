// /components/timeline/TaskCard.tsx
"use client";

import Link from "next/link";
import { TimelineTask } from "@/types/timeline";
import { getSubjectColor } from "@/lib/timeline";
import { BookOpen, FileText, Calendar } from "lucide-react";

interface TaskCardProps {
  task: TimelineTask;
}

export function TaskCard({ task }: TaskCardProps) {
  const subjectColor = getSubjectColor(task.subject);
  const isCompleted = task.progress >= 80;

  return (
    <Link href={`/task/${task.id}`}>
      <div className="group bg-card hover:bg-secondary/50 rounded-lg p-3 border border-border hover:border-accent/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
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
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${subjectColor}`}>
                {task.subject}
              </span>
              <span className="text-[10px] text-muted-foreground capitalize">
                {task.type}
              </span>
            </div>
          </div>
          {isCompleted && (
            <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
              ✓ Done
            </span>
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

        {/* Date */}
        <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
          <Calendar size={12} />
          <span>{new Date(task.date).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}