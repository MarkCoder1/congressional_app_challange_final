// /components/assignment/types.ts
export type Stage =
  | "overview"
  | "plan"
  | "research"
  | "execution"
  | "checkpoints"
  | "quality"
  | "validation";

export interface ResearchItem {
  id: string;
  type: "link" | "note" | "text";
  content: string;
  tags: string[];
  aiSummary?: string;
}

export interface ExecutionStep {
  id: string;
  title: string;
  completed: boolean;
  estimatedTime?: number;
}

export interface ValidationResult {
  score: number;
  feedback: string[];
}

export interface ExternalTool {
  type: "canva" | "google-docs" | "figma" | "other";
  url: string;
}

export interface AssignmentContent {
  goal: string;
  understanding: {
    summary: string;
    successCriteria: string[];
  };
  plan: {
    steps: Array<{
      id: string;
      title: string;
      description: string;
    }>;
  };
  checkpoints: Array<{
    id: string;
    question: string;
    expectedAnswerHint?: string;
  }>;
  validation: {
    checklist: string[];
    rubric: {
      clarity: number;
      completeness: number;
      structure: number;
    };
  };
  submission?: {
    text?: string;
    links?: string[];
  };
}   