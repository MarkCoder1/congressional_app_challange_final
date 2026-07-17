import {
  AnalyticsState,
  PlannerHistoryEntry,
  PlannerTask,
  ProductivityTrendItem,
  SubjectAnalyticsItem,
} from "../plannerTypes";

function buildSubjectDistribution(
  tasks: PlannerTask[],
): SubjectAnalyticsItem[] {
  const map = new Map<string, SubjectAnalyticsItem>();

  for (const task of tasks) {
    const existing = map.get(task.subject) ?? {
      subject: task.subject,
      taskCount: 0,
      knownMinutes: 0,
      hours: 0,
      unknownEstimateCount: 0,
    };

    existing.taskCount += 1;
    if (task.estimatedMinutes === null) existing.unknownEstimateCount += 1;
    else {
      existing.knownMinutes += task.estimatedMinutes;
      existing.hours = Number((existing.knownMinutes / 60).toFixed(1));
    }
    map.set(task.subject, existing);
  }

  return [...map.values()].sort(
    (left, right) => right.knownMinutes - left.knownMinutes,
  );
}

function buildDeadlineHeatmap(
  tasks: PlannerTask[],
): { date: string; count: number }[] {
  const map = new Map<string, number>();

  for (const task of tasks) {
    if (!task.deadline) continue;
    map.set(task.deadline, (map.get(task.deadline) ?? 0) + 1);
  }

  return [...map.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, count]) => ({ date, count }));
}

function buildProductivityTrend(
  history: PlannerHistoryEntry[],
): ProductivityTrendItem[] {
  const map = new Map<string, number>();

  for (const entry of history) {
    if (typeof entry.minutesSpent !== "number") continue;
    map.set(entry.date, (map.get(entry.date) ?? 0) + entry.minutesSpent);
  }

  return [...map.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, minutesSpent]) => ({ date, minutesSpent }));
}

export function buildAnalyticsState(
  tasks: PlannerTask[],
  history: PlannerHistoryEntry[] = [],
): AnalyticsState {
  const taskCount = tasks.length;
  const completedCount = tasks.filter((task) => task.completed).length;
  const overdueCount = tasks.filter(
    (task) => task.isOverdue && !task.completed,
  ).length;
  const knownMinutes = tasks.reduce(
    (sum, task) => sum + (task.estimatedMinutes ?? 0),
    0,
  );
  const unknownEstimateCount = tasks.filter(
    (task) => task.estimatedMinutes === null,
  ).length;
  const estimatedHours = Number((knownMinutes / 60).toFixed(1));
  const totalStudyHours = estimatedHours;
  const completionRate =
    taskCount > 0
      ? Number(((completedCount / taskCount) * 100).toFixed(1))
      : null;
  const subjectDistribution = buildSubjectDistribution(tasks);
  const deadlineHeatmap = buildDeadlineHeatmap(tasks);
  const productivityTrend = buildProductivityTrend(history);
  const productivityTrendValues = productivityTrend.map(
    (entry) => entry.minutesSpent,
  );

  return {
    taskCount,
    completedCount,
    overdueCount,
    completionRate,
    knownMinutes,
    unknownEstimateCount,
    estimatedHours,
    totalStudyHours,
    subjectDistribution,
    deadlineHeatmap,
    productivityTrend,
    productivityTrendValues,
    averageDaily:
      taskCount > 0 ? Number((knownMinutes / 7 / 60).toFixed(1)) : null,
    upcomingWorkload: tasks.filter((task) => !task.completed).length,
    streak: null,
    averageDailyMinutes: null,
    burnoutIndicator: null,
  };
}
