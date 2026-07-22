import type { PlannerTask, LearningProfile, RecommendationRecord } from "../../types";
import { isTaskCompleted } from "../normalizer";
import { calculateTaskPriority, type PriorityResult } from "./priorityEngine";

export interface NextAction {
  taskId: string;
  action: string;
  reason: string;
  explanation: string;
  estimatedMinutes: number;
  priorityScore: number;
  /** Recommendation record ready to be appended to the store. */
  record: RecommendationRecord;
}

/**
 * Generate the single best next action for the student.
 *
 * Strategy:
 * 1. Score every incomplete task with the priority engine.
 * 2. Filter out tasks whose dependencies are not yet met.
 * 3. Pick the highest-scoring task.
 * 4. Determine the action type based on the task's state:
 *    - If progress < 30 and type is "lesson" → "Learn {title}"
 *    - If progress >= 30 and type is "practice" → "Practice {title}"
 *    - If progress >= 30 and type is "assignment" → "Work on {title}"
 *    - If progress >= 80 → "Finish {title}"
 *    - If confidence < 40 → "Review {title}"
 *    - If mastery < 50 → "Practice {title}"
 *    - Default → "Study {title}"
 */
export function generateNextAction(
  tasks: ReadonlyArray<PlannerTask>,
): NextAction | null {
  const incomplete = tasks.filter((t) => !isTaskCompleted(t));
  if (incomplete.length === 0) {
    return null;
  }

  // Score all tasks
  const scored: Array<{ task: PlannerTask; priority: PriorityResult }> =
    incomplete.map((task) => ({
      task,
      priority: calculateTaskPriority(task),
    }));

  // Sort by priority score descending
  scored.sort((a, b) => b.priority.score - a.priority.score);

  // Find the first task whose dependencies are met
  const taskIds = new Set(tasks.map((t) => t.id));
  const best = scored.find((entry) => {
    const deps = entry.task.dependencies ?? [];
    // A dependency is "met" if it's completed or doesn't exist
    return deps.every((depId) => {
      const depTask = tasks.find((t) => t.id === depId);
      return depTask ? isTaskCompleted(depTask) : true;
    });
  });

  if (!best) {
    // Fallback: pick the highest-scoring task even if deps aren't met
    if (scored.length === 0) return null;
    const fallback = scored[0];
    return buildNextAction(fallback.task, fallback.priority);
  }

  return buildNextAction(best.task, best.priority);
}

function buildNextAction(
  task: PlannerTask,
  priority: PriorityResult,
): NextAction {
  const confidence = task.confidence ?? 100;
  const mastery = task.metadata?.masteryScore ?? 100;
  const progress = task.progress;

  let action: string;
  let explanationParts: string[] = [];

  if (progress >= 80) {
    action = `Finish ${task.title}`;
    explanationParts.push("You're almost done");
  } else if (confidence < 40) {
    action = `Review ${task.title}`;
    explanationParts.push("Your confidence is low");
  } else if (mastery < 50) {
    action = `Practice ${task.title}`;
    explanationParts.push("Your mastery needs improvement");
  } else if (progress < 30 && task.type === "lesson") {
    action = `Learn ${task.title}`;
    explanationParts.push("You haven't started learning this yet");
  } else if (task.type === "practice") {
    action = `Practice ${task.title}`;
    explanationParts.push("Practice will reinforce your understanding");
  } else if (task.type === "assignment") {
    action = `Work on ${task.title}`;
    explanationParts.push("Assignment needs attention");
  } else {
    action = `Study ${task.title}`;
    explanationParts.push("Scheduled study session");
  }

  // Build the main reason from priority scores
  const topReasons = priority.reasons
    .filter((r) => r.weight > 0)
    .slice(0, 2)
    .map((r) => r.reason)
    .join(" and ");

  const reason = topReasons || "Scheduled task";

  // Build explanation: why this specific recommendation now
  if (task.deadline) {
    const deadline = new Date(task.deadline);
    const now = new Date();
    const daysUntilDeadline = Math.round(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysUntilDeadline <= 1) {
      explanationParts.push("deadline is urgent");
    } else if (daysUntilDeadline <= 3) {
      explanationParts.push(`deadline in ${daysUntilDeadline} days`);
    }
  }
  if (mastery < 60) {
    explanationParts.push("mastery can be improved");
  }
  if (confidence !== null && confidence < 50) {
    explanationParts.push("building confidence will help");
  }
  const timeHistory = task.timeEstimateHistory ?? [];
  if (timeHistory.length > 0) {
    const lastActual = timeHistory[timeHistory.length - 1].actualMinutes;
    const lastEstimated = timeHistory[timeHistory.length - 1].estimatedMinutes;
    if (lastActual > lastEstimated * 1.3) {
      explanationParts.push(
        `you typically need ${Math.round((lastActual / lastEstimated) * 100)}% of estimated time`,
      );
    }
  }

  const explanation = explanationParts.join(" — ");

  const timestamp = new Date().toISOString();
  const record: RecommendationRecord = {
    taskId: task.id,
    reason,
    timestamp,
    source: "recommendation-engine",
  };

  return {
    taskId: task.id,
    action,
    reason,
    explanation,
    estimatedMinutes: task.estimatedMinutes ?? 30,
    priorityScore: priority.score,
    record,
  };
}
