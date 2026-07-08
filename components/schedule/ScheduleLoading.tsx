"use client";

export function ScheduleLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-secondary rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 h-32" />
        ))}
      </div>
      <div className="h-20 bg-secondary rounded"></div>
    </div>
  );
}