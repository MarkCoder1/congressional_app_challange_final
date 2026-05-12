"use client";

import { useState, useEffect } from "react";
import { Bot, TrendingUp, Target, Lightbulb } from "lucide-react";

interface AIFeedbackProps {
  mode: "practice" | "master";
  subject: string;
  score: number;
  answers: Array<{
    questionId: string;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    category: string;
  }>;
  weakAreas: string[];
}

export function AIFeedback({ mode, subject, score, answers, weakAreas }: AIFeedbackProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    generateFeedback();
  }, []);

  const generateFeedback = async () => {
    try {
      const response = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          subject,
          score,
          answers,
          weakAreas,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to get feedback");
      
      const data = await response.json();
      setInsights(data.insights || getDefaultInsights());
      setError(false);
    } catch (err) {
      console.error("Error generating feedback:", err);
      setInsights(getDefaultInsights());
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultInsights = (): string[] => {
    if (score < 60) {
      return [
        `Review ${subject} basics`,
        "Practice fundamental problems",
        "Read explanations carefully"
      ];
    } else if (score < 80) {
      return [
        `Practice ${subject} problem sets`,
        "Focus on weak areas identified",
        "Review incorrect answers"
      ];
    } else {
      return [
        `Master ${subject} advanced topics`,
        "Try challenging variations",
        "Help others learn these concepts"
      ];
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-5 h-5 text-blue-600 animate-pulse" />
          <h3 className="font-semibold text-blue-900">Analyzing performance...</h3>
        </div>
        <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  const insightIcons = [TrendingUp, Target, Lightbulb];
  const insightColors = ["text-blue-600", "text-orange-600", "text-green-600"];
  const insightBgColors = ["bg-blue-50", "bg-orange-50", "bg-green-50"];
  const insightBorderColors = ["border-blue-200", "border-orange-200", "border-green-200"];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-sm text-gray-700">AI Insights</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {insights.map((insight, index) => {
          const Icon = insightIcons[index % insightIcons.length];
          const color = insightColors[index % insightColors.length];
          const bgColor = insightBgColors[index % insightBgColors.length];
          const borderColor = insightBorderColors[index % insightBorderColors.length];
          
          return (
            <div
              key={index}
              className={`${bgColor} rounded-lg p-3 border ${borderColor}`}
            >
              <div className="flex items-start gap-2">
                <Icon className={`w-4 h-4 ${color} flex-shrink-0 mt-0.5`} />
                <p className="text-xs text-gray-700 leading-relaxed">{insight}</p>
              </div>
            </div>
          );
        })}
      </div>
      {error && (
        <p className="text-xs text-gray-500 text-center">Using default insights</p>
      )}
    </div>
  );
}