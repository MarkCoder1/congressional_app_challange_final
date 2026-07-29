"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Clock,
  Calendar,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  BookOpen,
  Zap,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import type { Task } from "@/types/task";
import type { TaskPriorityScore } from "@/features/planner/types";

interface NextActionCardProps {
  task: Task | null;
  priorityScore: TaskPriorityScore | undefined;
}

export function NextActionCard({ task, priorityScore }: NextActionCardProps) {
  if (!task) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-base p-6"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Brain className="text-accent" size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-wider">
              You're all caught up!
            </p>
            <h3 className="text-xl font-bold mt-1">No tasks remaining</h3>
          </div>
        </div>
        <p className="caption mt-3 ml-[4rem]">
          Create a new task to get started.
        </p>
      </motion.div>
    );
  }

  const priorityLabel = getPriorityLabel(priorityScore?.score ?? 0);
  const priorityColor = getPriorityColor(priorityScore?.score ?? 0);
  const daysLeft = getDaysLeft(task.deadline);
  const isOverdue = daysLeft !== null && daysLeft < 0;

  const reasons = generateReasons(task, priorityScore, daysLeft);

  const taskTypeIcon = getTaskTypeIcon(task.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="card-base p-6"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center"
          >
            <Brain className="text-accent" size={24} />
          </motion.div>
            <div>
                <div className="flex items-center gap-1.5">
                  <p className="uppercase-label">
                    Your Next Best Action
                  </p>
                  <Tooltip content="Your most important learning step based on deadlines, difficulty, and priority." side="top">
                    <HelpCircle size={12} className="text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <h3 className="page-title mt-1">{task.title}</h3>
              </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card-inset">
          <p className="caption mb-1">Subject</p>
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-accent" />
            <span className="text-sm font-semibold">{task.subject}</span>
          </div>
        </div>

        <div className="card-inset">
          <p className="caption mb-1">Type</p>
          <div className="flex items-center gap-2">
            <span className={`p-1 rounded-md ${taskTypeIcon.color}`}>
              <taskTypeIcon.icon size={16} />
            </span>
            <span className="text-sm font-semibold capitalize">{task.type}</span>
          </div>
        </div>

        <div className="card-inset">
          <p className="caption mb-1">Priority</p>
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className={priorityColor} />
            <span className={`text-sm font-semibold ${priorityColor}`}>
              {priorityLabel}
            </span>
          </div>
        </div>

        <div className="card-inset">
          <p className="caption mb-1">Estimated</p>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-muted-foreground" />
            <span className="text-sm font-semibold">
              {formatMinutes(task.estimatedMinutes ?? 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="flex items-center gap-3 bg-secondary/30 rounded-xl px-4 py-3">
          <Calendar size={18} className={isOverdue ? "text-destructive" : "text-muted-foreground"} />
          <div>
            <p className="caption">Deadline</p>
            <p className={`text-sm font-semibold ${isOverdue ? "text-destructive" : ""}`}>
              {task.deadline
                ? isOverdue
                  ? `Overdue by ${Math.abs(daysLeft!)} days`
                  : daysLeft === 0
                    ? "Due today"
                    : daysLeft === 1
                      ? "Tomorrow"
                      : `In ${daysLeft} days`
                : "No deadline"}
            </p>
          </div>
        </div>

        <div className="bg-secondary/30 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="caption">Progress</p>
            <p className="text-sm font-bold">{task.progress}%</p>
          </div>
          <div className="progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${task.progress}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="progress-fill"
            />
          </div>
        </div>
      </div>

      {reasons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-accent/[0.04] border border-accent/10 rounded-xl p-4 mb-6"
        >
          <p className="text-sm font-semibold text-accent mb-3 flex items-center gap-2">
            <Brain size={16} />
            Why this task now?
          </p>
          <div className="flex flex-wrap gap-2">
            {reasons.map((reason, i) => (
              <motion.span
                key={reason.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${reason.color}`}
              >
                <span>{reason.icon}</span>
                <span>{reason.label}</span>
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Link
          href={`/task/${task.id}`}
          className="btn-primary inline-flex"
        >
          Start Learning <ArrowRight size={16} />
        </Link>
      </motion.div>
    </motion.div>
  );
}

function getDaysLeft(deadline?: string): number | null {
  if (!deadline) return null;
  const due = new Date(deadline);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
}

function getPriorityLabel(score: number): string {
  if (score >= 90) return "Critical";
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function getPriorityColor(score: number): string {
  if (score >= 90) return "text-destructive";
  if (score >= 70) return "text-warning";
  if (score >= 40) return "text-accent";
  return "text-muted-foreground";
}

function getTaskTypeIcon(type: string) {
  switch (type) {
    case "lesson":
      return { icon: BookOpen, color: "bg-primary-tint text-primary" };
    case "assignment":
      return { icon: Zap, color: "bg-ai-violet-tint text-ai-violet" };
    default:
      return { icon: RefreshCw, color: "bg-secondary text-muted-foreground" };
  }
}

interface Reason {
  label: string;
  icon: React.ReactNode;
  color: string;
}

function generateReasons(
  task: Task,
  priorityScore: TaskPriorityScore | undefined,
  daysLeft: number | null,
): Reason[] {
  const reasons: Reason[] = [];

  if (daysLeft !== null && daysLeft <= 1) {
    reasons.push({
      label: daysLeft <= 0 ? "Overdue" : "Due soon",
      icon: <Calendar size={14} />,
      color: "bg-destructive/10 text-destructive",
    });
  }

  if (task.difficulty === "hard") {
    reasons.push({
      label: "High difficulty",
      icon: <AlertTriangle size={14} />,
      color: "bg-warning/10 text-warning",
    });
  }

  if ((task.estimatedMinutes ?? 0) > 90) {
    reasons.push({
      label: "Large workload",
      icon: <Clock size={14} />,
      color: "bg-ai-violet-tint text-ai-violet",
    });
  }

  if ((priorityScore?.score ?? 0) >= 70) {
    reasons.push({
      label: "High priority",
      icon: <BarChart3 size={14} />,
      color: "bg-accent/10 text-accent",
    });
  }

  if ((task.progress ?? 0) > 0 && (task.progress ?? 0) < 100) {
    reasons.push({
      label: "In progress",
      icon: <RefreshCw size={14} />,
      color: "bg-success/10 text-success",
    });
  }

  return reasons;
}

function formatMinutes(minutes: number): string {
  if (!minutes) return "0m";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
