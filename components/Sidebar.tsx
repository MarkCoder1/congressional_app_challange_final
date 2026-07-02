"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  CheckSquare,
  Menu,
  X,
  Plus,
  ListTodo,
  ChevronDown,
  ChevronRight,
  FileText,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Task } from "@/types/task";

type SectionState = {
  tasks: boolean;
  assignments: boolean;
};

const SIDEBAR_STATE_KEY = "sidebar_sections_state";
const SIDEBAR_EXPANDED_KEY = "sidebar_expanded";

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionsState, setSectionsState] = useState<SectionState>({
    tasks: true,
    assignments: true,
  });

  // Load saved states
  useEffect(() => {
    const savedSections = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (savedSections) {
      try {
        const parsed = JSON.parse(savedSections);
        setSectionsState(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to load sidebar state:", e);
      }
    }
    
    const savedExpanded = localStorage.getItem(SIDEBAR_EXPANDED_KEY);
    if (savedExpanded !== null) {
      setIsExpanded(savedExpanded === "true");
    }
  }, []);

  const toggleSection = useCallback((section: keyof SectionState) => {
    setSectionsState(prev => {
      const newState = { ...prev, [section]: !prev[section] };
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => {
      const newState = !prev;
      localStorage.setItem(SIDEBAR_EXPANDED_KEY, String(newState));
      return newState;
    });
  }, []);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks/all");
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks for sidebar:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const { lessonTasks, assignmentTasks } = useMemo(() => {
    const lessons = tasks.filter(task => task.type === "lesson");
    const assignments = tasks.filter(task => task.type === "assignment");
    return { lessonTasks: lessons, assignmentTasks: assignments };
  }, [tasks]);

  const isTaskActive = useCallback(
    (taskId: string) => pathname === `/task/${taskId}`,
    [pathname]
  );

  const getProgressDisplay = (progress: number, status: string) => {
    if (status === "completed") {
      return { text: "Completed", color: "text-green-600 dark:text-green-400" };
    }
    return { text: `${progress}%`, color: "text-accent" };
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/timeline") return pathname === "/timeline";
    return false;
  };

  const staticNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/timeline", label: "Timeline", icon: BookOpen },
  ];

  const sidebarWidth = isExpanded ? "w-72" : "w-20";

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border shadow-sm hover:bg-secondary transition-all duration-200 active:scale-95"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen ${sidebarWidth} bg-card border-r border-border shadow-lg transition-all duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Branding - Centered when collapsed */}
          <div className={`px-4 py-6 border-b border-border bg-gradient-to-b from-accent/5 to-transparent`}>
            <div className={`flex ${isExpanded ? "justify-start px-2" : "justify-center"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-md flex-shrink-0">
                  <button
                    onClick={() => (window.location.href = '/')}
                    aria-label="Home"
                    className="text-white font-bold text-lg hover:cursor-pointer"
                  >
                    SF
                  </button>
                </div>
                {isExpanded && (
                  <div className="transition-opacity duration-200">
                    <h1 className="font-bold text-lg text-foreground whitespace-nowrap">StudyFlow AI</h1>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">Learn better</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expand/Collapse Toggle - Only one button, inside sidebar */}
          <div className={`px-4 py-3 ${isExpanded ? "" : "flex justify-center"}`}>
            <button
              onClick={toggleExpanded}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-200 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <>
                  <ChevronLeft size={16} />
                  <span>Collapse</span>
                </>
              ) : (
                <ChevronRightIcon size={16} />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-6">
            {/* Static Navigation Links */}
            <div className="space-y-1">
              {staticNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      onClick={() => setIsMobileOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-secondary ${
                        active ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground"
                      } ${!isExpanded && "justify-center"}`}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
                    </button>
                  </Link>
                );
              })}
            </div>

            {/* TASKS Section */}
            <div className="space-y-2">
              <button
                onClick={() => toggleSection("tasks")}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 hover:bg-secondary ${
                  isExpanded ? "justify-between" : "justify-center"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckSquare size={18} className="flex-shrink-0 text-muted-foreground" />
                  {isExpanded && (
                    <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                      Tasks ({lessonTasks.length})
                    </span>
                  )}
                </div>
                {isExpanded && (
                  sectionsState.tasks ? (
                    <ChevronDown size={14} className="text-muted-foreground" />
                  ) : (
                    <ChevronRight size={14} className="text-muted-foreground" />
                  )
                )}
              </button>

              {sectionsState.tasks && isExpanded && (
                <div className="space-y-1 ml-2">
                  {isLoading ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground animate-pulse">
                      Loading tasks...
                    </div>
                  ) : lessonTasks.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground italic">
                      No tasks yet
                    </div>
                  ) : (
                    lessonTasks.map((task) => {
                      const isActiveTask = isTaskActive(task.id);
                      const progressInfo = getProgressDisplay(task.progress, task.status);
                      return (
                        <Link key={task.id} href={`/task/${task.id}`}>
                          <button
                            onClick={() => setIsMobileOpen(false)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 hover:bg-secondary ${
                              isActiveTask ? "bg-accent/10 text-accent" : "text-foreground/80"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <BookOpen size={14} className="flex-shrink-0" />
                                <span className="text-sm font-medium truncate">{task.title}</span>
                              </div>
                              <span className={`text-xs font-semibold whitespace-nowrap ${progressInfo.color}`}>
                                {progressInfo.text}
                              </span>
                            </div>
                            {task.status !== "completed" && task.progress > 0 && (
                              <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-accent rounded-full transition-all duration-300"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                            )}
                          </button>
                        </Link>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* ASSIGNMENTS Section */}
            <div className="space-y-2">
              <button
                onClick={() => toggleSection("assignments")}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 hover:bg-secondary ${
                  isExpanded ? "justify-between" : "justify-center"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ListTodo size={18} className="flex-shrink-0 text-muted-foreground" />
                  {isExpanded && (
                    <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                      Assignments ({assignmentTasks.length})
                    </span>
                  )}
                </div>
                {isExpanded && (
                  sectionsState.assignments ? (
                    <ChevronDown size={14} className="text-muted-foreground" />
                  ) : (
                    <ChevronRight size={14} className="text-muted-foreground" />
                  )
                )}
              </button>

              {sectionsState.assignments && isExpanded && (
                <div className="space-y-1 ml-2">
                  {isLoading ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground animate-pulse">
                      Loading assignments...
                    </div>
                  ) : assignmentTasks.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground italic">
                      No assignments yet
                    </div>
                  ) : (
                    assignmentTasks.map((task) => {
                      const isActiveTask = isTaskActive(task.id);
                      const progressInfo = getProgressDisplay(task.progress, task.status);
                      return (
                        <Link key={task.id} href={`/task/${task.id}`}>
                          <button
                            onClick={() => setIsMobileOpen(false)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 hover:bg-secondary ${
                              isActiveTask ? "bg-accent/10 text-accent" : "text-foreground/80"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText size={14} className="flex-shrink-0" />
                                <span className="text-sm font-medium truncate">{task.title}</span>
                              </div>
                              <span className={`text-xs font-semibold whitespace-nowrap ${progressInfo.color}`}>
                                {progressInfo.text}
                              </span>
                            </div>
                            {task.status !== "completed" && task.progress > 0 && (
                              <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-accent rounded-full transition-all duration-300"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                            )}
                          </button>
                        </Link>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Create Task Button */}
          <div className="px-4 py-4 border-t border-border">
            <Link href="/create-task">
              <button
                onClick={() => setIsMobileOpen(false)}
                className={`hover:cursor-pointer w-full btn-primary flex items-center gap-2 ${
                  isExpanded ? "justify-center" : "justify-center"
                }`}
              >
                <Plus size={20} className="flex-shrink-0" />
                {isExpanded && <span>New Task</span>}
              </button>
            </Link>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border">
            {isExpanded ? (
              <p className="text-xs text-muted-foreground text-center font-medium">
                © 2026 StudyFlow
              </p>
            ) : (
              <div className="w-full h-px bg-border" />
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}