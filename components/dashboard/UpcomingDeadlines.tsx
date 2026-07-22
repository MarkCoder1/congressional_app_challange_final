"use client";

import { Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import type { UpcomingState } from "@/features/planner/types";

interface UpcomingDeadlinesProps {
  upcoming: UpcomingState;
}

export function UpcomingDeadlines({ upcoming }: UpcomingDeadlinesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock size={20} className="text-accent" />
        Upcoming Deadlines
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DeadlineCard label="Tomorrow" count={upcoming.tomorrow.tasks.length} minutes={upcoming.tomorrow.estimatedMinutes} />
        <DeadlineCard label="This Week" count={upcoming.laterThisWeek.tasks.length} minutes={upcoming.laterThisWeek.estimatedMinutes} />
        <DeadlineCard label="Next Week" count={upcoming.nextWeek.tasks.length} minutes={upcoming.nextWeek.estimatedMinutes} />
      </div>
    </motion.div>
  );
}

function DeadlineCard({ label, count, minutes }: { label: string; count: number; minutes: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-secondary/50 rounded-xl p-4"
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{count}</p>
      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
        <Calendar size={12} />
        {formatMinutes(minutes)}
      </p>
    </motion.div>
  );
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}