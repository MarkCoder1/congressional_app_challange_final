import type { PlannerTask, PlannerPriority } from "../../types";
import { isTaskCompleted, formatPlannerDateKey, addPlannerDays, parsePlannerDate } from "../normalizer";
import { calculateTaskPriority } from "./priorityEngine";
import { predictTaskDuration } from "./timePrediction";

export type StudyBlockType = "learn" | "practice" | "review" | "work";

export interface StudyBlock {
  taskId: string;
  title: string;
  subject: string;
  type: StudyBlockType;
  duration: number;
  date: string; // YYYY-MM-DD
  reason: string;
  priorityScore?: number;
  priorityLevel?: PlannerPriority;
}

export interface StudyScheduleOptions {
  /** Maximum minutes per day. Default 120. */
  maxDailyMinutes?: number;
  /** How many days ahead to schedule. Default 7. */
  horizonDays?: number;
  /** Reference date (defaults to today). */
  referenceDate?: Date;
}

/**
 * Convert tasks into a structured study schedule.
 *
 * Rules:
 * 1. Score all incomplete tasks by priority.
 * 2. Break large tasks into smaller sessions (max 50 min each).
 * 3. Interleave practice/review sessions for low-mastery tasks.
 * 4. Respect deadlines — schedule urgent tasks earlier.
 * 5. Respect dependencies — don't schedule a task before its deps.
 * 6. Cap daily load at maxDailyMinutes.
 */
export function generateStudySchedule(
  tasks: ReadonlyArray<PlannerTask>,
  options: StudyScheduleOptions = {},
): StudyBlock[] {
  const {
    maxDailyMinutes = 120,
    horizonDays = 7,
    referenceDate = new Date(),
  } = options;

  const incomplete = tasks.filter((t) => !isTaskCompleted(t));
  if (incomplete.length === 0) return [];

  // Score and sort by priority
  const scored = incomplete
    .map((task) => ({
      task,
      priority: calculateTaskPriority(task),
    }))
    .sort((a, b) => b.priority.score - a.priority.score);

  const blocks: StudyBlock[] = [];
  const dailyMinutes: Map<string, number> = new Map();
  // Track unique (taskId, date) pairs to prevent duplicate sessions for the same task on the same date
  const scheduledTaskDates: Set<string> = new Set();

  for (const { task, priority } of scored) {
    // Check dependencies
    const deps = task.dependencies ?? [];
    const depsMet = deps.every((depId) => {
      const depTask = tasks.find((t) => t.id === depId);
      return depTask ? isTaskCompleted(depTask) : true;
    });

    // Determine the best day to schedule this task
    const scheduledDate = findBestDay(
      task,
      dailyMinutes,
      maxDailyMinutes,
      horizonDays,
      referenceDate,
      depsMet,
    );

    if (!scheduledDate) continue; // No room in the horizon

    // Use estimated minutes directly (single source of truth), fall back to prediction only if no estimate
    const taskEstimate = task.estimatedMinutes ?? 30;
    const predictedMinutes = predictTaskDuration(task).predictedMinutes;
    // Only use prediction if it differs significantly from estimate AND there's history to justify it
    const hasHistory = (task.timeEstimateHistory ?? []).length > 0;
    const effectiveMinutes = hasHistory ? predictedMinutes : taskEstimate;
    const clampMax = Math.min(effectiveMinutes, maxDailyMinutes);

    // Determine block type
    const blockType = determineBlockType(task);

    // Generate ONE block per task per day — do NOT split into multiple duplicate sessions
    // Use the full predicted/available duration for this single session
    const currentDaily = dailyMinutes.get(scheduledDate) ?? 0;
    const available = maxDailyMinutes - currentDaily;
    const actualDuration = Math.min(clampMax, available);

    if (actualDuration <= 0) continue;

    // Prevent duplicate (taskId, date) entries
    const taskDateKey = `${task.id}::${scheduledDate}`;
    if (scheduledTaskDates.has(taskDateKey)) continue;
    scheduledTaskDates.add(taskDateKey);

    dailyMinutes.set(scheduledDate, currentDaily + actualDuration);

    const topReason = priority.reasons
      .filter((r) => r.weight > 0)
      .slice(0, 1)
      .map((r) => r.reason)
      .join("");

    blocks.push({
      taskId: task.id,
      title: task.title,
      subject: task.subject,
      type: blockType,
      duration: actualDuration,
      date: scheduledDate,
      reason: topReason || "Scheduled",
      priorityScore: priority.score,
      priorityLevel: task.priority,
    });
  }

  // Safety deduplication: ensure no duplicate (taskId, date) pairs exist
  const seen = new Set<string>();
  return blocks.filter((block) => {
    const key = `${block.taskId}::${block.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function determineBlockType(task: PlannerTask): StudyBlockType {
  const confidence = task.confidence ?? 100;
  const mastery = task.metadata?.masteryScore ?? 100;
  const progress = task.progress;

  if (progress >= 80) return "review";
  if (confidence < 40 || mastery < 50) return "practice";
  if (task.type === "practice") return "practice";
  if (task.type === "lesson" && progress < 30) return "learn";
  if (task.type === "assignment") return "work";
  return "review";
}

function findBestDay(
  task: PlannerTask,
  dailyMinutes: Map<string, number>,
  maxDaily: number,
  horizonDays: number,
  referenceDate: Date,
  depsMet: boolean,
): string | null {
  const deadline = task.deadline ? parsePlannerDate(task.deadline) : null;

  // If deps aren't met, schedule on the last possible day (gives time for deps)
  const startOffset = depsMet ? 0 : 1;

  for (let offset = startOffset; offset <= horizonDays; offset++) {
    const candidate = addPlannerDays(referenceDate, offset);
    const key = formatPlannerDateKey(candidate);

    // If there's a deadline, don't schedule after it
    if (deadline && candidate.getTime() > deadline.getTime()) {
      // Try the deadline day itself
      const deadlineKey = formatPlannerDateKey(deadline);
      const deadlineMinutes = dailyMinutes.get(deadlineKey) ?? 0;
      if (deadlineMinutes < maxDaily) {
        return deadlineKey;
      }
      return null;
    }

    const currentMinutes = dailyMinutes.get(key) ?? 0;
    if (currentMinutes < maxDaily) {
      return key;
    }
  }

  return null;
}