"use client";

import { Calendar, BookOpen, Zap, RefreshCw, Target, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { StudyBlockResult } from "@/features/planner/types";

interface TodayStudyPlanProps {
  blocks: StudyBlockResult[];
}

const studyTypeConfig = {
  learn: { icon: BookOpen, color: "text-blue-600 bg-blue-50" },
  practice: { icon: Zap, color: "text-orange-600 bg-orange-50" },
  review: { icon: RefreshCw, color: "text-purple-600 bg-purple-50" },
  work: { icon: Target, color: "text-green-600 bg-green-50" },
};

export function TodayStudyPlan({ blocks }: TodayStudyPlanProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar size={20} className="text-accent" />
          Today's Study Plan
        </h3>
        <span className="text-sm text-muted-foreground">
          {blocks.length} {blocks.length === 1 ? "block" : "blocks"}
        </span>
      </div>

      {blocks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar size={32} className="mx-auto mb-2 opacity-50" />
          <p>No study blocks scheduled for today</p>
          <p className="text-sm mt-1">Your schedule will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, idx) => {
            const config = studyTypeConfig[block.type] || studyTypeConfig.work;
            const Icon = config.icon;

            return (
              <motion.div
                key={`${block.taskId}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex items-center gap-4 bg-secondary/50 rounded-xl p-4 hover:bg-secondary transition-all hover:scale-[1.02]"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{block.title}</h4>
                  <p className="text-sm text-muted-foreground">{block.subject}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Clock size={14} className="text-muted-foreground" />
                    {formatMinutes(block.duration)}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{block.type}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}