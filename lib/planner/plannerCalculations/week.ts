import {
  PlannerTask,
  PlannerUserPreferences,
  WeekDayState,
  WeekState,
} from "../plannerTypes";

function addDays(baseDate: Date, days: number): Date {
  const next = new Date(baseDate);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function deriveWorkload(knownMinutes: number): WeekDayState["workload"] {
  if (knownMinutes >= 360) return "overloaded";
  if (knownMinutes >= 240) return "heavy";
  if (knownMinutes >= 120) return "medium";
  return "light";
}

export function buildWeekState(
  tasks: PlannerTask[],
  currentDate: string,
  _preferences: PlannerUserPreferences,
): WeekState {
  const baseDate = new Date(`${currentDate}T00:00:00`);
  const days: WeekDayState[] = [];

  for (let index = 0; index < 7; index += 1) {
    const date = toDateKey(addDays(baseDate, index));
    const dayTasks = tasks.filter(
      (task) => !task.completed && task.deadline === date,
    );
    const knownMinutes = dayTasks.reduce(
      (sum, task) => sum + (task.estimatedMinutes ?? 0),
      0,
    );
    const unknownEstimateCount = dayTasks.filter(
      (task) => task.estimatedMinutes === null,
    ).length;

    days.push({
      date,
      tasks: dayTasks,
      estimatedMinutes: knownMinutes,
      hours: Number((knownMinutes / 60).toFixed(1)),
      knownMinutes,
      unknownEstimateCount,
      taskCount: dayTasks.length,
      workload: deriveWorkload(knownMinutes),
    });
  }

  const knownMinutes = days.reduce((sum, day) => sum + day.knownMinutes, 0);
  const unknownEstimateCount = days.reduce(
    (sum, day) => sum + day.unknownEstimateCount,
    0,
  );
  const estimatedHours = Number((knownMinutes / 60).toFixed(1));
  const studyHours = estimatedHours;
  const workload = deriveWorkload(knownMinutes);

  const hardestDay = days.reduce<WeekDayState | null>((current, next) => {
    if (!current) return next;
    return next.knownMinutes > current.knownMinutes ? next : current;
  }, null);

  const lightestDay = days.reduce<WeekDayState | null>((current, next) => {
    if (!current) return next;
    return next.knownMinutes < current.knownMinutes ? next : current;
  }, null);

  return {
    days,
    estimatedHours,
    studyHours,
    knownMinutes,
    unknownEstimateCount,
    workload,
    hardestDay: hardestDay?.date ?? null,
    lightestDay: lightestDay?.date ?? null,
  };
}
