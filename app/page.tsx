"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, BookOpen, Zap, CheckCircle2, ArrowRight, ChevronDown, ChevronUp, Trophy, Target, Calendar } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

type Task = {
  id: string;
  title: string;
  subject: string;
  description?: string;
  progress: number;
  status?: string;
  completedAt?: string;
  deadline?: string;        // ← Make sure this exists
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    fetch("/api/tasks/all")
      .then((res) => res.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeTasks = tasks.filter((t) => (t.progress ?? 0) < 100);
  const completedTasks = tasks.filter((t) => (t.progress ?? 0) >= 100);

  const totalActiveProgress = activeTasks.length
    ? Math.round(activeTasks.reduce((sum, t) => sum + (t.progress ?? 0), 0) / activeTasks.length)
    : 0;

  const nextAction = [...activeTasks].sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))[0];
  const upNext = [...activeTasks].sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0)).slice(1, 6);

  const totalCompleted = completedTasks.length;
  const inProgressCount = activeTasks.filter(t => (t.progress ?? 0) > 0).length;

  // Helper: Calculate days left
  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const due = new Date(deadline);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    return diffDays;
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  if (tasks.length === 0) {
    return <EmptyState icon={<BookOpen size={32} />} title="No tasks yet" description="Create your first task" actionLabel="Create Task" actionHref="/create-task" />;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Good morning, Mark</h2>
        <p className="text-muted-foreground">Here's your learning overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Progress */}
          {activeTasks.length > 0 && (
            <div className="bg-gradient-to-br from-accent/10 to-card border border-accent/30 rounded-3xl p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm font-medium text-accent">CURRENT PROGRESS</p>
                  <p className="text-5xl font-bold mt-2">{totalActiveProgress}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-semibold">{activeTasks.length}</p>
                </div>
              </div>
              <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent transition-all duration-500" style={{ width: `${totalActiveProgress}%` }} />
              </div>
            </div>
          )}

          {/* Next Action */}
          {nextAction && (
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-3">{nextAction.title}</h3>
              <p className="text-muted-foreground mb-6">{nextAction.description}</p>
              <Link
                href={`/task/${nextAction.id}`}
                className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-2xl font-medium hover:bg-accent/90"
              >
                Continue • {nextAction.progress}% complete <ArrowRight size={18} />
              </Link>
            </div>
          )}

          {/* Up Next - With Deadline */}
          {upNext.length > 0 && (
            <div>
              <h4 className="uppercase text-sm font-semibold tracking-widest text-muted-foreground mb-4">
                Up Next
              </h4>
              <div className="space-y-3">
                {upNext.map((task) => {
                  const daysLeft = getDaysLeft(task.deadline);
                  const isOverdue = daysLeft !== null && daysLeft < 0;

                  return (
                    <Link key={task.id} href={`/task/${task.id}`} className="block group">
                      <div className="bg-card border border-border hover:border-accent/50 rounded-2xl p-5 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold group-hover:text-accent">{task.title}</h5>
                            <p className="text-sm text-muted-foreground">{task.subject}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-accent">{task.progress}%</span>
                          </div>
                        </div>

                        {/* Deadline Info */}
                        {task.deadline && (
                          <div className={`mt-3 text-sm flex items-center gap-1.5 ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}>
                            <Calendar size={16} />
                            {daysLeft === null || Number.isNaN(daysLeft) || Number.isNaN(new Date(task.deadline).getTime()) ? (
                              <span>No Deadline</span>
                            ) : (
                              isOverdue ? (
                                <span>Overdue by {Math.abs(daysLeft)} days</span>
                              ) : daysLeft === 0 ? (
                                <span className="font-medium">Due today</span>
                              ) : (
                                <span>Due in {daysLeft} days</span>
                              )
                            )}
                          </div>
                        )}

                        <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${task.progress}%` }} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {totalCompleted > 0 && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="text-yellow-500" size={22} />
                  <span className="font-semibold">Completed Tasks ({totalCompleted})</span>
                </div>
                {showCompleted ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
                          <p className="text-sm text-muted-foreground">{task.subject}</p>
                        </div>
                        <div className="text-green-600 font-semibold">100%</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl p-6">
            <h4 className="text-lg font-semibold mb-6">Overview</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Trophy size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold">{totalCompleted}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Target size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold">{inProgressCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}