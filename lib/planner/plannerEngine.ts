import {
  AnalyticsState,
  CalendarState,
  OverdueState,
  PlannerHistoryEntry,
  PlannerState,
  PlannerTask,
  PlannerUserPreferences,
  RawTask,
  TodayState,
  UpcomingState,
  WeekState,
} from "./plannerTypes";
import { normalizePlannerTasks } from "./plannerNormalizer";
import { buildAnalyticsState } from "./plannerCalculations/analytics";
import { buildCalendarState } from "./plannerCalculations/calendar";
import { buildOverdueState } from "./plannerCalculations/overdue";
import { buildTodayMission } from "./plannerCalculations/mission";
import { buildTimeline } from "./plannerCalculations/timeline";
import { buildUpcomingState } from "./plannerCalculations/upcoming";
import { buildWeekState } from "./plannerCalculations/week";

export interface BuildPlannerStateInput {
  tasks: RawTask[];
  currentDate: string | Date;
  history?: PlannerHistoryEntry[];
  preferences?: PlannerUserPreferences;
}

function getCurrentDateKey(currentDate: string | Date): string {
  const date =
    currentDate instanceof Date ? currentDate : new Date(currentDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildTodayState(
  tasks: PlannerTask[],
  currentDate: string,
  preferences: PlannerUserPreferences,
): TodayState {
  const { mission, workload, warnings, priorityTasks } = buildTodayMission(
    tasks,
    currentDate,
    preferences,
  );
  return {
    mission,
    timeline: buildTimeline(priorityTasks, preferences),
    workload,
    priorityTasks,
    warnings,
  };
}

export function buildPlannerState(input: BuildPlannerStateInput): PlannerState {
  const currentDate = getCurrentDateKey(input.currentDate);
  const preferences = input.preferences ?? {};
  const history = input.history ?? [];
  const tasks = normalizePlannerTasks(input.tasks, currentDate);

  const today = buildTodayState(tasks, currentDate, preferences);
  const week = buildWeekState(tasks, currentDate, preferences);
  const calendar = buildCalendarState(tasks, currentDate);
  const upcoming = buildUpcomingState(tasks, currentDate);
  const overdue = buildOverdueState(tasks);
  const analytics = buildAnalyticsState(tasks, history);

  return {
    currentDate,
    tasks,
    today,
    week,
    calendar,
    upcoming,
    overdue,
    analytics,
  };
}

export type {
  AnalyticsState,
  CalendarState,
  OverdueState,
  PlannerTask,
  PlannerUserPreferences,
  TodayState,
  UpcomingState,
  WeekState,
} from "./plannerTypes";
