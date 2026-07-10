// /components/planner/components/AICoach.tsx
"use client";

import { AIInsight } from "@/types/planner";
import { Lightbulb, AlertTriangle, CheckCircle, MessageCircle } from "lucide-react";

interface AICoachProps {
  coach: AIInsight;
}

export function AICoach({ coach }: AICoachProps) {
  const items = [
    { icon: Lightbulb, text: coach.focusSuggestion, color: "text-accent" },
    { icon: AlertTriangle, text: coach.biggestRisk, color: "text-amber-500" },
    { icon: CheckCircle, text: coach.encouragement, color: "text-green-500" },
    ...coach.warnings.map((w) => ({ icon: AlertTriangle, text: w, color: "text-amber-500" })),
    ...coach.recommendations.map((r) => ({ icon: MessageCircle, text: r, color: "text-blue-500" })),
    { icon: Lightbulb, text: coach.studyTip, color: "text-accent" },
    { icon: CheckCircle, text: coach.motivation, color: "text-green-500" },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
        <Lightbulb size={16} className="text-accent" />
        AI Coach
      </h3>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <item.icon size={14} className={`mt-0.5 flex-shrink-0 ${item.color}`} />
            <p className="text-xs text-foreground/80 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}