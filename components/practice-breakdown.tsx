"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb, AlertCircle, Zap } from "lucide-react";

interface PracticeBreakdownStepType {
  number: number;
  title: string;
  explanation: string;
  example?: string;
  keyPoint?: string;
  commonMistake?: string;
}

interface PracticeBreakdownProps {
  question: string;
  steps: PracticeBreakdownStepType[];
  fullExplanation: string;
  answer: string;
  enableDeepMode?: boolean;
}

export function PracticeBreakdown({
  question,
  steps,
  fullExplanation,
  answer,
  enableDeepMode = false,
}: PracticeBreakdownProps) {
  const [expandedSteps, setExpandedSteps] = useState<number[]>(
    enableDeepMode ? steps.map((s) => s.number) : []
  );
  const [deepModeEnabled, setDeepModeEnabled] = useState(enableDeepMode);

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) =>
      prev.includes(stepNumber)
        ? prev.filter((n) => n !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  const toggleDeepMode = () => {
    setDeepModeEnabled(!deepModeEnabled);
    if (!deepModeEnabled) {
      // Open all steps when enabling deep mode
      setExpandedSteps(steps.map((s) => s.number));
    } else {
      // Close all steps when disabling
      setExpandedSteps([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Deep Mode Toggle */}
      <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
        <button
          onClick={toggleDeepMode}
          className={`flex-1 text-left px-4 py-2 rounded-lg font-medium transition-all ${
            deepModeEnabled
              ? "bg-accent text-white"
              : "bg-secondary hover:bg-secondary/80"
          }`}
        >
          <Zap className="inline mr-2" size={18} />
          {deepModeEnabled ? "Deep Explanation Active" : "Enable Deep Explanation"}
        </button>
      </div>

      {/* Question Display */}
      <div className="bg-secondary/30 rounded-lg p-6 border border-border">
        <p className="text-sm text-muted-foreground mb-2">Question:</p>
        <p className="font-mono text-lg font-semibold text-foreground">
          {question}
        </p>
      </div>

      {/* Step-by-Step Breakdown */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Step-by-Step Solution</h3>
        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.number}
              className="border border-border rounded-lg overflow-hidden bg-card"
            >
              {/* Step Header */}
              <button
                onClick={() => toggleStep(step.number)}
                className="w-full px-6 py-4 text-left font-medium hover:bg-secondary/30 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </div>
                  <span className="text-foreground">{step.title}</span>
                </div>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${
                    expandedSteps.includes(step.number) ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Step Content */}
              {(expandedSteps.includes(step.number) || deepModeEnabled) && (
                <div className="px-6 py-4 border-t border-border bg-secondary/10 space-y-4">
                  {/* Explanation */}
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">
                      Explanation:
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {step.explanation}
                    </p>
                  </div>

                  {/* Key Point */}
                  {step.keyPoint && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
                      <Lightbulb size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-900 mb-1">
                          Key Point
                        </p>
                        <p className="text-sm text-blue-800">{step.keyPoint}</p>
                      </div>
                    </div>
                  )}

                  {/* Example */}
                  {step.example && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-900 mb-2">
                        Example:
                      </p>
                      <p className="text-sm text-green-800 font-mono">
                        {step.example}
                      </p>
                    </div>
                  )}

                  {/* Common Mistake */}
                  {step.commonMistake && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex gap-3">
                      <AlertCircle size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-orange-900 mb-1">
                          Common Mistake
                        </p>
                        <p className="text-sm text-orange-800">
                          {step.commonMistake}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full Breakdown Panel */}
      {deepModeEnabled && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h4 className="font-semibold text-purple-900 mb-3">Complete Breakdown</h4>
          <p className="text-sm text-purple-800 leading-relaxed mb-4">
            {fullExplanation}
          </p>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Final Answer:
            </p>
            <p className="text-lg font-bold text-accent">{answer}</p>
          </div>
        </div>
      )}

      {/* Summary */}
      {!deepModeEnabled && (
        <div className="bg-secondary/50 rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Answer:</span> {answer}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            💡 Tip: Enable "Deep Explanation" to see all steps automatically
          </p>
        </div>
      )}
    </div>
  );
}
