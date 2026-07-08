"use client";

import { AIInsights } from "@/types/schedule";
import { Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";

interface AIInsightsCardProps {
  insights: AIInsights;
}

export function AIInsightsCard({ insights }: AIInsightsCardProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Lightbulb size={16} className="text-accent" />
        AI Insights
      </h3>

      <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
        <p className="text-xs text-muted-foreground">Focus Suggestion</p>
        <p className="text-sm font-medium text-foreground mt-1">{insights.focusSuggestion}</p>
      </div>

      {insights.warnings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1">
            <AlertTriangle size={14} className="text-amber-500" />
            Warnings
          </p>
          <ul className="space-y-1">
            {insights.warnings.map((warning, i) => (
              <li key={i} className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-1.5 border border-amber-200">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {insights.recommendations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1">
            <CheckCircle size={14} className="text-green-500" />
            Recommendations
          </p>
          <ul className="space-y-1">
            {insights.recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-muted-foreground bg-green-50 dark:bg-green-950/20 rounded-lg px-3 py-1.5 border border-green-200">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}