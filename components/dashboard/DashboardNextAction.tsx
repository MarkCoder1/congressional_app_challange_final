"use client";

import Link from "next/link";
import { Brain, Clock, Target, Lightbulb, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { NextActionResult } from "@/features/planner/types";

interface DashboardNextActionProps {
  nextAction: NextActionResult | null;
}

export function DashboardNextAction({ nextAction }: DashboardNextActionProps) {
  if (!nextAction) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-green-50 via-card to-card border border-green-200 rounded-3xl p-8 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
            <Brain className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-green-700 uppercase tracking-wider">
              You're all caught up!
            </p>
            <h3 className="text-2xl font-bold mt-1">No recommendations right now</h3>
          </div>
        </div>
        <p className="text-muted-foreground mt-4">
          Complete more tasks to unlock personalized recommendations.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-accent/10 via-card to-card border border-accent/30 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
            <Brain className="text-accent" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-accent uppercase tracking-wider">
              AI Recommendation
            </p>
            <h3 className="text-2xl font-bold mt-1">{nextAction.action}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Priority</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold border ${
              nextAction.priorityScore >= 90
                ? "text-red-600 bg-red-50 border-red-200"
                : nextAction.priorityScore >= 70
                  ? "text-orange-600 bg-orange-50 border-orange-200"
                  : nextAction.priorityScore >= 40
                    ? "text-blue-600 bg-blue-50 border-blue-200"
                    : "text-gray-600 bg-gray-50 border-gray-200"
            }`}
          >
            {nextAction.priorityScore}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Estimated</p>
            <p className="font-semibold">{formatMinutes(nextAction.estimatedMinutes)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Target size={18} className="text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Reason</p>
            <p className="font-semibold">{nextAction.reason}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Lightbulb size={18} className="text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Why Now</p>
            <p className="font-semibold text-sm">{nextAction.explanation}</p>
          </div>
        </div>
      </div>

      <Link
        href={`/task/${nextAction.taskId}`}
        className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-2xl font-medium hover:bg-accent/90 transition-all shadow-md hover:shadow-lg"
      >
        Start Learning <ArrowRight size={18} />
      </Link>
    </motion.div>
  );
}

function formatMinutes(minutes: number | null | undefined): string {
  if (!minutes) return "0m";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}