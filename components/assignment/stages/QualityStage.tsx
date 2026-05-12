// /components/assignment/stages/QualityStage.tsx
import { ChevronLeft, Loader2, Zap, Sparkles } from "lucide-react";
import { ValidationResult } from "../types";

interface QualityStageProps {
  validatorInput: string;
  validatorResult: ValidationResult | null;
  validating: boolean;
  improvedText: string;
  onValidatorInputChange: (value: string) => void;
  onValidate: () => void;
  onImprove: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function QualityStage({
  validatorInput,
  validatorResult,
  validating,
  improvedText,
  onValidatorInputChange,
  onValidate,
  onImprove,
  onPrev,
  onNext,
}: QualityStageProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">✨ Live Quality Validator</h2>
      <div className="bg-card rounded-xl p-5 border border-border">
        <textarea
          value={validatorInput}
          onChange={(e) => onValidatorInputChange(e.target.value)}
          rows={6}
          className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent"
          placeholder="Paste your written work here to get instant AI feedback..."
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onValidate}
            disabled={validating}
            className="btn-primary flex items-center gap-2"
          >
            {validating ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />} Validate
          </button>
          {validatorResult && (
            <button onClick={onImprove} className="btn-secondary flex items-center gap-2">
              <Sparkles size={16} /> Improve it
            </button>
          )}
        </div>
        {validatorResult && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Quality score</span>
              <span className="text-2xl font-bold text-accent">{validatorResult.score}%</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${validatorResult.score}%` }} />
            </div>
            <div className="bg-secondary/20 rounded-lg p-4">
              <h3 className="font-medium mb-2">3 key improvements</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validatorResult.feedback.map((fb, i) => (
                  <li key={i}>{fb}</li>
                ))}
              </ul>
            </div>
            {improvedText && (
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200">
                <h3 className="font-medium mb-2">✨ Suggested rewrite</h3>
                <p className="text-sm">{improvedText}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-between gap-3">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-1">
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2">
          Final Validation →
        </button>
      </div>
    </div>
  );
}