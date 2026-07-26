// /components/task-workspace/types.ts
export type LearningStage = "Learn" | "Practice" | "Master" | "Assignment";

export interface StageStatus {
  stage: LearningStage;
  completed: boolean;
  current: boolean;
  locked: boolean;
}

export interface LessonProgressState {
  learnCompleted: boolean;
  practiceCompleted: boolean;
  masterCompleted: boolean;
  practiceScore?: number;
  masterScore?: number;
  progress: number;
}

export interface NextAction {
  label: string;
  action: string;
  targetTab: LearningStage;
}