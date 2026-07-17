// /components/planner/tabs/TodayTab.tsx
"use client";

import { usePlanner } from "../PlannerProvider";
import { MissionCard } from "../components/MissionCard";
import { AICoach } from "../components/AICoach";
import { AISummary } from "../components/AISummary";
import { WorkloadBreakdown } from "../components/WorkloadBreakdown";
import { EnhancedTimelineCard } from "../components/EnhancedTimelineCard";
import { EmptyPlannerState } from "../components/EmptyPlannerState";
import { Clock } from "lucide-react";

export function TodayTab() {
  const { plannerState, data, loading, error, completeTask, skipTask, moveTaskTomorrow } = usePlanner();

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading today's plan...</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  if (!plannerState || plannerState.tasks.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyPlannerState />
        <p className="text-sm text-muted-foreground text-center">
          Create your first task to start planning.
        </p>
      </div>
    );
  }

  const { today, overdue } = plannerState;
  const coach = data?.coach;
  const summary = today.warnings[0] ?? today.mission.title;

  return (
    <div className="space-y-6">
      {/* Mission Card – engine-driven */}
      <MissionCard
        mission={{
          goal: today.mission.title,
          focusTaskId: today.mission.focusTaskId ?? "",
          estimatedMinutes: today.mission.estimatedMinutes,
          sessions: today.mission.sessionCount,
          productivityScore: 0,
          confidenceScore: 0,
          urgentCount: today.priorityTasks.length,
          overdueCount: overdue.count,
        }}
      />

      {/* AI Summary */}
      <AISummary summary={summary} />

      {/* Workload Breakdown */}
      <WorkloadBreakdown workload={today.workload} />

      {/* Timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Clock size={16} className="text-muted-foreground" />
          Today's Timeline
        </h3>
        {today.timeline.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tasks scheduled for today. Enjoy your free time!
          </div>
        ) : (
          today.timeline.map((item, idx) => (
            <EnhancedTimelineCard
              key={item.taskId + idx}
              item={{
                taskId: item.taskId,
                title: item.task.title,
                subject: item.task.subject,
                type: item.task.type,
                progress: item.task.progress,
                deadline: item.task.deadline ?? undefined,
                startTime: item.startTime ?? "09:00",
                duration: item.durationMinutes ?? 0,
                priority: item.priorityLevel,
                reason: item.reason,
                action:
                  item.task.type === "assignment"
                    ? "research"
                    : item.task.type === "practice"
                      ? "practice"
                      : item.task.type === "review"
                        ? "review"
                        : "study",
              }}
              onComplete={completeTask}
              onSkip={skipTask}
              onMoveTomorrow={moveTaskTomorrow}
            />
          ))
        )}
      </div>

      {/* AI Coach */}
      {coach && <AICoach coach={coach} />}
    </div>
  );
}