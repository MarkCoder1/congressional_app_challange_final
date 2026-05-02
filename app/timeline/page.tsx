"use client";

import { useState } from "react";
import { CalendarX, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { mockTimelineSessions } from "@/lib/mockQuestionsData";
import { getTaskRoute, getTaskTypeLabel } from "@/lib/navigation";
import { EmptyState } from "@/components/EmptyState";
import { WeeklyTimeline } from "@/components/weekly-timeline";

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

// Helper: Convert time string to pixels (for positioning)
const timeToPixels = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const startHour = 8; // Grid starts at 8 AM
  const pixelPerHour = 120;
  return (hours - startHour + minutes / 60) * pixelPerHour;
};

// Helper: Format time string
const formatTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

// Helper: Get today's date
const getTodayDate = () => {
  const today = new Date();
  return today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

export default function Timeline() {
  const [view, setView] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

  // Get sessions for today (Monday for demo)
  const todaysSessions = mockTimelineSessions.filter((s) => s.day === "Monday");

  if (!todaysSessions.length && view === "day") {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-card border border-border rounded-2xl shadow-sm">
          <EmptyState
            icon={<CalendarX size={32} />}
            title="No timeline items"
            description="Add a task to see your study plan laid out across the day."
            actionLabel="Create Task"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2 text-foreground">Timeline</h1>
        <p className="text-muted-foreground text-base">Your learning schedule</p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
        {/* Date Selector */}
        <div className="flex items-center gap-4">
          <button className="p-2.5 rounded-lg hover:bg-secondary transition-colors duration-200 active:scale-95">
            <ChevronLeft size={20} className="text-muted-foreground" />
          </button>
          <div className="text-center min-w-56">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Today</p>
            <p className="font-bold text-xl text-foreground mt-1">{getTodayDate()}</p>
          </div>
          <button className="p-2.5 rounded-lg hover:bg-secondary transition-colors duration-200 active:scale-95">
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex gap-1.5 bg-secondary rounded-lg p-1.5">
            <button
              onClick={() => setView("day")}
              className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 ${
                view === "day"
                  ? "bg-white text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 ${
                view === "week"
                  ? "bg-white text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Week
            </button>
          </div>

          {/* Add Task Button */}
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </div>

      {/* View Content */}
      {view === "week" ? (
        <WeeklyTimeline selectedDate={selectedDate} />
      ) : (
        <>
          {/* Timeline Grid (Day View) */}
          <div className="card-base bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Timeline Container */}
                <div className="flex">
                  {/* Time Labels Column */}
                  <div className="w-24 flex-shrink-0 border-r border-border bg-gradient-to-b from-secondary/40 to-secondary/20">
                    <div className="h-12" /> {/* Spacer for header alignment */}
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="h-30 border-b border-border/40 flex items-start justify-center pt-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {hour === 12
                          ? "12 PM"
                          : hour < 12
                            ? `${hour} AM`
                            : `${hour - 12} PM`}
                      </div>
                    ))}
                  </div>

                  {/* Timeline Grid Column */}
                  <div className="flex-1 relative bg-gradient-to-b from-background to-secondary/5">
                    {/* Grid Background */}
                    <div className="absolute inset-0 pointer-events-none">
                      {hours.map((_, idx) => (
                        <div
                          key={idx}
                          className="h-30 border-b border-border/30"
                        />
                      ))}
                    </div>

                    {/* Task Blocks Container */}
                    <div className="relative p-6 space-y-2">
                      {todaysSessions.map((session) => {
                        const topPosition = timeToPixels(session.start);
                        const blockHeight = (session.duration / 60) * 120; // 120px per hour
                        const colors = typeColors[session.type as keyof typeof typeColors];
                        const taskRoute = getTaskRoute({
                          id: session.id,
                          taskType: session.taskType,
                        });

                        return (
                          <Link key={`${session.id}-${session.start}`} href={taskRoute}>
                            <button
                              className={`absolute left-6 right-6 ${colors.bg} border-2 ${colors.border} rounded-xl p-4 text-left transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 cursor-pointer group active:scale-95`}
                              style={{
                                top: `${topPosition}px`,
                                height: `${blockHeight}px`,
                                minHeight: "70px",
                              }}
                            >
                              {/* Type Badge */}
                              <div className={`inline-block ${colors.badge} text-xs font-bold px-2.5 py-1.5 rounded-md mb-2 transition-all group-hover:scale-105`}>
                                {session.type}
                              </div>

                              {/* Title */}
                              <h4 className={`${colors.text} font-bold text-sm leading-tight group-hover:opacity-100 opacity-95`}>
                                {session.title}
                              </h4>

                              {/* Meta Info */}
                              <div className="mt-2 space-y-0.5">
                                <p className="text-xs text-muted-foreground font-medium">
                                  {session.subject} • {getTaskTypeLabel(session.taskType)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ⏱️ {session.duration} min
                                </p>
                              </div>
                            </button>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Footer */}
          <div className="mt-8 card-base bg-gradient-to-r from-accent/5 to-accent/10 rounded-lg p-6 border-2 border-accent/20 shadow-md">
            <p className="text-sm text-foreground">
              <span className="font-bold text-accent">📊 Study Summary:</span>
              <span className="text-muted-foreground ml-2">
                {Math.round(todaysSessions.reduce((sum, s) => sum + s.duration, 0) / 60)} hours {(todaysSessions.reduce((sum, s) => sum + s.duration, 0) % 60)} minutes of focused learning across {todaysSessions.length} sessions
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
