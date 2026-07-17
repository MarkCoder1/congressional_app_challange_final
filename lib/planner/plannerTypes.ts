export type PlannerTaskType =
  | "lesson"
  | "assignment"
  | "practice"
  | "review"
  | "concept"
  | "mixed"
  | (string & {});

export type PlannerPriorityLevel = "low" | "medium" | "high";
export type PlannerWorkloadLevel = "light" | "medium" | "heavy" | "overloaded";
export type PlannerTaskStatus = "not_started" | "in_progress" | "completed";

export interface PlannerHistoryEntry {
  date: string;
  taskId?: string;
  subject?: string;
  taskType?: PlannerTaskType;
  minutesSpent?: number;
  status?: "completed" | "skipped" | "in_progress" | "reviewed" | "partial";
  source?: "assignment" | "lesson" | "practice" | "master" | "manual";
  metadata?: Record<string, unknown>;
}

export interface PlannerUserPreferences {
  dayStartHour?: number;
  dayEndHour?: number;
  preferredSessionLengthMinutes?: number;
  maxHeavySessionsPerDay?: number;
  timezone?: string;
  focusSubjects?: string[];
}

export interface RawTask {
  id: string;
  title: string;
  subject?: string;
  type?: PlannerTaskType;
  taskType?: PlannerTaskType;
  description?: string;
  deadline?: string | null;
  progress?: number | null;
  status?: string | null;
  completed?: boolean | null;
  completedAt?: string | null;
  startedAt?: string | null;
  lastActivityAt?: string | null;
  estimatedMinutes?: number | null;
  estimatedDuration?: number | null;
  estimatedHours?: number | null;
  priority?: string | null;
  difficulty?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  assignments?: Record<string, unknown>[] | null;
  practice?: Record<string, unknown>[] | null;
  master?: Record<string, unknown>[] | null;
  resources?: Record<string, unknown> | null;
  progressMeta?: Record<string, unknown> | null;
  learningContent?: Record<string, unknown> | null;
  assignmentContent?: Record<string, unknown> | null;
  history?: PlannerHistoryEntry[] | null;
  [key: string]: unknown;
}

export interface PlannerTask {
  id: string;
  title: string;
  subject: string;
  type: PlannerTaskType;
  description: string;
  deadline: string | null;
  progress: number;
  status: PlannerTaskStatus;
  estimatedMinutes: number | null;
  priorityScore: number;
  priorityLevel: PlannerPriorityLevel;
  completed: boolean;
  isOverdue: boolean;
  reason: string;
}

export interface PlannerTimelineItem {
  taskId: string;
  task: PlannerTask;
  order: number;
  startTime: string | null;
  durationMinutes: number | null;
  priorityLevel: PlannerPriorityLevel;
  reason: string;
}

export interface MissionState {
  title: string;
  focusTaskId: string | null;
  estimatedMinutes: number;
  knownMinutes: number;
  unknownEstimateCount: number;
  sessionCount: number;
}

export interface TodayWorkloadState {
  level: PlannerWorkloadLevel;
  estimatedMinutes: number;
  estimatedHours: number;
  remainingMinutes: number;
  knownMinutes: number;
  unknownEstimateCount: number;
  taskCount: number;
  typeCounts: {
    assignment: number;
    lesson: number;
    practice: number;
    review: number;
  };
}

export interface TodayState {
  mission: MissionState;
  timeline: PlannerTimelineItem[];
  workload: TodayWorkloadState;
  priorityTasks: PlannerTask[];
  warnings: string[];
}

export interface WeekDayState {
  date: string;
  tasks: PlannerTask[];
  estimatedMinutes: number;
  hours: number;
  knownMinutes: number;
  unknownEstimateCount: number;
  taskCount: number;
  workload: PlannerWorkloadLevel;
}

export interface WeekState {
  days: WeekDayState[];
  estimatedHours: number;
  studyHours: number;
  knownMinutes: number;
  unknownEstimateCount: number;
  workload: PlannerWorkloadLevel;
  hardestDay: string | null;
  lightestDay: string | null;
}

export interface CalendarDayState {
  date: string;
  tasks: PlannerTask[];
  taskCount: number;
  estimatedMinutes: number;
  knownMinutes: number;
  unknownEstimateCount: number;
  indicators: string[];
}

export interface CalendarState {
  days: CalendarDayState[];
  unscheduled: PlannerTask[];
  rangeStart: string;
  rangeEnd: string;
}

export interface UpcomingGroupState {
  tasks: PlannerTask[];
  estimatedMinutes: number;
  unknownEstimateCount: number;
}

export interface UpcomingState {
  tomorrow: UpcomingGroupState;
  laterThisWeek: UpcomingGroupState;
  nextWeek: UpcomingGroupState;
  future: UpcomingGroupState;
}

export interface OverdueState {
  tasks: PlannerTask[];
  count: number;
  recoveryPlaceholder: string;
}

export interface SubjectAnalyticsItem {
  subject: string;
  taskCount: number;
  knownMinutes: number;
  hours: number;
  unknownEstimateCount: number;
}

export interface DeadlineHeatmapItem {
  date: string;
  count: number;
}

export interface ProductivityTrendItem {
  date: string;
  minutesSpent: number;
}

export interface AnalyticsState {
  taskCount: number;
  completedCount: number;
  overdueCount: number;
  completionRate: number | null;
  knownMinutes: number;
  unknownEstimateCount: number;
  estimatedHours: number;
  totalStudyHours: number;
  subjectDistribution: SubjectAnalyticsItem[];
  deadlineHeatmap: DeadlineHeatmapItem[];
  productivityTrend: ProductivityTrendItem[];
  productivityTrendValues: number[];
  averageDaily: number | null;
  upcomingWorkload: number;
  streak: number | null;
  averageDailyMinutes: number | null;
  burnoutIndicator: number | null;
}

export interface PlannerState {
  currentDate: string;
  tasks: PlannerTask[];
  today: TodayState;
  week: WeekState;
  calendar: CalendarState;
  upcoming: UpcomingState;
  overdue: OverdueState;
  analytics: AnalyticsState;
}

export interface PlannerAIInput {
  tasks: PlannerTask[];
  state: PlannerState;
  history: PlannerHistoryEntry[];
  preferences: PlannerUserPreferences;
  assignments: RawTask[];
  practiceResults: Record<string, unknown>[];
  masterResults: Record<string, unknown>[];
  studyHistory: PlannerHistoryEntry[];
  userBehavior: Record<string, unknown>[];
}

export interface PlannerRecommendation {
  id: string;
  taskId?: string;
  title: string;
  reason: string;
  priorityLevel: PlannerPriorityLevel;
  impact?: string;
}

export interface AIReasoning {
  summary: string;
  signals: string[];
  notes: string[];
}
