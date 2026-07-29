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
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { DashboardGreeting } from "@/components/DashboardGreeting";
import { ContextualHint } from "@/components/ContextualHint";
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

  const activeTasks = useMemo(() => {
    return apiTasks.filter((t) => (t.progress ?? 0) < 100);
  }, [apiTasks]);

  const completedTasks = useMemo(() => {
    return apiTasks.filter((t) => (t.progress ?? 0) >= 100);
  }, [apiTasks]);

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
      <PageTransition>
        <div className="page-container section-spacing">
          <div className="h-8 w-64 shimmer rounded-lg" />
          <div className="space-y-4 mt-6">
            <div className="h-6 w-48 shimmer rounded" />
            <div className="h-64 shimmer rounded-xl" />
          </div>
          <div className="content-grid mt-6">
            <div className="content-main space-y-4">
              <div className="h-8 w-40 shimmer rounded-lg" />
              <div className="h-48 shimmer rounded-xl" />
              <div className="h-8 w-40 shimmer rounded-lg" />
              <div className="h-32 shimmer rounded-xl" />
            </div>
            <div className="content-sidebar space-y-4">
              <div className="h-32 shimmer rounded-xl" />
              <div className="h-32 shimmer rounded-xl" />
              <div className="h-48 shimmer rounded-xl" />
            </div>
          </div>
        </div>
      </PageTransition>
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
      <PageTransition>
        <div className="page-container">
          <motion.div
            variants={staggerItem}
            initial="initial"
            animate="animate"
          >
            <DashboardGreeting
              completedToday={totalCompleted}
              hasTasks={activeTasks.length > 0}
            />
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="content-grid"
          >
            <div className="content-main">
              <motion.div variants={staggerItem}>
                {activeTasks.length > 0 && (
                  <ContextualHint
                    message={activeTasks.length === 1 ? "You have 1 task waiting today" : `You have ${activeTasks.length} tasks to work on`}
                    className="mb-4"
                  />
                )}
                <NextActionCard
                  task={nextAction}
                  priorityScore={nextActionPriority}
                />
              </motion.div>

              {upNext.length > 0 && (
                <motion.div variants={staggerItem}>
                  <div className="card-dashboard">
                    <h4 className="uppercase-label mb-4 flex items-center gap-2">
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
                              delay: idx * 0.05,
                            }}
                          >
                            <Link
                              href={`/task/${task.id}`}
                              className="block group"
                            >
                              <div className="card-interactive p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold group-hover:text-accent truncate">
                                      {task.title}
                                    </h5>
                                    <p className="caption">{task.subject}</p>
                                  </div>
                                  <div className="text-right ml-4">
                                    <span className="font-bold text-accent">
                                      {task.progress}%
                                    </span>
                                  </div>
                                </div>

                                {priorityScore && (
                                  <div className="mt-2 metadata">
                                    Priority:{" "}
                                    {formatPriorityLabel(priorityScore.score)}
                                  </div>
                                )}

                                {task.deadline && (
                                  <div
                                    className={`mt-1.5 text-sm flex items-center gap-1.5 ${
                                      isOverdue
                                        ? "text-destructive"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    <Calendar size={14} />
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

                                <div className="progress-bar mt-3">
                                  <div
                                    className="progress-fill"
                                    style={{ width: `${task.progress}%` }}
                                  />
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {totalCompleted > 0 && (
                <motion.div variants={staggerItem}>
                  <div className="card-base overflow-hidden">
                    <button
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Trophy className="text-warning" size={20} />
                        <span className="font-semibold">
                          Completed Tasks ({totalCompleted})
                        </span>
                      </div>
                      {showCompleted ? (
                        <ChevronUp size={18} className="text-muted-foreground" />
                      ) : (
                        <ChevronDown size={18} className="text-muted-foreground" />
                      )}
                    </button>
                    {showCompleted && (
                      <div className="p-4 pt-2 space-y-2 max-h-[400px] overflow-auto">
                        {completedTasks.map((task) => (
                          <Link
                            key={task.id}
                            href={`/task/${task.id}`}
                            className="block card-interactive p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium group-hover:text-accent transition-colors">
                                  {task.title}
                                </h5>
                                <p className="caption">{task.subject}</p>
                              </div>
                              <div className="badge-success">100%</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="content-sidebar">
              <motion.div variants={staggerItem}>
                <TodayProgressCard tasks={apiTasks} />
              </motion.div>
              <motion.div variants={staggerItem}>
                <UpcomingWorkload tasks={apiTasks} />
              </motion.div>
              <motion.div variants={staggerItem}>
                <QuickActions
                  hasTasks={activeTasks.length > 0}
                  topTaskId={nextAction?.id}
                />
              </motion.div>
              {/* <motion.div variants={staggerItem}>
                <ProgressHistory />
              </motion.div> */}
            </div>
          </motion.div>
        </div>
      </PageTransition>
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
