import { CalendarDayState, CalendarState, PlannerTask } from "../../types";
import {
  addPlannerDays,
  formatPlannerDateKey,
  getPlannerEstimatedMinutes,
  isTaskCompleted,
  parsePlannerDate,
  startOfPlannerDay,
} from "../normalizer";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function sortTasks(left: PlannerTask, right: PlannerTask): number {
  const leftMinutes = getPlannerEstimatedMinutes(left);
  const rightMinutes = getPlannerEstimatedMinutes(right);
  if (leftMinutes !== rightMinutes) return leftMinutes - rightMinutes;
  return left.title.localeCompare(right.title);
}

export function calculateCalendar(
  tasks: ReadonlyArray<PlannerTask>,
  referenceDate: Date = new Date(),
): CalendarState {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth() + 1;
  const dayCount = getDaysInMonth(year, month);
  const monthStart = startOfPlannerDay(new Date(year, month - 1, 1));

  const days: CalendarDayState[] = Array.from(
    { length: dayCount },
    (_, index) => {
      const date = addPlannerDays(monthStart, index);
      const dayTasks = tasks
        .filter((task) => {
          if (isTaskCompleted(task)) return false;
          if (!task.deadline) return false;
          const deadline = parsePlannerDate(task.deadline);
          return deadline
            ? formatPlannerDateKey(deadline) === formatPlannerDateKey(date)
            : false;
        })
        .slice()
        .sort(sortTasks);

      return {
        date: formatPlannerDateKey(date),
        hasTasks: dayTasks.length > 0,
        tasks: dayTasks,
      };
    },
  );

  return {
    month,
    year,
    days,
  };
}
