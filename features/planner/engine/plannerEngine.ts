import {
  PlannerState,
  TaskPriorityScore,
  StudyBlockResult,
  NextActionResult,
  LearningProfile,
  SubjectInsight,
} from "../types";
import { calculateAnalytics } from "./calculations/analytics";
import { calculateCalendar } from "./calculations/calendar";
import { calculateOverdue } from "./calculations/overdue";
import { calculateToday } from "./calculations/today";
import { calculateUpcoming } from "./calculations/upcoming";
import { calculateWeek } from "./calculations/week";
import { normalizeTasks, PlannerEngineTaskInput } from "./normalizer";
import {
  calculateTaskPriority,
  generateNextAction,
  generateStudySchedule,
  buildLearningProfile,
  computeTrend,
} from "./intelligence";
import type { StudyBlock } from "./intelligence";
import type { PriorityReason } from "./intelligence/priorityEngine";
import type { NextAction } from "./intelligence/recommendationEngine";

export interface BuildPlannerStateOptions {
  referenceDate?: Date;
  /** Maximum study minutes per day for schedule generation. Default 120. */
  maxDailyMinutes?: number;
  /** How many days ahead to schedule. Default 7. */
  scheduleHorizonDays?: number;
}

export function buildPlannerState(
  tasks: ReadonlyArray<PlannerEngineTaskInput>,
  options: BuildPlannerStateOptions = {},
): PlannerState {
  const referenceDate = options.referenceDate ?? new Date();
  const normalizedTasks = normalizeTasks(tasks, referenceDate);

  const totalTasks = normalizedTasks.length;
  const completedTasks = normalizedTasks.filter((t) => t.completed).length;
  const activeTasks = totalTasks - completedTasks;
  console.log({
    totalTasks,
    completedTasks,
    activeTasks,
  });

  const today = calculateToday(normalizedTasks, referenceDate);
  const week = calculateWeek(normalizedTasks, referenceDate);
  const calendar = calculateCalendar(normalizedTasks, referenceDate);
  const upcoming = calculateUpcoming(normalizedTasks, referenceDate);
  const overdue = calculateOverdue(normalizedTasks, referenceDate);
  const analytics = calculateAnalytics(normalizedTasks, referenceDate);

  // ── Phase 6: Build learning profile from all tasks ──
  const learningProfile = buildLearningProfile(normalizedTasks);
  const subjectInsights: SubjectInsight[] = buildSubjectInsightsFromProfile(learningProfile, normalizedTasks);

  // ── Phase 6: Priority engine now uses learning profile ──
  const priorityScores: TaskPriorityScore[] = normalizedTasks.map((task) => {
    const result = calculateTaskPriority(task, learningProfile);
    return {
      taskId: task.id,
      score: result.score,
      reasons: result.reasons
        .filter((r: PriorityReason) => r.weight > 0)
        .map((r: PriorityReason) => r.reason),
    };
  });

  // ── Phase 6: Recommendation engine with feedback record ──
  const nextActionData = generateNextAction(normalizedTasks);
  let nextAction: NextActionResult | null = null;
  if (nextActionData) {
    nextAction = {
      taskId: nextActionData.taskId,
      action: nextActionData.action,
      reason: nextActionData.reason,
      explanation: nextActionData.explanation,
      estimatedMinutes: nextActionData.estimatedMinutes,
      priorityScore: nextActionData.priorityScore,
      record: nextActionData.record,
    };
  }

  const studyBlocks = generateStudySchedule(normalizedTasks, {
    maxDailyMinutes: options.maxDailyMinutes ?? 120,
    horizonDays: options.scheduleHorizonDays ?? 7,
    referenceDate,
  });

  const studySchedule: StudyBlockResult[] = studyBlocks.map((block: StudyBlock) => ({
    taskId: block.taskId,
    title: block.title,
    subject: block.subject,
    type: block.type,
    duration: block.duration,
    date: block.date,
    reason: block.reason,
  }));

  return {
    tasks: normalizedTasks,
    today,
    week,
    calendar,
    upcoming,
    overdue,
    analytics,
    generatedAt: referenceDate.toISOString(),
    nextAction,
    studySchedule,
    priorityScores,
    learningProfile,
    subjectInsights,
  };
}

/**
 * Convert the internal learning profile's subject data into SubjectInsight[].
 * We reconstruct the per-subject data by scanning tasks again.
 */
function buildSubjectInsightsFromProfile(
  profile: LearningProfile,
  tasks: ReadonlyArray<import("../types").PlannerTask>,
): SubjectInsight[] {
  // Rebuild subject data for the insights
  const subjectMap = new Map<string, SubjectInsight>();

  for (const task of tasks) {
    const subj = task.subject;
    if (!subjectMap.has(subj)) {
      subjectMap.set(subj, {
        subject: subj,
        taskCount: 0,
        completedCount: 0,
        averageMastery: null,
        averageConfidence: null,
        averageCompletionQuality: null,
        averageStudyMinutes: null,
        weakTopics: [],
        trend: null,
      });
    }
    const insight = subjectMap.get(subj)!;
    insight.taskCount += 1;
    if (task.completed) insight.completedCount += 1;
  }

  // Fill in averages from the full data
  const allMasteries = new Map<string, number[]>();
  const allConfidences = new Map<string, number[]>();
  const allQualities = new Map<string, number[]>();
  const allStudyMins = new Map<string, number[]>();
  const weakTopicsMap = new Map<string, Map<string, number>>();

  for (const task of tasks) {
    const subj = task.subject;
    if (!allMasteries.has(subj)) allMasteries.set(subj, []);
    if (!allConfidences.has(subj)) allConfidences.set(subj, []);
    if (!allQualities.has(subj)) allQualities.set(subj, []);
    if (!allStudyMins.has(subj)) allStudyMins.set(subj, []);
    if (!weakTopicsMap.has(subj)) weakTopicsMap.set(subj, new Map());

    if (typeof task.metadata?.masteryScore === "number") {
      allMasteries.get(subj)!.push(task.metadata.masteryScore);
    }
    if (typeof task.confidence === "number") {
      allConfidences.get(subj)!.push(task.confidence);
    }
    if (typeof task.completionQuality === "number") {
      allQualities.get(subj)!.push(task.completionQuality);
    }
    for (const session of task.metadata?.learningData?.studySessions ?? []) {
      if (typeof session.minutes === "number") {
        allStudyMins.get(subj)!.push(session.minutes);
      }
    }
    for (const wt of task.metadata?.weakTopics ?? []) {
      const subjMap = weakTopicsMap.get(subj)!;
      subjMap.set(wt.topic, (subjMap.get(wt.topic) ?? 0) + wt.flaggedCount);
    }
  }

  for (const [subj, insight] of subjectMap) {
    const masteries = allMasteries.get(subj) ?? [];
    const confidences = allConfidences.get(subj) ?? [];
    const qualities = allQualities.get(subj) ?? [];
    const studyMins = allStudyMins.get(subj) ?? [];

    insight.averageMastery =
      masteries.length > 0
        ? masteries.reduce((a, b) => a + b, 0) / masteries.length
        : null;
    insight.averageConfidence =
      confidences.length > 0
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length
        : null;
    insight.averageCompletionQuality =
      qualities.length > 0
        ? qualities.reduce((a, b) => a + b, 0) / qualities.length
        : null;
    insight.averageStudyMinutes =
      studyMins.length > 0
        ? studyMins.reduce((a, b) => a + b, 0) / studyMins.length
        : null;

    // Weak topics
    const subjWeakTopics = weakTopicsMap.get(subj) ?? new Map();
    insight.weakTopics = Array.from(subjWeakTopics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    // Trend
    const allScores = tasks
      .filter((t) => t.subject === subj)
      .flatMap((t) => t.metadata?.learningData?.masteryHistory ?? [])
      .map((e) => e.score)
      .filter((s): s is number => typeof s === "number" && Number.isFinite(s))
      .sort();
    insight.trend = computeTrend(allScores);
  }

  return Array.from(subjectMap.values());
}
