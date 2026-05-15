// /app/task/[id]/TaskWorkspaceClient.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  BookOpen,
  Zap,
  Trophy,
  Clock,
  Calendar,
  Lightbulb,
  Target,
  CheckCircle2,
  ListChecks,
  GraduationCap,
  Sparkles,
  Brain,
  FileText,
  Eye,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PracticeMode } from "@/components/practice-mode";
import { MasterMode } from "@/components/master-mode";
import { EmptyState } from "@/components/EmptyState";
import {
  subjectPresets,
  PresetType,
} from "@/lib/learningMapPresets";
import { Subject } from "@/lib/types";
import { Task, AssignmentContent } from "@/types/task";
import { TaskProgressUpdateInput } from "@/lib/progress/taskProgressEngine";
import { updateTaskProgress } from "@/lib/progress/updateTaskProgress";
// NEW visual renderer (for AI-generated visuals) – expects only `data`
import { VisualRenderer as NewVisualRenderer } from "@/components/VisualRenderer";
// OLD visual renderer (for legacy learningMaps) – expects `type` and `data`
import { VisualRenderer as OldVisualRenderer } from "@/components/visuals/VisualRenderer";
import AssignmentWorkspace from "@/components/assignment/AssignmentWorkspace";

type TabType = "Learn" | "Practice" | "Master" | "Assignment";

const tabIcons: Record<TabType, LucideIcon> = {
  Learn: BookOpen,
  Practice: Zap,
  Master: Trophy,
  Assignment: FileText,
};

interface TaskWorkspaceClientProps {
  initialTask: Task;
  assignment: AssignmentContent | null;
  hasAssignment: boolean;
}

const statusLabelMap: Record<Task["status"], string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

const statusPillClassMap: Record<Task["status"], string> = {
  not_started: "bg-secondary text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

export default function TaskWorkspaceClient({
  initialTask,
  assignment,
  hasAssignment,
}: TaskWorkspaceClientProps) {
  const [task, setTask] = useState<Task>(initialTask);
  const [activeTab, setActiveTab] = useState<TabType>(
    hasAssignment ? "Assignment" : "Learn",
  );
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const lessonStartSentRef = useRef(!!initialTask.startedAt);
  const learnViewSentRef = useRef(!!initialTask.progressMeta?.learnCompleted);

  useEffect(() => {
    console.log("[TaskWorkspaceClient] mounted", {
      taskId: initialTask.id,
      title: initialTask.title,
      subject: initialTask.subject,
      hasAssignment,
      hasVisualData: !!initialTask.visualData,
      visualType: initialTask.visualData?.type,
    });
  }, [hasAssignment, initialTask]);

  useEffect(() => {
    console.log("[TaskWorkspaceClient] task state changed", {
      taskId: task.id,
      title: task.title,
      progress: task.progress,
      hasVisualData: !!task.visualData,
      visualType: task.visualData?.type,
      learningMapCount: task.learningMaps?.length ?? 0,
      practiceCount: task.practice?.length ?? 0,
      masterCount: task.master?.length ?? 0,
    });

    lessonStartSentRef.current = !!task.startedAt;
    learnViewSentRef.current = !!task.progressMeta?.learnCompleted;
  }, [task]);

  useEffect(() => {
    console.log("[TaskWorkspaceClient] active tab changed", {
      taskId: task.id,
      activeTab,
      hasAssignment,
    });
  }, [activeTab, hasAssignment, task.id]);

  const refreshTask = useCallback(async () => {
    console.log("[TaskWorkspaceClient] refreshing task from API", { taskId: task.id });
    const res = await fetch(`/api/tasks/${task.id}`);
    if (res.ok) {
      const updated = await res.json();
      console.log("[TaskWorkspaceClient] task refresh completed", {
        taskId: task.id,
        status: res.status,
        hasVisualData: !!updated?.visualData,
        visualType: updated?.visualData?.type,
      });
      setTask(updated);
    } else {
      console.warn("[TaskWorkspaceClient] task refresh failed", {
        taskId: task.id,
        status: res.status,
      });
    }
  }, [task.id]);

  const applyProgressUpdate = useCallback(async (updates: TaskProgressUpdateInput) => {
    try {
      await updateTaskProgress(task.id, updates);
      await refreshTask();
    } catch (error) {
      console.error("[TaskWorkspaceClient] failed to update task progress", {
        taskId: task.id,
        updates,
        error,
      });
    }
  }, [refreshTask, task.id]);

  useEffect(() => {
    if (task.type !== "lesson") return;
    if (activeTab !== "Learn") return;
    if (task.startedAt || lessonStartSentRef.current) return;

    lessonStartSentRef.current = true;
    applyProgressUpdate({ lessonEvent: "learn_entered" });
  }, [activeTab, applyProgressUpdate, task.startedAt, task.type]);

  useEffect(() => {
    if (task.type !== "lesson") return;
    if (activeTab !== "Learn") return;
    if (task.progressMeta?.learnCompleted || learnViewSentRef.current) return;

    learnViewSentRef.current = true;
    applyProgressUpdate({ lessonEvent: "learn_viewed" });
  }, [activeTab, applyProgressUpdate, task.progressMeta?.learnCompleted, task.type]);

  const handleManualProgressAction = async (
    action: "increase" | "decrease" | "complete" | "reset",
  ) => {
    if (action === "increase") {
      await applyProgressUpdate({ manualDelta: 10 });
      return;
    }

    if (action === "decrease") {
      await applyProgressUpdate({ manualDelta: -10 });
      return;
    }

    if (action === "complete") {
      await applyProgressUpdate({ markCompleted: true });
      return;
    }

    await applyProgressUpdate({ reset: true });
  };

  const handlePracticeComplete = async (result: { score: number; weakAreas: string[] }) => {
    console.log("[TaskWorkspaceClient] practice completed", {
      taskId: task.id,
      score: result.score,
      weakAreas: result.weakAreas,
    });
    await applyProgressUpdate({
      lessonEvent: "practice_completed",
      lessonScore: result.score,
    });
  };

  const handleMasterComplete = async (result: { score: number; passed: boolean; weakAreas: string[] }) => {
    console.log("[TaskWorkspaceClient] master completed", {
      taskId: task.id,
      score: result.score,
      passed: result.passed,
      weakAreas: result.weakAreas,
    });
    if (result.passed) {
      console.log("[TaskWorkspaceClient] master passed, marking task complete", {
        taskId: task.id,
      });
      await applyProgressUpdate({
        lessonEvent: "master_completed",
      });
    } else {
      await applyProgressUpdate({
        lessonEvent: "master_failed",
        lessonScore: result.score,
      });
      alert("Score below 80%. Please review the material and retry.");
    }
  };

  // Guard: only if task is completely missing
  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-sm">
          <EmptyState
            icon={<BookOpen size={32} />}
            title="No task found"
            description="No task found"
            actionLabel="Back to Dashboard"
            actionHref="/"
          />
        </div>
      </div>
    );
  }

  // Show only Assignment UI if this is an assignment task (no Learn/Practice/Master)
  if (hasAssignment && assignment) {
    // Override tabs to show only Assignment
    const assignmentOnlyTabs = ["Assignment"] as const;
    const isAssignmentTab = activeTab === "Assignment";

    return (
      <div className="h-full flex flex-col lg:flex-row bg-background">
        {/* LEFT PANEL - Task Overview */}
        <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border bg-card p-6 flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold mb-3 text-foreground">{task.title}</h1>
            <div className="inline-block mb-4">
              <span className="px-3 py-1.5 bg-accent/10 text-accent font-semibold text-sm rounded-lg">
                {task.subject}
              </span>
            </div>
            <div className="mb-4">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusPillClassMap[task.status]}`}>
                {statusLabelMap[task.status]}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={16} />
                <span>Due: { }</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={16} />
                <span>Estimated: 2 hours</span>

              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{task.progress}% Complete</span>
              <span className="text-sm font-semibold text-accent">{task.progress}%</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${task.progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {task.completedAt
                ? `Completed ${new Date(task.completedAt).toLocaleDateString()}`
                : task.startedAt
                  ? `Started ${new Date(task.startedAt).toLocaleDateString()}`
                  : "Not started yet"}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button onClick={() => handleManualProgressAction("increase")} className="text-xs px-2 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                +10%
              </button>
              <button onClick={() => handleManualProgressAction("decrease")} className="text-xs px-2 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                -10%
              </button>
              <button onClick={() => handleManualProgressAction("complete")} className="text-xs px-2 py-1.5 rounded-md bg-green-100 text-green-700 hover:opacity-90 transition-opacity">
                Mark Complete
              </button>
              <button onClick={() => handleManualProgressAction("reset")} className="text-xs px-2 py-1.5 rounded-md bg-red-100 text-red-700 hover:opacity-90 transition-opacity">
                Reset
              </button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
          <button className="btn-primary w-full flex items-center justify-center gap-2 mt-auto">
            <Play size={18} /> Start Assignment
          </button>
        </div>

        {/* RIGHT PANEL - Assignment Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-border bg-card">
            <div className="flex overflow-x-auto p-6 gap-2">
              {assignmentOnlyTabs.map((tab) => {
                const IconComponent = tabIcons[tab];
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tab-button flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${isActive
                      ? "active bg-accent text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                  >
                    <IconComponent size={18} />
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6">
            {isAssignmentTab && (
              <AssignmentWorkspace
                assignment={assignment}
                taskId={task.id}
                taskProgress={task.progress}
                onTaskRefresh={refreshTask}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----- LESSON (original) UI -----
  const taskData = {
    id: task.id,
    title: task.title,
    subject: (task.subject || "General") as Subject,
    deadline: task.deadline,
    progress: task.progress ?? 0,
    description: task.description || "",
  };

  const practiceQuestions = task.practice ?? [];
  const masterQuestions = task.master ?? [];
  const taskMaps = task.learningMaps ?? [];
  const subjectPresetOptions = subjectPresets[task.subject as Subject] ?? [];
  const mapOptions = subjectPresetOptions.filter((presetOption) =>
    taskMaps.some((taskMap) => taskMap.presetId === presetOption.id)
  );
  const selectedMap = taskMaps.find((map) => map.presetId === selectedPresetId) ?? taskMaps[0];
  const selectedMapOption = mapOptions.find((mapOption) => mapOption.id === selectedMap?.presetId);
  const selectedVisualType = (selectedMap?.type ?? selectedMapOption?.type) as PresetType | undefined;
  const hasLearningMaps = taskMaps.length > 0;
  const hasPracticeQuestions = practiceQuestions.length > 0;
  const hasMasterQuestions = masterQuestions.length > 0;

  const learningContent = task.learningContent ?? {
    overview: "No overview available.",
    keyPoints: [],
    example: "No example provided.",
    steps: [],
  };

  console.log("TASK DEADLINE VALUE:", task.deadline);

  // Only show Learn/Practice/Master tabs (no Assignment)
  const lessonTabs = ["Learn", "Practice", "Master"] as const;

  const handleTabChange = (tab: TabType) => {
    console.log("[TaskWorkspaceClient] tab change requested", {
      taskId: task.id,
      from: activeTab,
      to: tab,
    });
    setActiveTab(tab);
  };

  console.log("TaskWorkspaceClient visualData:", task.visualData);
  console.log("[TaskWorkspaceClient] render summary", {
    taskId: task.id,
    activeTab,
    hasVisualData: !!task.visualData,
    visualType: task.visualData?.type,
    hasLearningMaps,
    selectedPresetId,
    selectedMapId: selectedMap?.presetId,
  });

  return (
    <div className="h-full flex flex-col lg:flex-row bg-background">
      {/* LEFT PANEL - unchanged */}
      <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border bg-card p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-3 text-foreground">{taskData.title}</h1>
          <div className="inline-block mb-4">
            <span className="px-3 py-1.5 bg-accent/10 text-accent font-semibold text-sm rounded-lg">
              {taskData.subject}
            </span>
          </div>
          <div className="mb-4">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusPillClassMap[task.status]}`}>
              {statusLabelMap[task.status]}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            {/* Deadline Display */}
            {/* Deadline Display - Safe Version */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={16} />
              {task.deadline && task.deadline !== "TBD" && task.deadline !== "null" ? (
                (() => {
                  const dueDate = new Date(task.deadline);
                  const isValid = !isNaN(dueDate.getTime());
                  const isOverdue = isValid && dueDate < new Date();

                  return (
                    <span>
                      Due{" "}
                      <span className={`font-medium ${isOverdue ? "text-red-600" : "text-foreground"}`}>
                        {isValid
                          ? dueDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                          : "Invalid Date"
                        }
                      </span>
                      {isValid && task.deadline.includes("T") && (
                        <span className="text-xs ml-1">
                          • {dueDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </span>
                      )}
                    </span>
                  );
                })()
              ) : (
                <span>No deadline set</span>
              )}
            </div>

            {/* Estimated Time */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} />
              <span>Estimated: 2 hours</span>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{taskData.progress}% Complete</span>
            <span className="text-sm font-semibold text-accent">{taskData.progress}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${taskData.progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {task.completedAt
              ? `Completed ${new Date(task.completedAt).toLocaleDateString()}`
              : task.startedAt
                ? `Started ${new Date(task.startedAt).toLocaleDateString()}`
                : "Not started yet"}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button onClick={() => handleManualProgressAction("increase")} className="text-xs px-2 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
              +10%
            </button>
            <button onClick={() => handleManualProgressAction("decrease")} className="text-xs px-2 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
              -10%
            </button>
            <button onClick={() => handleManualProgressAction("complete")} className="text-xs px-2 py-1.5 rounded-md bg-green-100 text-green-700 hover:opacity-90 transition-opacity">
              Mark Complete
            </button>
            <button onClick={() => handleManualProgressAction("reset")} className="text-xs px-2 py-1.5 rounded-md bg-red-100 text-red-700 hover:opacity-90 transition-opacity">
              Reset
            </button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{taskData.description}</p>
        <button className="btn-primary w-full flex items-center justify-center gap-2 mt-auto">
          <Play size={18} /> Start Focus Mode
        </button>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-card">
          <div className="flex overflow-x-auto p-6 gap-2">
            {lessonTabs.map((tab) => {
              const IconComponent = tabIcons[tab];
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`tab-button flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${isActive
                    ? "active bg-accent text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                >
                  <IconComponent size={18} />
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {activeTab === "Learn" && (
            <div className="p-6 space-y-6 fade-in-panel">
              {/* Hero Banner */}
              <div className="bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-6 h-6 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Learning Module</span>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{task.title}</h1>
                    <p className="text-muted-foreground text-sm max-w-2xl">{learningContent.overview}</p>
                  </div>
                  <div className="hidden lg:block">
                    <Brain className="w-16 h-16 text-primary/20" />
                  </div>
                </div>
              </div>

              {/* Key Points Grid */}
              {learningContent.keyPoints && learningContent.keyPoints.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Target size={20} /> Key Points
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {learningContent.keyPoints.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                        <CheckCircle2 size={18} className="text-accent shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground/80">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Example Card */}
              {learningContent.example && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Lightbulb size={20} /> Example
                  </h2>
                  <div className="p-5 rounded-xl bg-accent/5 border border-accent/20">
                    <p className="text-sm text-foreground/80 leading-relaxed">{learningContent.example}</p>
                  </div>
                </div>
              )}

              {/* Steps Timeline */}
              {learningContent.steps && learningContent.steps.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <ListChecks size={20} /> Step by Step
                  </h2>
                  <div className="space-y-3">
                    {learningContent.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                        <div className="shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-foreground/80">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Tip */}
              {learningContent.proTip && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Sparkles size={20} /> Pro Tip
                  </h2>
                  <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">💡 {learningContent.proTip}</p>
                  </div>
                </div>
              )}

              {/* Visual Learning System */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Eye size={20} /> Visual Concept Map
                </h2>
                <div className="rounded-xl border border-border bg-card p-4">
                  {task.visualData ? (
                    <div className="w-full min-h-75">
                      <NewVisualRenderer data={task.visualData} />
                    </div>
                  ) : hasLearningMaps ? (
                    <div className="space-y-4">
                      {/* Map selector buttons */}
                      <div className="flex flex-wrap gap-2">
                        {mapOptions.map((mapOption) => (
                          <button
                            key={mapOption.id}
                            onClick={() => setSelectedPresetId(mapOption.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedPresetId === mapOption.id
                              ? "bg-accent text-white shadow-md"
                              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                              }`}
                          >
                            {mapOption.icon} {mapOption.label}
                          </button>
                        ))}
                      </div>
                      {/* Old visual renderer */}
                      {selectedMap && selectedVisualType ? (
                        <OldVisualRenderer data={selectedMap.data} />
                      ) : (
                        <p className="text-sm text-muted-foreground">Select a map to view the visualization.</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No visualization available for this topic.</p>
                  )}
                </div>
              </div>

              {/* Progress Indicator (optional) */}
              <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
                Keep exploring – you’re making progress!
              </div>
            </div>
          )}
          {activeTab === "Practice" && (
            <div className="p-6 fade-in-panel">
              {!hasPracticeQuestions ? (
                <div className="bg-card border border-border rounded-xl shadow-sm">
                  <EmptyState
                    icon={<Zap size={32} />}
                    title="No data available for this section"
                    description="This task does not include practice questions yet."
                  />
                </div>
              ) : (
                <PracticeMode
                  questions={practiceQuestions}
                  subject={taskData.subject}
                  onComplete={handlePracticeComplete}
                />
              )}
            </div>
          )}
          {activeTab === "Master" && (
            <div className="p-6 fade-in-panel">
              {!hasMasterQuestions ? (
                <div className="bg-card border border-border rounded-xl shadow-sm">
                  <EmptyState
                    icon={<Trophy size={32} />}
                    title="No data available for this section"
                    description="This task does not include master questions yet."
                  />
                </div>
              ) : (
                <MasterMode
                  questions={masterQuestions}
                  subject={taskData.subject}
                  timeLimit={30}
                  onComplete={handleMasterComplete}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}