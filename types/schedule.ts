// /types/schedule.ts
import { Task } from "./task";

// ----- AI Schedule Output -----
export type ScheduledSession = {
  taskId: string;
  title: string;
  subject: string;
  type: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  reason: string;
  priority: "high" | "medium" | "low";
  difficulty: "easy" | "medium" | "hard";
};

export type DailyPlan = {
  date: string;
  summary: string;
  focusTask: string;
  sessions: ScheduledSession[];
};

export type WeeklyPlan = {
  date: string;
  workload: "light" | "medium" | "heavy" | "overloaded";
  sessions: ScheduledSession[];
};

export type AIInsights = {
  focusSuggestion: string;
  warnings: string[];
  recommendations: string[];
};

export type AIScheduleResponse = {
  dailyPlan: DailyPlan;
  weeklyPlan: WeeklyPlan[];
  insights: AIInsights;
  generatedAt: string;
  source: "ai" | "fallback"; // <-- NEW: tells where the schedule came from
};

// ----- Legacy types (fallback) -----
export type LegacyScheduledTask = {
  taskId: string;
  title: string;
  subject: string;
  type: string;
  progress: number;
  deadline?: string;
  estimatedTime: number;
  priorityScore: number;
  priorityReason: string;
  suggestedOrder: number;
  status: "pending" | "completed" | "overdue";
};

export type LegacyDailyPlan = {
  date: string;
  tasks: LegacyScheduledTask[];
  totalEstimatedTime: number;
  workloadLevel: "light" | "medium" | "heavy" | "overloaded";
};

export type LegacyWeeklyPlan = {
  weekStart: string;
  days: LegacyDailyPlan[];
  overloadedDays: string[];
  emptyDays: string[];
};

export type LegacyAIInsights = {
  workloadWarnings: string[];
  recommendations: string[];
  focusSuggestion: string;
  behindSchedule: boolean;
  estimatedRecoveryDays?: number;
};

export type LegacyAIPlan = {
  dailyPlan: LegacyDailyPlan[];
  weeklyPlan: LegacyWeeklyPlan;
  insights: LegacyAIInsights;
  generatedAt: string;
};