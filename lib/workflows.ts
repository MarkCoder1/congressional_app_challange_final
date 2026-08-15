import {
  BookOpen,
  PenLine,
  Target,
  ScrollText,
  Search,
  ClipboardList,
  FileEdit,
  CheckSquare,
  Sparkles,
  Shield,
  Cog,
  Rocket,
  Eye,
  FileQuestion,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface WorkflowStage {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const TASK_WORKFLOWS: Record<string, WorkflowStage[]> = {
  lesson: [
    { key: "learn", label: "Learn", description: "Explore core concepts and key ideas", icon: BookOpen, color: "bg-mode-learn" },
    { key: "practice", label: "Practice", description: "Apply what you've learned with exercises", icon: PenLine, color: "bg-mode-practice" },
    { key: "master", label: "Master", description: "Prove your understanding with challenges", icon: Target, color: "bg-mode-master" },
  ],
  assignment: [
    { key: "overview", label: "Overview", description: "Get a clear picture of what's expected", icon: ScrollText, color: "bg-mode-assignment" },
    { key: "research", label: "Research", description: "Gather information and explore resources", icon: Search, color: "bg-mode-assignment" },
    { key: "plan", label: "Plan", description: "Structure your approach and outline steps", icon: ClipboardList, color: "bg-mode-assignment" },
    { key: "execution", label: "Execution", description: "Write, build, or create your deliverable", icon: FileEdit, color: "bg-mode-assignment" },
    { key: "checkpoints", label: "Checkpoints", description: "Verify progress with self-checks", icon: CheckSquare, color: "bg-mode-assignment" },
    { key: "quality", label: "Quality Review", description: "Refine and polish your work", icon: Sparkles, color: "bg-mode-assignment" },
    { key: "validation", label: "Validation", description: "Confirm everything meets the criteria", icon: Shield, color: "bg-mode-assignment" },
  ],
  project: [
    { key: "plan", label: "Plan", description: "Define goals and break into milestones", icon: ClipboardList, color: "bg-mode-assignment" },
    { key: "research", label: "Research", description: "Explore tools, examples, and resources", icon: Search, color: "bg-mode-assignment" },
    { key: "build", label: "Build", description: "Create and iterate on your project", icon: Cog, color: "bg-mode-assignment" },
    { key: "review", label: "Review", description: "Test and refine your work", icon: Eye, color: "bg-mode-assignment" },
    { key: "launch", label: "Launch", description: "Share and present your finished project", icon: Rocket, color: "bg-mode-assignment" },
  ],
  exam: [
    { key: "review", label: "Review Topics", description: "Refresh key concepts and material", icon: BookOpen, color: "bg-mode-learn" },
    { key: "practice", label: "Practice Questions", description: "Test your understanding with sample questions", icon: PenLine, color: "bg-mode-practice" },
    { key: "mock", label: "Mock Test", description: "Simulate the exam environment", icon: FileQuestion, color: "bg-mode-practice" },
    { key: "analyze", label: "Analyze Results", description: "Identify weak areas and improve", icon: BarChart3, color: "bg-mode-master" },
  ],
};
