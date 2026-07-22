"use client";

import { useEffect, useMemo, useState } from "react";
import { TimelineContainer } from "@/components/timeline";
import { usePlannerStore } from "@/features/planner/store";
import { usePlanner } from "@/features/planner/hooks/usePlanner";
import type { Task } from "@/types/task";

export default function TimelinePage() {
  const planner = usePlanner();
  const { studySchedule, tasks, generatedAt } = planner;
  const setTasks = usePlannerStore((state) => state.setTasks);

  const [isFetching, setIsFetching] = useState(true);

  const blocks = useMemo(() => {
    console.log(studySchedule);
    return studySchedule;
  }, [studySchedule]);
  const loading = isFetching;

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      try {
        const response = await fetch("/api/tasks/all");
        if (!response.ok) {
          setIsFetching(false);
          return;
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          setIsFetching(false);
          return;
        }

        const apiTasks = data as Task[];

        if (cancelled) return;

        // Map API Task type to planner-compatible tasks
        const mapTaskType = (apiType: string): "lesson" | "assignment" | "practice" | "review" | "custom" => {
          if (apiType === "lesson") return "lesson";
          if (apiType === "assignment") return "assignment";
          return "custom";
        };

        const mapStatus = (apiStatus: string): "not_started" | "in_progress" | "completed" => {
          if (apiStatus === "completed") return "completed";
          if (apiStatus === "in_progress") return "in_progress";
          return "not_started";
        };

        const plannerTasks = apiTasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          subject: task.subject,
          type: mapTaskType(task.type),
          deadline: task.deadline || null,
          estimatedMinutes: 45,
          difficulty: "medium" as const,
          priority: "medium" as const,
          progress: task.progress ?? 0,
          status: mapStatus(task.status),
          completed: task.status === "completed" || (task.progress ?? 0) >= 100,
          createdAt: task.startedAt || new Date().toISOString(),
          updatedAt: task.lastActivityAt || new Date().toISOString(),
        }));

        // Overwrite ALL tasks in the store with the API data
        setTasks(plannerTasks as any);
      } catch (error) {
        console.error("Failed to load tasks for timeline:", error);
      } finally {
        if (!cancelled) {
          setIsFetching(false);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [setTasks]); // Only depends on stable setTasks reference — runs once on mount

  return <TimelineContainer blocks={blocks} tasks={tasks} loading={loading} />;
}