import { OverdueState, PlannerTask } from "../../types";
import {
  isTaskCompleted,
  parsePlannerDate,
  startOfPlannerDay,
} from "../normalizer";

export function calculateOverdue(
  tasks: ReadonlyArray<PlannerTask>,
  referenceDate: Date = new Date(),
): OverdueState {
  const overdueTasks = tasks.filter((task) => {
    if (isTaskCompleted(task) || !task.deadline) return false;
    const deadline = parsePlannerDate(task.deadline);
    if (!deadline) return false;
    return (
      startOfPlannerDay(deadline).getTime() <
      startOfPlannerDay(referenceDate).getTime()
    );
  });

  return {
    tasks: overdueTasks.map((task) => ({
      ...task,
      completed: false,
      status: task.status === "completed" ? "in_progress" : task.status,
    })),
    count: overdueTasks.length,
  };
}
