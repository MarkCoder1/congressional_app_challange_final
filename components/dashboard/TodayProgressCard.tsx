"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Brain, Target } from "lucide-react";
import type { Task } from "@/types/task";

interface TodayProgressCardProps {
  tasks: Task[];
  totalStudyMinutes?: number;
  focusSessions?: number;
}

export function TodayProgressCard({
  tasks,
  totalStudyMinutes = 0,
  focusSessions = 0,
}: TodayProgressCardProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => t.status === "completed" || (t.progress ?? 0) >= 100,
  ).length;
  const inProgressTasks = tasks.filter(
    (t) => (t.progress ?? 0) > 0 && (t.progress ?? 0) < 100,
  ).length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="card-dashboard"
    >
      <h3 className="card-title mb-4">
        <Target size={18} className="text-accent" />
        Today's Progress
      </h3>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="text-success" size={20} />
        </div>
        <div>
          <p className="caption">Tasks completed</p>
          <p className="text-2xl font-bold">
            {completedTasks}
            <span className="text-base font-normal text-muted-foreground">
              /{totalTasks}
            </span>
          </p>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Overall progress</span>
          <span className="font-semibold">{progressPercent}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="progress-fill"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* <div className="card-stat">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={14} className="text-muted-foreground" />
            <span className="metadata">Study Time</span>
          </div>
          <p className="font-bold text-base">
            {totalStudyMinutes > 0
              ? `${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`
              : "—"}
          </p>
        </div> */}
        {/* <div className="card-stat">
          <div className="flex items-center gap-1.5 mb-1">
            <Brain size={14} className="text-muted-foreground" />
            <span className="metadata">Focus Sessions</span>
          </div>
          <p className="font-bold text-base">
            {focusSessions > 0 ? focusSessions : "—"}
          </p>
        </div> */}
        <div className="card-stat">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 size={14} className="text-success" />
            <span className="metadata">Completed</span>
          </div>
          <p className="font-bold text-base">{completedTasks}</p>
        </div>
        <div className="card-stat">
          <div className="flex items-center gap-1.5 mb-1">
            <Target size={14} className="text-accent" />
            <span className="metadata">In Progress</span>
          </div>
          <p className="font-bold text-base">{inProgressTasks}</p>
        </div>
      </div>
    </motion.div>
  );
}
