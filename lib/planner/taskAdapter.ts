// /lib/planner/taskAdapter.ts
import { PlannerTask } from "@/types/planner";

export function toPlannerTask(raw: any): PlannerTask {
  const now = new Date();
  const deadline = raw.deadline ? new Date(raw.deadline) : null;
  const isOverdue = deadline ? deadline < now : false;
  const progress = typeof raw.progress === "number" ? raw.progress : 0;

  // Priority estimation based on deadline (rule‑based, not AI)
  let priority: "high" | "medium" | "low" = "medium";
  if (deadline) {
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 2) priority = "high";
    else if (daysUntil <= 5) priority = "medium";
    else priority = "low";
  }
  if (isOverdue) priority = "high";

  // Estimate duration based on type and question count
  let estimatedMinutes = 45;
  if (raw.type === "assignment") estimatedMinutes = 90;
  else if (raw.type === "practice") estimatedMinutes = 30;
  else if (raw.type === "review") estimatedMinutes = 20;

  if (Array.isArray(raw.practice)) estimatedMinutes += raw.practice.length * 3;
  if (Array.isArray(raw.master)) estimatedMinutes += raw.master.length * 5;

  return {
    id: raw.id,
    title: raw.title || "Untitled",
    subject: raw.subject || "General",
    type: raw.type || "lesson",
    progress,
    deadline: raw.deadline || undefined,
    estimatedMinutes,
    priority,
    status: isOverdue ? "overdue" : progress >= 100 ? "completed" : "pending",
    reason: "", // filled later by AI
  };
}

export function toPlannerTasks(rawTasks: any[]): PlannerTask[] {
  return rawTasks.map(toPlannerTask);
}