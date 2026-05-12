// /components/assignment/WorkspaceStages.tsx
import { Stage } from "./types";
import {
  BookOpen,
  GitBranch,
  Search,
  FileText,
  CheckSquare,
  Zap,
  Star,
} from "lucide-react";

const stageIcons: Record<Stage, React.ReactNode> = {
  overview: <BookOpen size={16} />,
  plan: <GitBranch size={16} />,
  research: <Search size={16} />,
  execution: <FileText size={16} />,
  checkpoints: <CheckSquare size={16} />,
  quality: <Zap size={16} />,
  validation: <Star size={16} />,
};

const stageLabels: Record<Stage, string> = {
  overview: "Overview",
  plan: "Plan",
  research: "Research",
  execution: "Execution",
  checkpoints: "Checkpoints",
  quality: "Quality",
  validation: "Validation",
};

interface WorkspaceStagesProps {
  currentStage: Stage;
  onStageChange: (stage: Stage) => void;
}

export function WorkspaceStages({ currentStage, onStageChange }: WorkspaceStagesProps) {
  const stages = Object.keys(stageLabels) as Stage[];

  return (
    <div className="flex flex-wrap gap-2 border-b border-border pb-3">
      {stages.map(stage => (
        <button
          key={stage}
          onClick={() => onStageChange(stage)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            currentStage === stage
              ? "bg-accent text-white shadow-md"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
          }`}
        >
          {stageIcons[stage]}
          {stageLabels[stage]}
        </button>
      ))}
    </div>
  );
}