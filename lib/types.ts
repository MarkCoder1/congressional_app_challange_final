import type { PresetType } from "./learningMapPresets";

// Unified types for the learning platform

/**
 * AI-READY LEARNING PRESET SYSTEM
 *
 * This module integrates with learningMapPresets.ts for a scalable,
 * preset-based visual learning system ready for AI content injection.
 */

// Re-export preset types for convenience
export type {
  PresetType,
  LearningPreset,
  PresetOption,
  TimelinePreset,
  TimelineEvent,
  NodeMapPreset,
  NodeMapNode,
  GraphPreset,
  GraphDataPoint,
  TablePreset,
  TableColumn,
  TableRow,
  FlowPreset,
  FlowStep,
  CardsPreset,
  Card,
  DiagramPreset,
  DiagramElement,
  ProcessPreset,
  ProcessStage,
  ListPreset,
  ListItem,
  ComparisonPreset,
  ComparisonItem,
} from "./learningMapPresets";

export type Subject =
  | "Math"
  | "History"
  | "Science"
  | "Physics"
  | "Programming"
  | "Biology"
  | "Spanish"
  | "English"
  | "Literature"
  | "Geography"
  | "Chemistry"
  | "Economics";
export type TaskType = "concept" | "lesson" | "assignment" | "mixed";
export type PriorityLevel = "low" | "medium" | "high";

export interface Task {
  id: string;
  type?: TaskType;
  title: string;
  subject: Subject;
  taskType: TaskType;
  deadline: string;
  priority: PriorityLevel;
  description?: string;
  progress: number;
  createdAt: string;
  learningMapPreset?: string;
  learningMap?: LearningMapPreset;
  learningMaps?: TaskLearningMap[]; // AI-ready: array of preset selections
  learningContent?: LearningContent;
  practice?: PracticeQuestion[];
  master?: MasterQuestion[];
  assignments?: Assignment[];
  sources?: LearningSource[];
}

/**
 * Task Learning Map Instance
 * Defines which preset to render and what data to inject
 * Ready for AI content injection
 */
export interface TaskLearningMap {
  presetId: string;
  subject: Subject;
  type?: PresetType;
  data?: unknown;
  // Future AI will fill this in - for now, uses mock data
  // Future: content?: AIGeneratedContent;
}

export interface LearningContent {
  overview: string;
  keyPoints: string[];
  example: string;
  steps: string[];
  proTip?: string; // AI-generated pro tip
}

export interface Assignment {
  id: string;
  title: string;
  subject?: Subject;
  deadline?: string;
  questions: Question[];
  resources?: string[];
  notes?: string;
  enableBreakdown: boolean;
}

export interface Question {
  id: string;
  text: string;
  hint?: string;
  correctAnswer?: string;
  category?: string;
  explanation?: string;
  userAnswer?: string;
  isCorrect?: boolean;
  breakdownSteps?: PracticeBreakdownStep[];
}

// Practice & Master Mode types
export interface PracticeQuestion extends Question {
  explanation: string;
  breakdownSteps?: PracticeBreakdownStep[];
}

export interface MasterQuestion extends Question {
  explanation: string;
}

export interface TimelineSession {
  id: string;
  title: string;
  subject: Subject;
  type: "Learn" | "Practice" | "Review" | "Assignment";
  start: string; // HH:MM format
  duration: number; // minutes
  taskType: TaskType;
  day?: string; // "Monday", "Tuesday", etc.
}

export interface PracticeBreakdownStep {
  number: number;
  title: string;
  explanation: string;
  example?: string;
  keyPoint?: string;
  commonMistake?: string;
}

export interface LearningMapNode {
  id: string;
  title: string;
  label?: string;
  icon: string;
  description: string;
  content: string;
  color: string;
  example?: string;
  visualization?: string;
}

export interface LearningMapPreset {
  subject: Subject;
  nodes: LearningMapNode[];
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface LearningSource {
  type: "text" | "link" | "file";
  content: string;
  label?: string;
}
