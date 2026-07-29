"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AlertTriangle, Clock, CalendarX } from "lucide-react";
import type { PlannerTask } from "@/features/planner/types";
import { isTaskCompleted } from "@/features/planner/engine/normalizer";

interface DueTimelineProps {
  tasks: PlannerTask[];
  onBlockClick?: (block: any) => void;
}

export function DueTimeline({ tasks, onBlockClick }: DueTimelineProps) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const overdueTasks = tasks.filter((task) => {
    if (!task.deadline) return false;
    if (isTaskCompleted(task)) return false;
    const deadlineDate = new Date(task.deadline).toISOString().split("T")[0];
    return deadlineDate < todayStr;
  });

  const dueTomorrow = tasks.filter((task) => {
    if (!task.deadline) return false;
    if (isTaskCompleted(task)) return false;
    const deadlineDate = new Date(task.deadline).toISOString().split("T")[0];
    return deadlineDate === tomorrowStr;
  });

  const dueThisWeek = tasks.filter((task) => {
    if (!task.deadline) return false;
    if (isTaskCompleted(task)) return false;
    const deadlineDate = new Date(task.deadline).toISOString().split("T")[0];
    return deadlineDate > tomorrowStr && deadlineDate <= weekEndStr;
  });

  const dueLater = tasks.filter((task) => {
    if (!task.deadline) return false;
    if (isTaskCompleted(task)) return false;
    const deadlineDate = new Date(task.deadline).toISOString().split("T")[0];
    return deadlineDate > weekEndStr;
  });

  const getDaysLate = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const diffTime = today.getTime() - deadlineDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderTaskCard = (task: PlannerTask, showDaysLate = false) => {
    const daysLate = showDaysLate ? getDaysLate(task.deadline!) : 0;
    const deadlineDate = task.deadline ? new Date(task.deadline) : null;
    const deadlineStr = deadlineDate?.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-hover p-4"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/task/${task.id}`}
              className="font-semibold text-sm text-foreground hover:text-accent transition-colors line-clamp-1"
            >
              {task.title}
            </Link>
            <p className="caption mt-1">{task.subject}</p>
          </div>
          <span className={`badge capitalize ${task.priority === "urgent" || task.priority === "high" ? "badge-destructive" : "badge-default"}`}>
            {task.priority}
          </span>
        </div>

        <div className="flex items-center gap-3 caption">
          {deadlineStr && (
            <div className="flex items-center gap-1">
              <CalendarX size={14} />
              <span>{deadlineStr}</span>
            </div>
          )}
          {showDaysLate && daysLate > 0 && (
            <div className="flex items-center gap-1 text-destructive font-semibold">
              <AlertTriangle size={14} />
              <span>{daysLate} day{daysLate > 1 ? "s" : ""} late</span>
            </div>
          )}
          {task.estimatedMinutes && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{task.estimatedMinutes} min</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const totalDue = overdueTasks.length + dueTomorrow.length + dueThisWeek.length + dueLater.length;

  if (totalDue === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base p-12 text-center"
      >
        <CalendarX size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">All caught up!</h3>
        <p className="text-muted-foreground">No upcoming deadlines</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {overdueTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-destructive" size={20} />
            <h3 className="text-lg font-bold text-foreground">
              Overdue ({overdueTasks.length})
            </h3>
          </div>
          <div className="space-y-3">
            {overdueTasks.map((task) => renderTaskCard(task, true))}
          </div>
        </div>
      )}

      {dueTomorrow.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-warning" size={20} />
            <h3 className="text-lg font-bold text-foreground">
              Due Tomorrow ({dueTomorrow.length})
            </h3>
          </div>
          <div className="space-y-3">
            {dueTomorrow.map((task) => renderTaskCard(task))}
          </div>
        </div>
      )}

      {dueThisWeek.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CalendarX className="text-accent" size={20} />
            <h3 className="text-lg font-bold text-foreground">
              Due This Week ({dueThisWeek.length})
            </h3>
          </div>
          <div className="space-y-3">
            {dueThisWeek.map((task) => renderTaskCard(task))}
          </div>
        </div>
      )}

      {dueLater.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CalendarX className="text-muted-foreground" size={20} />
            <h3 className="text-lg font-bold text-foreground">
              Due Later ({dueLater.length})
            </h3>
          </div>
          <div className="space-y-3">
            {dueLater.map((task) => renderTaskCard(task))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
