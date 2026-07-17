"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  PlannerOutput,
  PlannerTask as LegacyPlannerTask,
  TodayMission,
  TimelineItem,
  WeeklySummary,
  AIInsight,
} from "@/types/planner";
import {
  buildPlannerState,
  PlannerTask,
} from "@/lib/planner/plannerEngine";
import { PlannerState, RawTask } from "@/lib/planner/plannerTypes";
import { normalizeRawTaskInput } from "@/lib/planner/plannerNormalizer";
import {
  AIPlannerState,
  buildAIPlannerState,
} from "@/lib/planner/ai/plannerAI";

type PlannerTab = "today" | "week" | "calendar" | "upcoming" | "overdue" | "analytics";

interface PlannerContextType {
  activeTab: PlannerTab;
  setActiveTab: (tab: PlannerTab) => void;
  plannerState: PlannerState | null;
  aiState: AIPlannerState | null;
  data: PlannerOutput | null;
  tasks: PlannerTask[];
  loading: boolean;
  error: string | null;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  refresh: () => void;
  regeneratePlan: () => void;
  completeTask: (taskId: string) => Promise<void>;
  skipTask: (taskId: string) => Promise<void>;
  moveTaskTomorrow: (taskId: string) => Promise<void>;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

function toLegacyPlannerTask(task: PlannerTask): LegacyPlannerTask {
  function toLegacyType(): LegacyPlannerTask["type"] {
    if (task.type === "assignment") return "assignment";
    if (task.type === "practice") return "practice";
    if (task.type === "review") return "review";
    return "lesson";
  }

  return {
    id: task.id,
    title: task.title,
    subject: task.subject,
    type: toLegacyType(),
    progress: task.progress,
    deadline: task.deadline ?? undefined,
    estimatedMinutes: task.estimatedMinutes ?? 0,
    priority: task.priorityLevel,
    status: task.completed ? "completed" : task.isOverdue ? "overdue" : "pending",
    reason: task.reason,
  };
}

function toLegacyMission(state: PlannerState): TodayMission {
  return {
    goal: state.today.mission.title,
    focusTaskId: state.today.mission.focusTaskId ?? "",
    estimatedMinutes: state.today.mission.estimatedMinutes,
    sessions: state.today.mission.sessionCount,
    productivityScore: 0,
    confidenceScore: 0,
  };
}

function toLegacyTimelineItem(item: PlannerState["today"]["timeline"][number]): TimelineItem {
  return {
    taskId: item.taskId,
    title: item.task.title,
    subject: item.task.subject,
    type: item.task.type,
    progress: item.task.progress,
    deadline: item.task.deadline ?? undefined,
    startTime: item.startTime ?? "09:00",
    duration: item.durationMinutes ?? 0,
    priority: item.priorityLevel,
    reason: item.reason,
    action:
      item.task.type === "assignment"
        ? "research"
        : item.task.type === "practice"
          ? "practice"
          : item.task.type === "review"
            ? "review"
            : item.task.type === "concept"
              ? "study"
              : "study",
  };
}

function toLegacyWeeklySummary(state: PlannerState): WeeklySummary {
  return {
    studyHours: state.week.studyHours,
    workload: state.week.workload,
    hardestDay: state.week.hardestDay ?? "",
    lightestDay: state.week.lightestDay ?? "",
    days: state.week.days.map((day): WeeklySummary["days"][number] => ({
      date: day.date,
      hours: day.hours,
      tasks: day.taskCount,
      workload: day.workload,
    })),
  };
}

function toLegacyCoach(state: PlannerState): AIInsight {
  return {
    focusSuggestion:
      state.today.mission.focusTaskId
        ? `Focus on ${state.today.priorityTasks[0]?.title ?? "your top task"} first.`
        : "Create a task to see your focus suggestion.",
    biggestRisk: state.overdue.count > 0 ? state.overdue.recoveryPlaceholder : "No immediate risks detected.",
    encouragement: state.today.warnings[0] ?? "Your planner is ready.",
    warnings: state.today.warnings,
    recommendations: state.overdue.count > 0 ? [state.overdue.recoveryPlaceholder] : [],
    studyTip: "Use the planner engine outputs as the single source of truth.",
    motivation: "Stay consistent and the plan will stay consistent with you.",
  };
}

function toLegacyAnalytics(state: PlannerState): PlannerOutput["analytics"] {
  return {
    completionRate: state.analytics.completionRate ?? 0,
    totalStudyHours: state.analytics.totalStudyHours,
    subjectDistribution: state.analytics.subjectDistribution.map((item): PlannerOutput["analytics"]["subjectDistribution"][number] => ({
      subject: item.subject,
      hours: item.hours,
    })),
    streak: state.analytics.streak ?? 0,
    averageDaily: state.analytics.averageDaily ?? 0,
    upcomingWorkload: state.analytics.upcomingWorkload,
    burnoutIndicator: state.analytics.burnoutIndicator ?? 0,
    productivityTrend: state.analytics.productivityTrendValues,
    deadlineHeatmap: state.analytics.deadlineHeatmap,
  };
}

function toLegacyPlannerOutput(state: PlannerState): PlannerOutput {
  return {
    today: {
      mission: toLegacyMission(state),
      timeline: state.today.timeline.map(toLegacyTimelineItem),
    },
    week: toLegacyWeeklySummary(state),
    upcoming: {
      tomorrow: state.upcoming.tomorrow.tasks.map(toLegacyPlannerTask),
      laterThisWeek: state.upcoming.laterThisWeek.tasks.map(toLegacyPlannerTask),
      nextWeek: state.upcoming.nextWeek.tasks.map(toLegacyPlannerTask),
      future: state.upcoming.future.tasks.map(toLegacyPlannerTask),
    },
    overdue: state.overdue.tasks.map(toLegacyPlannerTask),
    coach: toLegacyCoach(state),
    analytics: toLegacyAnalytics(state),
  };
}

function buildEmptyPlannerState(): PlannerState {
  return buildPlannerState({ tasks: [], currentDate: new Date() });
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<PlannerTab>("today");
  const [plannerState, setPlannerState] = useState<PlannerState | null>(null);
  const [aiState, setAiState] = useState<AIPlannerState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tasks/all");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const raw = (await response.json()) as unknown[];
      const rawTasks: RawTask[] = Array.isArray(raw)
        ? raw
            .map((task) => normalizeRawTaskInput(task))
            .filter((task): task is RawTask => Boolean(task))
        : [];

      const nextState = buildPlannerState({
        tasks: rawTasks,
        currentDate: new Date(),
      });

      setPlannerState(nextState);
      setAiState(buildAIPlannerState(nextState));
      setSelectedDate(null);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Could not load tasks.";
      setError(message);
      const emptyState = buildEmptyPlannerState();
      setPlannerState(emptyState);
      setAiState(buildAIPlannerState(emptyState));
    } finally {
      setLoading(false);
    }
  };

  const regeneratePlan = refresh;

  const completeTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: 100, status: "completed" }),
      });
      await refresh();
    } catch (taskError) {
      console.error("Failed to complete task:", taskError);
    }
  };

  const skipTask = async (taskId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const newDeadline = tomorrow.toISOString().split("T")[0];

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadline: newDeadline }),
      });
      await refresh();
    } catch (taskError) {
      console.error("Failed to skip task:", taskError);
    }
  };

  const moveTaskTomorrow = async (taskId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const newDeadline = tomorrow.toISOString().split("T")[0];

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadline: newDeadline }),
      });
      await refresh();
    } catch (taskError) {
      console.error("Failed to move task:", taskError);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const data = useMemo(
    () => (plannerState ? toLegacyPlannerOutput(plannerState) : null),
    [plannerState],
  );

  return (
    <PlannerContext.Provider
      value={{
        activeTab,
        setActiveTab,
        plannerState,
        aiState,
        data,
        tasks: plannerState?.tasks ?? [],
        loading,
        error,
        selectedDate,
        setSelectedDate,
        refresh,
        regeneratePlan,
        completeTask,
        skipTask,
        moveTaskTomorrow,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) throw new Error("usePlanner must be used within PlannerProvider");
  return context;
}