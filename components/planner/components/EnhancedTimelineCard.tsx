// /components/planner/components/EnhancedTimelineCard.tsx
"use client";

import Link from "next/link";
import { TimelineItem } from "@/types/planner";
import { Clock, BookOpen, CheckCircle, SkipForward, CalendarPlus, ExternalLink } from "lucide-react";
import { useState } from "react";

interface EnhancedTimelineCardProps {
  item: TimelineItem;
  onComplete: (taskId: string) => void;
  onSkip: (taskId: string) => void;
  onMoveTomorrow: (taskId: string) => void;
}

export function EnhancedTimelineCard({ item, onComplete, onSkip, onMoveTomorrow }: EnhancedTimelineCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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

  const subjectColors: Record<string, string> = {
    Math: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
    Science: "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300",
    History: "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
    English: "bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300",
    Biology: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
    Physics: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-300",
    Chemistry: "bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300",
    Programming: "bg-violet-100 text-violet-800 dark:bg-violet-950/30 dark:text-violet-300",
    General: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300",
  };

  const subjectColor = subjectColors[item.subject] || subjectColors.General;

  const progressColor = item.progress >= 80 ? "text-green-600" : item.progress >= 40 ? "text-yellow-600" : "text-red-600";

  return (
    <div
      className={`bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all group ${priorityColors[item.priority]}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${subjectColor}`}>
                {item.subject}
              </span>
              <span className="text-xs font-medium text-muted-foreground capitalize">
                {actionLabels[item.action]}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{item.duration}m</span>
              <span className={`text-xs font-medium ${progressColor}`}>
                {item.progress}%
              </span>
              {item.deadline && (
                <span className="text-xs text-muted-foreground">
                  Due {new Date(item.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
            <Link href={`/task/${item.taskId}`} className="block">
              <h4 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate mt-1">
                {item.title}
              </h4>
            </Link>
            <div className="mt-1 text-xs text-muted-foreground italic line-clamp-2">
              {item.reason}
            </div>
          </div>

          {/* Action buttons – appear on hover */}
          <div className={`flex-shrink-0 flex items-center gap-1 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}>
            <Link href={`/task/${item.taskId}`} className="p-1.5 rounded hover:bg-secondary transition-colors" title="Open Task">
              <ExternalLink size={16} className="text-muted-foreground" />
            </Link>
            <button
              onClick={() => onComplete(item.taskId)}
              className="p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors"
              title="Mark Complete"
            >
              <CheckCircle size={16} className="text-green-600" />
            </button>
            <button
              onClick={() => onSkip(item.taskId)}
              className="p-1.5 rounded hover:bg-yellow-100 dark:hover:bg-yellow-950/30 transition-colors"
              title="Skip Today"
            >
              <SkipForward size={16} className="text-yellow-600" />
            </button>
            <button
              onClick={() => onMoveTomorrow(item.taskId)}
              className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
              title="Move to Tomorrow"
            >
              <CalendarPlus size={16} className="text-blue-600" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}