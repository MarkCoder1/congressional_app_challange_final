import type {
  PlannerPriorityLevel,
  PlannerState,
  PlannerTask,
  PlannerWorkloadLevel,
} from "../plannerTypes";

export interface PlannerMissionRecommendation {
  title: string;
  description: string;
  focusTaskId: string | null;
  estimatedMinutes: number;
  reason: string;
}

export interface PlannerTimelineRecommendation {
  taskId: string;
  order: number;
  suggestedTime: string;
  durationMinutes: number;
  reason: string;
  priorityLevel: PlannerPriorityLevel;
  action: "study" | "practice" | "review" | "research" | "write";
}

export interface PlannerTaskRecommendation {
  taskId: string;
  title: string;
  priorityLevel: PlannerPriorityLevel;
  reason: string;
  action: "study" | "practice" | "review" | "research" | "write";
}

export interface PlannerWarning {
  id: string;
  title: string;
  reason: string;
  severity: "low" | "medium" | "high";
}

export interface PlannerSuggestion {
  id: string;
  title: string;
  reason: string;
}

export interface PlannerRisk {
  id: string;
  title: string;
  reason: string;
  severity: "low" | "medium" | "high";
}

export interface PlannerRecoveryStep {
  title: string;
  reason: string;
}

export interface PlannerRecoveryPlan {
  title: string;
  reason: string;
  steps: PlannerRecoveryStep[];
}

export interface PlannerPriorityExplanation {
  taskId: string;
  title: string;
  priorityLevel: PlannerPriorityLevel;
  reason: string;
}

export interface PlannerDailySummary {
  title: string;
  reason: string;
  workload: PlannerWorkloadLevel;
}

export interface PlannerWeeklySummary {
  title: string;
  reason: string;
  workload: PlannerWorkloadLevel;
}

export interface AIPlannerState {
  mission: PlannerMissionRecommendation;
  timeline: PlannerTimelineRecommendation[];
  taskRecommendations: PlannerTaskRecommendation[];
  warnings: PlannerWarning[];
  suggestions: PlannerSuggestion[];
  risks: PlannerRisk[];
  recoveryPlan: PlannerRecoveryPlan;
  priorityExplanations: PlannerPriorityExplanation[];
  dailySummary: PlannerDailySummary;
  weeklySummary: PlannerWeeklySummary;
  metadata: {
    generatedAt: string;
    source: "mock" | "groq";
    plannerTaskCount: number;
  };
}

export interface PlannerAIContext {
  plannerState: PlannerState;
  currentDate: string;
}

export type { PlannerPriorityLevel, PlannerTask };
