import {
  MissionState,
  PlannerTask,
  TodayState,
  TimelineItem,
} from "../../types";
import {
  formatPlannerDateKey,
  getPlannerEstimatedMinutes,
  getPlannerPriorityWeight,
  isSamePlannerDay,
  isTaskCompleted,
  parsePlannerDate,
  startOfPlannerDay,
} from "../normalizer";

function sortForToday(left: PlannerTask, right: PlannerTask): number {
  if (left.completed !== right.completed) return left.completed ? 1 : -1;
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

  return left.updatedAt.localeCompare(right.updatedAt);
}

function createTimelineItems(
  tasks: PlannerTask[],
  referenceDate: Date,
): TimelineItem[] {
  const startTime = new Date(startOfPlannerDay(referenceDate));
  startTime.setHours(8, 0, 0, 0);

  return tasks.map((task) => {
    const itemStart = new Date(startTime);
    const duration = getPlannerEstimatedMinutes(task);
    const itemEnd = new Date(itemStart);
    itemEnd.setMinutes(itemEnd.getMinutes() + duration);
    startTime.setMinutes(startTime.getMinutes() + duration);

    return {
      taskId: task.id,
      title: task.title,
      subject: task.subject,
      startTime: itemStart.toISOString(),
      endTime: itemEnd.toISOString(),
      duration,
      reason: task.completed
        ? "Completed today"
        : task.deadline
          ? "Due today"
          : "Priority focus",
      priority: task.priority,
    };
  });
}

function createMission(tasks: PlannerTask[]): MissionState {
  const activeTasks = tasks.filter((task) => !isTaskCompleted(task));

  if (tasks.length === 0) {
    return {
      title: "No tasks scheduled",
      description: "There are no planner tasks available for today.",
      estimatedMinutes: null,
      mainTaskId: null,
      taskCount: 0,
      warnings: [],
    };
  }

  const mainTask = activeTasks.length > 0 ? activeTasks[0] : tasks[0];
  const warnings = tasks.length > 6 ? ["Today has a large task load."] : [];

  return {
    title: mainTask.completed
      ? `Review ${mainTask.title}`
      : `Focus on ${mainTask.title}`,
    description: `${tasks.length} task${tasks.length === 1 ? "" : "s"} are available today.`,
    estimatedMinutes: tasks.reduce(
      (sum, task) => sum + getPlannerEstimatedMinutes(task),
      0,
    ),
    mainTaskId: mainTask.id,
    taskCount: tasks.length,
    warnings,
  };
}

export function calculateToday(
  tasks: ReadonlyArray<PlannerTask>,
  referenceDate: Date = new Date(),
): TodayState {
  const todayKey = formatPlannerDateKey(referenceDate);
  const deadlineMatches = tasks.filter((task) => {
    if (!task.deadline) return false;
    if (isTaskCompleted(task)) return false;
    const deadline = parsePlannerDate(task.deadline);
    return deadline ? isSamePlannerDay(deadline, referenceDate) : false;
  });

  const selectedTasks = (
    deadlineMatches.length > 0
      ? deadlineMatches
      : tasks
          .filter((task) => !isTaskCompleted(task))
          .slice()
          .sort(sortForToday)
  )
    .slice()
    .sort(sortForToday);

  const timeline = createTimelineItems(selectedTasks, referenceDate);
  const totalMinutes = selectedTasks.reduce(
    (sum, task) => sum + getPlannerEstimatedMinutes(task),
    0,
  );
  const completedMinutes = selectedTasks.reduce(
    (sum, task) =>
      isTaskCompleted(task) ? sum + getPlannerEstimatedMinutes(task) : sum,
    0,
  );

  return {
    mission: createMission(selectedTasks),
    timeline,
    totalMinutes,
    completedMinutes,
    remainingMinutes: Math.max(0, totalMinutes - completedMinutes),
  };
}