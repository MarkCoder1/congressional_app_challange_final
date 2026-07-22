"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

interface TimelineHeaderProps {
  view: "today" | "day" | "week" | "due";
  onViewChange: (view: "today" | "day" | "week" | "due") => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function TimelineHeader({
  view,
  onViewChange,
  selectedDate,
  onDateChange,
}: TimelineHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const dateLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const goToPreviousDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() - 1);
    onDateChange(next);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
    >
      {/* Left: Date Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={goToPreviousDay}
          className="p-2.5 rounded-lg hover:bg-secondary transition-colors duration-200 active:scale-95"
          aria-label="Previous day"
        >
          <ChevronLeft size={20} className="text-muted-foreground" />
        </button>

        <div className="text-center min-w-48">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            {view === "today" ? "Today" : view === "day" ? "Day View" : view === "week" ? "Week View" : "Due Dates"}
          </p>
          <p className="font-bold text-xl text-foreground mt-1">{dateLabel}</p>
        </div>

        <button
          onClick={goToNextDay}
          className="p-2.5 rounded-lg hover:bg-secondary transition-colors duration-200 active:scale-95"
          aria-label="Next day"
        >
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>

        {!isToday && (
          <button
            onClick={goToToday}
            className="px-3 py-2 text-xs font-semibold bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
          >
            Today
          </button>
        )}
      </div>

      {/* Right: View Toggle & Search */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-64"
          />
        </div>

        {/* View Toggle */}
        <div className="flex gap-1.5 bg-secondary rounded-lg p-1.5">
          <button
            onClick={() => onViewChange("today")}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 ${
              view === "today"
                ? "bg-white text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => onViewChange("day")}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 ${
              view === "day"
                ? "bg-white text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Day
          </button>
          <button
            onClick={() => onViewChange("week")}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 ${
              view === "week"
                ? "bg-white text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => onViewChange("due")}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 ${
              view === "due"
                ? "bg-white text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Due
          </button>
        </div>
      </div>
    </motion.div>
  );
}
