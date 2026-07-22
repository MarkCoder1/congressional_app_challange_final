"use client";

import { motion } from "framer-motion";
import { StudyBlock } from "./StudyBlock";
import { formatPlannerDateKey } from "@/features/planner/engine/normalizer";
import type { StudyBlockResult } from "@/features/planner/types";

interface WeekTimelineProps {
  blocks: StudyBlockResult[];
  selectedDate?: Date;
  onBlockClick: (block: StudyBlockResult) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekStart(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const dayOfWeek = result.getDay();
  const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  result.setDate(result.getDate() + offset);
  return result;
}

export function WeekTimeline({ blocks, selectedDate, onBlockClick }: WeekTimelineProps) {
  const today = new Date();
  const weekStart = selectedDate ? getWeekStart(selectedDate) : getWeekStart(today);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  const getBlocksForDate = (date: Date) => {
    const dateStr = formatPlannerDateKey(date);
    return blocks.filter((block) => block.date === dateStr);
  };

  const isCurrentWeek = (date: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return date >= weekStart && date <= weekEnd;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {weekDays.map((date, idx) => {
          const dayBlocks = getBlocksForDate(date);
          const isToday = date.toDateString() === today.toDateString();
          const isSelectedWeek = isCurrentWeek(date);
          const totalMinutes = dayBlocks.reduce((sum, block) => sum + block.duration, 0);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`p-4 min-h-[200px] ${
                isToday ? "bg-accent/5" : isSelectedWeek ? "bg-background" : "bg-secondary/20"
              }`}
            >
              {/* Day Header */}
              <div className="text-center mb-4 pb-3 border-b border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {DAYS[date.getDay()]}
                </p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <p className={`text-2xl font-bold ${isToday ? "text-accent" : "text-foreground"}`}>
                    {date.getDate()}
                  </p>
                  {isToday && (
                    <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full font-semibold">
                      Today
                    </span>
                  )}
                </div>
                {totalMinutes > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                  </p>
                )}
              </div>

              {/* Blocks */}
              <div className="space-y-2">
                {dayBlocks.length === 0 ? (
                  <p className="text-xs text-center text-muted-foreground py-4">
                    No sessions
                  </p>
                ) : (
                  <>
                    {dayBlocks.slice(0, 2).map((block, blockIdx) => (
                      <motion.div
                        key={`${block.taskId}-${blockIdx}`}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => onBlockClick(block)}
                        className="cursor-pointer"
                      >
                        <StudyBlock block={block} />
                      </motion.div>
                    ))}
                    {dayBlocks.length > 2 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="text-xs text-center text-accent font-semibold w-full py-2 hover:bg-accent/5 rounded-lg transition-colors"
                      >
                        +{dayBlocks.length - 2} more
                      </motion.button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
