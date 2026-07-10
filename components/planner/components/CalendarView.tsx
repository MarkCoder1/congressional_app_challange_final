// /components/planner/components/CalendarView.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  onSelectDate?: (date: string) => void;
  selectedDate?: string | null;
}

export function CalendarView({ onSelectDate, selectedDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onSelectDate?.(dateStr);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">
          {monthNames[month]} {year}
        </span>
        <div className="flex gap-1">
          <button onClick={goToPrevMonth} className="p-1 rounded hover:bg-secondary">
            <ChevronLeft size={16} />
          </button>
          <button onClick={goToNextMonth} className="p-1 rounded hover:bg-secondary">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="font-medium">{d}</div>
        ))}
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(day)}
              className={
                "w-full py-1 rounded transition-colors " +
                (isSelected
                  ? "bg-accent text-white"
                  : isToday
                  ? "bg-accent/20 text-accent font-bold"
                  : "hover:bg-secondary")
              }
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}