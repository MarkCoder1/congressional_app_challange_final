// /components/assignment/stages/PlanStage.tsx
import { CheckCircle2, Circle, ChevronLeft } from "lucide-react";
import { AssignmentContent } from "../types";

interface PlanStageProps {
  assignment: AssignmentContent;
  completedSteps: Record<string, boolean>;
  onToggleStep: (stepId: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function PlanStage({ assignment, completedSteps, onToggleStep, onPrev, onNext }: PlanStageProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">✍️ Plan</h2>
      <div className="space-y-3">
        {assignment.plan.steps.map(step => (
          <div
            key={step.id}
            className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-accent/30 transition"
          >
            <button onClick={() => onToggleStep(step.id)} className="flex-shrink-0 mt-0.5">
              {completedSteps[step.id] ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            <div className="flex-1">
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-3">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-1">
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2">
          Continue to Research →
        </button>
      </div>
    </div>
  );
}