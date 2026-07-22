import type { PlannerTask } from "../../types";

export interface TimePrediction {
  predictedMinutes: number;
  confidence: "high" | "medium" | "low";
  reason: string;
}

/**
 * Predict how long a task will take, using historical data when available.
 *
 * Strategy:
 * 1. If there are timeEstimateHistory entries, compute a weighted average
 *    of actual minutes (more recent = higher weight).
 * 2. If no history, use estimatedMinutes as a starting point and adjust
 *    based on difficulty / task type.
 * 3. Clamp between 5 and 480 minutes.
 */
export function predictTaskDuration(task: PlannerTask): TimePrediction {
  const history = task.timeEstimateHistory ?? [];
  const estimated = task.estimatedMinutes ?? 30;

  // ── 1. Use history if available ──
  if (history.length > 0) {
    // Weighted average: more recent entries get higher weight
    const weightedSum = history.reduce((sum, entry, index) => {
      // Weight increases linearly: 1, 2, 3, ...
      const weight = index + 1;
      return sum + entry.actualMinutes * weight;
    }, 0);

    const totalWeight = (history.length * (history.length + 1)) / 2;
    const historicalAverage = weightedSum / totalWeight;

    // Blend historical average with the original estimate
    // More history = more trust in historical data
    const historyWeight = Math.min(0.8, history.length * 0.15);
    const blendedEstimate =
      historicalAverage * historyWeight + estimated * (1 - historyWeight);

    const predictedMinutes = Math.max(5, Math.min(480, Math.round(blendedEstimate)));

    const confidence =
      history.length >= 3 ? "high" : history.length >= 1 ? "medium" : "low";

    const reason =
      history.length > 0
        ? `Based on ${history.length} previous session(s), average ${Math.round(historicalAverage)} min (estimated ${estimated} min)`
        : `Estimated ${estimated} min`;

    return { predictedMinutes, confidence, reason };
  }

  // ── 2. No history — heuristic from estimate + type + difficulty ──
  let adjusted = estimated;

  // Task type adjustments
  if (task.type === "assignment") adjusted = Math.max(adjusted, 45);
  if (task.type === "lesson") adjusted = Math.max(adjusted, 30);
  if (task.type === "review") adjusted = Math.min(adjusted, 30);

  // Difficulty adjustments (the enum is coarse, so this is a rough guide)
  if (task.difficulty === "hard") adjusted = Math.round(adjusted * 1.3);
  if (task.difficulty === "easy") adjusted = Math.round(adjusted * 0.8);

  // If confidence is low, the student will likely take longer
  if (task.confidence !== undefined && task.confidence !== null && Number.isFinite(task.confidence)) {
    if (task.confidence < 40) adjusted = Math.round(adjusted * 1.4);
    else if (task.confidence < 60) adjusted = Math.round(adjusted * 1.15);
  }

  const predictedMinutes = Math.max(5, Math.min(480, adjusted));

  return {
    predictedMinutes,
    confidence: "low",
    reason: `Estimated ${estimated} min, adjusted for ${task.difficulty} difficulty`,
  };
}