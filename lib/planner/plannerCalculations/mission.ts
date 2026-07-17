import {
  MissionState,
  PlannerTask,
  PlannerUserPreferences,
  TodayWorkloadState,
} from "../plannerTypes";

function formatMissionTitle(taskCount: number, overdueCount: number): string {
  if (taskCount === 0) return "No tasks scheduled for today";
  if (overdueCount > 0)
    return `Clear ${overdueCount} overdue task${overdueCount === 1 ? "" : "s"} first`;
  if (taskCount === 1) return "Focus on your top priority task";
  return `Focus on ${taskCount} priority tasks today`;
}

export function buildTodayMission(
  tasks: PlannerTask[],
  currentDate: string,
  preferences: PlannerUserPreferences,
): {
  mission: MissionState;
  workload: TodayWorkloadState;
  warnings: string[];
  priorityTasks: PlannerTask[];
} {
  const activeTasks = tasks.filter((task) => !task.completed);
  const overdueTasks = activeTasks.filter((task) => task.isOverdue);
  const todayTasks = activeTasks.filter(
    (task) => task.deadline === currentDate,
  );
  const candidateTasks = [...todayTasks, ...activeTasks]
    .filter(
      (task, index, self) =>
        self.findIndex((candidate) => candidate.id === task.id) === index,
    )
    .sort((left, right) => right.priorityScore - left.priorityScore);

  const maxSessions = Math.max(1, preferences.maxHeavySessionsPerDay ?? 3);
  const priorityTasks = candidateTasks.slice(0, maxSessions);
  const knownMinutes = priorityTasks.reduce(
    (sum, task) => sum + (task.estimatedMinutes ?? 0),
    0,
  );
  const unknownEstimateCount = priorityTasks.filter(
    (task) => task.estimatedMinutes === null,
  ).length;
  const taskCount = priorityTasks.length;
  const estimatedMinutes = knownMinutes;
  const estimatedHours = Math.floor(estimatedMinutes / 60);
  const remainingMinutes = estimatedMinutes % 60;
  const typeCounts = priorityTasks.reduce(
    (counts, task) => {
      if (task.type === "assignment") counts.assignment += 1;
      else if (task.type === "lesson") counts.lesson += 1;
      else if (task.type === "practice") counts.practice += 1;
      else if (task.type === "review") counts.review += 1;
      return counts;
    },
    { assignment: 0, lesson: 0, practice: 0, review: 0 },
  );

  const workloadLevel: TodayWorkloadState["level"] =
    knownMinutes >= 360
      ? "overloaded"
      : knownMinutes >= 240
        ? "heavy"
        : knownMinutes >= 120
          ? "medium"
          : "light";

  const warnings: string[] = [];
  if (overdueTasks.length > 0) {
    warnings.push(
      `${overdueTasks.length} overdue task${overdueTasks.length === 1 ? " is" : "s are"} waiting.`,
    );
  }
  if (unknownEstimateCount > 0) {
    warnings.push(
      `${unknownEstimateCount} task${unknownEstimateCount === 1 ? " needs" : "s need"} an estimate.`,
    );
  }
  if (workloadLevel === "overloaded") {
    warnings.push("Today's known workload is overloaded.");
  }

  return {
    mission: {
      title: formatMissionTitle(taskCount, overdueTasks.length),
      focusTaskId: priorityTasks[0]?.id ?? null,
      estimatedMinutes,
      knownMinutes,
      unknownEstimateCount,
      sessionCount: taskCount,
    },
    workload: {
      level: workloadLevel,
      estimatedMinutes,
      estimatedHours,
      remainingMinutes,
      knownMinutes,
      unknownEstimateCount,
      taskCount,
      typeCounts,
    },
    warnings,
    priorityTasks,
  };
}
