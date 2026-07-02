// /components/timeline/WeekView.tsx
"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TimelineTask, DayGroup } from "@/types/timeline";
import { TaskCard } from "./TaskCard";
import { getWeekDates, groupTasksByDate, getDateLabel } from "@/lib/timeline";

interface WeekViewProps {
  tasks: TimelineTask[];
}

export function WeekView({ tasks }: WeekViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  
  const weekDates = useMemo(() => {
    const refDate = new Date();
    refDate.setDate(refDate.getDate() + weekOffset * 7);
    return getWeekDates(refDate);
  }, [weekOffset]);

  const weekDateStrings = useMemo(() => {
    return weekDates.map(d => d.toISOString().split('T')[0]);
  }, [weekDates]);

  const groupedTasks = useMemo(() => {
    const allGroups = groupTasksByDate(tasks);
    return weekDateStrings.map(dateStr => {
      const group = allGroups.find(g => g.date === dateStr);
      return {
        date: dateStr,
        tasks: group ? group.tasks : [],
      };
    });
  }, [tasks, weekDateStrings]);

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const navigateWeek = (direction: number) => {
    setWeekOffset(prev => prev + direction);
  };

  const totalTasks = groupedTasks.reduce((sum, day) => sum + day.tasks.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Week {weekOffset + 1} · {totalTasks} tasks
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {groupedTasks.map((day, idx) => (
          <div
            key={day.date}
            className={`rounded-xl p-3 border ${
              isToday(day.date)
                ? "bg-accent/5 border-accent/50 shadow-sm"
                : "bg-card border-border"
            }`}
          >
            <div className="text-center mb-2">
              <div className="text-xs font-medium text-muted-foreground">
                {weekDates[idx].toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-sm font-bold ${
                isToday(day.date) ? "text-accent" : "text-foreground"
              }`}>
                {weekDates[idx].getDate()}
              </div>
              {isToday(day.date) && (
                <span className="text-[10px] font-medium text-accent">Today</span>
              )}
            </div>

            <div className="space-y-1.5 max-h-[400px] overflow-y-auto scrollbar-thin">
              {day.tasks.length === 0 ? (
                <div className="text-[10px] text-muted-foreground text-center py-2">
                  No tasks
                </div>
              ) : (
                day.tasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}