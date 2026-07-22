import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { normalizeTask, type PlannerEngineTaskInput } from "../engine";
import type {
  ConfusionMarker,
  LearningData,
  LearningSessionEntry,
  PracticeHistoryEntry,
  PlannerAssignmentGrade,
  PlannerPracticeResult,
  PlannerStudyHistoryEntry,
  PlannerTask,
  PlannerTaskMetadata,
  RecommendationRecord,
  SpacedRepetitionData,
  TimeEstimateEntry,
  WeakTopic,
} from "../types";

const STORAGE_KEY = "student-planner-storage";

/**
 * Set to `true` to seed demo tasks on first load.
 * Production should keep this `false`.
 */
const DEMO_MODE = false;

export interface PlannerStoreTaskInput extends Partial<
  Omit<PlannerEngineTaskInput, "id">
> {
  id?: string;
}

export interface PracticeResultInput extends Partial<
  Omit<PlannerPracticeResult, "attempts">
> {
  attempts?: number | null;
}

export interface AssignmentGradeInput extends Partial<
  Omit<PlannerAssignmentGrade, "submittedAt">
> {
  submittedAt?: string | null;
}

export interface StudySessionInput extends Partial<PlannerStudyHistoryEntry> {
  id?: string;
}

export interface MasteryScoreEntry {
  score: number | null;
  recordedAt: string;
}

export interface ScheduleOverride {
  id: string;
  taskId: string;
  originalDate: string;
  newDate: string;
  newTime?: string;
  createdAt: string;
}

export interface PlannerStoreState {
  tasks: PlannerTask[];
  scheduleOverrides: ScheduleOverride[];
  setTasks: (tasks: PlannerTask[]) => void;
  addTask: (task?: PlannerStoreTaskInput) => PlannerTask;
  updateTask: (
    taskId: string,
    updates: PlannerStoreTaskInput,
  ) => PlannerTask | null;
  deleteTask: (taskId: string) => boolean;
  completeTask: (taskId: string) => PlannerTask | null;
  savePracticeResult: (
    taskId: string,
    result: PracticeResultInput,
  ) => PlannerTask | null;
  saveAssignmentGrade: (
    taskId: string,
    grade: AssignmentGradeInput,
  ) => PlannerTask | null;
  addStudySession: (
    taskId: string,
    session: StudySessionInput,
  ) => PlannerTask | null;
  updateMasteryScore: (
    taskId: string,
    score: number | null,
  ) => PlannerTask | null;

  // ── Phase 4 Step 1: rich learning data actions ──

  /**
   * Append a practice attempt to the task's learningData.practiceHistory.
   * Unlike savePracticeResult (which tracks the old flat shape), this
   * always appends and never overwrites.
   */
  recordPracticeEntry: (
    taskId: string,
    entry: PracticeHistoryEntry,
  ) => PlannerTask | null;

  /**
   * Append a mastery snapshot to the task's learningData.masteryHistory.
   */
  recordMasteryEntry: (
    taskId: string,
    score: number | null,
    date?: string,
  ) => PlannerTask | null;

  /**
   * Append an assignment submission to the task's learningData.assignmentHistory.
   */
  recordAssignmentEntry: (
    taskId: string,
    entry: {
      grade: number | null;
      maxGrade?: number | null;
      letterGrade?: string | null;
      submittedAt: string;
    },
  ) => PlannerTask | null;

  /**
   * Record a learning/study session in the task's learningData.studySessions.
   */
  recordLearningSession: (
    taskId: string,
    session: {
      minutes: number;
      notes?: string;
      date?: string;
    },
  ) => PlannerTask | null;

  /**
   * Flag (or increment) a weak topic for this task.
   */
  flagWeakTopic: (
    taskId: string,
    topic: string,
    masteryScore?: number | null,
  ) => PlannerTask | null;

  /**
   * Get the structured learning data for a task, or undefined if none exists.
   */
  getTaskLearningData: (taskId: string) => LearningData | undefined;

  // ── Phase 4.5: intelligence data actions ──

  /**
   * Record the student's self-rated confidence (0-100) for a task.
   */
  recordConfidence: (
    taskId: string,
    confidence: number | null,
  ) => PlannerTask | null;

  /**
   * Record a review event: updates lastReviewedAt, increments reviewCount,
   * and optionally sets nextReviewAt for spaced repetition.
   */
  recordReview: (
    taskId: string,
    nextReviewAt?: string | null,
  ) => PlannerTask | null;

  /**
   * Set the completion quality (0-100) for a task.
   * Distinguishes "finished" from "understood".
   */
  updateCompletionQuality: (
    taskId: string,
    quality: number | null,
  ) => PlannerTask | null;

  /**
   * Add a dependency (task ID) to a task.
   */
  addDependency: (taskId: string, dependencyId: string) => PlannerTask | null;

  /**
   * Remove a dependency (task ID) from a task.
   */
  removeDependency: (
    taskId: string,
    dependencyId: string,
  ) => PlannerTask | null;

  /**
   * Record actual time spent and optionally add a time estimate entry.
   */
  recordTimeSpent: (
    taskId: string,
    actualMinutes: number,
  ) => PlannerTask | null;

  /**
   * Set the student-rated actual difficulty (0-100) after completion.
   */
  setActualDifficulty: (
    taskId: string,
    difficulty: number | null,
  ) => PlannerTask | null;

  /**
   * Add a confusion marker for a specific concept within a task.
   */
  recordConfusionMarker: (
    taskId: string,
    marker: {
      topic: string;
      concept: string;
      reason?: string;
    },
  ) => PlannerTask | null;

  /**
   * Record a recommendation from the planner engine.
   */
  recordRecommendation: (
    taskId: string,
    recommendation: {
      reason: string;
      source: string;
    },
  ) => PlannerTask | null;

  /**
   * Update spaced repetition data for a task.
   */
  updateSpacedRepetition: (
    taskId: string,
    data: SpacedRepetitionData,
  ) => PlannerTask | null;

  // ── Phase 8: timeline schedule overrides ──
  addScheduleOverride: (
    override: Omit<ScheduleOverride, "id" | "createdAt">,
  ) => ScheduleOverride;
  removeScheduleOverride: (overrideId: string) => void;
  updateScheduleOverride: (
    overrideId: string,
    updates: Partial<Omit<ScheduleOverride, "id" | "createdAt">>,
  ) => void;
}

function createId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `planner-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
}

function nowIso(): string {
  return new Date().toISOString();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeMetadata(
  existing?: PlannerTaskMetadata,
  patch?: PlannerTaskMetadata,
): PlannerTaskMetadata | undefined {
  if (!existing && !patch) return undefined;
  return {
    ...(existing ?? {}),
    ...(patch ?? {}),
  };
}

function areEqualRecords(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function normalizeStoredTask(
  input: PlannerStoreTaskInput,
  referenceDate: Date,
): PlannerTask {
  const taskInput: PlannerEngineTaskInput = {
    ...input,
    id: input.id ?? createId(),
    title: input.title ?? "Untitled Task",
    createdAt: input.createdAt ?? nowIso(),
    updatedAt: input.updatedAt ?? nowIso(),
  };

  if (input.metadata && isPlainObject(input.metadata)) {
    taskInput.metadata = {
      ...(input.metadata as Record<string, unknown>),
    };
  }

  return normalizeTask(taskInput, referenceDate);
}

function createInitialPlannerTasks(
  referenceDate: Date = new Date(),
): PlannerTask[] {
  const baseTime = referenceDate.toISOString();
  const lesson = normalizeTask(
    {
      id: "seed-biology-cell-structure",
      title: "Biology Cell Structure",
      description:
        "Review the structure and function of plant and animal cells.",
      subject: "Biology",
      type: "lesson",
      deadlineDate: new Date(referenceDate.getTime() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      priority: "medium",
      difficulty: "medium",
      progress: 30,
      status: "in_progress",
      completed: false,
      estimatedMinutes: 45,
      createdAt: baseTime,
      updatedAt: baseTime,
      metadata: {
        studyHistory: [
          {
            id: "biology-study-1",
            startedAt: baseTime,
            endedAt: baseTime,
            minutesStudied: 30,
          },
        ],
        masteryScore: 72,
        masteryHistory: [{ score: 72, recordedAt: baseTime }],
      },
    },
    referenceDate,
  );

  const assignment = normalizeTask(
    {
      id: "seed-history-essay",
      title: "History Essay",
      description: "Draft and submit the essay on early industrialization.",
      subject: "History",
      type: "assignment",
      deadlineDate: new Date(referenceDate.getTime() + 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      priority: "high",
      difficulty: "hard",
      progress: 60,
      status: "in_progress",
      completed: false,
      estimatedMinutes: 90,
      createdAt: baseTime,
      updatedAt: baseTime,
      metadata: {
        assignmentGrade: {
          score: 88,
          maxScore: 100,
          letterGrade: "B+",
          submittedAt: baseTime,
        },
        assignmentGradeHistory: [
          {
            score: 88,
            maxScore: 100,
            letterGrade: "B+",
            submittedAt: baseTime,
          },
        ],
      },
    },
    referenceDate,
  );

  const practice = normalizeTask(
    {
      id: "seed-algebra-equations-practice",
      title: "Algebra Equations Practice",
      description:
        "Work through equation-solving drills and check the results.",
      subject: "Math",
      type: "practice",
      deadlineDate: new Date(referenceDate.getTime() + 1 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      priority: "urgent",
      difficulty: "medium",
      progress: 50,
      status: "in_progress",
      completed: false,
      estimatedMinutes: 30,
      createdAt: baseTime,
      updatedAt: baseTime,
      metadata: {
        practiceResult: {
          score: 75,
          completedAt: baseTime,
          attempts: 1,
        },
        practiceHistory: [
          {
            score: 75,
            completedAt: baseTime,
            attempts: 1,
          },
        ],
        studyHistory: [
          {
            id: "algebra-study-1",
            startedAt: baseTime,
            endedAt: baseTime,
            minutesStudied: 20,
          },
        ],
      },
    },
    referenceDate,
  );

  return [lesson, assignment, practice];
}

function getTaskIndex(tasks: PlannerTask[], taskId: string): number {
  return tasks.findIndex((task) => task.id === taskId);
}

function updateTaskAtIndex(
  tasks: PlannerTask[],
  index: number,
  nextTask: PlannerTask,
): PlannerTask[] {
  return tasks.map((task, taskIndex) =>
    taskIndex === index ? nextTask : task,
  );
}

function normalizeTaskForUpdate(
  existing: PlannerTask,
  updates: PlannerStoreTaskInput,
): PlannerTask {
  const mergedMetadata = mergeMetadata(
    existing.metadata,
    isPlainObject(updates.metadata)
      ? (updates.metadata as PlannerTaskMetadata)
      : undefined,
  );

  return normalizeTask(
    {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: nowIso(),
      metadata: mergedMetadata,
    },
    new Date(),
  );
}

function ensurePracticeHistory(
  metadata: PlannerTaskMetadata,
  nextResult: PlannerPracticeResult,
): PlannerTaskMetadata {
  const history = [...(metadata.practiceHistory ?? [])];
  if (
    metadata.practiceResult &&
    !areEqualRecords(history.at(-1), metadata.practiceResult)
  ) {
    history.push(metadata.practiceResult);
  }
  history.push(nextResult);

  return {
    ...metadata,
    practiceResult: nextResult,
    practiceHistory: history,
  };
}

function ensureAssignmentGradeHistory(
  metadata: PlannerTaskMetadata,
  nextGrade: PlannerAssignmentGrade,
): PlannerTaskMetadata {
  const history = [...(metadata.assignmentGradeHistory ?? [])];
  if (
    metadata.assignmentGrade &&
    !areEqualRecords(history.at(-1), metadata.assignmentGrade)
  ) {
    history.push(metadata.assignmentGrade);
  }
  history.push(nextGrade);

  return {
    ...metadata,
    assignmentGrade: nextGrade,
    assignmentGradeHistory: history,
  };
}

function normalizePracticeResult(
  result: PracticeResultInput,
  existing: PlannerTask,
): PlannerPracticeResult {
  const previousAttempts = existing.metadata?.practiceResult?.attempts ?? 0;
  const nextAttempts = Math.max(previousAttempts + 1, result.attempts ?? 0);

  return {
    score:
      typeof result.score === "number" && Number.isFinite(result.score)
        ? Math.min(100, Math.max(0, result.score))
        : null,
    completedAt: result.completedAt ?? nowIso(),
    attempts: nextAttempts,
  };
}

function normalizeAssignmentGrade(
  grade: AssignmentGradeInput,
): PlannerAssignmentGrade {
  return {
    score:
      typeof grade.score === "number" && Number.isFinite(grade.score)
        ? Math.min(100, Math.max(0, grade.score))
        : null,
    maxScore:
      typeof grade.maxScore === "number" && Number.isFinite(grade.maxScore)
        ? Math.max(0, grade.maxScore)
        : null,
    letterGrade: grade.letterGrade ?? null,
    submittedAt: grade.submittedAt ?? nowIso(),
  };
}

function normalizeStudySession(
  session: StudySessionInput,
): PlannerStudyHistoryEntry {
  return {
    id: session.id ?? createId(),
    startedAt: session.startedAt ?? nowIso(),
    endedAt: session.endedAt ?? null,
    minutesStudied:
      typeof session.minutesStudied === "number" &&
      Number.isFinite(session.minutesStudied)
        ? Math.max(0, session.minutesStudied)
        : null,
    notes: session.notes,
  };
}

function buildNextTaskState(
  existing: PlannerTask,
  nextMetadata: PlannerTaskMetadata,
  overrides: Partial<PlannerTask> = {},
): PlannerTask {
  return normalizeTask(
    {
      ...existing,
      ...overrides,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: nowIso(),
      metadata: nextMetadata,
    },
    new Date(),
  );
}

const safeStorage =
  typeof window !== "undefined"
    ? createJSONStorage(() => window.localStorage)
    : undefined;

export const usePlannerStore = create<PlannerStoreState>()(
  persist(
    (set, get) => ({
      tasks: DEMO_MODE ? createInitialPlannerTasks() : [],

      setTasks: (tasks) => {
        set({ tasks });
      },

      addTask: (task = {}) => {
        const nextTask = normalizeStoredTask(
          {
            ...task,
            id: task.id ?? createId(),
            createdAt: task.createdAt ?? nowIso(),
            updatedAt: task.updatedAt ?? nowIso(),
          },
          new Date(),
        );

        set((state) => ({ tasks: [...state.tasks, nextTask] }));
        return nextTask;
      },

      updateTask: (taskId, updates) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const nextTask = normalizeTaskForUpdate(existing, updates);
        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      deleteTask: (taskId) => {
        const previousLength = get().tasks.length;
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }));
        return get().tasks.length !== previousLength;
      },

      completeTask: (taskId) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const nextMetadata = existing.metadata
          ? { ...existing.metadata }
          : undefined;
        const nextTask = buildNextTaskState(existing, nextMetadata ?? {}, {
          progress: 100,
          status: "completed",
          completed: true,
        });

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      savePracticeResult: (taskId, result) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const nextResult = normalizePracticeResult(result, existing);
        const nextMetadata = ensurePracticeHistory(
          existing.metadata ?? {},
          nextResult,
        );
        const nextTask = buildNextTaskState(existing, nextMetadata);

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      saveAssignmentGrade: (taskId, grade) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const nextGrade = normalizeAssignmentGrade(grade);
        const nextMetadata = ensureAssignmentGradeHistory(
          existing.metadata ?? {},
          nextGrade,
        );
        const nextTask = buildNextTaskState(existing, nextMetadata);

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      addStudySession: (taskId, session) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const nextSession = normalizeStudySession(session);
        const nextMetadata = {
          ...(existing.metadata ?? {}),
          studyHistory: [
            ...(existing.metadata?.studyHistory ?? []),
            nextSession,
          ],
        };
        const nextTask = buildNextTaskState(existing, nextMetadata);

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      updateMasteryScore: (taskId, score) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const recordedAt = nowIso();
        const nextMetadata = {
          ...(existing.metadata ?? {}),
          masteryScore:
            typeof score === "number" && Number.isFinite(score)
              ? Math.min(100, Math.max(0, score))
              : null,
          masteryHistory: [
            ...(existing.metadata?.masteryHistory ?? []),
            {
              score:
                typeof score === "number" && Number.isFinite(score)
                  ? Math.min(100, Math.max(0, score))
                  : null,
              recordedAt,
            } satisfies MasteryScoreEntry,
          ],
        };
        const nextTask = buildNextTaskState(existing, nextMetadata);

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      // ── Phase 4 Step 1: rich learning data actions ──

      recordPracticeEntry: (taskId, entry) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const currentLearningData = existing.metadata?.learningData ?? {
          practiceHistory: [],
          masteryHistory: [],
          studySessions: [],
          assignmentHistory: [],
        };

        const nextLearningData: LearningData = {
          ...currentLearningData,
          practiceHistory: [
            ...(currentLearningData.practiceHistory ?? []),
            {
              score:
                typeof entry.score === "number" && Number.isFinite(entry.score)
                  ? Math.min(100, Math.max(0, entry.score))
                  : null,
              attempts:
                typeof entry.attempts === "number" && Number.isFinite(entry.attempts)
                  ? Math.max(0, Math.round(entry.attempts))
                  : 0,
              date: entry.date ?? nowIso(),
              notes: entry.notes,
            },
          ],
        };

        const nextMetadata = {
          ...(existing.metadata ?? {}),
          learningData: nextLearningData,
        };
        const nextTask = buildNextTaskState(existing, nextMetadata);

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      recordMasteryEntry: (taskId, score, date) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const currentLearningData = existing.metadata?.learningData ?? {
          practiceHistory: [],
          masteryHistory: [],
          studySessions: [],
          assignmentHistory: [],
        };

        const nextLearningData: LearningData = {
          ...currentLearningData,
          masteryHistory: [
            ...(currentLearningData.masteryHistory ?? []),
            {
              score:
                typeof score === "number" && Number.isFinite(score)
                  ? Math.min(100, Math.max(0, score))
                  : null,
              date: date ?? nowIso(),
            },
          ],
        };

        const nextMetadata = {
          ...(existing.metadata ?? {}),
          learningData: nextLearningData,
          // Also update the flat masteryScore for backward compat with analytics
          masteryScore:
            typeof score === "number" && Number.isFinite(score)
              ? Math.min(100, Math.max(0, score))
              : null,
          masteryHistory: [
            ...(existing.metadata?.masteryHistory ?? []),
            {
              score:
                typeof score === "number" && Number.isFinite(score)
                  ? Math.min(100, Math.max(0, score))
                  : null,
              recordedAt: date ?? nowIso(),
            },
          ],
        };
        const nextTask = buildNextTaskState(existing, nextMetadata);

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      recordAssignmentEntry: (taskId, entry) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const currentLearningData = existing.metadata?.learningData ?? {
          practiceHistory: [],
          masteryHistory: [],
          studySessions: [],
          assignmentHistory: [],
        };

        const nextLearningData: LearningData = {
          ...currentLearningData,
          assignmentHistory: [
            ...(currentLearningData.assignmentHistory ?? []),
            {
              grade:
                typeof entry.grade === "number" && Number.isFinite(entry.grade)
                  ? Math.min(100, Math.max(0, entry.grade))
                  : null,
              maxGrade:
                typeof entry.maxGrade === "number" && Number.isFinite(entry.maxGrade)
                  ? Math.max(0, entry.maxGrade)
                  : undefined,
              letterGrade: entry.letterGrade ?? undefined,
              submittedAt: entry.submittedAt ?? nowIso(),
            },
          ],
        };

        const nextMetadata = {
          ...(existing.metadata ?? {}),
          learningData: nextLearningData,
        };
        const nextTask = buildNextTaskState(existing, nextMetadata);

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      recordLearningSession: (taskId, session) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const currentLearningData = existing.metadata?.learningData ?? {
          practiceHistory: [],
          masteryHistory: [],
          studySessions: [],
          assignmentHistory: [],
        };

        const nextLearningData: LearningData = {
          ...currentLearningData,
          studySessions: [
            ...(currentLearningData.studySessions ?? []),
            {
              minutes:
                typeof session.minutes === "number" && Number.isFinite(session.minutes)
                  ? Math.max(0, session.minutes)
                  : 0,
              date: session.date ?? nowIso(),
              notes: session.notes,
            },
          ],
        };

        const nextMetadata = {
          ...(existing.metadata ?? {}),
          learningData: nextLearningData,
        };
        const nextTask = buildNextTaskState(existing, nextMetadata);

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      flagWeakTopic: (taskId, topic, masteryScore) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const currentWeakTopics = existing.metadata?.weakTopics ?? [];
        const existingTopicIndex = currentWeakTopics.findIndex(
          (wt) => wt.topic === topic,
        );

        const now = nowIso();
        let nextWeakTopics: WeakTopic[];

        if (existingTopicIndex >= 0) {
          // Increment existing weak topic
          const existingTopic = currentWeakTopics[existingTopicIndex];
          nextWeakTopics = currentWeakTopics.map((wt, i) =>
            i === existingTopicIndex
              ? {
                  ...wt,
                  flaggedCount: wt.flaggedCount + 1,
                  lastMasteryScore:
                    typeof masteryScore === "number"
                      ? Math.min(100, Math.max(0, masteryScore))
                      : wt.lastMasteryScore,
                  lastFlaggedAt: now,
                }
              : wt,
          );
        } else {
          // Add new weak topic
          nextWeakTopics = [
            ...currentWeakTopics,
            {
              topic,
              flaggedCount: 1,
              lastMasteryScore:
                typeof masteryScore === "number"
                  ? Math.min(100, Math.max(0, masteryScore))
                  : undefined,
              lastFlaggedAt: now,
            },
          ];
        }

        const nextMetadata = {
          ...(existing.metadata ?? {}),
          weakTopics: nextWeakTopics,
        };
        const nextTask = buildNextTaskState(existing, nextMetadata);

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      getTaskLearningData: (taskId) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === taskId);
        return task?.metadata?.learningData;
      },

      // ── Phase 4.5: intelligence data actions ──

      recordConfidence: (taskId, confidence) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const nextTask = normalizeTask(
          {
            ...existing,
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: nowIso(),
            metadata: existing.metadata,
            confidence:
              typeof confidence === "number" && Number.isFinite(confidence)
                ? Math.min(100, Math.max(0, Math.round(confidence)))
                : null,
          },
          new Date(),
        );

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      recordReview: (taskId, nextReviewAt) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const currentReviewCount = existing.reviewCount ?? 0;
        const nextTask = normalizeTask(
          {
            ...existing,
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: nowIso(),
            metadata: existing.metadata,
            lastReviewedAt: nowIso(),
            reviewCount: currentReviewCount + 1,
            nextReviewAt:
              typeof nextReviewAt === "string" ? nextReviewAt : undefined,
          },
          new Date(),
        );

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      updateCompletionQuality: (taskId, quality) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const nextTask = normalizeTask(
          {
            ...existing,
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: nowIso(),
            metadata: existing.metadata,
            completionQuality:
              typeof quality === "number" && Number.isFinite(quality)
                ? Math.min(100, Math.max(0, Math.round(quality)))
                : null,
          },
          new Date(),
        );

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      addDependency: (taskId, dependencyId) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const currentDeps = existing.dependencies ?? [];
        if (currentDeps.includes(dependencyId)) return existing;

        const nextTask = normalizeTask(
          {
            ...existing,
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: nowIso(),
            metadata: existing.metadata,
            dependencies: [...currentDeps, dependencyId],
          },
          new Date(),
        );

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      removeDependency: (taskId, dependencyId) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const currentDeps = existing.dependencies ?? [];
        const nextDeps = currentDeps.filter((dep) => dep !== dependencyId);
        if (nextDeps.length === currentDeps.length) return existing;

        const nextTask = normalizeTask(
          {
            ...existing,
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: nowIso(),
            metadata: existing.metadata,
            dependencies: nextDeps.length > 0 ? nextDeps : undefined,
          },
          new Date(),
        );

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      recordTimeSpent: (taskId, actualMinutes) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const clampedMinutes =
          typeof actualMinutes === "number" && Number.isFinite(actualMinutes)
            ? Math.max(0, Math.round(actualMinutes))
            : 0;

        const currentTotal = existing.timeSpentMinutes ?? 0;
        const currentHistory = existing.timeEstimateHistory ?? [];
        const now = nowIso();

        const nextTask = normalizeTask(
          {
            ...existing,
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: nowIso(),
            metadata: existing.metadata,
            timeSpentMinutes: currentTotal + clampedMinutes,
            timeEstimateHistory: [
              ...currentHistory,
              {
                estimatedMinutes: existing.estimatedMinutes ?? 0,
                actualMinutes: clampedMinutes,
                date: now,
              },
            ],
          },
          new Date(),
        );

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      setActualDifficulty: (taskId, difficulty) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const nextTask = normalizeTask(
          {
            ...existing,
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: nowIso(),
            metadata: existing.metadata,
            actualDifficulty:
              typeof difficulty === "number" && Number.isFinite(difficulty)
                ? Math.min(100, Math.max(0, Math.round(difficulty)))
                : null,
          },
          new Date(),
        );

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      recordConfusionMarker: (taskId, marker) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const currentMarkers = existing.metadata?.confusionMarkers ?? [];
        const now = nowIso();

        const nextMetadata = {
          ...(existing.metadata ?? {}),
          confusionMarkers: [
            ...currentMarkers,
            {
              topic: marker.topic,
              concept: marker.concept,
              flaggedAt: now,
              reason: marker.reason,
            },
          ],
        };
        const nextTask = buildNextTaskState(existing, nextMetadata);

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      recordRecommendation: (taskId, recommendation) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const currentHistory = existing.metadata?.recommendationHistory ?? [];
        const now = nowIso();

        const nextMetadata = {
          ...(existing.metadata ?? {}),
          recommendationHistory: [
            ...currentHistory,
            {
              taskId,
              reason: recommendation.reason,
              timestamp: now,
              source: recommendation.source,
            },
          ],
        };
        const nextTask = buildNextTaskState(existing, nextMetadata);

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      updateSpacedRepetition: (taskId, data) => {
        const state = get();
        const index = getTaskIndex(state.tasks, taskId);
        if (index < 0) return null;

        const existing = state.tasks[index];
        const nextMetadata = {
          ...(existing.metadata ?? {}),
          spacedRepetition: {
            interval:
              typeof data.interval === "number" && Number.isFinite(data.interval)
                ? Math.max(0, Math.round(data.interval))
                : 0,
            easeFactor:
              typeof data.easeFactor === "number" && Number.isFinite(data.easeFactor)
                ? Math.max(1.3, data.easeFactor)
                : 2.5,
            nextReviewAt:
              typeof data.nextReviewAt === "string" ? data.nextReviewAt : null,
            repetitions:
              typeof data.repetitions === "number" && Number.isFinite(data.repetitions)
                ? Math.max(0, Math.round(data.repetitions))
                : 0,
          },
        };
        const nextTask = buildNextTaskState(existing, nextMetadata);

        set((current) => ({
          tasks: updateTaskAtIndex(current.tasks, index, nextTask),
        }));
        return nextTask;
      },

      // ── Phase 8: schedule overrides ──

      scheduleOverrides: [],

      addScheduleOverride: (
        override: Omit<ScheduleOverride, "id" | "createdAt">,
      ) => {
        const newOverride: ScheduleOverride = {
          ...override,
          id: createId(),
          createdAt: nowIso(),
        };
        set((state) => ({
          scheduleOverrides: [...state.scheduleOverrides, newOverride],
        }));
        return newOverride;
      },

      removeScheduleOverride: (overrideId: string) => {
        set((state) => ({
          scheduleOverrides: state.scheduleOverrides.filter(
            (o) => o.id !== overrideId,
          ),
        }));
      },

      updateScheduleOverride: (
        overrideId: string,
        updates: Partial<Omit<ScheduleOverride, "id" | "createdAt">>,
      ) => {
        set((state) => ({
          scheduleOverrides: state.scheduleOverrides.map((o) =>
            o.id === overrideId ? { ...o, ...updates } : o,
          ),
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      storage: safeStorage,
      partialize: (state) => ({ tasks: state.tasks }),
      version: 1,
    },
  ),
);

export { STORAGE_KEY };
