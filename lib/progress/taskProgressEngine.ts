import {
  AssignmentWorkflowStage,
  LessonProgressEvent,
  Task,
  TaskProgressMeta,
  TaskStatus,
} from "@/types/task";

const ASSIGNMENT_STAGE_WEIGHTS: Record<AssignmentWorkflowStage, number> = {
  overview: 5,
  planning: 10,
  research: 15,
  execution: 30,
  checkpoints: 10,
  quality: 10,
  validation: 10,
  submission: 10,
};

export type TaskProgressUpdateInput = {
  manualProgress?: number;
  manualDelta?: number;
  markCompleted?: boolean;
  reset?: boolean;
  lessonEvent?: LessonProgressEvent;
  lessonScore?: number;
  assignmentStageCompleted?: AssignmentWorkflowStage;
  assignmentStagesCompleted?: AssignmentWorkflowStage[];
  workflowAdvancedTo?: AssignmentWorkflowStage;
  submissionValidated?: boolean;
  status?: TaskStatus;
};

export type TaskProgressResult = Pick<
  Task,
  "progress" | "status" | "startedAt" | "completedAt" | "lastActivityAt" | "progressMeta"
>;

const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

function ensureStatus(progress: number, status?: TaskStatus): TaskStatus {
  if (status === "completed" || progress >= 100) return "completed";
  if (status === "in_progress" || progress > 0) return "in_progress";
  return "not_started";
}

function uniqueStages(stages: AssignmentWorkflowStage[]): AssignmentWorkflowStage[] {
  return [...new Set(stages)];
}

function calculateAssignmentWorkflowProgress(stages: AssignmentWorkflowStage[]): number {
  return clamp(
    uniqueStages(stages).reduce((sum, stage) => sum + ASSIGNMENT_STAGE_WEIGHTS[stage], 0),
  );
}

export function calculateTaskProgress(task: Task, updates: TaskProgressUpdateInput = {}): TaskProgressResult {
  const now = new Date().toISOString();
  const progressMeta: TaskProgressMeta = { ...(task.progressMeta ?? {}) };

  if (updates.reset) {
    return {
      progress: 0,
      status: "not_started",
      startedAt: undefined,
      completedAt: undefined,
      lastActivityAt: now,
      progressMeta: {
        ...progressMeta,
        manuallyAdjusted: true,
        learnCompleted: false,
        practiceCompleted: false,
        masterCompleted: false,
        assignmentWorkflowProgress: 0,
        assignmentSectionsCompleted: [],
      },
    };
  }

  let progress = clamp(task.progress ?? 0);
  let status: TaskStatus = task.status ?? "not_started";
  let startedAt = task.startedAt;
  let completedAt = task.completedAt;

  const markStarted = () => {
    if (!startedAt) startedAt = now;
    if (status === "not_started") status = "in_progress";
  };

  if (updates.lessonEvent) {
    markStarted();
    switch (updates.lessonEvent) {
      case "learn_entered": {
        break;
      }
      case "learn_viewed": {
        if (!progressMeta.learnCompleted) {
          progress = clamp(progress + 10);
          progressMeta.learnCompleted = true;
        }
        break;
      }
      case "practice_completed": {
        const score = updates.lessonScore ?? 0;
        const gain = score < 50 ? 10 : score < 80 ? 25 : 40;
        progress = clamp(progress + gain);
        progressMeta.practiceCompleted = true;
        break;
      }
      case "master_completed": {
        progress = 100;
        status = "completed";
        progressMeta.masterCompleted = true;
        completedAt = now;
        break;
      }
      case "master_failed": {
        break;
      }
      default:
        break;
    }
  }

  if (task.type === "assignment") {
    const stages = uniqueStages([
      ...(progressMeta.assignmentSectionsCompleted ?? []),
      ...(updates.assignmentStagesCompleted ?? []),
      ...(updates.assignmentStageCompleted ? [updates.assignmentStageCompleted] : []),
      ...(updates.workflowAdvancedTo ? [updates.workflowAdvancedTo] : []),
      ...(updates.submissionValidated ? ["submission"] : []),
    ]);

    if (stages.length > 0) {
      markStarted();
      progressMeta.assignmentSectionsCompleted = stages;
      progressMeta.assignmentWorkflowProgress = calculateAssignmentWorkflowProgress(stages);
      progress = Math.max(progress, progressMeta.assignmentWorkflowProgress);
    }

    if (updates.submissionValidated || stages.includes("submission")) {
      progress = 100;
      status = "completed";
      completedAt = now;
    }
  }

  if (typeof updates.manualProgress === "number") {
    progress = clamp(updates.manualProgress);
    progressMeta.manuallyAdjusted = true;
    if (progress > 0) markStarted();
  }

  if (typeof updates.manualDelta === "number") {
    progress = clamp(progress + updates.manualDelta);
    progressMeta.manuallyAdjusted = true;
    if (progress > 0) markStarted();
  }

  if (updates.markCompleted) {
    progress = 100;
    status = "completed";
    completedAt = now;
    markStarted();
  }

  if (updates.status) {
    status = updates.status;
  }

  progress = clamp(progress);
  status = ensureStatus(progress, status);

  if (status === "completed") {
    progress = 100;
    completedAt = completedAt ?? now;
    startedAt = startedAt ?? now;
  } else if (progress === 0) {
    completedAt = undefined;
    if (status === "not_started") {
      startedAt = undefined;
    }
  }

  return {
    progress,
    status,
    startedAt,
    completedAt,
    lastActivityAt: now,
    progressMeta,
  };
}

export function updateTaskProgress(task: Task, updates: TaskProgressUpdateInput = {}): TaskProgressResult {
  return calculateTaskProgress(task, updates);
}

export function completeTask(task: Task): TaskProgressResult {
  return calculateTaskProgress(task, { markCompleted: true });
}

export function resetTaskProgress(task: Task): TaskProgressResult {
  return calculateTaskProgress(task, { reset: true });
}
