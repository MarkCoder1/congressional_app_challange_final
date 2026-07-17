import {
  PlannerAIContext,
  PlannerPriorityExplanation,
  PlannerTaskRecommendation,
  PlannerTimelineRecommendation,
} from "./plannerTypes";
import { PlannerTask } from "../plannerTypes";

function daysUntilDeadline(
  currentDate: string,
  deadline?: string | null,
): number | null {
  if (!deadline) return null;

  const current = new Date(`${currentDate}T00:00:00`);
  const target = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(current.getTime()) || Number.isNaN(target.getTime()))
    return null;

  return Math.round(
    (target.getTime() - current.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function formatTaskAction(task: PlannerTask): PlannerTaskRecommendation["action"] {
  if (task.type === "assignment") return "complete";
  if (task.type === "review") return "review";
  if (task.type === "practice") return "practice";
  return "study";
}

export function summarizeTaskReason(task: PlannerTask): string {
  if (task.isOverdue) {
    return "It is overdue and must be recovered first.";
  }

  if (task.deadline && task.estimatedMinutes !== null) {
    return `Due ${task.deadline} and estimated at ${task.estimatedMinutes} minutes.`;
  }

  if (task.deadline) {
    return `Due ${task.deadline} and still needs an estimate.`;
  }

  if (task.estimatedMinutes !== null) {
    return `Estimated at ${task.estimatedMinutes} minutes with no fixed deadline.`;
  }

  return "No estimate or deadline exists yet, so it remains a flexible priority.";
}

export function pickPriorityTask(
  contextOrState: PlannerAIContext | PlannerAIContext["plannerState"],
): PlannerTask | null {
  const plannerState =
    "plannerState" in contextOrState
      ? contextOrState.plannerState
      : contextOrState;
  const candidates =
    plannerState.today.priorityTasks.length > 0
      ? plannerState.today.priorityTasks
      : plannerState.tasks.filter((task) => !task.completed);

  return candidates[0] ?? null;
}

export function buildTimelineRecommendations(
  context: PlannerAIContext,
): PlannerTimelineRecommendation[] {
  const baseTasks =
    context.plannerState.today.priorityTasks.length > 0
      ? context.plannerState.today.priorityTasks
      : context.plannerState.tasks
          .filter((task) => !task.completed)
          .slice(0, 5);

  return baseTasks.map((task, index) => ({
    taskId: task.id,
    order: index + 1,
    suggestedTime:
      context.plannerState.today.timeline[index]?.startTime ??
      `${String(9 + index).padStart(2, "0")}:00`,
    durationMinutes:
      task.estimatedMinutes ??
      context.plannerState.today.mission.estimatedMinutes,
    reason: summarizeTaskReason(task),
    priorityLevel: task.priorityLevel,
    action:
      task.type === "assignment"
        ? "research"
        : task.type === "practice"
          ? "practice"
          : task.type === "review"
            ? "review"
            : task.type === "concept"
              ? "study"
              : "study",
  }));
}

export function buildPriorityExplanations(
  context: PlannerAIContext,
): PlannerPriorityExplanation[] {
  return context.plannerState.tasks
    .filter((task) => !task.completed)
    .sort((left, right) => right.priorityScore - left.priorityScore)
    .slice(0, 8)
    .map((task) => ({
      taskId: task.id,
      title: task.title,
      priorityLevel: task.priorityLevel,
      reason: summarizeTaskReason(task),
    }));
}

export function buildTaskRecommendations(
  context: PlannerAIContext,
): PlannerTaskRecommendation[] {
  const tasks = context.plannerState.tasks.filter((task) => !task.completed);
  const recommendations: PlannerTaskRecommendation[] = [];
  const currentDate = context.currentDate;

  for (const task of tasks) {
    if (task.isOverdue) {
      recommendations.push({
        taskId: task.id,
        title: `Recover ${task.title}`,
        priorityLevel: "high",
        reason:
          "This task is overdue and should be recovered before adding new work.",
        action: formatTaskAction(task),
      });
      continue;
    }

    const dueInDays = daysUntilDeadline(currentDate, task.deadline);

    if (dueInDays === 0 || dueInDays === 1) {
      recommendations.push({
        taskId: task.id,
        title: `Prioritise ${task.title}`,
        priorityLevel: "high",
        reason:
          dueInDays === 0
            ? `It is due today. ${summarizeTaskReason(task)}`
            : `It is due tomorrow. ${summarizeTaskReason(task)}`,
        action: formatTaskAction(task),
      });
      continue;
    }

    if (task.progress >= 80) {
      recommendations.push({
        taskId: task.id,
        title: `Finish ${task.title}`,
        priorityLevel: task.priorityLevel,
        reason: `This task is already ${task.progress}% complete, so finishing it will deliver quick progress.`,
        action: formatTaskAction(task),
      });
      continue;
    }

    if (
      task.type === "review" &&
      task.deadline &&
      (dueInDays === null || dueInDays <= 7)
    ) {
      recommendations.push({
        taskId: task.id,
        title: `Review ${task.title}`,
        priorityLevel: task.priorityLevel,
        reason: `Review work is most effective before ${task.deadline}. ${summarizeTaskReason(task)}`,
        action: "review",
      });
    }
  }

  return recommendations.slice(0, 8);
}
