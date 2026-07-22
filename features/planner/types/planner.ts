export type PlannerTaskType =
  | "lesson"
  | "assignment"
  | "practice"
  | "review"
  | "custom";

export type PlannerTaskStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "blocked"
  | "cancelled";

export type PlannerPriority = "low" | "medium" | "high" | "urgent";

export type PlannerDifficulty = "easy" | "medium" | "hard" | "unknown";

export type WorkloadLevel = "light" | "moderate" | "heavy" | "overloaded";

export type PlannerAnalyticsTrend = "up" | "down" | "stable";

export interface PlannerPracticeResult {
  score: number | null;
  completedAt: string | null;
  attempts: number | null;
}

export interface PlannerAssignmentGrade {
  score: number | null;
  maxScore: number | null;
  letterGrade: string | null;
  submittedAt: string | null;
}

export interface PlannerStudyHistoryEntry {
  id: string;
  startedAt: string;
  endedAt: string | null;
  minutesStudied: number | null;
  notes?: string;
}

export interface PlannerAIRecommendation {
  id: string;
  message: string;
  createdAt: string;
  source?: string;
}

// ──────────────────────────────────────────────
// Phase 4.1: Dedicated learning record types
// ──────────────────────────────────────────────

/** A single practice attempt record. */
export interface PracticeHistoryEntry {
  score: number | null;
  attempts: number;
  date: string;
  notes?: string;
}

/** A single mastery snapshot. */
export interface MasteryHistoryEntry {
  score: number | null;
  date: string;
}

/** A single assignment submission record. */
export interface AssignmentHistoryEntry {
  grade: number | null;
  maxGrade?: number | null;
  letterGrade?: string | null;
  submittedAt: string;
}

/** A single learning/study session. */
export interface LearningSessionEntry {
  minutes: number;
  date: string;
  notes?: string;
}

/** A weak topic that needs attention. */
export interface WeakTopic {
  topic: string;
  flaggedCount: number;
  lastMasteryScore?: number | null;
  lastFlaggedAt: string;
}

/** Complete learning record for a task. */
export interface LearningData {
  practiceHistory: PracticeHistoryEntry[];
  masteryHistory: MasteryHistoryEntry[];
  studySessions: LearningSessionEntry[];
  assignmentHistory: AssignmentHistoryEntry[];
}

// ──────────────────────────────────────────────
// Phase 4.5: Intelligence data model
// ──────────────────────────────────────────────

export interface TimeEstimateEntry {
  estimatedMinutes: number;
  actualMinutes: number;
  date: string;
}

export interface SpacedRepetitionData {
  interval: number;
  easeFactor: number;
  nextReviewAt: string | null;
  repetitions: number;
}

export interface ConfusionMarker {
  topic: string;
  concept: string;
  flaggedAt: string;
  reason?: string;
}

export interface RecommendationRecord {
  taskId: string;
  reason: string;
  timestamp: string;
  source: string;
}

// ──────────────────────────────────────────────
// Phase 6: Learning Profile & Self-Improvement
// ──────────────────────────────────────────────

export type StudyTypePreference = "practice" | "review" | "learn" | "work";

export interface SubjectInsight {
  subject: string;
  taskCount: number;
  completedCount: number;
  averageMastery: number | null;
  averageConfidence: number | null;
  averageCompletionQuality: number | null;
  averageStudyMinutes: number | null;
  weakTopics: string[];
  /** "improving" | "declining" | "stable" | null */
  trend: string | null;
}

export interface LearningProfile {
  strengths: string[];
  weaknesses: string[];
  preferredSessionLength: number | null;
  favoriteStudyType: StudyTypePreference | null;
  averageConfidence: number | null;
  averageMastery: number | null;
  averageCompletionQuality: number | null;
  averagePracticeScore: number | null;
  averageAssignmentScore: number | null;
  averageStudySessionMinutes: number | null;
  mostStudiedSubject: string | null;
  weakestSubject: string | null;
  strongestSubject: string | null;
  commonWeakTopics: string[];
  completionRate: number | null;
  averageEstimatedVsActual: number | null;
  reviewConsistency: number | null;
  reviewFrequency: number | null;
  averageReviewInterval: number | null;
  masteryGrowthRate: number | null;
  totalStudyMinutes: number;
  totalTasks: number;
  completedTasks: number;
}

export interface RecommendationOutcome {
  taskId: string;
  recommendedAt: string;
  outcome: "success" | "partial" | "ignored" | "failed";
  reason: string;
}

// ──────────────────────────────────────────────

export interface PlannerTaskMetadata {
  practiceResult?: PlannerPracticeResult;
  practiceHistory?: PlannerPracticeResult[];
  masteryScore?: number | null;
  masteryHistory?: Array<{
    score: number | null;
    recordedAt: string;
  }>;
  assignmentGrade?: PlannerAssignmentGrade;
  assignmentGradeHistory?: PlannerAssignmentGrade[];
  studyHistory?: PlannerStudyHistoryEntry[];
  aiRecommendations?: PlannerAIRecommendation[];
  tags?: string[];
  externalReferences?: string[];

  // ── Phase 4.1 ──
  learningData?: LearningData;
  weakTopics?: WeakTopic[];

  // ── Phase 4.5 ──
  spacedRepetition?: SpacedRepetitionData;
  confusionMarkers?: ConfusionMarker[];
  recommendationHistory?: RecommendationRecord[];

  // ── Phase 6 ──
  /** Track outcomes of past recommendations for self-improvement. */
  recommendationOutcomes?: RecommendationOutcome[];
}

export interface PlannerTask {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  type: PlannerTaskType;
  deadline: string | null;
  estimatedMinutes: number | null;
  difficulty: PlannerDifficulty;
  priority: PlannerPriority;
  progress: number;
  status: PlannerTaskStatus;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: PlannerTaskMetadata;

  // ── Phase 4.5 ──
  confidence?: number | null;
  completionQuality?: number | null;
  lastReviewedAt?: string | null;
  reviewCount?: number;
  nextReviewAt?: string | null;
  timeSpentMinutes?: number;
  timeEstimateHistory?: TimeEstimateEntry[];
  actualDifficulty?: number | null;
  dependencies?: string[];
}

export interface TimelineItem {
  taskId: string;
  title: string;
  subject: string;
  startTime: string;
  endTime: string;
  duration: number;
  reason: string | null;
  priority: PlannerPriority;
}

export interface MissionState {
  title: string;
  description: string;
  estimatedMinutes: number | null;
  mainTaskId: string | null;
  taskCount: number;
  warnings: string[];
}

export interface TodayState {
  mission: MissionState;
  timeline: TimelineItem[];
  totalMinutes: number;
  completedMinutes: number;
  remainingMinutes: number;
}

export interface WeekDayState {
  date: string;
  tasks: PlannerTask[];
  estimatedMinutes: number;
  workload: WorkloadLevel;
}

export interface WeekState {
  days: WeekDayState[];
  totalHours: number;
  hardestDay: WeekDayState | null;
  lightestDay: WeekDayState | null;
}

export interface CalendarDayState {
  date: string;
  hasTasks: boolean;
  tasks: PlannerTask[];
}

export interface CalendarState {
  month: number;
  year: number;
  days: CalendarDayState[];
}

export interface UpcomingGroupState {
  tasks: PlannerTask[];
  estimatedMinutes: number;
}

export interface UpcomingState {
  tomorrow: UpcomingGroupState;
  laterThisWeek: UpcomingGroupState;
  nextWeek: UpcomingGroupState;
  future: UpcomingGroupState;
}

export type OverdueTask = PlannerTask & {
  completed: false;
  status: Exclude<PlannerTaskStatus, "completed">;
};

export interface OverdueState {
  tasks: OverdueTask[];
  count: number;
}

export interface AnalyticsMetricState {
  value: number | null;
  previousValue?: number | null;
  trend?: PlannerAnalyticsTrend | null;
  updatedAt?: string | null;
}

export interface SubjectProgressState {
  subject: string;
  completionRate: number | null;
  masteryPerformance: number | null;
  studyHours: number | null;
}

export interface StreakState {
  current: number | null;
  longest: number | null;
  lastActiveAt: string | null;
}

export interface AnalyticsState {
  completionRate: AnalyticsMetricState | null;
  studyHours: AnalyticsMetricState | null;
  practicePerformance: AnalyticsMetricState | null;
  masteryPerformance: AnalyticsMetricState | null;
  subjectProgress: SubjectProgressState[];
  streak: StreakState | null;
}

export interface TaskPriorityScore {
  taskId: string;
  score: number;
  reasons: string[];
}

export interface NextActionResult {
  taskId: string;
  action: string;
  reason: string;
  explanation: string;
  estimatedMinutes: number;
  priorityScore: number;
  /** Recommendation record ready to be appended to the store. */
  record: RecommendationRecord;
}

export interface StudyBlockResult {
  taskId: string;
  title: string;
  subject: string;
  type: "learn" | "practice" | "review" | "work";
  duration: number;
  date: string;
  reason: string;
  priorityScore?: number;
  deadline?: string | null;
}

export interface PlannerState {
  tasks: PlannerTask[];
  today: TodayState;
  week: WeekState;
  calendar: CalendarState;
  upcoming: UpcomingState;
  overdue: OverdueState;
  analytics: AnalyticsState;
  generatedAt: string;

  // ── Phase 5: Intelligence results ──
  nextAction: NextActionResult | null;
  studySchedule: StudyBlockResult[];
  priorityScores: TaskPriorityScore[];

  // ── Phase 6: Learning profile & insights ──
  learningProfile: LearningProfile;
  subjectInsights: SubjectInsight[];
}