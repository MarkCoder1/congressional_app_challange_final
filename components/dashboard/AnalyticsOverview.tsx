"use client";

import { Trophy, Timer, Gauge, Flame } from "lucide-react";
import { motion } from "framer-motion";
import type { AnalyticsState } from "@/features/planner/types";

interface AnalyticsOverviewProps {
  analytics: AnalyticsState;
}

export function AnalyticsOverview({ analytics }: AnalyticsOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <StatCard
        icon={<Trophy size={20} className="text-yellow-600" />}
        label="Completed"
        value={analytics.completionRate?.value != null ? `${Math.round(analytics.completionRate.value)}%` : "0%"}
      />
      <StatCard
        icon={<Timer size={20} className="text-blue-600" />}
        label="Study Hours"
        value={analytics.studyHours?.value != null ? `${analytics.studyHours.value.toFixed(1)}h` : "0h"}
      />
      <StatCard
        icon={<Gauge size={20} className="text-green-600" />}
        label="Avg Mastery"
        value={analytics.masteryPerformance?.value != null ? `${Math.round(analytics.masteryPerformance.value)}%` : "N/A"}
      />
      <StatCard
        icon={<Flame size={20} className="text-orange-600" />}
        label="Streak"
        value={`${analytics.streak?.current ?? 0} days`}
      />
    </motion.div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}