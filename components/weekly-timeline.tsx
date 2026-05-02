"use client";

import { useMemo } from "react";
import Link from "next/link";
import { mockTimelineSessions } from "@/lib/mockQuestionsData";
import { getTaskRoute } from "@/lib/navigation";

interface WeeklyTimelineProps {
  selectedDate?: Date;
}

// Color mapping for session types
const typeColors = {
  Learn: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    text: "text-blue-900",
  },
  Practice: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
    text: "text-yellow-900",
  },
  Review: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    text: "text-purple-900",
  },
  Assignment: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700",
    text: "text-orange-900",
  },
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

// Helper: Convert time string to pixels
const timeToPixels = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const startHour = 8;
  const pixelPerHour = 80;
  return (hours - startHour + minutes / 60) * pixelPerHour;
};

// Helper: Format time string
const formatTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export function WeeklyTimeline({ selectedDate }: WeeklyTimelineProps) {
  const sessionsByDay = useMemo(() => {
    const grouped: Record<string, typeof mockTimelineSessions> = {};
    days.forEach((day) => {
      grouped[day] = mockTimelineSessions.filter((session) => session.day === day);
    });
    return grouped;
  }, []);

  return (
    <div className="w-full">
      {/* Week Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-1">Weekly View</h2>
        <p className="text-muted-foreground text-sm">Your study schedule for the week</p>
      </div>

      {/* Timeline Grid */}
      <div className="card-base bg-card rounded-2xl overflow-hidden shadow-lg border border-border">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Grid Container */}
            <div className="flex">
              {/* Time Labels Column */}
              <div className="w-20 flex-shrink-0 border-r border-border bg-gradient-to-b from-secondary/40 to-secondary/20">
                <div className="h-16" /> {/* Spacer for header alignment */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-20 border-b border-border/40 flex items-start justify-center pt-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {hour === 12
                      ? "12 PM"
                      : hour < 12
                        ? `${hour} AM`
                        : `${hour - 12} PM`}
                  </div>
                ))}
              </div>

              {/* Days Columns */}
              <div className="flex flex-1">
                {days.map((day) => (
                  <div key={day} className="flex-1 border-r border-border last:border-r-0">
                    {/* Day Header */}
                    <div className="h-16 border-b border-border bg-gradient-to-r from-accent/5 to-accent/10 px-4 py-3 sticky top-0 z-10">
                      <p className="text-sm font-bold text-foreground">{day}</p>
                      <p className="text-xs text-muted-foreground">
                        {sessionsByDay[day]?.length || 0} sessions
                      </p>
                    </div>

                    {/* Day Grid Background & Sessions */}
                    <div className="relative">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 pointer-events-none">
                        {hours.map((_, idx) => (
                          <div
                            key={idx}
                            className="h-20 border-b border-border/30"
                          />
                        ))}
                      </div>

                      {/* Sessions */}
                      <div className="relative p-2 space-y-1 min-h-max">
                        {sessionsByDay[day]?.map((session) => {
                          const topPosition = timeToPixels(session.start);
                          const blockHeight = (session.duration / 60) * 80;
                          const colors = typeColors[session.type as keyof typeof typeColors];
                          const taskRoute = getTaskRoute({
                            id: session.id,
                            taskType: session.taskType,
                          });

                          return (
                            <Link key={`${session.id}-${session.start}`} href={taskRoute}>
                              <button
                                className={`absolute left-2 right-2 ${colors.bg} border-2 ${colors.border} rounded-lg p-2 text-left transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 cursor-pointer group active:scale-95 group-hover:z-20`}
                                style={{
                                  top: `${topPosition}px`,
                                  height: `${blockHeight}px`,
                                  minHeight: "60px",
                                }}
                              >
                                {/* Type Badge */}
                                <div className={`inline-block ${colors.badge} text-xs font-bold px-2 py-0.5 rounded mb-1 transition-all group-hover:scale-105`}>
                                  {session.type}
                                </div>

                                {/* Title */}
                                <h4 className={`${colors.text} font-bold text-xs leading-tight group-hover:opacity-100 opacity-90 line-clamp-2`}>
                                  {session.title}
                                </h4>

                                {/* Meta Info */}
                                <div className="mt-1 space-y-0">
                                  <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                                    {session.subject}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatTime(session.start)} • {session.duration}m
                                  </p>
                                </div>
                              </button>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Sessions",
            value: mockTimelineSessions.length,
            icon: "📅",
          },
          {
            label: "Total Study Time",
            value: `${Math.round(mockTimelineSessions.reduce((sum, s) => sum + s.duration, 0) / 60)} hrs`,
            icon: "⏱️",
          },
          {
            label: "Subjects Covered",
            value: new Set(mockTimelineSessions.map((s) => s.subject)).size,
            icon: "📚",
          },
        ].map((stat) => (
          <div key={stat.label} className="card-base bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg p-6 border-2 border-accent/20 shadow-md">
            <p className="text-3xl mb-2">{stat.icon}</p>
            <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 bg-card border border-border rounded-lg p-6">
        <h3 className="font-bold text-foreground mb-4">Session Types</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(typeColors).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${colors.bg} border-2 ${colors.border}`} />
              <span className="text-sm text-foreground font-medium">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
