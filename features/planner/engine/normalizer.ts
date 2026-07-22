import {
  ConfusionMarker,
  LearningData,
  PlannerDifficulty,
  PlannerPriority,
  PlannerTask,
  PlannerTaskMetadata,
  PlannerTaskStatus,
  PlannerTaskType,
  RecommendationRecord,
  SpacedRepetitionData,
  TimeEstimateEntry,
  WeakTopic,
} from "../types";

export interface PlannerEngineTaskInput {
  id: string;
  title: string;
  description?: string | null;
  subject?: string | null;
  type?: string | null;
  taskType?: string | null;
  deadline?: string | null;
  deadlineDate?: string | null;
  deadlineTime?: string | null;
  estimatedMinutes?: number | null;
  durationMinutes?: number | null;
  estimatedTime?: number | null;
  priority?: string | null;
  difficulty?: string | null;
  progress?: number | null;
  status?: string | null;
  completed?: boolean | null;
  completedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  startedAt?: string | null;
  lastActivityAt?: string | null;
  metadata?: unknown;
  progressMeta?: unknown;
  practiceResult?: unknown;
  practiceHistory?: unknown;
  assignmentGrade?: unknown;
  assignmentGradeHistory?: unknown;
  masteryScore?: unknown;
  masteryHistory?: unknown;
  studyHistory?: unknown;
  aiRecommendations?: unknown;
  tags?: unknown;
  externalReferences?: unknown;
  learningData?: unknown;
  weakTopics?: unknown;
  spacedRepetition?: unknown;
  confusionMarkers?: unknown;
  recommendationHistory?: unknown;
  confidence?: number | null;
  completionQuality?: number | null;
  lastReviewedAt?: string | null;
  reviewCount?: number | null;
  nextReviewAt?: string | null;
  timeSpentMinutes?: number | null;
  timeEstimateHistory?: unknown;
  actualDifficulty?: number | null;
  dependencies?: unknown;
}

const DEFAULT_SUBJECT = "General";
const DEFAULT_TITLE = "Untitled Task";

const PRIORITY_WEIGHT: Record<PlannerPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const TYPE_BASE_MINUTES: Record<PlannerTaskType, number> = {
  lesson: 45,
  assignment: 90,
  practice: 30,
  review: 20,
  custom: 30,
};

const DIFFICULTY_MULTIPLIER: Record<PlannerDifficulty, number> = {
  easy: 0.8,
  medium: 1,
  hard: 1.4,
  unknown: 1,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function normalizeSubject(subject: string | null | undefined): string {
  const trimmed = subject?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_SUBJECT;
}

function normalizeTaskType(type: string | null | undefined): PlannerTaskType {
  const value = type?.trim().toLowerCase();
  switch (value) {
    case "lesson":
    case "concept":
      return "lesson";
    case "assignment":
      return "assignment";
    case "practice":
      return "practice";
    case "review":
      return "review";
    case "custom":
      return "custom";
    case "mixed":
    default:
      return "custom";
  }
}

function normalizePriority(
  priority: string | null | undefined,
): PlannerPriority {
  const value = priority?.trim().toLowerCase();
  switch (value) {
    case "urgent":
      return "urgent";
    case "high":
      return "high";
    case "low":
      return "low";
    case "medium":
    default:
      return "medium";
  }
}

function normalizeDifficulty(
  difficulty: string | null | undefined,
): PlannerDifficulty {
  const value = difficulty?.trim().toLowerCase();
  switch (value) {
    case "easy":
      return "easy";
    case "hard":
      return "hard";
    case "medium":
      return "medium";
    case "unknown":
    default:
      return "unknown";
  }
}

function normalizeStatus(
  status: string | null | undefined,
  progress: number,
  completed: boolean,
): PlannerTaskStatus {
  const value = status?.trim().toLowerCase();

  if (completed || value === "completed" || progress >= 100) {
    return "completed";
  }

  if (value === "blocked") return "blocked";
  if (value === "cancelled") return "cancelled";
  if (value === "in_progress" || progress > 0) return "in_progress";

  return "not_started";
}

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function parsePlannerDate(
  value: string | null | undefined,
): Date | null {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "TBD" || trimmed === "null") return null;

  const dateOnly = parseDateOnly(trimmed);
  if (dateOnly) return dateOnly;

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatPlannerDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSamePlannerDay(left: Date, right: Date): boolean {
  return formatPlannerDateKey(left) === formatPlannerDateKey(right);
}

export function addPlannerDays(date: Date, offset: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + offset);
  return result;
}

export function startOfPlannerDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfPlannerDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function getWeekStart(date: Date): Date {
  const result = startOfPlannerDay(date);
  const dayOfWeek = result.getDay();
  const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  return addPlannerDays(result, offset);
}

export function getWeekEnd(date: Date): Date {
  return endOfPlannerDay(addPlannerDays(getWeekStart(date), 6));
}

function normalizeNonNegativeNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function normalizePositiveNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function estimateTaskMinutes(
  type: PlannerTaskType,
  difficulty: PlannerDifficulty,
): number {
  const baseMinutes = TYPE_BASE_MINUTES[type];
  const multiplier = DIFFICULTY_MULTIPLIER[difficulty];
  return Math.max(5, Math.round((baseMinutes * multiplier) / 5) * 5);
}

function normalizeDeadline(input: PlannerEngineTaskInput): string | null {
  const directDeadline = parsePlannerDate(input.deadline);
  if (directDeadline) return directDeadline.toISOString();

  const deadlineDate = input.deadlineDate?.trim();
  if (!deadlineDate || deadlineDate === "TBD" || deadlineDate === "null") {
    return null;
  }

  const parsedDate = parsePlannerDate(deadlineDate);
  if (!parsedDate) return null;

  const deadlineTime = input.deadlineTime?.trim();
  if (!deadlineTime) {
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 0, 0);
    return endOfDay.toISOString();
  }

  const [hoursText, minutesText] = deadlineTime.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 0, 0);
    return endOfDay.toISOString();
  }

  const combined = new Date(parsedDate);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

function normalizeMetadata(
  input: PlannerEngineTaskInput,
): PlannerTaskMetadata | undefined {
  const metadata: PlannerTaskMetadata = {};

  const metadataSource = isPlainObject(input.metadata)
    ? input.metadata
    : undefined;

  const practiceResultSource =
    (isPlainObject(input.practiceResult) && input.practiceResult) ||
    (metadataSource && isPlainObject(metadataSource.practiceResult)
      ? metadataSource.practiceResult
      : undefined);
  if (practiceResultSource) {
    metadata.practiceResult = {
      score: normalizeNonNegativeNumber(practiceResultSource.score) ?? null,
      completedAt:
        typeof practiceResultSource.completedAt === "string"
          ? practiceResultSource.completedAt
          : null,
      attempts:
        normalizeNonNegativeNumber(practiceResultSource.attempts) ?? null,
    };
  }

  const practiceHistorySource =
    (Array.isArray(input.practiceHistory)
      ? input.practiceHistory
      : undefined) ||
    (metadataSource && Array.isArray(metadataSource.practiceHistory)
      ? metadataSource.practiceHistory
      : undefined);
  if (practiceHistorySource) {
    metadata.practiceHistory = practiceHistorySource
      .filter(isPlainObject)
      .map((entry) => ({
        score: normalizeNonNegativeNumber(entry.score) ?? null,
        completedAt:
          typeof entry.completedAt === "string" ? entry.completedAt : null,
        attempts: normalizeNonNegativeNumber(entry.attempts) ?? null,
      }));
  }

  const masteryScore =
    normalizeNonNegativeNumber(
      input.masteryScore ??
        (metadataSource && "masteryScore" in metadataSource
          ? metadataSource.masteryScore
          : undefined),
    ) ?? null;
  if (masteryScore !== null) {
    metadata.masteryScore = masteryScore;
  }

  const masteryHistorySource =
    (Array.isArray(input.masteryHistory) ? input.masteryHistory : undefined) ||
    (metadataSource && Array.isArray(metadataSource.masteryHistory)
      ? metadataSource.masteryHistory
      : undefined);
  if (masteryHistorySource) {
    metadata.masteryHistory = masteryHistorySource
      .filter(isPlainObject)
      .map((entry) => ({
        score: normalizeNonNegativeNumber(entry.score) ?? null,
        recordedAt:
          typeof entry.recordedAt === "string"
            ? entry.recordedAt
            : new Date().toISOString(),
      }));
  }

  const assignmentGradeSource =
    (isPlainObject(input.assignmentGrade) && input.assignmentGrade) ||
    (metadataSource && isPlainObject(metadataSource.assignmentGrade)
      ? metadataSource.assignmentGrade
      : undefined);
  if (assignmentGradeSource) {
    metadata.assignmentGrade = {
      score: normalizeNonNegativeNumber(assignmentGradeSource.score) ?? null,
      maxScore:
        normalizeNonNegativeNumber(assignmentGradeSource.maxScore) ?? null,
      letterGrade:
        typeof assignmentGradeSource.letterGrade === "string"
          ? assignmentGradeSource.letterGrade
          : null,
      submittedAt:
        typeof assignmentGradeSource.submittedAt === "string"
          ? assignmentGradeSource.submittedAt
          : null,
    };
  }

  const assignmentGradeHistorySource =
    (Array.isArray(input.assignmentGradeHistory)
      ? input.assignmentGradeHistory
      : undefined) ||
    (metadataSource && Array.isArray(metadataSource.assignmentGradeHistory)
      ? metadataSource.assignmentGradeHistory
      : undefined);
  if (assignmentGradeHistorySource) {
    metadata.assignmentGradeHistory = assignmentGradeHistorySource
      .filter(isPlainObject)
      .map((entry) => ({
        score: normalizeNonNegativeNumber(entry.score) ?? null,
        maxScore: normalizeNonNegativeNumber(entry.maxScore) ?? null,
        letterGrade:
          typeof entry.letterGrade === "string" ? entry.letterGrade : null,
        submittedAt:
          typeof entry.submittedAt === "string" ? entry.submittedAt : null,
      }));
  }

  const studyHistorySource =
    (Array.isArray(input.studyHistory) ? input.studyHistory : undefined) ||
    (metadataSource && Array.isArray(metadataSource.studyHistory)
      ? metadataSource.studyHistory
      : undefined);
  if (studyHistorySource) {
    metadata.studyHistory = studyHistorySource
      .filter(isPlainObject)
      .map((entry, index) => ({
        id:
          typeof entry.id === "string" && entry.id.trim().length > 0
            ? entry.id
            : `study-${index}`,
        startedAt:
          typeof entry.startedAt === "string"
            ? entry.startedAt
            : new Date().toISOString(),
        endedAt: typeof entry.endedAt === "string" ? entry.endedAt : null,
        minutesStudied:
          normalizeNonNegativeNumber(entry.minutesStudied) ?? null,
        notes: typeof entry.notes === "string" ? entry.notes : undefined,
      }));
  }

  const aiRecommendationsSource =
    (Array.isArray(input.aiRecommendations)
      ? input.aiRecommendations
      : undefined) ||
    (metadataSource && Array.isArray(metadataSource.aiRecommendations)
      ? metadataSource.aiRecommendations
      : undefined);
  if (aiRecommendationsSource) {
    metadata.aiRecommendations = aiRecommendationsSource
      .filter(isPlainObject)
      .map((entry, index) => ({
        id:
          typeof entry.id === "string" && entry.id.trim().length > 0
            ? entry.id
            : `recommendation-${index}`,
        message: typeof entry.message === "string" ? entry.message : "",
        createdAt:
          typeof entry.createdAt === "string"
            ? entry.createdAt
            : new Date().toISOString(),
        source: typeof entry.source === "string" ? entry.source : undefined,
      }));
  }

  const tagsSource =
    (Array.isArray(input.tags) ? input.tags : undefined) ||
    (metadataSource && Array.isArray(metadataSource.tags)
      ? metadataSource.tags
      : undefined);
  if (tagsSource) {
    metadata.tags = tagsSource.filter(
      (tag): tag is string => typeof tag === "string",
    );
  }

  const externalReferencesSource =
    (Array.isArray(input.externalReferences)
      ? input.externalReferences
      : undefined) ||
    (metadataSource && Array.isArray(metadataSource.externalReferences)
      ? metadataSource.externalReferences
      : undefined);
  if (externalReferencesSource) {
    metadata.externalReferences = externalReferencesSource.filter(
      (reference): reference is string => typeof reference === "string",
    );
  }

  // ── Phase 4 Step 1: learningData ──
  const learningDataSource =
    (isPlainObject(input.learningData) ? input.learningData : undefined) ||
    (metadataSource && isPlainObject(metadataSource.learningData)
      ? metadataSource.learningData
      : undefined);
  if (learningDataSource) {
    const ld = learningDataSource as Record<string, unknown>;
    const normalized: LearningData = {
      practiceHistory: Array.isArray(ld.practiceHistory)
        ? ld.practiceHistory
            .filter(isPlainObject)
            .map((entry) => ({
              score:
                typeof entry.score === "number" && Number.isFinite(entry.score)
                  ? Math.min(100, Math.max(0, entry.score))
                  : null,
              attempts:
                typeof entry.attempts === "number" && Number.isFinite(entry.attempts)
                  ? Math.max(0, Math.round(entry.attempts))
                  : 0,
              date: typeof entry.date === "string" ? entry.date : new Date().toISOString(),
              notes: typeof entry.notes === "string" ? entry.notes : undefined,
            }))
        : [],
      masteryHistory: Array.isArray(ld.masteryHistory)
        ? ld.masteryHistory
            .filter(isPlainObject)
            .map((entry) => ({
              score:
                typeof entry.score === "number" && Number.isFinite(entry.score)
                  ? Math.min(100, Math.max(0, entry.score))
                  : null,
              date: typeof entry.date === "string" ? entry.date : new Date().toISOString(),
            }))
        : [],
      studySessions: Array.isArray(ld.studySessions)
        ? ld.studySessions
            .filter(isPlainObject)
            .map((entry) => ({
              minutes:
                typeof entry.minutes === "number" && Number.isFinite(entry.minutes)
                  ? Math.max(0, entry.minutes)
                  : 0,
              date: typeof entry.date === "string" ? entry.date : new Date().toISOString(),
              notes: typeof entry.notes === "string" ? entry.notes : undefined,
            }))
        : [],
      assignmentHistory: Array.isArray(ld.assignmentHistory)
        ? ld.assignmentHistory
            .filter(isPlainObject)
            .map((entry) => ({
              grade:
                typeof entry.grade === "number" && Number.isFinite(entry.grade)
                  ? Math.min(100, Math.max(0, entry.grade))
                  : null,
              maxGrade:
                typeof entry.maxGrade === "number" && Number.isFinite(entry.maxGrade)
                  ? Math.max(0, entry.maxGrade)
                  : undefined,
              letterGrade:
                typeof entry.letterGrade === "string" ? entry.letterGrade : undefined,
              submittedAt:
                typeof entry.submittedAt === "string"
                  ? entry.submittedAt
                  : new Date().toISOString(),
            }))
        : [],
    };
    metadata.learningData = normalized;
  }

  // ── Phase 4.5: spacedRepetition ──
  const spacedRepetitionSource =
    (isPlainObject(input.spacedRepetition) ? input.spacedRepetition : undefined) ||
    (metadataSource && isPlainObject(metadataSource.spacedRepetition)
      ? metadataSource.spacedRepetition
      : undefined);
  if (spacedRepetitionSource) {
    const sr = spacedRepetitionSource as Record<string, unknown>;
    metadata.spacedRepetition = {
      interval:
        typeof sr.interval === "number" && Number.isFinite(sr.interval)
          ? Math.max(0, Math.round(sr.interval))
          : 0,
      easeFactor:
        typeof sr.easeFactor === "number" && Number.isFinite(sr.easeFactor)
          ? Math.max(1.3, sr.easeFactor)
          : 2.5,
      nextReviewAt:
        typeof sr.nextReviewAt === "string" ? sr.nextReviewAt : null,
      repetitions:
        typeof sr.repetitions === "number" && Number.isFinite(sr.repetitions)
          ? Math.max(0, Math.round(sr.repetitions))
          : 0,
    };
  }

  // ── Phase 4.5: confusionMarkers ──
  const confusionMarkersSource =
    (Array.isArray(input.confusionMarkers) ? input.confusionMarkers : undefined) ||
    (metadataSource && Array.isArray(metadataSource.confusionMarkers)
      ? metadataSource.confusionMarkers
      : undefined);
  if (confusionMarkersSource) {
    metadata.confusionMarkers = confusionMarkersSource
      .filter(isPlainObject)
      .map((entry) => ({
        topic: typeof entry.topic === "string" ? entry.topic : "unknown",
        concept: typeof entry.concept === "string" ? entry.concept : "unknown",
        flaggedAt:
          typeof entry.flaggedAt === "string"
            ? entry.flaggedAt
            : new Date().toISOString(),
        reason: typeof entry.reason === "string" ? entry.reason : undefined,
      }));
  }

  // ── Phase 4.5: recommendationHistory ──
  const recommendationHistorySource =
    (Array.isArray(input.recommendationHistory)
      ? input.recommendationHistory
      : undefined) ||
    (metadataSource && Array.isArray(metadataSource.recommendationHistory)
      ? metadataSource.recommendationHistory
      : undefined);
  if (recommendationHistorySource) {
    metadata.recommendationHistory = recommendationHistorySource
      .filter(isPlainObject)
      .map((entry) => ({
        taskId: typeof entry.taskId === "string" ? entry.taskId : "",
        reason: typeof entry.reason === "string" ? entry.reason : "",
        timestamp:
          typeof entry.timestamp === "string"
            ? entry.timestamp
            : new Date().toISOString(),
        source: typeof entry.source === "string" ? entry.source : "unknown",
      }));
  }

  // ── Phase 4.1: weakTopics ──
  const weakTopicsSource =
    (Array.isArray(input.weakTopics) ? input.weakTopics : undefined) ||
    (metadataSource && Array.isArray(metadataSource.weakTopics)
      ? metadataSource.weakTopics
      : undefined);
  if (weakTopicsSource) {
    metadata.weakTopics = weakTopicsSource
      .filter(isPlainObject)
      .map((entry) => ({
        topic: typeof entry.topic === "string" ? entry.topic : "unknown",
        flaggedCount:
          typeof entry.flaggedCount === "number" && Number.isFinite(entry.flaggedCount)
            ? Math.max(0, Math.round(entry.flaggedCount))
            : 1,
        lastMasteryScore:
          typeof entry.lastMasteryScore === "number" && Number.isFinite(entry.lastMasteryScore)
            ? Math.min(100, Math.max(0, entry.lastMasteryScore))
            : undefined,
        lastFlaggedAt:
          typeof entry.lastFlaggedAt === "string"
            ? entry.lastFlaggedAt
            : new Date().toISOString(),
      }));
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

export function normalizeTask(
  input: PlannerEngineTaskInput,
  referenceDate: Date = new Date(),
): PlannerTask {
  const progress = clampProgress(input.progress ?? 0);
  const completed =
    input.completed === true ||
    input.status === "completed" ||
    input.completedAt !== undefined ||
    progress >= 100;
  const type = normalizeTaskType(input.type ?? input.taskType);
  const difficulty = normalizeDifficulty(input.difficulty);
  const priority = normalizePriority(input.priority);
  const estimatedMinutes =
    normalizePositiveNumber(input.estimatedMinutes) ??
    normalizePositiveNumber(input.durationMinutes) ??
    normalizePositiveNumber(input.estimatedTime) ??
    estimateTaskMinutes(type, difficulty);
  const createdAt = input.createdAt ?? referenceDate.toISOString();
  const updatedAt =
    input.updatedAt ?? input.lastActivityAt ?? referenceDate.toISOString();
  const deadline = normalizeDeadline(input);
  const metadata = normalizeMetadata(input);
  const normalizedProgress = completed ? 100 : progress;

  // ── Phase 4.5: normalize top-level intelligence fields ──
  const confidence =
    typeof input.confidence === "number" && Number.isFinite(input.confidence)
      ? Math.min(100, Math.max(0, Math.round(input.confidence)))
      : undefined;

  const completionQuality =
    typeof input.completionQuality === "number" &&
    Number.isFinite(input.completionQuality)
      ? Math.min(100, Math.max(0, Math.round(input.completionQuality)))
      : undefined;

  const lastReviewedAt =
    typeof input.lastReviewedAt === "string" ? input.lastReviewedAt : undefined;

  const reviewCount =
    typeof input.reviewCount === "number" && Number.isFinite(input.reviewCount)
      ? Math.max(0, Math.round(input.reviewCount))
      : undefined;

  const nextReviewAt =
    typeof input.nextReviewAt === "string" ? input.nextReviewAt : undefined;

  const timeSpentMinutes =
    typeof input.timeSpentMinutes === "number" &&
    Number.isFinite(input.timeSpentMinutes)
      ? Math.max(0, Math.round(input.timeSpentMinutes))
      : undefined;

  const timeEstimateHistorySource =
    Array.isArray(input.timeEstimateHistory)
      ? input.timeEstimateHistory
      : undefined;
  const timeEstimateHistory: TimeEstimateEntry[] | undefined =
    timeEstimateHistorySource
      ? timeEstimateHistorySource
          .filter(isPlainObject)
          .map((entry) => ({
            estimatedMinutes:
              typeof entry.estimatedMinutes === "number" &&
              Number.isFinite(entry.estimatedMinutes)
                ? Math.max(0, Math.round(entry.estimatedMinutes))
                : 0,
            actualMinutes:
              typeof entry.actualMinutes === "number" &&
              Number.isFinite(entry.actualMinutes)
                ? Math.max(0, Math.round(entry.actualMinutes))
                : 0,
            date:
              typeof entry.date === "string"
                ? entry.date
                : new Date().toISOString(),
          }))
      : undefined;

  const actualDifficulty =
    typeof input.actualDifficulty === "number" &&
    Number.isFinite(input.actualDifficulty)
      ? Math.min(100, Math.max(0, Math.round(input.actualDifficulty)))
      : undefined;

  const dependenciesSource = Array.isArray(input.dependencies)
    ? input.dependencies
    : undefined;
  const dependencies: string[] | undefined = dependenciesSource
    ? dependenciesSource.filter(
        (dep): dep is string => typeof dep === "string" && dep.trim().length > 0,
      )
    : undefined;

  return {
    id: input.id,
    title: input.title?.trim() || DEFAULT_TITLE,
    description:
      typeof input.description === "string" &&
      input.description.trim().length > 0
        ? input.description
        : null,
    subject: normalizeSubject(input.subject),
    type,
    deadline,
    estimatedMinutes,
    difficulty,
    priority,
    progress: normalizedProgress,
    status: normalizeStatus(input.status, normalizedProgress, completed),
    completed,
    createdAt,
    updatedAt,
    metadata,
    // ── Phase 4.5 ──
    ...(confidence !== undefined && { confidence }),
    ...(completionQuality !== undefined && { completionQuality }),
    ...(lastReviewedAt !== undefined && { lastReviewedAt }),
    ...(reviewCount !== undefined && { reviewCount }),
    ...(nextReviewAt !== undefined && { nextReviewAt }),
    ...(timeSpentMinutes !== undefined && { timeSpentMinutes }),
    ...(timeEstimateHistory !== undefined && { timeEstimateHistory }),
    ...(actualDifficulty !== undefined && { actualDifficulty }),
    ...(dependencies !== undefined && { dependencies }),
  };
}

export function normalizeTasks(
  tasks: ReadonlyArray<PlannerEngineTaskInput>,
  referenceDate: Date = new Date(),
): PlannerTask[] {
  return tasks.map((task) => normalizeTask(task, referenceDate));
}

export function getPlannerPriorityWeight(priority: PlannerPriority): number {
  return PRIORITY_WEIGHT[priority];
}

export function getPlannerEstimatedMinutes(task: PlannerTask): number {
  return task.estimatedMinutes ?? 0;
}

export function isTaskCompleted(task: PlannerTask): boolean {
  return task.completed || task.status === "completed" || task.progress >= 100;
}

export function isTaskOverdue(task: PlannerTask, referenceDate: Date): boolean {
  if (isTaskCompleted(task) || !task.deadline) return false;
  const deadline = parsePlannerDate(task.deadline);
  if (!deadline) return false;
  return (
    startOfPlannerDay(deadline).getTime() <
    startOfPlannerDay(referenceDate).getTime()
  );
}

export function getPlannerDeadlineDay(task: PlannerTask): string | null {
  if (!task.deadline) return null;
  const deadline = parsePlannerDate(task.deadline);
  return deadline ? formatPlannerDateKey(deadline) : null;
}
