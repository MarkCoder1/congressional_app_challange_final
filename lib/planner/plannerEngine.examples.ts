import { buildPlannerState } from "./plannerEngine";
import { RawTask } from "./plannerTypes";

export const plannerEngineExampleTasks: RawTask[] = [
  {
    id: "lesson-normal",
    title: "Water Cycle Lesson",
    subject: "Science",
    type: "lesson",
    description: "Standard lesson with a known duration.",
    deadline: "2026-07-16",
    progress: 20,
    status: "in_progress",
    estimatedMinutes: 120,
    createdAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "completed-overdue",
    title: "Finished History Review",
    subject: "History",
    type: "review",
    description: "Completed task that used to be overdue.",
    deadline: "2026-07-10",
    progress: 100,
    status: "completed",
    completedAt: "2026-07-11T15:00:00Z",
    estimatedMinutes: 45,
    createdAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "overdue-task",
    title: "Math Problem Set",
    subject: "Math",
    type: "assignment",
    description: "Incomplete task with a past deadline.",
    deadline: "2026-07-14",
    progress: 35,
    status: "in_progress",
    estimatedMinutes: 90,
    createdAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "assignment-no-estimate",
    title: "English Essay",
    subject: "English",
    type: "assignment",
    description: "Assignment without an estimate yet.",
    deadline: "2026-07-20",
    progress: 0,
    status: "not_started",
    createdAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "lesson-future",
    title: "Biology Reading",
    subject: "Biology",
    type: "lesson",
    description: "Lesson scheduled later this month.",
    deadline: "2026-07-23",
    progress: 0,
    status: "not_started",
    estimatedMinutes: 60,
    createdAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "no-deadline",
    title: "General Notes Cleanup",
    subject: "General",
    type: "practice",
    description: "Task without a deadline.",
    progress: 10,
    status: "in_progress",
    estimatedMinutes: 30,
    createdAt: "2026-07-01T09:00:00Z",
  },
];

export function buildPlannerEngineExampleState() {
  return buildPlannerState({
    tasks: plannerEngineExampleTasks,
    currentDate: "2026-07-15",
    history: [
      {
        date: "2026-07-14",
        taskId: "lesson-normal",
        minutesSpent: 120,
        status: "completed",
        source: "lesson",
      },
    ],
    preferences: {
      dayStartHour: 9,
      maxHeavySessionsPerDay: 3,
    },
  });
}

export function assertPlannerEngineExamples(): void {
  const state = buildPlannerEngineExampleState();
  const overdueCompleted = state.tasks.find(
    (task) => task.id === "completed-overdue",
  );
  const overdueTask = state.tasks.find((task) => task.id === "overdue-task");
  const noDeadlineTask = state.tasks.find((task) => task.id === "no-deadline");

  if (!overdueCompleted || !overdueTask || !noDeadlineTask) {
    throw new Error("Planner engine examples could not be resolved.");
  }

  if (overdueCompleted.isOverdue) {
    throw new Error("Completed tasks must never be marked overdue.");
  }

  if (!overdueTask.isOverdue) {
    throw new Error("Incomplete tasks with past deadlines must be overdue.");
  }

  if (
    state.today.priorityTasks.some(
      (task) =>
        task.id === "assignment-no-estimate" && task.estimatedMinutes !== null,
    )
  ) {
    throw new Error("Missing estimates must stay null in planner state.");
  }

  const knownMinutes = state.tasks.find(
    (task) => task.id === "lesson-normal",
  )?.estimatedMinutes;
  const missionMinutes = state.today.mission.estimatedMinutes;
  const calendarMinutes = state.calendar.days.find(
    (day) => day.date === "2026-07-16",
  )?.estimatedMinutes;

  if (knownMinutes !== 120 || missionMinutes < 120 || calendarMinutes !== 120) {
    throw new Error(
      "Estimated minutes must stay consistent across planner slices.",
    );
  }

  if (state.overdue.tasks.some((task) => task.completed)) {
    throw new Error("Overdue state must not include completed tasks.");
  }
}
