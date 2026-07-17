// /components/planner/components/MissionCard.tsx
"use client";

import { TodayMission } from "@/types/planner";
import { Target, Clock, TrendingUp, Play } from "lucide-react";
import { motion } from "framer-motion";

// /components/planner/components/MissionCard.tsx
interface MissionCardProps {
  mission: TodayMission & { urgentCount?: number; overdueCount?: number };
}

export function MissionCard({ mission }: MissionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-accent/5 via-accent/10 to-primary/5 rounded-2xl border border-accent/20 p-6 shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target size={18} className="text-accent" />
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Today's Mission
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{mission.goal}</h2>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={14} /> {mission.estimatedMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Target size={14} /> {mission.sessions} sessions
            </span>
            <span className="flex items-center gap-1 text-accent">
              <TrendingUp size={14} /> Productivity {mission.productivityScore}%
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              Confidence {mission.confidenceScore}%
            </span>
          </div>
        </div>
        <button
          className="px-6 py-3 bg-accent text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium whitespace-nowrap disabled:opacity-50"
          disabled
        >
          <Play size={18} /> Start Focus Session
        </button>
      </div>
    </motion.div>
  );
}