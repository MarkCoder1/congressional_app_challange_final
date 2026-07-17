// /components/planner/PlannerLayout.tsx
"use client";

import { ReactNode } from "react";
import { usePlanner } from "./PlannerProvider";
import { PlannerTabs } from "./PlannerTabs";
import { RefreshCw } from "lucide-react";

interface PlannerLayoutProps {
  children: ReactNode;
}

export function PlannerLayout({ children }: PlannerLayoutProps) {
  const { regeneratePlan, loading } = usePlanner();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Study Planner
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your unified study schedule.
            </p>
          </div>
          <button
            onClick={regeneratePlan}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm font-medium text-foreground disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Regenerate Plan
          </button>
        </div>

        <PlannerTabs />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}