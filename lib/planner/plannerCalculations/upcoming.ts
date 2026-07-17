import {
  UpcomingGroupState,
  UpcomingState,
  PlannerTask,
} from "../plannerTypes";

function createGroup(tasks: PlannerTask[]): UpcomingGroupState {
  return {
    tasks,
    estimatedMinutes: tasks.reduce(
      (sum, task) => sum + (task.estimatedMinutes ?? 0),
      0,
    ),
    unknownEstimateCount: tasks.filter((task) => task.estimatedMinutes === null)
      .length,
  };
}

function daysBetween(fromDate: string, toDate: string): number {
  const from = new Date(`${fromDate}T12:00:00`);
  const to = new Date(`${toDate}T12:00:00`);
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function buildUpcomingState(
  tasks: PlannerTask[],
  currentDate: string,
): UpcomingState {
  const buckets = {
    tomorrow: [] as PlannerTask[],
    laterThisWeek: [] as PlannerTask[],
    nextWeek: [] as PlannerTask[],
    future: [] as PlannerTask[],
  };

  for (const task of tasks) {
    if (task.completed) continue;
    if (!task.deadline) {
      buckets.future.push(task);
      continue;
    }

    const diffDays = daysBetween(currentDate, task.deadline);
    if (diffDays === 1) buckets.tomorrow.push(task);
    else if (diffDays >= 2 && diffDays <= 6) buckets.laterThisWeek.push(task);
    else if (diffDays >= 7 && diffDays <= 13) buckets.nextWeek.push(task);
    else buckets.future.push(task);
  }

  return {
    tomorrow: createGroup(buckets.tomorrow),
    laterThisWeek: createGroup(buckets.laterThisWeek),
    nextWeek: createGroup(buckets.nextWeek),
    future: createGroup(buckets.future),
  };
}
