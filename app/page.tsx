"use client";

import { Clock, BookOpen, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { mockTasks } from "@/lib/mockTasks";
import { getTaskRoute, getTaskTypeLabel } from "@/lib/navigation";
import { EmptyState } from "@/components/EmptyState";

// Mock data for stats (keeping as is)
const stats = [
  { label: "Completed Today", value: "5", icon: CheckCircle2 },
  { label: "Time Studied", value: "1h 45m", icon: Clock },
  { label: "Streak", value: "12 days", icon: Zap },
];

const todaySchedule = [
  {
    time: "4:00 PM",
    type: "Learn",
    subject: "Math",
    color: "bg-blue-100 text-blue-700",
  },
  {
    time: "4:30 PM",
    type: "Practice",
    subject: "Math",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    time: "5:00 PM",
    type: "Review",
    subject: "Biology",
    color: "bg-purple-100 text-purple-700",
  },
  {
    time: "5:30 PM",
    type: "Learn",
    subject: "Spanish",
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function Dashboard() {
  // Get featured task (first one) as next action
  const nextAction = mockTasks[0];
  const upNext = mockTasks.slice(1);

  if (!nextAction) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-card border border-border rounded-2xl shadow-sm">
          <EmptyState
            icon={<BookOpen size={32} />}
            title="No tasks yet"
            description="Create your first learning task to start building a clear demo flow."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Page Intro */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">What's next?</h2>
        <p className="text-muted-foreground text-sm">
          Jump into your learning journey
        </p>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (Primary) - ~70% */}
        <div className="lg:col-span-2 space-y-6">
          {/* NEXT ACTION CARD - Core Feature */}
          <div className="bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent/40 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            {/* Header Label */}
            <div className="mb-4 inline-block">
              <span className="text-xs font-semibold text-accent uppercase tracking-widest bg-accent/10 px-3 py-1.5 rounded-lg">
                Next Action
              </span>
            </div>

            {/* Title */}
            <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-foreground group-hover:text-accent transition-colors duration-200">
              {nextAction.title}
            </h3>

            {/* Metadata Row */}
            <div className="flex flex-wrap gap-3 mb-6">
              {/* Subject Badge */}
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-accent/10 text-accent font-medium text-sm">
                {nextAction.subject}
              </span>

              {/* Task Type */}
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-sm font-medium">
                {getTaskTypeLabel(nextAction.taskType)}
              </span>

              {/* Deadline */}
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-sm font-medium">
                {nextAction.deadline}
              </span>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {nextAction.description || "Get started with this task to continue your learning journey"}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={getTaskRoute(nextAction)}
                className="flex-1 btn-primary flex items-center justify-center gap-2 group/btn"
              >
                <span>Start Now</span>
                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                href={getTaskRoute(nextAction)}
                className="flex-1 btn-ghost border border-border hover:border-accent/50"
              >
                Open Task
              </Link>
            </div>
          </div>

          {/* UP NEXT Section */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Up Next
            </h4>
            <div className="space-y-3">
              {upNext.map((task) => (
                <Link
                  key={task.id}
                  href={getTaskRoute(task)}
                  className="block group"
                >
                  <div className="card-interactive bg-card border border-border rounded-lg p-4 active:scale-[0.98]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-foreground group-hover:text-accent transition-colors duration-200">
                          {task.title}
                        </h5>
                        <p className="text-sm text-muted-foreground mt-1.5">
                          {task.subject} • {getTaskTypeLabel(task.taskType)}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-accent">
                            {Math.round(task.progress)}%
                          </span>
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                            <CheckCircle2 size={16} className="text-accent" />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Secondary) - ~30% */}
        <div className="space-y-6">
          {/* TODAY SCHEDULE CARD */}
          <div className="card-base bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <h4 className="text-lg font-semibold mb-6 text-foreground">Today's Schedule</h4>

            <div className="space-y-3">
              {todaySchedule.map((block, idx) => (
                <div key={idx} className="flex gap-3 group">
                  {/* Time Label */}
                  <div className="flex-shrink-0 w-14">
                    <p className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                      {block.time}
                    </p>
                  </div>

                  {/* Block */}
                  <div
                    className={`flex-1 px-3 py-2.5 rounded-lg ${block.color} text-sm font-medium transition-all duration-200 group-hover:shadow-sm group-hover:scale-105`}
                  >
                    <div className="font-semibold">{block.type}</div>
                    <div className="text-xs opacity-70">{block.subject}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* View Full Schedule Link */}
            <button className="w-full mt-6 pt-6 border-t border-border text-sm font-semibold text-accent hover:text-accent/80 transition-colors py-3 active:scale-[0.98]">
              View Full Schedule →
            </button>
          </div>

          {/* QUICK STATS CARD */}
          <div className="card-base bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <h4 className="text-lg font-semibold mb-6 text-foreground">Today's Stats</h4>

            <div className="space-y-4">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-200">
                      <Icon size={22} className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium">
                        {stat.label}
                      </p>
                      <p className="font-bold text-xl mt-0.5 text-foreground">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
