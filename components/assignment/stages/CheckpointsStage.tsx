// /components/assignment/stages/CheckpointsStage.tsx
import { ChevronLeft } from "lucide-react";
import { AssignmentContent } from "../types";

interface CheckpointsStageProps {
  assignment: AssignmentContent;
  answers: Record<string, string>;
  onAnswerChange: (id: string, value: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function CheckpointsStage({ assignment, answers, onAnswerChange, onPrev, onNext }: CheckpointsStageProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">✅ Self‑Checkpoints</h2>
      <div className="space-y-4">
        {assignment.checkpoints.map(cp => (
          <div key={cp.id} className="bg-card rounded-xl p-5 border border-border">
            <p className="font-medium mb-2">{cp.question}</p>
            {cp.expectedAnswerHint && (
              <p className="text-sm text-muted-foreground mb-3">💡 Hint: {cp.expectedAnswerHint}</p>
            )}
            <textarea
              value={answers[cp.id] || ""}
              onChange={(e) => onAnswerChange(cp.id, e.target.value)}
              rows={2}
              className="w-full p-2 rounded-md border border-border bg-background focus:ring-1 focus:ring-accent"
              placeholder="Your answer..."
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-3">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-1">
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2">
          Validate & Improve →
        </button>
      </div>
    </div>
  );
}