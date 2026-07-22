import { UpcomingGroupState, UpcomingState, PlannerTask } from "../../types";
import {
  getPlannerEstimatedMinutes,
  getPlannerPriorityWeight,
  getWeekEnd,
  getWeekStart,
  isTaskCompleted,
  parsePlannerDate,
  startOfPlannerDay,
  addPlannerDays,
} from "../normalizer";

function emptyGroup(): UpcomingGroupState {
  return { tasks: [], estimatedMinutes: 0 };
}

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

function buildGroup(tasks: PlannerTask[]): UpcomingGroupState {
  return {
    tasks: tasks.slice().sort(sortTasks),
    estimatedMinutes: tasks.reduce(
      (sum, task) => sum + getPlannerEstimatedMinutes(task),
      0,
    ),
  };
}

export function calculateUpcoming(
  tasks: ReadonlyArray<PlannerTask>,
  referenceDate: Date = new Date(),
): UpcomingState {
  const today = startOfPlannerDay(referenceDate);
  const tomorrow = addPlannerDays(today, 1);
  const currentWeekStart = getWeekStart(referenceDate);
  const currentWeekEnd = getWeekEnd(referenceDate);
  const nextWeekStart = addPlannerDays(currentWeekStart, 7);
  const nextWeekEnd = addPlannerDays(currentWeekStart, 13);

  const scheduledTasks = tasks.filter(
    (task) => !isTaskCompleted(task) && task.deadline,
  );

  const tomorrowTasks = scheduledTasks.filter((task) => {
    const deadline = task.deadline ? parsePlannerDate(task.deadline) : null;
    return deadline
      ? startOfPlannerDay(deadline).getTime() === tomorrow.getTime()
      : false;
  });

  const laterThisWeekTasks = scheduledTasks.filter((task) => {
    const deadline = task.deadline ? parsePlannerDate(task.deadline) : null;
    if (!deadline) return false;
    const deadlineTime = startOfPlannerDay(deadline).getTime();
    return (
      deadlineTime > tomorrow.getTime() &&
      deadlineTime <= currentWeekEnd.getTime()
    );
  });

  const nextWeekTasks = scheduledTasks.filter((task) => {
    const deadline = task.deadline ? parsePlannerDate(task.deadline) : null;
    if (!deadline) return false;
    const deadlineTime = startOfPlannerDay(deadline).getTime();
    return (
      deadlineTime >= nextWeekStart.getTime() &&
      deadlineTime <= nextWeekEnd.getTime()
    );
  });

  const futureTasks = tasks.filter((task) => {
    if (isTaskCompleted(task)) return false;
    if (!task.deadline) return true;
    const deadline = parsePlannerDate(task.deadline);
    if (!deadline) return true;
    const deadlineTime = startOfPlannerDay(deadline).getTime();
    return deadlineTime > nextWeekEnd.getTime();
  });

  return {
    tomorrow:
      tomorrowTasks.length > 0 ? buildGroup(tomorrowTasks) : emptyGroup(),
    laterThisWeek:
      laterThisWeekTasks.length > 0
        ? buildGroup(laterThisWeekTasks)
        : emptyGroup(),
    nextWeek:
      nextWeekTasks.length > 0 ? buildGroup(nextWeekTasks) : emptyGroup(),
    future: futureTasks.length > 0 ? buildGroup(futureTasks) : emptyGroup(),
  };
}
