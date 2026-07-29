"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle2, Calendar, Flame, TrendingUp } from "lucide-react";
import { MiniCalendar } from "./MiniCalendar";
import { isTaskCompleted, formatPlannerDateKey } from "@/features/planner/engine/normalizer";
import type { StudyBlockResult, PlannerTask } from "@/features/planner/types";

interface TimelineLeftSidebarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  blocks: StudyBlockResult[];
  upcomingBlocks: StudyBlockResult[];
  tasks: PlannerTask[];
}

export function TimelineLeftSidebar({
  selectedDate,
  onDateChange,
  blocks,
  upcomingBlocks,
  tasks,
}: TimelineLeftSidebarProps) {
  const today = formatPlannerDateKey(new Date());
  const selectedDateStr = formatPlannerDateKey(selectedDate);

  const todayBlocks = blocks.filter((block) => block.date === today);
  const todayMinutes = todayBlocks.reduce((sum, block) => sum + block.duration, 0);

  const tasksDueToday = tasks.filter((task) => {
    if (!task.deadline) return false;
    const taskDate = formatPlannerDateKey(new Date(task.deadline));
    return taskDate === today;
  });
  const todayCompleted = tasksDueToday.filter((task) => isTaskCompleted(task)).length;

  const selectedBlocks = blocks.filter((block) => block.date === selectedDateStr);
  const selectedMinutes = selectedBlocks.reduce((sum, block) => sum + block.duration, 0);

  const tasksByDate: Record<string, { count: number; minutes: number }> = {};
  blocks.forEach((block) => {
    if (!tasksByDate[block.date]) {
      tasksByDate[block.date] = { count: 0, minutes: 0 };
    }
    tasksByDate[block.date].count += 1;
    tasksByDate[block.date].minutes += block.duration;
  });

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <MiniCalendar
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        tasksByDate={tasksByDate}
      />

      <div className="card-base p-4">
        <h3 className="card-title mb-4">
          <Flame className="text-warning" size={16} />
          Today's Progress
        </h3>
        <div className="space-y-3">
          <StatItem
            icon={<Clock size={16} />}
            label="Study Time"
            value={formatMinutes(todayMinutes)}
            color="text-accent"
          />
          <StatItem
            icon={<Calendar size={16} />}
            label="Tasks Today"
            value={todayBlocks.length.toString()}
            color="text-accent"
          />
          <StatItem
            icon={<CheckCircle2 size={16} />}
            label="Completed"
            value={todayCompleted.toString()}
            color="text-success"
          />
        </div>
      </div>

      {selectedDateStr !== today && (
        <div className="card-base p-4">
          <h3 className="card-title mb-3">
            <TrendingUp className="text-accent" size={16} />
            Selected Date
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sessions</span>
              <span className="font-semibold">{selectedBlocks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Time</span>
              <span className="font-semibold">{formatMinutes(selectedMinutes)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="card-base p-4">
        <h3 className="card-title mb-3">Legend</h3>
        <div className="space-y-2">
          <LegendItem color="bg-accent" label="Learn" />
          <LegendItem color="bg-success" label="Practice" />
          <LegendItem color="bg-warning" label="Review" />
          <LegendItem color="bg-ai-violet" label="Assignment" />
        </div>
      </div>

      {upcomingBlocks.length > 0 && (
        <div className="card-base p-4">
          <h3 className="card-title mb-3">Upcoming</h3>
          <div className="space-y-2">
            {upcomingBlocks.slice(0, 5).map((block, index) => (
              <div
                key={`${block.taskId}-${block.date}-${index}`}
                className="caption p-2 bg-secondary/50 rounded-lg"
              >
                <p className="font-semibold line-clamp-1">{block.title}</p>
                <p className="text-muted-foreground">{block.subject}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded ${color}`} />
      <span className="caption">{label}</span>
    </div>
  );
}
