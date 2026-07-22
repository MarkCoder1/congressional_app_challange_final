"use client";

import { motion } from "framer-motion";
import type { StudyBlockResult } from "@/features/planner/types";

interface TodayTimelineProps {
  blocks: StudyBlockResult[];
  taskStats: {
    total: number;
    completed: number;
    remaining: number;
  };
  onBlockClick: (block: StudyBlockResult) => void;
}

export function TodayTimeline({ blocks, taskStats, onBlockClick }: TodayTimelineProps) {
  const totalMinutes = blocks.reduce((sum, block) => sum + block.duration, 0);

  // Sort blocks by date
  const sortedBlocks = [...blocks].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Today's Progress Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-4 shadow-sm"
        >
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
            Total Study Time
          </p>
          <p className="text-2xl font-bold text-foreground">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-4 shadow-sm"
        >
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
            Sessions Today
          </p>
          <p className="text-2xl font-bold text-foreground">
            {blocks.length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-4 shadow-sm"
        >
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
            Tasks Due
          </p>
          <p className="text-2xl font-bold text-foreground">
            {taskStats.remaining} <span className="text-sm font-normal text-muted-foreground">({taskStats.completed} done)</span>
          </p>
        </motion.div>
      </div>

      {/* Today's Schedule */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Today's Schedule</h3>
        {sortedBlocks.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">No study sessions scheduled for today</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            <div className="divide-y divide-border">
              {sortedBlocks.map((block, idx) => {
                // Since date is just YYYY-MM-DD, show session number instead of time
                const sessionNum = idx + 1;

                return (
                  <motion.div
                    key={block.taskId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => onBlockClick(block)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Session Number */}
                      <div className="flex-shrink-0 w-16 text-right">
                        <p className="text-sm font-bold text-foreground">#{sessionNum}</p>
                        <p className="text-xs text-muted-foreground">{block.duration} min</p>
                      </div>

                      {/* Divider */}
                      <div className="flex-shrink-0 w-px h-12 bg-border" />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-1">
                          {block.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">{block.subject}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-secondary rounded-md capitalize font-medium">
                            {block.type}
                          </span>
                          {block.priorityScore && (
                            <span className="text-xs text-muted-foreground">
                              Priority: {block.priorityScore.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}