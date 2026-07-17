import { buildMissionRecommendation } from "./plannerMission";
import {
  buildPriorityExplanations,
  buildTaskRecommendations,
  buildTimelineRecommendations,
} from "./plannerSchedule";
import {
  buildPlannerRisks,
  buildPlannerSuggestions,
  buildPlannerWarnings,
} from "./plannerWarnings";
import { AIPlannerState, PlannerAIContext } from "./plannerTypes";

export interface PlannerAIStrategy {
  analyze(context: PlannerAIContext): AIPlannerState;
}

function buildSummaryTitle(
  prefix: string,
  count: number,
  noun: string,
): string {
  if (count === 0) return `${prefix} is clear`;
  return `${count} ${noun}${count === 1 ? "" : "s"} in ${prefix.toLowerCase()}`;
}

export class MockPlannerStrategy implements PlannerAIStrategy {
  analyze(context: PlannerAIContext): AIPlannerState {
    const mission = buildMissionRecommendation(context);
    const timeline = buildTimelineRecommendations(context);
    const taskRecommendations = buildTaskRecommendations(context);
    const warnings = buildPlannerWarnings(context);
    const suggestions = buildPlannerSuggestions(context);
    const risks = buildPlannerRisks(context);
    const priorityExplanations = buildPriorityExplanations(context);

    const recoveryPlan = {
      title: warnings.length > 0 ? "Recovery plan" : "No recovery required",
      reason:
        context.plannerState.overdue.count > 0
          ? "Overdue tasks are present, so the plan starts with recovery."
          : "There are no overdue tasks to recover.",
      steps:
        context.plannerState.overdue.count > 0
          ? [
              {
                title: "Work on overdue tasks first",
                reason: "Recover the most urgent work before adding new tasks.",
              },
              {
                title: "Rebuild today's timeline",
                reason:
                  "Use the current planner state to sequence the remaining work.",
              },
            ]
          : [
              {
                title: "Keep the current plan",
                reason:
                  "The planner state does not currently require recovery steps.",
              },
            ],
    };

    const dailySummary = {
      title: buildSummaryTitle(
        "today",
        context.plannerState.today.priorityTasks.length,
        "priority task",
      ),
      reason:
        context.plannerState.today.warnings[0] ??
        "The engine has produced a stable daily plan.",
      workload: context.plannerState.today.workload.level,
    };

    const weeklySummary = {
      title: buildSummaryTitle(
        "this week",
        context.plannerState.week.days.filter((day) => day.taskCount > 0)
          .length,
        "busy day",
      ),
      reason:
        context.plannerState.week.workload === "overloaded"
          ? "Weekly workload is overloaded and should be reduced if possible."
          : `Weekly workload is ${context.plannerState.week.workload}.`,
      workload: context.plannerState.week.workload,
    };

    return {
      mission,
      timeline,
      taskRecommendations,
      warnings,
      suggestions,
      risks,
      recoveryPlan,
      priorityExplanations,
      dailySummary,
      weeklySummary,
      metadata: {
        generatedAt: new Date().toISOString(),
        source: "mock",
        plannerTaskCount: context.plannerState.tasks.length,
      },
    };
  }
}

export class GroqPlannerStrategy implements PlannerAIStrategy {
  analyze(context: PlannerAIContext): AIPlannerState {
    return new MockPlannerStrategy().analyze(context);
  }
}

export function createPlannerStrategy(
  strategy: "mock" | "groq" = "mock",
): PlannerAIStrategy {
  return strategy === "groq"
    ? new GroqPlannerStrategy()
    : new MockPlannerStrategy();
}
