import { CalendarDayState, CalendarState, PlannerTask } from "../plannerTypes";

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildCalendarState(
  tasks: PlannerTask[],
  currentDate: string,
): CalendarState {
  const rangeStart = currentDate;
  const rangeEndDate = new Date(`${currentDate}T00:00:00`);
  rangeEndDate.setDate(rangeEndDate.getDate() + 30);
  const rangeEnd = toDateKey(rangeEndDate);

  const dayMap = new Map<string, PlannerTask[]>();
  const unscheduled: PlannerTask[] = [];

  for (const task of tasks) {
    if (task.completed) continue;
    if (!task.deadline) {
      unscheduled.push(task);
      continue;
    }

    const bucket = dayMap.get(task.deadline) ?? [];
    bucket.push(task);
    dayMap.set(task.deadline, bucket);
  }

  const days: CalendarDayState[] = [...dayMap.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, dayTasks]) => {
      const knownMinutes = dayTasks.reduce(
        (sum, task) => sum + (task.estimatedMinutes ?? 0),
        0,
      );
      const unknownEstimateCount = dayTasks.filter(
        (task) => task.estimatedMinutes === null,
      ).length;
      const indicators = [
        dayTasks.some((task) => task.isOverdue) ? "overdue" : null,
        dayTasks.some((task) => task.priorityLevel === "high")
          ? "high-priority"
          : null,
        unknownEstimateCount > 0 ? "missing-estimate" : null,
      ].filter((indicator): indicator is string => Boolean(indicator));

      return {
        date,
        tasks: dayTasks,
        taskCount: dayTasks.length,
        estimatedMinutes: knownMinutes,
        knownMinutes,
        unknownEstimateCount,
        indicators,
      };
    });

  return {
    days,
    unscheduled,
    rangeStart,
    rangeEnd,
  };
}
