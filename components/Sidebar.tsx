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
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/hooks/useSidebar";

type SectionState = {
  tasks: boolean;
  assignments: boolean;
};

const IS_DEMO_MODE = true;

const SIDEBAR_STATE_KEY = "sidebar_sections_state";

export function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, toggleExpanded } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionsState, setSectionsState] = useState<SectionState>({
    tasks: true,
    assignments: true,
  });

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
  }, []);

  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  const toggleSection = useCallback((section: keyof SectionState) => {
    setSectionsState(prev => {
      const newState = { ...prev, [section]: !prev[section] };
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

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
      return { text: "Completed", color: "text-success" };
    }
    return { text: `${progress}%`, color: "text-accent" };
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/timeline") return pathname === "/timeline";
    if (href === "/create-task") return pathname === "/create-task";
    return false;
  };

  const staticNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/timeline", label: "Timeline", icon: BookOpen },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto bg-sidebar border-r border-border">
      <div className={`px-4 py-5 border-b border-border`}>
        <div className={`flex ${isExpanded ? "justify-start px-2" : "justify-center"}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <button
                onClick={() => (window.location.href = '/')}
                aria-label="Home"
                className="text-white font-bold text-sm hover:cursor-pointer"
              >
                SF
              </button>
            </div>
            {isExpanded && (
              <div className="transition-opacity duration-200">
                <h1 className="font-bold text-base text-foreground whitespace-nowrap">StudyFlow AI</h1>
                <p className="caption whitespace-nowrap">Learn better</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`px-4 py-2 ${isExpanded ? "" : "flex justify-center"}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpanded}
          className="w-full text-muted-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronLeft size={16} />
              <span>Collapse</span>
            </>
          ) : (
            <ChevronRightIcon size={16} />
          )}
        </Button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-4">
        <div className="space-y-0.5">
          {staticNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={closeMobile}>
                <button
                  className={`sidebar-link w-full ${active ? "active" : ""} ${!isExpanded && "justify-center px-0"}`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {isExpanded && <span>{item.label}</span>}
                </button>
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          <button
            onClick={() => toggleSection("tasks")}
            className={`sidebar-section-header ${
              isExpanded ? "justify-between" : "justify-center"
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckSquare size={18} className="flex-shrink-0 text-muted-foreground" />
              {isExpanded && (
                <span>
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

          <AnimatePresence>
            {sectionsState.tasks && isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="space-y-0.5 ml-2 overflow-hidden"
              >
                {isLoading ? (
                  <div className="px-3 py-2 metadata shimmer rounded">
                    &nbsp;
                  </div>
                ) : lessonTasks.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground italic">
                    No tasks yet
                  </div>
                ) : (
                  lessonTasks.map((task) => {
                    const activeTask = isTaskActive(task.id);
                    const progressInfo = getProgressDisplay(task.progress, task.status);
                    return (
                      <Link key={task.id} href={`/task/${task.id}`} onClick={closeMobile}>
                        <button
                          className={`sidebar-task-item ${activeTask ? "active" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <BookOpen size={14} className="flex-shrink-0 text-muted-foreground" />
                              <span className="text-sm font-medium truncate">{task.title}</span>
                            </div>
                            <span className={`text-xs font-semibold whitespace-nowrap ${progressInfo.color}`}>
                              {progressInfo.text}
                            </span>
                          </div>
                          {task.status !== "completed" && task.progress > 0 && (
                            <div className="mt-2">
                              <Progress value={task.progress} className="h-1" />
                            </div>
                          )}
                        </button>
                      </Link>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => toggleSection("assignments")}
            className={`sidebar-section-header ${
              isExpanded ? "justify-between" : "justify-center"
            }`}
          >
            <div className="flex items-center gap-3">
              <ListTodo size={18} className="flex-shrink-0 text-muted-foreground" />
              {isExpanded && (
                <span>
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

          <AnimatePresence>
            {sectionsState.assignments && isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="space-y-0.5 ml-2 overflow-hidden"
              >
                {isLoading ? (
                  <div className="px-3 py-2 metadata shimmer rounded">
                    &nbsp;
                  </div>
                ) : assignmentTasks.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground italic">
                    No assignments yet
                  </div>
                ) : (
                  assignmentTasks.map((task) => {
                    const activeTask = isTaskActive(task.id);
                    const progressInfo = getProgressDisplay(task.progress, task.status);
                    return (
                      <Link key={task.id} href={`/task/${task.id}`} onClick={closeMobile}>
                        <button
                          className={`sidebar-task-item ${activeTask ? "active" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText size={14} className="flex-shrink-0 text-muted-foreground" />
                              <span className="text-sm font-medium truncate">{task.title}</span>
                            </div>
                            <span className={`text-xs font-semibold whitespace-nowrap ${progressInfo.color}`}>
                              {progressInfo.text}
                            </span>
                          </div>
                          {task.status !== "completed" && task.progress > 0 && (
                            <div className="mt-2">
                              <Progress value={task.progress} className="h-1" />
                            </div>
                          )}
                        </button>
                      </Link>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <div className="px-4 py-3 border-t border-border">
        <Link href="/create-task" onClick={closeMobile}>
          <Button variant="default" className="w-full">
            <Plus size={18} />
            {isExpanded && <span>New Task</span>}
          </Button>
        </Link>
      </div>

      <div className="px-4 py-3 border-t border-border">
        {isExpanded ? (
          <div className="space-y-2">
            {IS_DEMO_MODE && (
              <Badge variant="accent" className="w-full justify-center py-1">
                <Sparkles size={10} className="mr-1" />
                Demo Mode
              </Badge>
            )}
            <p className="caption text-center font-medium">
              &copy; 2026 StudyFlow
            </p>
          </div>
        ) : (
          <div className="w-full h-px bg-border" />
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border shadow-sm hover:bg-secondary transition-all duration-200 active:scale-95"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop sidebar — rendered inside its container via DashboardLayout */}
      <div className="hidden lg:block h-full">{sidebarContent}</div>

      {/* Mobile sidebar — fixed overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed left-0 top-0 z-40 h-screen w-72 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
