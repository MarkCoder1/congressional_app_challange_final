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
} from "lucide-react";
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
        className="bg-gradient-to-br from-green-50 via-card to-card border border-green-200 rounded-3xl p-8 shadow-lg"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
            <Brain className="text-green-600" size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-green-700 uppercase tracking-wider">
              You're all caught up!
            </p>
            <h3 className="text-2xl font-bold mt-1">No tasks remaining</h3>
          </div>
        </div>
        <p className="text-muted-foreground mt-4 ml-[4.25rem]">
          Create a new task to get started.
        </p>
      </motion.div>
    );
  }

  const priorityLabel = getPriorityLabel(priorityScore?.score ?? 0);
  const priorityColor = getPriorityColor(priorityScore?.score ?? 0);
  const daysLeft = getDaysLeft(task.deadline);
  const isOverdue = daysLeft !== null && daysLeft < 0;

  // Generate "Why this task?" reasons from existing data
  const reasons = generateReasons(task, priorityScore, daysLeft);

  const taskTypeIcon = getTaskTypeIcon(task.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gradient-to-br from-accent/[0.07] via-card to-card border border-accent/20 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center"
          >
            <Brain className="text-accent" size={28} />
          </motion.div>
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-[0.15em]">
              Your Next Best Action
            </p>
            <h3 className="text-2xl font-bold mt-1 leading-tight">{task.title}</h3>
          </div>
        </div>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Subject */}
        <div className="bg-secondary/40 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Subject</p>
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-accent" />
            <span className="font-semibold text-sm">{task.subject}</span>
          </div>
        </div>

        {/* Type */}
        <div className="bg-secondary/40 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Type</p>
          <div className="flex items-center gap-2">
            <span className={`p-1 rounded-md ${taskTypeIcon.color}`}>
              <taskTypeIcon.icon size={16} />
            </span>
            <span className="font-semibold text-sm capitalize">{task.type}</span>
          </div>
        </div>

        {/* Priority */}
        <div className="bg-secondary/40 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Priority</p>
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className={priorityColor} />
            <span className={`font-semibold text-sm ${priorityColor}`}>
              {priorityLabel}
            </span>
          </div>
        </div>

        {/* Estimated Duration */}
        <div className="bg-secondary/40 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Estimated</p>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-muted-foreground" />
            <span className="font-semibold text-sm">
              {formatMinutes(task.estimatedMinutes ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Deadline + Progress row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Deadline */}
        <div className="flex items-center gap-3 bg-secondary/30 rounded-xl px-4 py-3">
          <Calendar size={18} className={isOverdue ? "text-red-500" : "text-muted-foreground"} />
          <div>
            <p className="text-xs text-muted-foreground">Deadline</p>
            <p className={`font-semibold ${isOverdue ? "text-red-600" : ""}`}>
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

        {/* Progress */}
        <div className="bg-secondary/30 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Progress</p>
            <p className="text-sm font-bold">{task.progress}%</p>
          </div>
          <div className="h-2.5 bg-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${task.progress}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="h-full bg-accent rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Why This Task? - generated from existing data */}
      {reasons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-accent/[0.04] border border-accent/10 rounded-2xl p-4 mb-6"
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

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Link
          href={`/task/${task.id}`}
          className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-accent/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          Start Learning <ArrowRight size={18} />
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* ─── Helpers ─────────────────────────────────────────── */

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
  if (score >= 90) return "text-red-600";
  if (score >= 70) return "text-orange-600";
  if (score >= 40) return "text-blue-600";
  return "text-gray-500";
}

function getTaskTypeIcon(type: string) {
  switch (type) {
    case "lesson":
      return { icon: BookOpen, color: "bg-blue-100 text-blue-700" };
    case "assignment":
      return { icon: Zap, color: "bg-purple-100 text-purple-700" };
    default:
      return { icon: RefreshCw, color: "bg-gray-100 text-gray-700" };
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

  // Due soon
  if (daysLeft !== null && daysLeft <= 1) {
    reasons.push({
      label: daysLeft <= 0 ? "⚠ Overdue" : "Due soon",
      icon: <Calendar size={14} />,
      color: "bg-red-100 text-red-700 border border-red-200",
    });
  }

  // High difficulty
  if (task.difficulty === "hard") {
    reasons.push({
      label: "High difficulty",
      icon: <AlertTriangle size={14} />,
      color: "bg-orange-100 text-orange-700 border border-orange-200",
    });
  }

  // Large workload
  if ((task.estimatedMinutes ?? 0) > 90) {
    reasons.push({
      label: "Large workload",
      icon: <Clock size={14} />,
      color: "bg-purple-100 text-purple-700 border border-purple-200",
    });
  }

  // High priority score
  if ((priorityScore?.score ?? 0) >= 70) {
    reasons.push({
      label: "High priority",
      icon: <BarChart3 size={14} />,
      color: "bg-blue-100 text-blue-700 border border-blue-200",
    });
  }

  // Already started
  if ((task.progress ?? 0) > 0 && (task.progress ?? 0) < 100) {
    reasons.push({
      label: "In progress",
      icon: <RefreshCw size={14} />,
      color: "bg-green-100 text-green-700 border border-green-200",
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