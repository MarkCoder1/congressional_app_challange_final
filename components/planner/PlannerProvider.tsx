// /components/planner/PlannerProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PlannerOutput, PlannerTask, TodayMission, TimelineItem, WeeklySummary, AIInsight } from "@/types/planner";
import { toPlannerTasks } from "@/lib/planner/taskAdapter";

type PlannerTab = "today" | "week" | "calendar" | "upcoming" | "overdue" | "analytics";

interface PlannerContextType {
  activeTab: PlannerTab;
  setActiveTab: (tab: PlannerTab) => void;
  data: PlannerOutput | null;
  loading: boolean;
  error: string | null;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  regeneratePlan: () => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

// ---------- Helper: build default empty planner data ----------
function buildEmptyPlanner(): PlannerOutput {
  return {
    today: {
      mission: {
        goal: "No tasks planned for today",
        focusTaskId: "",
        estimatedMinutes: 0,
        sessions: 0,
        productivityScore: 0,
        confidenceScore: 0,
      },
      timeline: [],
    },
    week: {
      studyHours: 0,
      workload: "light",
      hardestDay: "",
      lightestDay: "",
      days: [],
    },
    upcoming: {
      tomorrow: [],
      laterThisWeek: [],
      nextWeek: [],
      future: [],
    },
    overdue: [],
    coach: {
      focusSuggestion: "Create your first task to get AI suggestions.",
      biggestRisk: "No tasks yet.",
      encouragement: "Start by creating a task.",
      warnings: [],
      recommendations: [],
      studyTip: "Add tasks to see planning suggestions.",
      motivation: "Every journey begins with a single step.",
    },
    analytics: {
      completionRate: 0,
      totalStudyHours: 0,
      subjectDistribution: [],
      streak: 0,
      averageDaily: 0,
      upcomingWorkload: 0,
      burnoutIndicator: 0,
      productivityTrend: [],
      deadlineHeatmap: [],
    },
  };
}

// ---------- Computation functions ----------
function computeTodayMission(tasks: PlannerTask[]): TodayMission {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // Tasks due today or with no deadline
  const todayTasks = tasks.filter(t => {
    if (!t.deadline) return false;
    const d = new Date(t.deadline).toISOString().split("T")[0];
    return d === todayStr;
  });

  // If no tasks due today, take high priority tasks
  const highPriority = tasks.filter(t => t.priority === "high" && t.status !== "completed");
  const focusTasks = todayTasks.length > 0 ? todayTasks : highPriority;

  const totalMinutes = focusTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const sessions = focusTasks.length;

  return {
    goal: sessions > 0
      ? `Focus on ${focusTasks.length} task${focusTasks.length > 1 ? 's' : ''} today`
      : "No tasks scheduled for today",
    focusTaskId: focusTasks[0]?.id || "",
    estimatedMinutes: totalMinutes,
    sessions,
    productivityScore: Math.min(100, Math.round((sessions / Math.max(1, sessions + 2)) * 100)),
    confidenceScore: sessions > 0 ? 85 : 0,
  };
}

function computeTimeline(tasks: PlannerTask[]): TimelineItem[] {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const dueToday = tasks.filter(t => {
    if (t.status === "completed") return false;
    if (!t.deadline) return true;
    const d = new Date(t.deadline).toISOString().split("T")[0];
    return d === todayStr;
  });

  const highPriority = tasks.filter(t => {
    if (t.status === "completed") return false;
    if (t.priority !== "high") return false;
    if (dueToday.some(dt => dt.id === t.id)) return false;
    return true;
  });

  const combined = [...dueToday, ...highPriority];

  const sorted = combined.sort((a, b) => {
    if (a.status === "overdue" && b.status !== "overdue") return -1;
    if (b.status === "overdue" && a.status !== "overdue") return 1;
    if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;
    if (a.priority === "high" && b.priority !== "high") return -1;
    if (b.priority === "high" && a.priority !== "high") return 1;
    return 0;
  });

  return sorted.map((task, idx) => ({
    taskId: task.id,
    title: task.title, // 👈 now we pass the title
    startTime: `${String(9 + idx).padStart(2, "0")}:00`,
    duration: task.estimatedMinutes,
    priority: task.priority,
    reason: task.status === "overdue"
      ? "Overdue – complete first."
      : task.deadline
      ? `Due ${new Date(task.deadline).toLocaleDateString()}`
      : "Scheduled for today.",
    action: task.type === "assignment" ? "research" : task.type === "practice" ? "practice" : task.type === "review" ? "review" : "study",
  }));
}

function computeWeek(tasks: PlannerTask[]): WeeklySummary {
  const now = new Date();
  const weekDays: WeeklySummary["days"] = [];
  let totalHours = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayTasks = tasks.filter(t => {
      if (t.status === "completed") return false;
      if (!t.deadline) return false;
      const taskDate = new Date(t.deadline).toISOString().split("T")[0];
      return taskDate === dateStr;
    });
    const hours = dayTasks.reduce((sum, t) => sum + t.estimatedMinutes / 60, 0);
    totalHours += hours;
    const workload: "light" | "medium" | "heavy" | "overloaded" =
      hours > 4 ? "overloaded" : hours > 3 ? "heavy" : hours > 2 ? "medium" : "light";
    weekDays.push({ date: dateStr, hours, tasks: dayTasks.length, workload });
  }

  const hardest = weekDays.reduce((a, b) => a.hours > b.hours ? a : b);
  const lightest = weekDays.reduce((a, b) => a.hours < b.hours ? a : b);

  return {
    studyHours: Math.round(totalHours * 10) / 10,
    workload: totalHours > 20 ? "overloaded" : totalHours > 15 ? "heavy" : totalHours > 10 ? "medium" : "light",
    hardestDay: hardest.date,
    lightestDay: lightest.date,
    days: weekDays,
  };
}

function computeUpcoming(tasks: PlannerTask[]): PlannerOutput["upcoming"] {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().split("T")[0];
  const nextWeekStr = new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0];

  const groups: PlannerOutput["upcoming"] = {
    tomorrow: [],
    laterThisWeek: [],
    nextWeek: [],
    future: [],
  };

  tasks.forEach(task => {
    if (task.status === "completed") return;
    if (!task.deadline) {
      groups.future.push(task);
      return;
    }
    const d = new Date(task.deadline).toISOString().split("T")[0];
    if (d === tomorrowStr) groups.tomorrow.push(task);
    else if (d > tomorrowStr && d <= nextWeekStr) groups.laterThisWeek.push(task);
    else if (d > nextWeekStr && d <= new Date(now.getTime() + 14 * 86400000).toISOString().split("T")[0]) groups.nextWeek.push(task);
    else groups.future.push(task);
  });

  return groups;
}

function computeOverdue(tasks: PlannerTask[]): PlannerTask[] {
  return tasks.filter(t => t.status === "overdue");
}

function computeCoach(tasks: PlannerTask[]): AIInsight {
  const overdue = tasks.filter(t => t.status === "overdue");
  const highPriority = tasks.filter(t => t.priority === "high" && t.status !== "completed");
  const totalTasks = tasks.length;

  let focusSuggestion = "Complete your highest priority task first.";
  let biggestRisk = "No immediate risks detected.";
  let warnings: string[] = [];
  let recommendations: string[] = [];

  if (overdue.length > 0) {
    focusSuggestion = `Finish ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''} first.`;
    warnings.push(`You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}.`);
    recommendations.push("Prioritise overdue tasks and reschedule less urgent work.");
  }

  if (highPriority.length > 0 && overdue.length === 0) {
    focusSuggestion = `Start with "${highPriority[0].title}" – it's high priority.`;
  }

  if (totalTasks === 0) {
    focusSuggestion = "Create your first task to get started.";
    biggestRisk = "No tasks yet – add some to begin planning.";
  }

  return {
    focusSuggestion,
    biggestRisk,
    encouragement: totalTasks > 0 ? "You're making progress! Keep going." : "Every journey begins with a single step.",
    warnings,
    recommendations,
    studyTip: "Break large tasks into smaller sessions to stay focused.",
    motivation: "Stay consistent and you'll reach your goals.",
  };
}

function computeAnalytics(tasks: PlannerTask[]): PlannerOutput["analytics"] {
  const totalTasks = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedMinutes / 60, 0);

  // Subject distribution
  const subjectMap: Record<string, number> = {};
  tasks.forEach(t => {
    if (!subjectMap[t.subject]) subjectMap[t.subject] = 0;
    subjectMap[t.subject] += t.estimatedMinutes / 60;
  });
  const subjectDistribution = Object.entries(subjectMap)
    .map(([subject, hours]) => ({ subject, hours: Math.round(hours * 10) / 10 }))
    .sort((a, b) => b.hours - a.hours);

  // Streak: simple – if any task completed today, streak = 1 (mock for now)
  const today = new Date().toISOString().split("T")[0];
  const hasTodayCompleted = tasks.some(t => t.status === "completed" && t.deadline === today);
  const streak = hasTodayCompleted ? 1 : 0;

  return {
    completionRate,
    totalStudyHours: Math.round(totalHours * 10) / 10,
    subjectDistribution,
    streak,
    averageDaily: totalHours / 7,
    upcomingWorkload: tasks.filter(t => t.status !== "completed").length,
    burnoutIndicator: 0,
    productivityTrend: [0],
    deadlineHeatmap: [],
  };
}

// ---------- Main Provider ----------
export function PlannerProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<PlannerTab>("today");
  const [data, setData] = useState<PlannerOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks/all");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const raw = await res.json();
      const tasks = Array.isArray(raw) ? toPlannerTasks(raw) : [];

      if (tasks.length === 0) {
        setData(buildEmptyPlanner());
      } else {
        const plannerData: PlannerOutput = {
          today: {
            mission: computeTodayMission(tasks),
            timeline: computeTimeline(tasks),
          },
          week: computeWeek(tasks),
          upcoming: computeUpcoming(tasks),
          overdue: computeOverdue(tasks),
          coach: computeCoach(tasks),
          analytics: computeAnalytics(tasks),
        };
        setData(plannerData);
      }
    } catch (err: any) {
      setError(err.message || "Could not load tasks.");
      setData(buildEmptyPlanner());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const regeneratePlan = () => {
    fetchTasks();
  };

  return (
    <PlannerContext.Provider
      value={{
        activeTab,
        setActiveTab,
        data,
        loading,
        error,
        selectedDate,
        setSelectedDate,
        regeneratePlan,
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