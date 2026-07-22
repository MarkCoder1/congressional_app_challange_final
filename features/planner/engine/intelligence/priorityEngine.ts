import type { PlannerTask, LearningProfile } from "../../types";
import { isTaskCompleted, isTaskOverdue, parsePlannerDate } from "../normalizer";

export interface PriorityReason {
  reason: string;
  weight: number;
}

export interface PriorityResult {
  score: number;
  reasons: PriorityReason[];
}

/**
 * Calculate a 0-100 importance score for a task.
 *
 * Factors (each contributes a weighted slice):
 *  - Deadline urgency     (0-40 pts)
 *  - Overdue penalty      (0-15 pts bonus if overdue)
 *  - Mastery & confidence (0-20 pts) — low mastery/confidence increases priority
 *  - Progress             (0-10 pts) — nearly-done tasks get a small bump
 *  - Dependencies         (0-10 pts) — blockers with unmet deps get higher priority
 *  - Difficulty           (0-5 pts)  — hard tasks get slight bump
 *
 * Returns { score: 0-100, reasons[] }.
 */
export function calculateTaskPriority(
  task: PlannerTask,
  profile?: LearningProfile | null,
): PriorityResult {
  const reasons: PriorityReason[] = [];

  // ── 1. Deadline urgency (0-40) ──
  let deadlineScore = 0;
  if (task.deadline) {
    const deadline = parsePlannerDate(task.deadline);
    if (deadline) {
      const now = new Date();
      const msRemaining = deadline.getTime() - now.getTime();
      const hoursRemaining = msRemaining / (1000 * 60 * 60);
      const daysRemaining = hoursRemaining / 24;

      if (msRemaining <= 0) {
        deadlineScore = 40;
        reasons.push({ reason: "Deadline passed", weight: 40 });
      } else if (hoursRemaining <= 1) {
        deadlineScore = 40;
        reasons.push({ reason: "Due within 1 hour", weight: 40 });
      } else if (hoursRemaining <= 6) {
        deadlineScore = 35;
        reasons.push({ reason: "Due within 6 hours", weight: 35 });
      } else if (daysRemaining <= 1) {
        deadlineScore = 30;
        reasons.push({ reason: "Due tomorrow", weight: 30 });
      } else if (daysRemaining <= 3) {
        deadlineScore = 20;
        reasons.push({ reason: `Due in ${Math.round(daysRemaining)} days`, weight: 20 });
      } else if (daysRemaining <= 7) {
        deadlineScore = 10;
        reasons.push({ reason: "Due within a week", weight: 10 });
      } else {
        deadlineScore = 5;
      }
    }
  }

  // ── 2. Overdue penalty (0-15) ──
  let overdueScore = 0;
  if (isTaskOverdue(task, new Date()) && !isTaskCompleted(task)) {
    overdueScore = 15;
    reasons.push({ reason: "Overdue", weight: 15 });
  }

  // ── 3. Mastery & confidence (0-20) ──
  let masteryConfidenceScore = 0;
  const mastery = task.metadata?.masteryScore;
  const confidence = task.confidence;

  if (mastery !== null && mastery !== undefined && Number.isFinite(mastery)) {
    const masteryGap = 100 - mastery;
    masteryConfidenceScore += (masteryGap / 100) * 12;
    if (mastery < 50) {
      reasons.push({ reason: `Low mastery (${Math.round(mastery)})`, weight: 12 });
    }
  }

  if (confidence !== null && confidence !== undefined && Number.isFinite(confidence)) {
    const confidenceGap = 100 - confidence;
    masteryConfidenceScore += (confidenceGap / 100) * 8;
    if (confidence < 40) {
      reasons.push({ reason: `Low confidence (${Math.round(confidence)})`, weight: 8 });
    }
  }

  // ── 4. Progress bump (0-10) ──
  let progressScore = 0;
  if (!isTaskCompleted(task)) {
    if (task.progress >= 80) {
      progressScore = 10;
      reasons.push({ reason: "Almost complete", weight: 10 });
    } else if (task.progress >= 50) {
      progressScore = 5;
      reasons.push({ reason: "Halfway done", weight: 5 });
    }
  }

  // ── 5. Dependencies (0-10) ──
  let dependencyScore = 0;
  const deps = task.dependencies ?? [];
  if (deps.length > 0) {
    dependencyScore = Math.min(10, deps.length * 3);
    reasons.push({ reason: `${deps.length} task(s) depend on this`, weight: dependencyScore });
  }

  // ── 6. Difficulty bump (0-5) ──
  let difficultyScore = 0;
  if (task.difficulty === "hard") {
    difficultyScore = 5;
  } else if (task.difficulty === "medium") {
    difficultyScore = 2;
  }

  // ── Completion check ──
  if (isTaskCompleted(task)) {
    return { score: 0, reasons: [{ reason: "Task completed", weight: 0 }] };
  }

  // ── Phase 6: Self-improvement via learning profile ──
  let profileBonus = 0;
  if (profile) {
    // Boost practice tasks if student learns best by practice
    if (profile.favoriteStudyType === "practice" && task.type === "practice") {
      profileBonus += 5;
    }

    // Reduce review priority if student tends to ignore reviews
    if (
      profile.weaknesses.some((w: string) => w.toLowerCase().includes("review")) &&
      task.type === "review"
    ) {
      profileBonus -= 3;
    }

    // Boost tasks in the student's most-studied subject
    if (profile.mostStudiedSubject && task.subject === profile.mostStudiedSubject) {
      profileBonus += 3;
    }

    // Boost tasks needing more time if student performs poorly with short sessions
    if (
      profile.preferredSessionLength !== null &&
      profile.preferredSessionLength < 20 &&
      task.estimatedMinutes !== null &&
      task.estimatedMinutes > profile.preferredSessionLength
    ) {
      profileBonus += 2;
    }

    // Boost weakest subject — it needs more attention
    if (profile.weakestSubject && task.subject === profile.weakestSubject) {
      profileBonus += 8;
    }

    // If student consistently underestimates time, boost to ensure they start early
    if (profile.averageEstimatedVsActual !== null && profile.averageEstimatedVsActual > 1.2) {
      profileBonus += 3;
    }

    // If mastery has been growing, boost incomplete tasks to continue momentum
    if (profile.masteryGrowthRate !== null && profile.masteryGrowthRate > 0) {
      profileBonus += 2;
    }
  }

  // ── Aggregate ──
  const rawScore =
    deadlineScore +
    overdueScore +
    masteryConfidenceScore +
    progressScore +
    dependencyScore +
    difficultyScore +
    profileBonus;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  if (profileBonus > 0) {
    reasons.push({ reason: "Learning pattern alignment", weight: profileBonus });
  }

  return { score, reasons };
}