import { PlannerTask, WeekDayState, WeekState } from "../../types";
import {
  addPlannerDays,
  formatPlannerDateKey,
  getPlannerEstimatedMinutes,
  getPlannerPriorityWeight,
  getWeekStart,
  isSamePlannerDay,
  isTaskCompleted,
  parsePlannerDate,
} from "../normalizer";

function sortTasks(left: PlannerTask, right: PlannerTask): number {
  const priorityDelta =
    getPlannerPriorityWeight(left.priority) -
    getPlannerPriorityWeight(right.priority);
  if (priorityDelta !== 0) return priorityDelta;

  const leftDeadline = left.deadline ? parsePlannerDate(left.deadline) : null;
  const rightDeadline = right.deadline
    ? parsePlannerDate(right.deadline)
    : null;
  if (leftDeadline && rightDeadline) {
    const deadlineDelta = leftDeadline.getTime() - rightDeadline.getTime();
    if (deadlineDelta !== 0) return deadlineDelta;
  }

  return left.title.localeCompare(right.title);
}

function workloadFromMinutes(minutes: number): WeekDayState["workload"] {
  if (minutes <= 60) return "light";
  if (minutes <= 180) return "moderate";
  if (minutes <= 300) return "heavy";
  return "overloaded";
}

export function calculateWeek(
  tasks: ReadonlyArray<PlannerTask>,
  referenceDate: Date = new Date(),
): WeekState {
  const start = getWeekStart(referenceDate);
  const days: WeekDayState[] = Array.from({ length: 7 }, (_, index) => {
    const date = addPlannerDays(start, index);
    const dayTasks = tasks
      .filter((task) => {
        if (isTaskCompleted(task)) return false;
        if (!task.deadline) return false;
        const deadline = parsePlannerDate(task.deadline);
        return deadline ? isSamePlannerDay(deadline, date) : false;
      })
      .slice()
      .sort(sortTasks);

    const estimatedMinutes = dayTasks.reduce(
      (sum, task) => sum + getPlannerEstimatedMinutes(task),
      0,
    );

    return {
      date: formatPlannerDateKey(date),
      tasks: dayTasks,
      estimatedMinutes,
      workload: workloadFromMinutes(estimatedMinutes),
    };
  });

  const daysWithTasks = days.filter((day) => day.tasks.length > 0);
  const hardestDay =
    daysWithTasks.length > 0
      ? daysWithTasks.reduce((current, day) =>
          day.estimatedMinutes > current.estimatedMinutes ? day : current,
        )
      : null;
  const lightestDay =
    daysWithTasks.length > 0
      ? daysWithTasks.reduce((current, day) =>
          day.estimatedMinutes < current.estimatedMinutes ? day : current,
        )
      : null;

  const totalMinutes = days.reduce((sum, day) => sum + day.estimatedMinutes, 0);

  return {
    days,
    totalHours: totalMinutes / 60,
    hardestDay,
    lightestDay,
  };
}