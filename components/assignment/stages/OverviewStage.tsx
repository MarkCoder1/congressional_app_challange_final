// /components/assignment/stages/OverviewStage.tsx
import { CheckCircle2 } from "lucide-react";
import { AssignmentContent } from "../types";

interface OverviewStageProps {
  assignment: AssignmentContent;
  onNext: () => void;
}

export function OverviewStage({ assignment, onNext }: OverviewStageProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border border-border">
        <h3 className="text-xl font-bold mb-2">🎯 Goal</h3>
        <p className="text-foreground/80">{assignment.goal}</p>
      </div>
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold mb-3">📖 Summary</h3>
        <p className="text-muted-foreground mb-4">{assignment.understanding.summary}</p>
        <h4 className="font-medium mb-2">✅ Success Criteria</h4>
        <ul className="space-y-2">
          {assignment.understanding.successCriteria.map((c, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <span className="text-sm">{c}</span>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={onNext} className="btn-primary w-full flex items-center justify-center gap-2">
        Start Plan →
      </button>
    </div>
  );
}