"use client";

import { Brain, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { motion } from "framer-motion";
import type { LearningProfile } from "@/features/planner/types";

interface LearningSnapshotProps {
  profile: LearningProfile;
}

export function LearningSnapshot({ profile }: LearningSnapshotProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Brain size={20} className="text-accent" />
        Learning Snapshot
      </h3>

      <div className="space-y-4">
        <MetricRow label="Average Mastery" value={formatPercent(profile.averageMastery)} />
        <MetricRow label="Average Confidence" value={formatPercent(profile.averageConfidence)} />
        <MetricRow label="Completion Rate" value={formatPercent(profile.completionRate)} />
        <MetricRow label="Avg Study Session" value={formatMinutes(profile.averageStudySessionMinutes)} />
        <MetricRow label="Favorite Study Type" value={profile.favoriteStudyType ? capitalize(profile.favoriteStudyType) : "N/A"} />
        <MetricRow label="Review Consistency" value={formatPercent(profile.reviewConsistency)} />
        <MetricRow
          label="Mastery Growth"
          value={
            profile.masteryGrowthRate !== null ? (
              <span className="flex items-center gap-1">
                {profile.masteryGrowthRate > 0 ? (
                  <TrendingUp size={16} className="text-green-600" />
                ) : profile.masteryGrowthRate < 0 ? (
                  <TrendingDown size={16} className="text-red-600" />
                ) : (
                  <Minus size={16} className="text-gray-500" />
                )}
                {profile.masteryGrowthRate > 0 ? "+" : ""}
                {profile.masteryGrowthRate}
              </span>
            ) : (
              "N/A"
            )
          }
        />
        <MetricRow label="Completed Tasks" value={`${profile.completedTasks} / ${profile.totalTasks}`} />
        <MetricRow label="Total Study Time" value={formatMinutes(profile.totalStudyMinutes)} />
      </div>
    </motion.div>
  );
}

function MetricRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
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

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}