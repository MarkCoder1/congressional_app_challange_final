// /types/task.ts
import { VisualData } from "./visuals";

export type TaskType = "lesson" | "assignment";
export type TaskStatus = "learning" | "practice" | "mastering" | "completed";

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
  deadline?: string;

  // Lesson‑specific fields
  learningContent: LearningContent;
  learningMaps: LearningMap[];
  practice: PracticeQuestion[];
  master: MasterQuestion[];

  // Assignment‑specific field
  assignmentContent?: AssignmentContent;

  resources: Record<string, any>;
  assignments: any[];
  visualData?: VisualData;
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

