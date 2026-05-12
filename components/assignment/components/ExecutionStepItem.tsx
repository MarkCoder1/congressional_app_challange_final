// /components/assignment/components/ExecutionStepItem.tsx
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { ExecutionStep } from "../types";

interface ExecutionStepItemProps {
  step: ExecutionStep;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ExecutionStepItem({ step, onToggle, onDelete }: ExecutionStepItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 border border-border">
      <button onClick={() => onToggle(step.id)} className="flex-shrink-0">
        {step.completed ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      <span className={`flex-1 text-sm ${step.completed ? "line-through text-muted-foreground" : ""}`}>
        {step.title}
      </span>
      <button onClick={() => onDelete(step.id)} className="text-muted-foreground hover:text-red-500">
        <Trash2 size={16} />
      </button>
    </div>
  );
}