import { PlannerMissionRecommendation, PlannerAIContext } from "./plannerTypes";
import {
  formatTaskAction,
  summarizeTaskReason,
  pickPriorityTask,
} from "./plannerSchedule";

export function buildMissionRecommendation(
  context: PlannerAIContext,
): PlannerMissionRecommendation {
  const { plannerState } = context;
  const overdueTask = plannerState.overdue.tasks[0] ?? null;
  const priorityTask = pickPriorityTask(plannerState);
  const focusTask = overdueTask ?? priorityTask;

  if (!focusTask) {
    return {
      title: "No tasks planned",
      description: "There are no active study tasks to prioritise right now.",
      focusTaskId: null,
      estimatedMinutes: 0,
      reason: "The planner state contains no active tasks.",
    };
  }

  const action = formatTaskAction(focusTask);
  const taskReason = summarizeTaskReason(focusTask);
  const title = overdueTask
    ? `Clear ${overdueTask.title}`
    : `${action} ${focusTask.title}`;

  return {
    title,
    description: `${focusTask.subject} ${action} focus for today.`,
    focusTaskId: focusTask.id,
    estimatedMinutes:
      focusTask.estimatedMinutes ?? plannerState.today.mission.estimatedMinutes,
    reason: overdueTask
      ? `This task is overdue and still incomplete. ${taskReason}`
      : `This is the highest priority task in the planner state. ${taskReason}`,
  };
}
