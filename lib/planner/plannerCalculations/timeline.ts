import {
  PlannerTask,
  PlannerTimelineItem,
  PlannerUserPreferences,
} from "../plannerTypes";

function toClockMinutes(hour: number, minute = 0): number {
  return hour * 60 + minute;
}

function formatClock(minutesFromMidnight: number): string {
  const normalized = ((minutesFromMidnight % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function buildTimeline(
  tasks: PlannerTask[],
  preferences: PlannerUserPreferences,
): PlannerTimelineItem[] {
  const startHour = preferences.dayStartHour ?? 9;
  const timelineStart = toClockMinutes(startHour);
  const orderedTasks = [...tasks].sort((left, right) => {
    if (left.isOverdue !== right.isOverdue) return left.isOverdue ? -1 : 1;
    if (left.priorityScore !== right.priorityScore)
      return right.priorityScore - left.priorityScore;
    if (left.deadline && right.deadline && left.deadline !== right.deadline)
      return left.deadline.localeCompare(right.deadline);
    if (left.deadline && !right.deadline) return -1;
    if (!left.deadline && right.deadline) return 1;
    return left.title.localeCompare(right.title);
  });

  let cursor = timelineStart;

  return orderedTasks.map((task, index) => {
    const startTime =
      task.estimatedMinutes === null ? null : formatClock(cursor);
    const durationMinutes = task.estimatedMinutes;

    if (durationMinutes !== null) {
      cursor += durationMinutes;
    }

    return {
      taskId: task.id,
      task,
      order: index + 1,
      startTime,
      durationMinutes,
      priorityLevel: task.priorityLevel,
      reason: task.reason,
    };
  });
}
