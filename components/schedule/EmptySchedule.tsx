"use client";

import { Sparkles } from "lucide-react";

export function EmptySchedule() {
  return (
    <div className="text-center py-12">
      <Sparkles size={48} className="mx-auto mb-4 text-muted-foreground/20" />
      <h3 className="text-lg font-semibold text-foreground">No schedule yet</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Create tasks and let AI plan your study sessions.
      </p>
    </div>
  );
}