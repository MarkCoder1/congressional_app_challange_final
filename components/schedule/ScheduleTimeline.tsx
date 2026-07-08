"use client";

import { useState } from "react";
import { AIScheduleResponse } from "@/types/schedule";
import { DailySchedule } from "./DailySchedule";
import { WeeklySchedule } from "./WeeklySchedule";
import { AgendaView } from "./AgendaView";
import { AIInsightsCard } from "./AIInsightsCard";
import { LayoutList, CalendarDays, Clock, AlertTriangle } from "lucide-react";

type ViewMode = "daily" | "weekly" | "agenda";

interface ScheduleTimelineProps {
  schedule: AIScheduleResponse;
  onComplete?: (id: string) => void;
  onSkip?: (id: string) => void;
}

export function ScheduleTimeline({ schedule, onComplete, onSkip }: ScheduleTimelineProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("daily");

  // Flatten all sessions for agenda view
  const allSessions = [
    ...schedule.dailyPlan.sessions,
    ...schedule.weeklyPlan.flatMap(day => day.sessions),
  ];

  return (
    <div className="space-y-6">
      {/* Fallback warning banner */}
      {schedule.source === "fallback" && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              Fallback Schedule Mode
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
              The AI scheduler is currently unavailable. This schedule was generated using the rule-based fallback engine. It may not be as intelligent or personalised.
            </p>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("daily")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "daily" ? "bg-accent text-white shadow-md" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              <Clock size={16} className="inline mr-1" />
              Daily
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "weekly" ? "bg-accent text-white shadow-md" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              <CalendarDays size={16} className="inline mr-1" />
              Weekly
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "agenda" ? "bg-accent text-white shadow-md" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              <LayoutList size={16} className="inline mr-1" />
              Agenda
            </button>
          </div>

          {viewMode === "daily" && (
            <DailySchedule plan={schedule.dailyPlan} onComplete={onComplete} onSkip={onSkip} />
          )}
          {viewMode === "weekly" && (
            <WeeklySchedule week={schedule.weeklyPlan} onComplete={onComplete} onSkip={onSkip} />
          )}
          {viewMode === "agenda" && (
            <AgendaView sessions={allSessions} onComplete={onComplete} onSkip={onSkip} />
          )}
        </div>

        {/* Insights panel */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm sticky top-4">
            <AIInsightsCard insights={schedule.insights} />
          </div>
        </div>
      </div>
    </div>
  );
}