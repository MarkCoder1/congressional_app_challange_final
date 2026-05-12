// /components/assignment/stages/ExecutionStage.tsx
import { ChevronLeft, Plus, Sparkles } from "lucide-react";
import { ExecutionStep } from "../types";
import { SubmissionSection } from "../components/SubmissionSection";
import { ExecutionStepItem } from "../components/ExecutionStepItem";

interface ExecutionStageProps {
  executionSteps: ExecutionStep[];
  newStepTitle: string;
  autoBuilding: boolean;
  onNewStepTitleChange: (value: string) => void;
  onAddStep: () => void;
  onAutoBuild: () => void;
  onToggleStep: (id: string) => void;
  onDeleteStep: (id: string) => void;
  // submission props
  finalOutput: string;
  onFinalOutputChange: (value: string) => void;
  links: string[];
  newLink: string;
  onNewLinkChange: (value: string) => void;
  onAddLink: () => void;
  onRemoveLink: (idx: number) => void;
  files: any[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (idx: number) => void;
  externalTools: Array<{ type: string; url: string }>;
  newToolType: string;
  newToolUrl: string;
  onNewToolTypeChange: (value: any) => void;
  onNewToolUrlChange: (value: string) => void;
  onAddTool: () => void;
  onRemoveTool: (idx: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function ExecutionStage({
  executionSteps,
  newStepTitle,
  autoBuilding,
  onNewStepTitleChange,
  onAddStep,
  onAutoBuild,
  onToggleStep,
  onDeleteStep,
  finalOutput,
  onFinalOutputChange,
  links,
  newLink,
  onNewLinkChange,
  onAddLink,
  onRemoveLink,
  files,
  onFileUpload,
  onRemoveFile,
  externalTools,
  newToolType,
  newToolUrl,
  onNewToolTypeChange,
  onNewToolUrlChange,
  onAddTool,
  onRemoveTool,
  onPrev,
  onNext,
}: ExecutionStageProps) {
  const completedCount = executionSteps.filter(s => s.completed).length;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">📝 Execution + Submission</h2>

      {/* Step Builder */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <h3 className="font-semibold mb-3">🗂️ Step‑by‑step plan (optional)</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newStepTitle}
            onChange={(e) => onNewStepTitleChange(e.target.value)}
            placeholder="Add a custom step"
            className="flex-1 p-2 rounded-md border border-border bg-background"
          />
          <button onClick={onAddStep} className="btn-secondary px-3 py-1 flex items-center gap-1">
            <Plus size={16} /> Add
          </button>
        </div>
        <button
          onClick={onAutoBuild}
          disabled={autoBuilding}
          className="mb-4 text-sm text-accent hover:underline flex items-center gap-1"
        >
          <Sparkles size={14} /> {autoBuilding ? "Building..." : "Auto‑build plan from assignment"}
        </button>
        {executionSteps.length > 0 && (
          <div className="space-y-2">
            {executionSteps.map(step => (
              <ExecutionStepItem
                key={step.id}
                step={step}
                onToggle={onToggleStep}
                onDelete={onDeleteStep}
              />
            ))}
            <div className="mt-2 text-right text-xs text-muted-foreground">
              {completedCount} / {executionSteps.length} completed
            </div>
          </div>
        )}
      </div>

      {/* Submission UI */}
      <SubmissionSection
        finalOutput={finalOutput}
        onFinalOutputChange={onFinalOutputChange}
        links={links}
        newLink={newLink}
        onNewLinkChange={onNewLinkChange}
        onAddLink={onAddLink}
        onRemoveLink={onRemoveLink}
        files={files}
        onFileUpload={onFileUpload}
        onRemoveFile={onRemoveFile}
        externalTools={externalTools}
        newToolType={newToolType}
        newToolUrl={newToolUrl}
        onNewToolTypeChange={onNewToolTypeChange}
        onNewToolUrlChange={onNewToolUrlChange}
        onAddTool={onAddTool}
        onRemoveTool={onRemoveTool}
      />

      <div className="flex justify-between gap-3 mt-6">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-1">
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2">
          Go to Checkpoints →
        </button>
      </div>
    </div>
  );
}