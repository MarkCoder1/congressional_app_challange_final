"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Trophy,
  Calendar,
  Brain,
} from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/EmptyState";
import { usePlanner } from "@/features/planner/hooks/usePlanner";
import { usePlannerStore } from "@/features/planner/store";
import {
  NextActionCard,
  TodayProgressCard,
  UpcomingWorkload,
  QuickActions,
} from "@/components/dashboard";
import { ProgressHistory } from "@/components/dashboard/ProgressHistory";
import { WelcomeScreen } from "@/components/onboarding/WelcomeScreen";
import type { Task } from "@/types/task";

export default function Dashboard() {
  const [apiTasks, setApiTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Load tasks from API into the planner store
  const setTasks = usePlannerStore((state) => state.setTasks);
  const planner = usePlanner();
  const { priorityScores } = planner;

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      try {
        const response = await fetch("/api/tasks/all");
        if (!response.ok) {
          setLoading(false);
          return;
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          setLoading(false);
          return;
        }

        if (cancelled) return;

        const apiTasksData = data as Task[];
        setApiTasks(apiTasksData);

        // Map API tasks to planner-compatible format and set in store
        const mapTaskType = (
          apiType: string,
        ): "lesson" | "assignment" | "practice" | "review" | "custom" => {
          if (apiType === "lesson") return "lesson";
          if (apiType === "assignment") return "assignment";
          return "custom";
        };

        const mapStatus = (
          apiStatus: string,
        ): "not_started" | "in_progress" | "completed" => {
          if (apiStatus === "completed") return "completed";
          if (apiStatus === "in_progress") return "in_progress";
          return "not_started";
        };

        const plannerTasks = apiTasksData.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          subject: task.subject,
          type: mapTaskType(task.type),
          deadline: task.deadline || null,
          estimatedMinutes: task.estimatedMinutes ?? null,
          difficulty: (task.difficulty as "easy" | "medium" | "hard") ?? null,
          priority: "medium" as const,
          progress: task.progress ?? 0,
          status: mapStatus(task.status),
          completed:
            task.status === "completed" || (task.progress ?? 0) >= 100,
          createdAt: task.startedAt || new Date().toISOString(),
          updatedAt: task.lastActivityAt || new Date().toISOString(),
        }));

        setTasks(plannerTasks as any);
      } catch (error) {
        console.error("Failed to load tasks for dashboard:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [setTasks]);

  // Use planner priorityScores for ordering (single source of truth)
  const activeTasks = useMemo(() => {
    return apiTasks.filter((t) => (t.progress ?? 0) < 100);
  }, [apiTasks]);

  const completedTasks = useMemo(() => {
    return apiTasks.filter((t) => (t.progress ?? 0) >= 100);
  }, [apiTasks]);

  // Sort by planner priorityScores (highest first), fallback to progress
  const sortedActiveTasks = useMemo(() => {
    return [...activeTasks].sort((a, b) => {
      const scoreA =
        priorityScores.find((p) => p.taskId === a.id)?.score ?? 0;
      const scoreB =
        priorityScores.find((p) => p.taskId === b.id)?.score ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (b.progress ?? 0) - (a.progress ?? 0);
    });
  }, [activeTasks, priorityScores]);

  const nextAction = sortedActiveTasks[0] || null;
  const nextActionPriority = nextAction
    ? priorityScores.find((p) => p.taskId === nextAction.id)
    : undefined;
  const upNext = sortedActiveTasks.slice(1, 6);

  const totalCompleted = completedTasks.length;

  // Helper: Calculate days left
  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const due = new Date(deadline);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    return diffDays;
  };

  if (loading)
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-secondary rounded-lg" />
        <div className="h-64 bg-secondary rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-48 bg-secondary rounded-3xl" />
          <div className="h-48 bg-secondary rounded-3xl" />
        </div>
      </div>
    );

  if (apiTasks.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen size={32} />}
        title="Your learning journey starts here"
        description="Create your first task to begin your personalized learning experience"
        actionLabel="Create First Task"
        actionHref="/create-task"
      />
    );
  }

  return (
    <>
      <WelcomeScreen onComplete={() => setShowOnboarding(false)} />
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold">Good morning, Marc</h2>
          <p className="text-muted-foreground">
            Here's your learning overview
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Main Area (Left 2/3) ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Next Action Card (Feature 1 + 2) */}
            <NextActionCard
              task={nextAction}
              priorityScore={nextActionPriority}
            />

            {/* Up Next - Ordered by Planner Priority */}
            {upNext.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h4 className="uppercase text-sm font-semibold tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                  <Brain size={16} />
                  Up Next
                </h4>
                <div className="space-y-3">
                  {upNext.map((task, idx) => {
                    const daysLeft = getDaysLeft(task.deadline);
                    const isOverdue = daysLeft !== null && daysLeft < 0;
                    const priorityScore = priorityScores.find(
                      (p) => p.taskId === task.id,
                    );

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.3 + idx * 0.05,
                        }}
                      >
                        <Link
                          href={`/task/${task.id}`}
                          className="block group"
                        >
                          <div className="bg-card border border-border hover:border-accent/50 rounded-2xl p-5 transition-all hover:shadow-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold group-hover:text-accent">
                                  {task.title}
                                </h5>
                                <p className="text-sm text-muted-foreground">
                                  {task.subject}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-accent">
                                  {task.progress}%
                                </span>
                              </div>
                            </div>

                            {/* Priority indicator */}
                            {priorityScore && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Priority:{" "}
                                {formatPriorityLabel(priorityScore.score)}
                              </div>
                            )}

                            {/* Deadline Info */}
                            {task.deadline && (
                              <div
                                className={`mt-1 text-sm flex items-center gap-1.5 ${
                                  isOverdue
                                    ? "text-red-600"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <Calendar size={16} />
                                {daysLeft !== null ? (
                                  isOverdue ? (
                                    <span>
                                      Overdue by {Math.abs(daysLeft)} days
                                    </span>
                                  ) : daysLeft === 0 ? (
                                    <span className="font-medium">
                                      Due today
                                    </span>
                                  ) : (
                                    <span>Due in {daysLeft} days</span>
                                  )
                                ) : (
                                  <span>
                                    Deadline:{" "}
                                    {new Date(
                                      task.deadline,
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Completed Tasks */}
            {totalCompleted > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="text-yellow-500" size={22} />
                    <span className="font-semibold">
                      Completed Tasks ({totalCompleted})
                    </span>
                  </div>
                  {showCompleted ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
                {showCompleted && (
                  <div className="p-6 pt-2 space-y-3 max-h-[420px] overflow-auto">
                    {completedTasks.map((task) => (
                      <Link
                        key={task.id}
                        href={`/task/${task.id}`}
                        className="block bg-secondary/50 hover:bg-secondary rounded-xl p-4 transition-all group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium group-hover:text-accent transition-colors">
                              {task.title}
                            </h5>
                            <p className="text-sm text-muted-foreground">
                              {task.subject}
                            </p>
                          </div>
                          <div className="text-green-600 font-semibold">
                            100%
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* ─── Sidebar (Right 1/3) ─── */}
          <div className="space-y-6">
            {/* Today's Progress Card (Feature 3) */}
            <TodayProgressCard tasks={apiTasks} />

            {/* Upcoming Workload (Feature 4) */}
            <UpcomingWorkload tasks={apiTasks} />

            {/* Quick Actions (Feature 5) */}
            <QuickActions
              hasTasks={activeTasks.length > 0}
              topTaskId={nextAction?.id}
            />

            {/* Progress History (Phase 10.4) */}
            <ProgressHistory />
          </div>
        </div>
      </div>
    </>
  );
}

function formatPriorityLabel(score: number): string {
  const rounded = Math.round(score);
  if (rounded >= 90) return "Critical";
  if (rounded >= 70) return "High";
  if (rounded >= 40) return "Medium";
  return "Low";
}