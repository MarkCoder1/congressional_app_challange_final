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
      className="bg-card border border-border rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
        <Target size={20} className="text-accent" />
        Today's Progress
      </h3>

      {/* Task completion count */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="text-green-600" size={24} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Tasks completed</p>
          <p className="text-3xl font-bold">
            {completedTasks}
            <span className="text-lg font-normal text-muted-foreground">
              /{totalTasks}
            </span>
          </p>
        </div>
      </div>

      {/* Animated progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Overall progress</span>
          <span className="font-semibold">{progressPercent}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-accent/80 to-accent rounded-full"
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/40 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Study Time</span>
          </div>
          <p className="font-bold text-lg">
            {totalStudyMinutes > 0
              ? `${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`
              : "—"}
          </p>
        </div>
        <div className="bg-secondary/40 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <Brain size={16} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Focus Sessions</span>
          </div>
          <p className="font-bold text-lg">
            {focusSessions > 0 ? focusSessions : "—"}
          </p>
        </div>
        <div className="bg-secondary/40 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-green-600" />
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <p className="font-bold text-lg">{completedTasks}</p>
        </div>
        <div className="bg-secondary/40 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-blue-600" />
            <span className="text-xs text-muted-foreground">In Progress</span>
          </div>
          <p className="font-bold text-lg">{inProgressTasks}</p>
        </div>
      </div>
    </motion.div>
  );
}