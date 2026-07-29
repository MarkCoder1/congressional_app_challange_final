"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, BookOpen } from "lucide-react";
import type { Task } from "@/types/task";

interface UpcomingWorkloadProps {
  tasks: Task[];
}

interface GroupedTasks {
  label: string;
  dateLabel: string;
  tasks: Task[];
}

export function UpcomingWorkload({ tasks }: UpcomingWorkloadProps) {
  const activeWithDeadlines = tasks.filter(
    (t) =>
      t.deadline &&
      (t.progress ?? 0) < 100 &&
      t.status !== "completed",
  );

  const groups = groupByTimeframe(activeWithDeadlines);

  if (groups.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="card-dashboard"
    >
      <h3 className="card-title mb-4">
        <Calendar size={18} className="text-accent" />
        Upcoming
      </h3>

      <div className="space-y-4">
        {groups.map((group, gi) => (
          <motion.div
            key={group.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + gi * 0.1, duration: 0.4 }}
          >
            <p className="uppercase-label mb-2">
              {group.dateLabel}
            </p>
            <div className="space-y-2">
              {group.tasks.map((task, ti) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + gi * 0.1 + ti * 0.05 }}
                  className="flex items-center gap-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg px-3.5 py-2.5 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={15} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">
                      {task.title}
                    </p>
                    <p className="caption">{task.subject}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                    <Clock size={12} />
                    <span>{formatMinutes(task.estimatedMinutes ?? 0)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function groupByTimeframe(tasks: Task[]): GroupedTasks[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

  const groups: { label: string; dateLabel: string; tasks: Task[] }[] = [];

  const tomorrowTasks = tasks.filter((t) => {
    const d = toDate(t.deadline!);
    return d >= tomorrow && d < dayAfter;
  });
  if (tomorrowTasks.length > 0) {
    groups.push({ label: "tomorrow", dateLabel: "Tomorrow", tasks: tomorrowTasks });
  }

  const thisWeekTasks = tasks.filter((t) => {
    const d = toDate(t.deadline!);
    return d >= dayAfter && d <= endOfWeek;
  });
  if (thisWeekTasks.length > 0) {
    groups.push({ label: "this-week", dateLabel: "Later This Week", tasks: thisWeekTasks });
  }

  const nextWeekTasks = tasks.filter((t) => {
    const d = toDate(t.deadline!);
    const nextWeekStart = new Date(endOfWeek);
    nextWeekStart.setDate(nextWeekStart.getDate() + 1);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
    return d >= nextWeekStart && d <= nextWeekEnd;
  });
  if (nextWeekTasks.length > 0) {
    groups.push({ label: "next-week", dateLabel: "Next Week", tasks: nextWeekTasks });
  }

  const futureTasks = tasks.filter((t) => {
    const d = toDate(t.deadline!);
    const farFuture = new Date(today);
    farFuture.setDate(farFuture.getDate() + 14);
    return d > farFuture;
  });
  if (futureTasks.length > 0) {
    groups.push({ label: "future", dateLabel: "In 2+ Weeks", tasks: futureTasks });
  }

  return groups;
}

function toDate(dateStr: string): Date {
  return new Date(dateStr);
}

function formatMinutes(minutes: number): string {
  if (!minutes) return "0m";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
