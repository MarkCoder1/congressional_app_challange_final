"use client";

import { BarChart3, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { motion } from "framer-motion";
import type { SubjectInsight } from "@/features/planner/types";

interface SubjectPerformanceProps {
  insights: SubjectInsight[];
}

export function SubjectPerformance({ insights }: SubjectPerformanceProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart3 size={20} className="text-accent" />
        Subject Performance
      </h3>

      {insights.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
          <p>Start learning to generate your profile</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, idx) => (
            <motion.div
              key={insight.subject}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-secondary/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{insight.subject}</h4>
                {getTrendIcon(insight.trend)}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mastery</span>
                  <span className="font-medium">{formatPercent(insight.averageMastery)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-medium">{formatPercent(insight.averageConfidence)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Study</span>
                  <span className="font-medium">{formatMinutes(insight.averageStudyMinutes)}</span>
                </div>
                {insight.weakTopics.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Weak Topics</p>
                    <div className="flex flex-wrap gap-1">
                      {insight.weakTopics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-lg"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function getTrendIcon(trend: string | null) {
  if (trend === "improving") return <TrendingUp className="text-green-600" size={18} />;
  if (trend === "declining") return <TrendingDown className="text-red-600" size={18} />;
  if (trend === "stable") return <Minus className="text-gray-500" size={18} />;
  return <Activity className="text-gray-400" size={18} />;
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return `${Math.round(value)}%`;
}

function formatMinutes(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return "N/A";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}