"use client";

import { useMemo } from "react";
import { buildPlannerState } from "../engine";
import {
  usePlannerStore,
  type AssignmentGradeInput,
  type PlannerStoreTaskInput,
  type PracticeResultInput,
  type StudySessionInput,
} from "../store";
import type {
  LearningData,
  PlannerTask,
  PracticeHistoryEntry,
  SpacedRepetitionData,
} from "../types";

export interface UsePlannerOptions {
  /**
   * Override "now" for the engine calculations (today/week/overdue/etc).
   * Mainly useful for tests, storybook, or previewing a specific date.
   * Defaults to `new Date()` on every recompute.
   */
  referenceDate?: Date;
}

export interface UsePlannerResult {
  // ── Planner state (from engine) ──
  tasks: PlannerTask[];
  today: import("../types").TodayState;
  week: import("../types").WeekState;
  calendar: import("../types").CalendarState;
  upcoming: import("../types").UpcomingState;
  overdue: import("../types").OverdueState;
  analytics: import("../types").AnalyticsState;
  generatedAt: string;

  // ── Original store actions ──
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
  updateMasteryScore: (taskId: string, score: number | null) => PlannerTask | null;

  // ── Phase 4 Step 1: rich learning data actions ──
  recordPracticeEntry: (
    taskId: string,
    entry: PracticeHistoryEntry,
  ) => PlannerTask | null;
  recordMasteryEntry: (
    taskId: string,
    score: number | null,
    date?: string,
  ) => PlannerTask | null;
  recordAssignmentEntry: (
    taskId: string,
    entry: {
      grade: number | null;
      maxGrade?: number | null;
      letterGrade?: string | null;
      submittedAt: string;
    },
  ) => PlannerTask | null;
  recordLearningSession: (
    taskId: string,
    session: { minutes: number; notes?: string; date?: string },
  ) => PlannerTask | null;
  flagWeakTopic: (
    taskId: string,
    topic: string,
    masteryScore?: number | null,
  ) => PlannerTask | null;
  getTaskLearningData: (taskId: string) => LearningData | undefined;

  // ── Phase 4.5: intelligence data actions ──
  recordConfidence: (
    taskId: string,
    confidence: number | null,
  ) => PlannerTask | null;
  recordReview: (
    taskId: string,
    nextReviewAt?: string | null,
  ) => PlannerTask | null;
  updateCompletionQuality: (
    taskId: string,
    quality: number | null,
  ) => PlannerTask | null;
  addDependency: (taskId: string, dependencyId: string) => PlannerTask | null;
  removeDependency: (
    taskId: string,
    dependencyId: string,
  ) => PlannerTask | null;
  recordTimeSpent: (
    taskId: string,
    actualMinutes: number,
  ) => PlannerTask | null;
  setActualDifficulty: (
    taskId: string,
    difficulty: number | null,
  ) => PlannerTask | null;
  recordConfusionMarker: (
    taskId: string,
    marker: { topic: string; concept: string; reason?: string },
  ) => PlannerTask | null;
  recordRecommendation: (
    taskId: string,
    recommendation: { reason: string; source: string },
  ) => PlannerTask | null;
  updateSpacedRepetition: (
    taskId: string,
    data: SpacedRepetitionData,
  ) => PlannerTask | null;

  // ── Phase 6: intelligence state ──
  nextAction: import("../types").NextActionResult | null;
  studySchedule: import("../types").StudyBlockResult[];
  priorityScores: import("../types").TaskPriorityScore[];
  learningProfile: import("../types").LearningProfile;
  subjectInsights: import("../types").SubjectInsight[];
}

/**
 * Planner integration layer (Phase 4).
 *
 * Connects the Zustand planner store to the planner engine:
 *
 *   Zustand Store -> usePlanner() -> buildPlannerState() -> UI-ready PlannerState
 *
 * This hook does NOT calculate any planner logic itself. It only reads raw
 * tasks from the store and hands them to the engine, which owns every
 * decision (today's mission, week workload, overdue detection, analytics,
 * etc). UI components should always read planner data through this hook
 * (or a selector built on top of it) instead of touching the store or the
 * engine directly.
 *
 * Phase 4 Step 1 adds rich learning data actions that append structured
 * records instead of overwriting.
 */
export function usePlanner(options: UsePlannerOptions = {}): UsePlannerResult {
  const { referenceDate } = options;

  const tasks = usePlannerStore((state) => state.tasks);
  const addTask = usePlannerStore((state) => state.addTask);
  const updateTask = usePlannerStore((state) => state.updateTask);
  const deleteTask = usePlannerStore((state) => state.deleteTask);
  const completeTask = usePlannerStore((state) => state.completeTask);
  const savePracticeResult = usePlannerStore((state) => state.savePracticeResult);
  const saveAssignmentGrade = usePlannerStore((state) => state.saveAssignmentGrade);
  const addStudySession = usePlannerStore((state) => state.addStudySession);
  const updateMasteryScore = usePlannerStore((state) => state.updateMasteryScore);

  // ── Phase 4.1 new actions ──
  const recordPracticeEntry = usePlannerStore((state) => state.recordPracticeEntry);
  const recordMasteryEntry = usePlannerStore((state) => state.recordMasteryEntry);
  const recordAssignmentEntry = usePlannerStore((state) => state.recordAssignmentEntry);
  const recordLearningSession = usePlannerStore((state) => state.recordLearningSession);
  const flagWeakTopic = usePlannerStore((state) => state.flagWeakTopic);
  const getTaskLearningData = usePlannerStore((state) => state.getTaskLearningData);

  // ── Phase 4.5 new actions ──
  const recordConfidence = usePlannerStore((state) => state.recordConfidence);
  const recordReview = usePlannerStore((state) => state.recordReview);
  const updateCompletionQuality = usePlannerStore((state) => state.updateCompletionQuality);
  const addDependency = usePlannerStore((state) => state.addDependency);
  const removeDependency = usePlannerStore((state) => state.removeDependency);
  const recordTimeSpent = usePlannerStore((state) => state.recordTimeSpent);
  const setActualDifficulty = usePlannerStore((state) => state.setActualDifficulty);
  const recordConfusionMarker = usePlannerStore((state) => state.recordConfusionMarker);
  const recordRecommendation = usePlannerStore((state) => state.recordRecommendation);
  const updateSpacedRepetition = usePlannerStore((state) => state.updateSpacedRepetition);

  const referenceDateTime = referenceDate?.getTime();

  const plannerState = useMemo(() => {
    return buildPlannerState(tasks, {
      referenceDate: referenceDateTime !== undefined ? new Date(referenceDateTime) : undefined,
    });
    // referenceDateTime (a primitive) is the stable dep for referenceDate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, referenceDateTime]);

  // ── Phase 6: intelligence state from plannerState ──
  const nextAction = plannerState.nextAction;
  const studySchedule = plannerState.studySchedule;
  const priorityScores = plannerState.priorityScores;
  const learningProfile = plannerState.learningProfile;
  const subjectInsights = plannerState.subjectInsights;

  return {
    ...plannerState,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    savePracticeResult,
    saveAssignmentGrade,
    addStudySession,
    updateMasteryScore,
    // ── Phase 4.1 ──
    recordPracticeEntry,
    recordMasteryEntry,
    recordAssignmentEntry,
    recordLearningSession,
    flagWeakTopic,
    getTaskLearningData,
    // ── Phase 4.5 ──
    recordConfidence,
    recordReview,
    updateCompletionQuality,
    addDependency,
    removeDependency,
    recordTimeSpent,
    setActualDifficulty,
    recordConfusionMarker,
    recordRecommendation,
    updateSpacedRepetition,
    // ── Phase 6 ──
    nextAction,
    studySchedule,
    priorityScores,
    learningProfile,
    subjectInsights,
  };
}
