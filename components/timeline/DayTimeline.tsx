"use client";

import { motion } from "framer-motion";
import { StudyBlock } from "./StudyBlock";
import { formatPlannerDateKey } from "@/features/planner/engine/normalizer";
import type { StudyBlockResult } from "@/features/planner/types";

interface DayTimelineProps {
  blocks: StudyBlockResult[];
  selectedDate?: Date;
  onBlockClick: (block: StudyBlockResult) => void;
}

export function DayTimeline({ blocks, selectedDate, onBlockClick }: DayTimelineProps) {
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

  const formatHour = (hour: number) => {
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  // Filter blocks by selected date if provided
  const selectedDateStr = selectedDate ? formatPlannerDateKey(selectedDate) : undefined;
  const filteredBlocks = selectedDateStr
    ? blocks.filter((block) => block.date === selectedDateStr)
    : blocks;

  // Sort blocks by date (they only have date, not time)
  const sortedBlocks = [...filteredBlocks].sort((a, b) => a.date.localeCompare(b.date));

  // Calculate positions to avoid overlap - stack blocks vertically
  const blockPositions = sortedBlocks.map((block, idx) => {
    // Each block gets its own row, starting at 8 AM
    const startHour = 8;
    const topPosition = idx * 100; // 100px per block row
    const blockHeight = Math.max(80, (block.duration / 60) * 80);
    return { topPosition, blockHeight };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg"
    >
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Timeline Container */}
          <div className="flex">
            {/* Time Labels Column */}
            <div className="w-20 flex-shrink-0 border-r border-border bg-gradient-to-b from-secondary/40 to-secondary/20">
              <div className="h-16" /> {/* Spacer for header alignment */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-24 border-b border-border/40 flex items-start justify-center pt-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>

            {/* Timeline Grid Column */}
            <div className="flex-1 relative bg-gradient-to-b from-background to-secondary/5">
              {/* Grid Background */}
              <div className="absolute inset-0 pointer-events-none">
                {hours.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-24 border-b border-border/30"
                  />
                ))}
              </div>

              {/* Current Time Indicator */}
              {(() => {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                if (currentHour >= 8 && currentHour <= 22) {
                  const topPosition = ((currentHour - 8) * 60 + currentMinute) * (24 / 60);
                  return (
                    <div
                      className="absolute left-0 right-0 z-10 pointer-events-none"
                      style={{ top: `${64 + topPosition}px` }}
                    >
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 relative z-10" />
                        <div className="flex-1 h-0.5 bg-red-500" />
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Task Blocks Container - Stacked vertically to avoid overlap */}
              <div className="relative">
                {sortedBlocks.length === 0 ? (
                  <div className="flex items-center justify-center h-96 text-muted-foreground">
                    <p>No study sessions scheduled for this day</p>
                  </div>
                ) : (
                  sortedBlocks.map((block, idx) => {
                    const { topPosition, blockHeight } = blockPositions[idx];

                    return (
                      <motion.div
                        key={`${block.taskId}-${idx}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        style={{
                          position: "absolute",
                          top: `${topPosition}px`,
                          left: "16px",
                          right: "16px",
                          height: `${blockHeight}px`,
                        }}
                      >
                        <StudyBlock
                          block={block}
                          onClick={() => onBlockClick(block)}
                        />
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}