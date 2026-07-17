// /types/plannerAI.ts
import { PlannerTask } from "./planner";

export type AITimelineItem = {
  taskId: string;
  order: number; // 1-based priority order
  suggestedTime: string; // "09:00", AI suggests start time
  duration: number; // minutes
  reason: string; // AI explanation
};

export type AIMission = {
  title: string; // e.g., "Complete Math assignment before lunch"
  description: string; // short summary
  estimatedHours: number;
  focusReason: string;
};

export type AIInsight = {
  warnings: string[];
  recommendations: string[];
  focusSuggestion: string;
};

export type PlannerAIOutput = {
  dailyMission: AIMission;
  timeline: AITimelineItem[];
  weeklyRecommendations: string[];
  taskPriorities: {
    taskId: string;
    priority: "high" | "medium" | "low";
    reason: string;
  }[];
  aiInsights: AIInsight;
};