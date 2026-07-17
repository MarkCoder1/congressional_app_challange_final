import {
  PlannerAIContext,
  PlannerRisk,
  PlannerSuggestion,
  PlannerWarning,
} from "./plannerTypes";

export function buildPlannerWarnings(
  context: PlannerAIContext,
): PlannerWarning[] {
  const warnings: PlannerWarning[] = [];

  if (context.plannerState.overdue.count > 0) {
    warnings.push({
      id: "overdue-tasks",
      title: "Overdue tasks need attention",
      reason: `${context.plannerState.overdue.count} task(s) are overdue and still incomplete.`,
      severity: "high",
    });
  }

  if (context.plannerState.today.workload.level === "overloaded") {
    warnings.push({
      id: "today-overloaded",
      title: "Today's workload is overloaded",
      reason: `Today's planner workload is marked as ${context.plannerState.today.workload.level}.`,
      severity: "high",
    });
  }

  if (context.plannerState.analytics.unknownEstimateCount > 0) {
    warnings.push({
      id: "missing-estimates",
      title: "Some tasks still need estimates",
      reason: `${context.plannerState.analytics.unknownEstimateCount} task(s) do not have an estimated duration yet.`,
      severity: "medium",
    });
  }

  return warnings;
}

export function buildPlannerRisks(context: PlannerAIContext): PlannerRisk[] {
  const risks: PlannerRisk[] = [];

  if (context.plannerState.overdue.count > 0) {
    risks.push({
      id: "recovery-risk",
      title: "Recovery backlog may grow",
      reason:
        "Overdue work can compound if it is not scheduled before new tasks.",
      severity: "high",
    });
  }

  if (context.plannerState.week.workload === "overloaded") {
    risks.push({
      id: "weekly-overload",
      title: "Weekly workload is overloaded",
      reason: `The weekly workload is currently marked as ${context.plannerState.week.workload}.`,
      severity: "high",
    });
  }

  if (context.plannerState.analytics.upcomingWorkload > 5) {
    risks.push({
      id: "upcoming-overload",
      title: "Upcoming workload is dense",
      reason: `${context.plannerState.analytics.upcomingWorkload} incomplete task(s) are queued ahead.`,
      severity: "medium",
    });
  }

  return risks;
}

export function buildPlannerSuggestions(
  context: PlannerAIContext,
): PlannerSuggestion[] {
  const suggestions: PlannerSuggestion[] = [];

  if (context.plannerState.overdue.count > 0) {
    suggestions.push({
      id: "recover-first",
      title: "Recover overdue tasks first",
      reason:
        "Starting with overdue work reduces risk and clears space for the rest of the plan.",
    });
  }

  const nearlyComplete = context.plannerState.tasks.find(
    (task) => !task.completed && task.progress >= 80,
  );
  if (nearlyComplete) {
    suggestions.push({
      id: "finish-nearly-complete",
      title: `Finish ${nearlyComplete.title}`,
      reason: `It is already ${nearlyComplete.progress}% complete, so finishing it gives a quick win.`,
    });
  }

  const reviewTask = context.plannerState.tasks.find(
    (task) => task.type === "review" && !task.completed,
  );
  if (reviewTask) {
    suggestions.push({
      id: "review-before-test",
      title: `Review ${reviewTask.title}`,
      reason:
        "Review tasks should be done before higher-pressure deadlines when possible.",
    });
  }

  return suggestions;
}
