import { PlannerAIContext } from "./plannerTypes";

export function buildPlannerAIPrompt(context: PlannerAIContext): string {
  const topTasks = context.plannerState.tasks
    .filter((task) => !task.completed)
    .slice(0, 10)
    .map((task) => {
      const deadline = task.deadline ? ` deadline=${task.deadline}` : "";
      const minutes =
        task.estimatedMinutes !== null
          ? ` estimated=${task.estimatedMinutes}m`
          : " estimated=unknown";
      return `- ${task.id}: ${task.title} (${task.type}) priority=${task.priorityLevel} progress=${task.progress}%${deadline}${minutes}`;
    })
    .join("\n");

  return `You are planning from PlannerState only.\nDate: ${context.currentDate}\n\nToday mission:\n${context.plannerState.today.mission.title}\n\nOverdue tasks: ${context.plannerState.overdue.count}\nWeekly workload: ${context.plannerState.week.workload}\n\nTasks:\n${topTasks}\n\nReturn structured planner recommendations with reasons.`;
}
