"use client";

import Link from "next/link";
import { AlertTriangle, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import type { OverdueState } from "@/features/planner/types";

interface OverdueTasksProps {
  overdue: OverdueState;
}

export function OverdueTasks({ overdue }: OverdueTasksProps) {
  if (overdue.tasks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-red-50 border border-red-200 rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-700">
        <AlertTriangle size={20} />
        Overdue Tasks ({overdue.count})
      </h3>

      <div className="space-y-3">
        {overdue.tasks.slice(0, 5).map((task, idx) => {
          const daysOverdue = getDaysLeft(task.deadline);

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Link
                href={`/task/${task.id}`}
                className="flex items-center justify-between bg-white rounded-xl p-4 hover:bg-red-50 transition-all"
              >
                <div>
                  <h4 className="font-semibold">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">{task.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">
                    {daysOverdue !== null ? `${Math.abs(daysOverdue)} days overdue` : "Overdue"}
                  </p>
                  <button
                    type="button"
                    className="text-xs text-accent hover:underline mt-1"
                    onClick={(e) => {
                      e.preventDefault();
                      // Placeholder for resume action
                    }}
                  >
                    Resume
                  </button>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
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