"use client";

import { useEffect, useState } from "react";
import { Task } from "@/types/task";
import { generateSchedule } from "@/lib/ai/scheduler";
import { AIScheduleResponse } from "@/types/schedule";
import { ScheduleTimeline } from "@/components/schedule/ScheduleTimeline";
import { ScheduleLoading } from "@/components/schedule/ScheduleLoading";
import { EmptySchedule } from "@/components/schedule/EmptySchedule";
import { saveSchedule, loadSchedule } from "@/lib/scheduleStorage";
import { EmptyState } from "@/components/EmptyState";
import { Sparkles } from "lucide-react";

export default function TimelinePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<AIScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks
  useEffect(() => {
    fetch("/api/tasks/all")
      .then(res => res.json())
      .then(data => {
        setTasks(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Load cached schedule or generate new
  useEffect(() => {
    if (tasks.length === 0) return;

    const cached = loadSchedule();
    if (cached) {
      setSchedule(cached);
    }

    // Always regenerate to get fresh plan (or we could check age)
    generateSchedule(tasks).then(newSchedule => {
      setSchedule(newSchedule);
      saveSchedule(newSchedule);
    });
  }, [tasks]);

  const handleComplete = (taskId: string) => {
    console.log("Complete", taskId);
    // Could update task progress via API, then regenerate
    if (tasks.length > 0) {
      generateSchedule(tasks).then(newSchedule => {
        setSchedule(newSchedule);
        saveSchedule(newSchedule);
      });
    }
  };

  const handleSkip = (taskId: string) => {
    console.log("Skip", taskId);
    // Regenerate
    if (tasks.length > 0) {
      generateSchedule(tasks).then(newSchedule => {
        setSchedule(newSchedule);
        saveSchedule(newSchedule);
      });
    }
  };

  if (isLoading) return <ScheduleLoading />;

  if (tasks.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <EmptyState
          icon={<Sparkles size={32} />}
          title="No tasks to plan"
          description="Create a task to start your AI study plan."
          actionLabel="Create Task"
          actionHref="/create-task"
        />
      </div>
    );
  }

  if (!schedule) return <ScheduleLoading />;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="text-accent" size={24} />
            AI Study Plan
          </h1>
          <p className="text-sm text-muted-foreground">
            Generated {new Date(schedule.generatedAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => {
            if (tasks.length > 0) {
              generateSchedule(tasks).then(newSchedule => {
                setSchedule(newSchedule);
                saveSchedule(newSchedule);
              });
            }
          }}
          className="px-4 py-2 rounded-lg bg-accent text-white shadow-md hover:shadow-lg transition-shadow"
        >
          Regenerate Plan
        </button>
      </div>

      <ScheduleTimeline
        schedule={schedule}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </div>
  );
}