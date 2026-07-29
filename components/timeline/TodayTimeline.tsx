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

function formatPriorityLabel(score: number): string {
  const rounded = Math.round(score);
  if (rounded >= 90) return "Critical";
  if (rounded >= 70) return "High";
  if (rounded >= 40) return "Medium";
  return "Low";
}

export function TodayTimeline({ blocks, taskStats, onBlockClick }: TodayTimelineProps) {
  const totalMinutes = blocks.reduce((sum, block) => sum + block.duration, 0);

  const sortedBlocks = [...blocks].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-base p-4">
          <p className="uppercase-label mb-1">Total Study Time</p>
          <p className="text-2xl font-bold text-foreground">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </p>
        </div>

        <div className="card-base p-4">
          <p className="uppercase-label mb-1">Sessions Today</p>
          <p className="text-2xl font-bold text-foreground">
            {blocks.length}
          </p>
        </div>

        <div className="card-base p-4">
          <p className="uppercase-label mb-1">Tasks Due</p>
          <p className="text-2xl font-bold text-foreground">
            {taskStats.remaining} <span className="text-sm font-normal text-muted-foreground">({taskStats.completed} done)</span>
          </p>
        </div>
      </div>

      <div>
        <h3 className="card-title mb-4">Today's Schedule</h3>
        {sortedBlocks.length === 0 ? (
          <div className="card-base p-8 text-center">
            <p className="text-muted-foreground">No study sessions scheduled for today</p>
          </div>
        ) : (
          <div className="card-base overflow-hidden">
            <div className="divide-y divide-border">
              {sortedBlocks.map((block, idx) => {
                const sessionNum = idx + 1;

                return (
                  <motion.div
                    key={`${block.taskId}-${block.date}-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => onBlockClick(block)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 text-right">
                        <p className="text-sm font-bold text-foreground">#{sessionNum}</p>
                        <p className="caption">{block.duration} min</p>
                      </div>

                      <div className="flex-shrink-0 w-px h-12 bg-border" />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-1">
                          {block.title}
                        </h4>
                        <p className="caption mb-2">{block.subject}</p>
                        <div className="flex items-center gap-2">
                          <span className="badge-default capitalize">{block.type}</span>
                          {block.priorityScore != null && (
                            <span className="metadata">
                              Priority: {formatPriorityLabel(block.priorityScore)}
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
