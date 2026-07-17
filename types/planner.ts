// /types/planner.ts

// ====== ADD THESE TYPES (for API input) ======
export type PlannerTaskInput = {
  id: string;
  title: string;
  subject: string;
  type: string;
  description: string;
  deadline?: string;
  priority: string;
  progress: number;
  estimatedDuration: number;
  learningContent?: any;
  assignmentContent?: any;
  practiceCount: number;
  masterCount: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlannerInput = {
  tasks: PlannerTaskInput[];
  today: string; // YYYY-MM-DD
  dayOfWeek: string;
  currentTime: string;
};

// ====== EXISTING TYPES (keep as is) ======
export type PlannerTask = {
  id: string;
  title: string;
  subject: string;
  type: "lesson" | "assignment" | "practice" | "review";
  progress: number;
  deadline?: string;
  estimatedMinutes: number;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed" | "overdue";
  reason?: string;
};

// /types/planner.ts (add these fields)
export type TimelineItem = {
  taskId: string;
  title: string;
  subject: string;        // new
  type: string;           // new – "lesson", "assignment", "practice", "review"
  progress: number;       // new – 0-100
  deadline?: string;      // new – ISO date
  startTime: string;
  duration: number;
  priority: "high" | "medium" | "low";
  reason: string;
  action: "study" | "practice" | "review" | "research" | "write";
};

export type TodayMission = {
  goal: string;
  focusTaskId: string;
  estimatedMinutes: number;
  sessions: number;
  productivityScore: number;
  confidenceScore: number;
};

export type WeeklySummary = {
  studyHours: number;
  workload: "light" | "medium" | "heavy" | "overloaded";
  hardestDay: string;
  lightestDay: string;
  days: {
    date: string;
    hours: number;
    tasks: number;
    workload: "light" | "medium" | "heavy" | "overloaded";
  }[];
};

export type AIInsight = {
  focusSuggestion: string;
  biggestRisk: string;
  encouragement: string;
  warnings: string[];
  recommendations: string[];
  studyTip: string;
  motivation: string;
};

export type PlannerOutput = {
  today: {
    mission: TodayMission;
    timeline: TimelineItem[];
  };
  week: WeeklySummary;
  upcoming: {
    tomorrow: PlannerTask[];
    laterThisWeek: PlannerTask[];
    nextWeek: PlannerTask[];
    future: PlannerTask[];
  };
  overdue: PlannerTask[];
  coach: AIInsight;
  analytics: {
    completionRate: number;
    totalStudyHours: number;
    subjectDistribution: { subject: string; hours: number }[];
    streak: number;
    averageDaily: number;
    upcomingWorkload: number;
    burnoutIndicator: number;
    productivityTrend: number[];
    deadlineHeatmap: { date: string; count: number }[];
  };
};

export type FocusSessionState = {
  isActive: boolean;
  taskId: string | null;
  elapsedSeconds: number;
  paused: boolean;
};