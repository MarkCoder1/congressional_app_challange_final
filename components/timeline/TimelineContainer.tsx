"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TimelineHeader } from "./TimelineHeader";
import { DayTimeline } from "./DayTimeline";
import { WeekTimeline } from "./WeekTimeline";
import { TodayTimeline } from "./TodayTimeline";
import { DueTimeline } from "./DueTimeline";
import { TimelineSidebar } from "./TimelineSidebar";
import { TimelineLeftSidebar } from "./TimelineLeftSidebar";
import { EmptyTimeline } from "./EmptyTimeline";
import { TimelineSkeleton } from "./TimelineSkeleton";
import { isTaskCompleted, formatPlannerDateKey } from "@/features/planner/engine/normalizer";
import type { StudyBlockResult, PlannerTask } from "@/features/planner/types";

interface TimelineContainerProps {
  blocks: StudyBlockResult[];
  tasks: PlannerTask[];
  loading?: boolean;
}

type TimelineView = "today" | "day" | "week" | "due";

export function TimelineContainer({ blocks, tasks, loading }: TimelineContainerProps) {
  const [view, setView] = useState<TimelineView>("today");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBlock, setSelectedBlock] = useState<StudyBlockResult | null>(null);

  // Single filtering pipeline - derive all state from blocks (which are already filtered by planner)
  const activeTasks = useMemo(() => {
    return tasks.filter((task) => !isTaskCompleted(task));
  }, [tasks]);

  const selectedDateStr = useMemo(() => {
    return formatPlannerDateKey(selectedDate);
  }, [selectedDate]);

  const todayStr = useMemo(() => {
    return formatPlannerDateKey(new Date());
  }, []);

  // Today's blocks - already filtered by planner to exclude completed tasks
  const todayBlocks = useMemo(() => {
    return blocks.filter((block) => block.date === todayStr);
  }, [blocks, todayStr]);

  // Selected day blocks - for day view and calendar selection
  const selectedDayBlocks = useMemo(() => {
    return blocks.filter((block) => block.date === selectedDateStr);
  }, [blocks, selectedDateStr]);

  // Upcoming blocks (future dates only)
  const upcomingBlocks = useMemo(() => {
    return blocks
      .filter((block) => block.date > todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [blocks, todayStr]);

  // Today's task stats (from tasks, not blocks)
  const todayTaskStats = useMemo(() => {
    const tasksDueToday = tasks.filter((task) => {
      if (!task.deadline) return false;
      const taskDate = formatPlannerDateKey(new Date(task.deadline));
      return taskDate === todayStr;
    });
    const completedToday = tasksDueToday.filter((task) => isTaskCompleted(task)).length;
    return {
      total: tasksDueToday.length,
      completed: completedToday,
      remaining: tasksDueToday.length - completedToday,
    };
  }, [tasks, todayStr]);

  if (loading) {
    return <TimelineSkeleton />;
  }

  // Show empty state only if we have no tasks at all
  if (tasks.length === 0) {
    return <EmptyTimeline />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Timeline</h1>
              <p className="text-muted-foreground text-sm mt-1">Your AI-generated study schedule</p>
            </div>
          </div>
          <TimelineHeader
            view={view}
            onViewChange={setView}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0 border-r border-border bg-card/30 p-6">
          <TimelineLeftSidebar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            blocks={blocks}
            upcomingBlocks={upcomingBlocks}
            tasks={tasks}
          />
        </div>

        {/* Center: Timeline View */}
        <div className="flex-1 p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {view === "today" && (
              <TodayTimeline
                key="today"
                blocks={todayBlocks}
                taskStats={todayTaskStats}
                onBlockClick={setSelectedBlock}
              />
            )}
            {view === "day" && (
              <DayTimeline
                key="day"
                blocks={selectedDayBlocks}
                selectedDate={selectedDate}
                onBlockClick={setSelectedBlock}
              />
            )}
            {view === "week" && (
              <WeekTimeline
                key="week"
                blocks={blocks}
                selectedDate={selectedDate}
                onBlockClick={setSelectedBlock}
              />
            )}
            {view === "due" && (
              <DueTimeline
                key="due"
                tasks={activeTasks}
                onBlockClick={setSelectedBlock}
              />
            )}
          </AnimatePresence>

          {/* Summary Footer */}
          {view === "today" && todayBlocks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 bg-gradient-to-r from-accent/5 to-accent/10 rounded-xl p-6 border border-accent/20 shadow-sm"
            >
              <p className="text-sm text-foreground">
                <span className="font-bold text-accent">📊 Study Summary:</span>
                <span className="text-muted-foreground ml-2">
                  {Math.round(todayBlocks.reduce((sum, block) => sum + block.duration, 0) / 60)}h {(todayBlocks.reduce((sum, block) => sum + block.duration, 0) % 60)}m of focused learning across {todayBlocks.length} sessions
                </span>
              </p>
            </motion.div>
          )}
        </div>

        {/* Right: Details Panel */}
        <TimelineSidebar
          block={selectedBlock}
          onClose={() => setSelectedBlock(null)}
        />
      </div>
    </div>
  );
}