// /types/task.ts
import { VisualData } from "./visuals";
import { Question, QuestionAnswer } from "./question";

export type TaskType = "lesson" | "assignment" | "project" | "exam";
export type TaskStatus = "not_started" | "in_progress" | "completed";
export type TaskDifficulty = "easy" | "medium" | "hard";
export type LessonProgressEvent =
  | "learn_entered"
  | "learn_viewed"
  | "practice_completed"
  | "master_completed"
  | "master_failed";
export type AssignmentWorkflowStage =
  | "overview"
  | "planning"
  | "research"
  | "execution"
  | "checkpoints"
  | "quality"
  | "validation"
  | "submission";

export interface TaskProgressMeta {
  learnCompleted?: boolean;
  practiceCompleted?: boolean;
  masterCompleted?: boolean;
  assignmentWorkflowProgress?: number;
  assignmentSectionsCompleted?: AssignmentWorkflowStage[];
  manuallyAdjusted?: boolean;
}

// ========== ASSIGNMENT CONTENT ==========
// /types/task.ts – add to AssignmentContent

export interface AssignmentContent {
  goal: string;
  understanding: {
    summary: string;
    successCriteria: string[];
  };
  plan: {
    steps: {
      id: string;
      title: string;
      description: string;
    }[];
  };
  researchGuide: {
    whatToSearch: string[];
    suggestedSources: string[];
    keywords: string[];
  };
  execution: {
    structure: string[];
  };
  checkpoints: {
    id: string;
    question: string;
    expectedAnswerHint?: string;
  }[];
  validation: {
    checklist: string[];
    rubric: {
      clarity: number;
      completeness: number;
      structure: number;
    };
  };

  // ----- NEW MULTI-SOURCE SUBMISSION -----
  submission?: {
    text?: string;
    links?: string[];
    files?: {
      name: string;
      type: "pdf" | "image" | "doc" | "other";
      url: string;
    }[];
    externalTools?: {
      type: "canva" | "google-docs" | "figma" | "other";
      url: string;
    }[];
  };
}

// ========== LESSON CONTENT ==========
export interface LearningContent {
  overview: string;
  keyPoints: string[];
  example: string;
  steps: string[];
  proTip?: string;
}

export interface ProjectContent {
  stages: {
    key: string;
    label: string;
    description: string;
  }[];
}

// ========== EXAM CONTENT ==========
// Phase 1 foundation for the Exam Preparation flow.
export type ExamTopicStatus =
  | "not_assessed"
  | "needs_work"
  | "developing"
  | "strong"
  | "mastered";

export interface ExamTopic {
  id: string;
  name: string;
  // Phase 1: every topic starts as "not_assessed".
  // Future phases will update this based on diagnostic/mastery data.
  status?: ExamTopicStatus;
}

// ========== EXAM DIAGNOSTIC (Phase 2) ==========
// The Diagnostic is one consumer of the shared Question Type Engine: it asks the
// AI for a topic-covering set of multiple-choice / true-false questions and the
// frontend renders them with <QuestionRenderer /> + evaluateQuestion(). All
// question shape/type definitions live in ./question.ts.

export type TopicMasteryLevel =
  | "Mastered"
  | "Strong"
  | "Developing"
  | "Needs Review";

export type TrendDirection = "improving" | "stable" | "declining";
export type PriorityLevel = "high" | "medium" | "low";
export type NextActionType =
  | "review_concept"
  | "practice_weak"
  | "practice_mixed"
  | "reinforce_strong"
  | "retake_diagnostic"
  | "continue_learning"
  | "mastery_check";

export interface PerformanceRecord {
  id: string;
  topicId: string;
  topic: string;
  questionId: string;
  questionType: string;
  correct: boolean;
  score: number; // 0-100
  timestamp: string; // ISO
  masteryBefore: number;
  masteryAfter: number;
  difficulty?: string;
}

export interface AdaptiveTopicState {
  topicId: string;
  topic: string;
  attempts: number;
  correct: number;
  accuracy: number; // 0-100
  masteryScore: number; // 0-100 deterministic
  masteryLevel: TopicMasteryLevel;
  recentScores: number[]; // last up to 5, each 0 or 100 (or partial)
  trend: TrendDirection;
  priority: PriorityLevel;
  priorityScore: number; // 0-100 internal ranking score
  reason: string;
  recommendedAction: string;
  nextAction: NextActionType;
  lastAttemptAt?: string;
  consecutiveMistakes: number;
  explanation: string;
}

export interface AdaptiveState {
  topics: Record<string, AdaptiveTopicState>;
  history: PerformanceRecord[];
  updatedAt: string;
  // lightweight difficulty hint per topic
  difficultyByTopic?: Record<string, "easy" | "medium" | "hard">;
}

export interface DiagnosticTopicPerformance {
  topicId: string;
  topic: string;
  attempted: number;
  correct: number;
  accuracy: number; // 0-100
  mastery: TopicMasteryLevel;
  explanation: string;
  recommendedAction: string;
}

export interface DiagnosticResult {
  overallScore: number; // 0-100
  correctCount: number;
  totalQuestions: number;
  topicPerformance: DiagnosticTopicPerformance[];
  recommendedFocus: string; // name of the weakest topic
  completedAt: string;
}

export interface ExamDiagnostic {
  // "in_progress" after questions are generated but not submitted,
  // "completed" once a scored attempt is final.
  status: "in_progress" | "completed";
  questions: Question[];
  answers: Record<string, QuestionAnswer>;
  result?: DiagnosticResult;
  generatedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export type StudySessionType = "learn" | "practice" | "review";
export type StudySessionStatus = "planned" | "completed" | "missed" | "skipped";

export interface StudySession {
  id: string;
  topicId: string;
  topicName: string;
  date: string; // YYYY-MM-DD
  type: StudySessionType;
  durationMinutes: number;
  priority: number; // 0-100
  reason: string;
  status: StudySessionStatus;
  source: "adaptive" | "spaced-review" | "exam-deadline" | "manual";
  createdAt: string;
}

export interface SpacedReviewState {
  topicId: string;
  lastReviewedAt?: string; // ISO
  nextReviewAt?: string; // YYYY-MM-DD
  intervalDays: number;
  reviewCount: number;
  retentionScore: number; // 0-100
}

export interface StudyPlan {
  sessions: StudySession[];
  reviews: SpacedReviewState[];
  generatedAt: string; // ISO
  planVersion: number;
}

export interface MockTestResult {
  overallScore: number;
  correctCount: number;
  totalQuestions: number;
  topicPerformance: DiagnosticTopicPerformance[];
  strengths: string[];
  weaknesses: string[];
  completedAt: string;
}

export interface MockTestAttempt {
  id: string;
  status: "in_progress" | "completed";
  questions: Question[];
  answers: Record<string, QuestionAnswer>;
  result?: MockTestResult;
  createdAt: string;
  completedAt?: string;
}

export interface ExamContent {
  examDate?: string;
  topics: ExamTopic[];
  // Future phases will drive this from diagnostic completion, topic mastery,
  // practice, review, and mock exams. Phase 1 always reports 0.
  preparationProgress?: number;
  // Phase 2: diagnostic assessment + knowledge map data.
  diagnostic?: ExamDiagnostic;
  // Phase 5: adaptive learning state (deterministic, survives refresh).
  adaptive?: AdaptiveState;
  // Optional lightweight practice queue for adaptive selection
  adaptivePractice?: {
    lastTopicId?: string;
    lastQuestionId?: string;
  };
  // Phase 6: study plan + spaced review
  studyPlan?: StudyPlan;
  // Phase 6.5: mock test + results (real, persisted)
  mockTest?: MockTestAttempt;
  mockTestHistory?: MockTestAttempt[];
  // Phase 6.6: available daily study time (15-90, persisted)
  availableDailyMinutes?: number;
}

export interface LearningMap {
  presetId: string;
  type: "diagram" | "flow" | "timeline" | "graph";
  data: any;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface PracticeQuestion {
  id: string;
  text: string;
  options: QuestionOption[];
  correctAnswer: string;
  hint?: string;
  explanation: string;
  category: string;
}

export interface MasterQuestion {
  id: string;
  text: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
  category: string;
  hint: string;
}

// ========== MAIN TASK ==========
export interface Task {
  id: string;
  title: string;
  subject: string;
  description: string;
  type: TaskType;
  progress: number;
  status: TaskStatus;
  completedAt?: string;
  startedAt?: string;
  lastActivityAt?: string;
  progressMeta?: TaskProgressMeta;
  deadline?: string;

  // Lesson‑specific fields
  learningContent: LearningContent;
  learningMaps: LearningMap[];
  practice: PracticeQuestion[];
  master: MasterQuestion[];

  // Assignment‑specific field
  assignmentContent?: AssignmentContent;

  // Project-specific foundation for the future project workspace
  projectContent?: ProjectContent;

  // Exam Preparation foundation
  examContent?: ExamContent;

  resources: Record<string, any>;
  assignments: any[];
  visualData?: VisualData;

  // NEW: Deadline
  deadlineDate?: string; // Optional: "2026-06-15"
  deadlineTime?: string; // Optional: "23:59"

  // ── Phase 9.2.2: Task Intelligence Input ──
  difficulty?: TaskDifficulty;
  estimatedMinutes?: number;
}

export interface AnswerAnalysis {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  category: string;
}

export interface FeedbackResponse {
  feedback: string;
}
