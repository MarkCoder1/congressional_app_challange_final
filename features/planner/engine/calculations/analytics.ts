import {
  AnalyticsState,
  PlannerTask,
  SubjectProgressState,
  StreakState,
} from "../../types";
import { isTaskCompleted } from "../normalizer";

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toDateKey(value: string): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function getStudyHistoryEntries(
  tasks: ReadonlyArray<PlannerTask>,
): Array<{
  startedAt: string;
  endedAt: string | null;
  minutesStudied: number | null;
}> {
  return tasks.flatMap((task) => task.metadata?.studyHistory ?? []);
}

function calculateStreak(
  tasks: ReadonlyArray<PlannerTask>,
  referenceDate: Date,
): StreakState | null {
  const entries = getStudyHistoryEntries(tasks);
  if (entries.length === 0) return null;

  const activityDays = new Set<string>();
  let latestTimestamp: string | null = null;

  for (const entry of entries) {
    const started = new Date(entry.startedAt);
    if (!Number.isNaN(started.getTime())) {
      activityDays.add(toDateKey(entry.startedAt));
      const startedISO = started.toISOString();
      if (latestTimestamp === null || startedISO > latestTimestamp) {
        latestTimestamp = startedISO;
      }
    }

    if (entry.endedAt) {
      const ended = new Date(entry.endedAt);
      if (!Number.isNaN(ended.getTime())) {
        activityDays.add(toDateKey(entry.endedAt));
        const endedISO = ended.toISOString();
        if (latestTimestamp === null || endedISO > latestTimestamp) {
          latestTimestamp = endedISO;
        }
      }
    }
  }


  const sortedDays = Array.from(activityDays).sort();
  if (sortedDays.length === 0) return null;

  const previousDay = (key: string): string => {
    const date = new Date(`${key}T00:00:00`);
    date.setDate(date.getDate() - 1);
    return toDateKey(date.toISOString());
  };

  let longest = 1;
  let currentRun = 1;
  for (let index = 1; index < sortedDays.length; index += 1) {
    if (previousDay(sortedDays[index]) === sortedDays[index - 1]) {
      currentRun += 1;
      longest = Math.max(longest, currentRun);
    } else {
      currentRun = 1;
    }
  }

  let current = 0;
  if (activityDays.has(toDateKey(referenceDate.toISOString()))) {
    const todayKey = toDateKey(referenceDate.toISOString());
    let cursor = todayKey;
    while (activityDays.has(cursor)) {
      current += 1;
      cursor = previousDay(cursor);
    }
  }

  return {
    current,
    longest,
    lastActiveAt: latestTimestamp,
  };
}

function subjectProgress(
  tasks: ReadonlyArray<PlannerTask>,
): SubjectProgressState[] {
  const subjects = new Map<
    string,
    {
      total: number;
      completed: number;
      mastery: number[];
      studyMinutes: number[];
    }
  >();

  for (const task of tasks) {
    const subject = task.subject;
    const current = subjects.get(subject) ?? {
      total: 0,
      completed: 0,
      mastery: [],
      studyMinutes: [],
    };

    current.total += 1;
    if (isTaskCompleted(task)) {
      current.completed += 1;
    }

    const masteryScore = task.metadata?.masteryScore;
    if (typeof masteryScore === "number" && Number.isFinite(masteryScore)) {
      current.mastery.push(masteryScore);
    }

    for (const entry of task.metadata?.studyHistory ?? []) {
      if (
        typeof entry.minutesStudied === "number" &&
        Number.isFinite(entry.minutesStudied)
      ) {
        current.studyMinutes.push(entry.minutesStudied);
      }
    }

    subjects.set(subject, current);
  }

  return Array.from(subjects.entries()).map(([subject, value]) => ({
    subject,
    completionRate:
      value.total > 0 ? (value.completed / value.total) * 100 : null,
    masteryPerformance: average(value.mastery),
    studyHours:
      value.studyMinutes.length > 0
        ? value.studyMinutes.reduce((sum, minutes) => sum + minutes, 0) / 60
        : null,
  }));
}

export function calculateAnalytics(
  tasks: ReadonlyArray<PlannerTask>,
  referenceDate: Date = new Date(),
): AnalyticsState {
  const completionRate =
    tasks.length > 0
      ? (tasks.filter((task) => isTaskCompleted(task)).length / tasks.length) *
        100
      : null;

  const practiceScores = tasks
    .map((task) => task.metadata?.practiceResult?.score)
    .filter(
      (score): score is number =>
        typeof score === "number" && Number.isFinite(score),
    );

  const masteryScores = tasks
    .map((task) => task.metadata?.masteryScore)
    .filter(
      (score): score is number =>
        typeof score === "number" && Number.isFinite(score),
    );

  const studyHistoryMinutes = tasks
    .flatMap((task) => task.metadata?.studyHistory ?? [])
    .map((entry) => entry.minutesStudied)
    .filter(
      (minutes): minutes is number =>
        typeof minutes === "number" && Number.isFinite(minutes),
    );

  return {
    completionRate:
      completionRate === null
        ? null
        : {
            value: completionRate,
            previousValue: null,
            trend: null,
            updatedAt: referenceDate.toISOString(),
          },
    studyHours:
      studyHistoryMinutes.length > 0
        ? {
            value:
              studyHistoryMinutes.reduce((sum, minutes) => sum + minutes, 0) /
              60,
            previousValue: null,
            trend: null,
            updatedAt: referenceDate.toISOString(),
          }
        : null,
    practicePerformance:
      practiceScores.length > 0
        ? {
            value: average(practiceScores),
            previousValue: null,
            trend: null,
            updatedAt: referenceDate.toISOString(),
          }
        : null,
    masteryPerformance:
      masteryScores.length > 0
        ? {
            value: average(masteryScores),
            previousValue: null,
            trend: null,
            updatedAt: referenceDate.toISOString(),
          }
        : null,
    subjectProgress: subjectProgress(tasks),
    streak: calculateStreak(tasks, referenceDate),
  };
}
