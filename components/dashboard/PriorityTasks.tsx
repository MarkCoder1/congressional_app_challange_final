"use client";

import Link from "next/link";
import { BarChart3, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import type { PlannerTask, TaskPriorityScore } from "@/features/planner/types";

interface PriorityTasksProps {
  tasks: PlannerTask[];
  priorityScores: TaskPriorityScore[];
}

export function PriorityTasks({ tasks, priorityScores }: PriorityTasksProps) {
  const topTasks = [...tasks]
    .sort((a, b) => {
      const scoreA = priorityScores.find((p) => p.taskId === a.id)?.score ?? 0;
      const scoreB = priorityScores.find((p) => p.taskId === b.id)?.score ?? 0;
      return scoreB - scoreA;
    })
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart3 size={20} className="text-accent" />
        Priority Tasks
      </h3>

      {topTasks.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No active tasks</p>
      ) : (
        <div className="space-y-3">
          {topTasks.map((task, idx) => {
            const priority = priorityScores.find((p) => p.taskId === task.id);
            const score = priority?.score ?? 0;
            const daysLeft = getDaysLeft(task.deadline);

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Link
                  href={`/task/${task.id}`}
                  className="block bg-secondary/50 hover:bg-secondary rounded-xl p-4 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 ${getPriorityColor(score)}`}
                    >
                      <span className="text-lg font-bold">{score}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.subject}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {task.deadline && (
                          <span
                            className={`text-xs flex items-center gap-1 ${daysLeft !== null && daysLeft < 0 ? "text-error" : "text-muted-foreground"}`}
                          >
                            <Calendar size={12} />
                            {daysLeft === null || daysLeft < 0
                              ? "Overdue"
                              : daysLeft === 0
                                ? "Due today"
                                : `Due in ${daysLeft} days`}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{task.progress}% complete</span>
                      </div>
                    </div>
                    <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className={`h-full rounded-full ${getPriorityBadgeColor(score)}`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function getDaysLeft(deadline: string | null): number | null {
  if (!deadline) return null;
  const due = new Date(deadline);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
  return diffDays;
}

function getPriorityColor(score: number): string {
  if (score >= 90) return "text-error bg-error-tint border-error/20";
  if (score >= 70) return "text-warning bg-warning-tint border-warning/20";
  if (score >= 40) return "text-primary bg-primary-tint border-primary/20";
  return "text-secondary bg-sunken border-border";
}

function getPriorityBadgeColor(score: number): string {
  if (score >= 90) return "bg-error";
  if (score >= 70) return "bg-warning";
  if (score >= 40) return "bg-primary";
  return "bg-border-strong";
}