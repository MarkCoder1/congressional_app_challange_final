import { OverdueState, PlannerTask } from "../plannerTypes";

export function buildOverdueState(tasks: PlannerTask[]): OverdueState {
  const overdueTasks = tasks.filter(
    (task) => task.isOverdue && !task.completed,
  );

  return {
    tasks: overdueTasks,
    count: overdueTasks.length,
    recoveryPlaceholder:
      overdueTasks.length > 0
        ? "Review overdue items first, then move non-urgent work into the planner queue."
        : "No overdue tasks. Recovery guidance will appear here when needed.",
  };
}
