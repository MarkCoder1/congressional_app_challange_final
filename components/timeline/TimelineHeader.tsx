"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";

interface TimelineHeaderProps {
  view: "today" | "day" | "week" | "due";
  onViewChange: (view: "today" | "day" | "week" | "due") => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function TimelineHeader({
  view,
  onViewChange,
  selectedDate,
  onDateChange,
  searchQuery,
  onSearchChange,
}: TimelineHeaderProps) {

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
      className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={goToPreviousDay}
          className="p-2.5 rounded-lg hover:bg-secondary transition-all duration-200 active:scale-95"
          aria-label="Previous day"
        >
          <ChevronLeft size={20} className="text-muted-foreground" />
        </button>

        <div className="text-center min-w-48">
          <p className="uppercase-label">
            {view === "today" ? "Today" : view === "day" ? "Day View" : view === "week" ? "Week View" : "Due Dates"}
          </p>
          <p className="font-bold text-xl text-foreground mt-1">{dateLabel}</p>
        </div>

        <button
          onClick={goToNextDay}
          className="p-2.5 rounded-lg hover:bg-secondary transition-all duration-200 active:scale-95"
          aria-label="Next day"
        >
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>

        {!isToday && (
          <button
            onClick={goToToday}
            className="btn-sm bg-accent/10 text-accent hover:bg-accent/20"
          >
            Today
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 h-10 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 w-56"
          />
        </div>

        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {(["today", "day", "week", "due"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-3.5 py-1.5 rounded-md font-medium text-sm transition-all duration-200 ${
                view === v
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
