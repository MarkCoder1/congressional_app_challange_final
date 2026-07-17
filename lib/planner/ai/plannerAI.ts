import { PlannerState } from "../plannerTypes";
import {
  AIPlannerState,
  PlannerAIContext,
  PlannerTaskRecommendation,
} from "./plannerTypes";
import {
  PlannerAIStrategy,
  createPlannerStrategy,
  MockPlannerStrategy,
} from "./plannerStrategy";

export function buildAIPlannerState(
  plannerState: PlannerState,
  strategy: PlannerAIStrategy = createPlannerStrategy("mock"),
): AIPlannerState {
  return strategy.analyze({
    plannerState,
    currentDate: plannerState.currentDate,
  });
}

export function createMockAIPlannerState(
  plannerState: PlannerState,
): AIPlannerState {
  return new MockPlannerStrategy().analyze({
    plannerState,
    currentDate: plannerState.currentDate,
  });
}

export function toLegacyPlannerAIOutput(aiState: AIPlannerState) {
  return {
    dailyMission: {
      title: aiState.mission.title,
      description: aiState.mission.description,
      estimatedHours: Number(
        (aiState.mission.estimatedMinutes / 60).toFixed(1),
      ),
      focusReason: aiState.mission.reason,
    },
    timeline: aiState.timeline.map((item) => ({
      taskId: item.taskId,
      order: item.order,
      suggestedTime: item.suggestedTime,
      duration: item.durationMinutes,
      reason: item.reason,
    })),
    weeklyRecommendations: aiState.suggestions.map((item) => item.reason),
    taskPriorities: aiState.priorityExplanations.map((item) => ({
      taskId: item.taskId,
      priority: item.priorityLevel,
      reason: item.reason,
    })),
    aiInsights: {
      warnings: aiState.warnings.map((warning) => warning.reason),
      recommendations: aiState.suggestions.map(
        (suggestion) => suggestion.reason,
      ),
      focusSuggestion: aiState.mission.reason,
    },
  };
}

export type {
  AIPlannerState,
  PlannerAIContext,
  PlannerTaskRecommendation,
} from "./plannerTypes";
