import {
  PlannerPriorityLevel,
  PlannerTask,
  PlannerTaskStatus,
  PlannerTaskType,
  RawTask,
} from "./plannerTypes";

function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function toDateKey(value: string | null | undefined): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    if (value.length >= 10) {
      const fallback = value.slice(0, 10);
      return /^\d{4}-\d{2}-\d{2}$/.test(fallback) ? fallback : null;
    }
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentDateKey(currentDate: string | Date): string {
  if (typeof currentDate === "string") {
    const normalized = toDateKey(currentDate);
    if (normalized) return normalized;
  }

  const asDate =
    currentDate instanceof Date ? currentDate : new Date(currentDate);
  const year = asDate.getFullYear();
  const month = String(asDate.getMonth() + 1).padStart(2, "0");
  const day = String(asDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseStatus(raw: RawTask, completed: boolean): PlannerTaskStatus {
  if (completed) return "completed";

  const status = raw.status?.toLowerCase();
  if (status === "completed") return "completed";
  if (status === "in_progress") return "in_progress";
  return "not_started";
}

function deriveType(raw: RawTask): PlannerTaskType {
  return raw.type ?? raw.taskType ?? "lesson";
}

function deriveEstimatedMinutes(raw: RawTask): number | null {
  if (isValidNumber(raw.estimatedMinutes)) return raw.estimatedMinutes;
  if (isValidNumber(raw.estimatedDuration)) return raw.estimatedDuration;
  if (isValidNumber(raw.estimatedHours)) return raw.estimatedHours * 60;
  return null;
}

function derivePriorityScore(params: {
  deadlineKey: string | null;
  currentDateKey: string;
  progress: number;
  type: PlannerTaskType;
  completed: boolean;
  isOverdue: boolean;
}): number {
  if (params.completed) return 0;

  const currentDate = new Date(`${params.currentDateKey}T00:00:00`);
  const deadlineDate = params.deadlineKey
    ? new Date(`${params.deadlineKey}T00:00:00`)
    : null;

  let score = 0;

  if (params.isOverdue) {
    score += 100;
  } else if (deadlineDate) {
    const diffDays = Math.ceil(
      (deadlineDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 0) score += 90;
    else if (diffDays === 1) score += 85;
    else if (diffDays <= 3) score += 70;
    else if (diffDays <= 7) score += 50;
    else if (diffDays <= 14) score += 30;
    else score += 15;
  } else {
    score += 10;
  }

  if (params.progress <= 10) score += 20;
  else if (params.progress <= 40) score += 12;
  else if (params.progress <= 75) score += 6;

  if (params.type === "assignment") score += 12;
  else if (params.type === "lesson") score += 8;
  else if (params.type === "practice") score += 5;
  else if (params.type === "review") score += 4;

  return score;
}

function derivePriorityLevel(score: number): PlannerPriorityLevel {
  if (score >= 80) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function buildReason(params: {
  completed: boolean;
  isOverdue: boolean;
  deadlineKey: string | null;
  progress: number;
  estimatedMinutes: number | null;
  type: PlannerTaskType;
}): string {
  if (params.completed)
    return "Completed task kept in the planner state for history.";
  if (params.isOverdue) return "Task is overdue and still incomplete.";

  const reasons: string[] = [];
  if (params.deadlineKey) reasons.push(`Due ${params.deadlineKey}.`);
  else reasons.push("No deadline provided.");

  if (params.progress >= 100) reasons.push("Marked complete by progress.");
  else if (params.progress > 0)
    reasons.push(`Progress at ${params.progress}%.`);
  else reasons.push("Not started yet.");

  if (params.estimatedMinutes === null)
    reasons.push("Estimated time is not set yet.");
  else reasons.push(`Estimated at ${params.estimatedMinutes} minutes.`);

  if (params.type === "assignment")
    reasons.push("Assignment tasks stay higher priority by default.");

  return reasons.join(" ");
}

export function normalizePlannerTask(
  raw: RawTask,
  currentDate: string | Date,
): PlannerTask {
  const currentDateKey = getCurrentDateKey(currentDate);
  const deadlineKey = toDateKey(raw.deadline);
  const progress = Number.isFinite(raw.progress ?? NaN)
    ? Math.max(0, Math.min(100, raw.progress ?? 0))
    : 0;
  const completed =
    Boolean(raw.completed) ||
    progress >= 100 ||
    raw.status === "completed" ||
    Boolean(raw.completedAt);
  const status = parseStatus(raw, completed);
  const type = deriveType(raw);
  const estimatedMinutes = deriveEstimatedMinutes(raw);
  const isOverdue = Boolean(
    deadlineKey && deadlineKey < currentDateKey && !completed,
  );
  const priorityScore = derivePriorityScore({
    deadlineKey,
    currentDateKey,
    progress,
    type,
    completed,
    isOverdue,
  });
  const priorityLevel = derivePriorityLevel(priorityScore);

  return {
    id: raw.id,
    title: raw.title?.trim() || "Untitled task",
    subject: raw.subject?.trim() || "General",
    type,
    description: raw.description?.trim() || "",
    deadline: deadlineKey,
    progress,
    status,
    estimatedMinutes,
    priorityScore,
    priorityLevel,
    completed,
    isOverdue,
    reason: buildReason({
      completed,
      isOverdue,
      deadlineKey,
      progress,
      estimatedMinutes,
      type,
    }),
  };
}

export function normalizePlannerTasks(
  rawTasks: RawTask[],
  currentDate: string | Date,
): PlannerTask[] {
  return rawTasks.map((task) => normalizePlannerTask(task, currentDate));
}

export function normalizeRawTaskInput(rawTask: unknown): RawTask | null {
  if (!rawTask || typeof rawTask !== "object") return null;
  if (!("id" in rawTask) || !("title" in rawTask)) return null;

  const task = rawTask as RawTask;
  return {
    ...task,
    id: String(task.id),
    title: String(task.title),
  };
}

export { getCurrentDateKey, toDateKey };
