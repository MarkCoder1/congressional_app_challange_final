"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
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
  ChevronDown,
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { Tooltip } from "@/components/ui/tooltip";
import { FirstTaskIntro } from "@/components/FirstTaskIntro";
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
import { 
  generateLearningStats, 
  generateUnderstandingFeedback,
  generateLearningReport,
  detectWeakAreas 
} from "@/lib/mockLearningData";
import type { LearningStats, UnderstandingFeedback, LearningReport } from "@/lib/mockLearningData";
import { VisualRenderer as NewVisualRenderer } from "@/components/VisualRenderer";
import { VisualRenderer as OldVisualRenderer } from "@/components/visuals/VisualRenderer";
import AssignmentWorkspace from "@/components/assignment/AssignmentWorkspace";
import { FloatingNotebook } from "@/components/floating-notebook";

import { LearningStatusCard } from "@/components/task-workspace/LearningStatusCard";
import { CompletionCelebration } from "@/components/task-workspace/CompletionCelebration";
import type { LearningStage, StageStatus, LessonProgressState, NextAction } from "@/components/task-workspace/types";

type TabType = "Learn" | "Practice" | "Master" | "Assignment";

const tabIcons: Record<TabType, LucideIcon> = {
  Learn: BookOpen,
  Practice: Zap,
  Master: Trophy,
  Assignment: FileText,
};

const tabDescriptions: Record<TabType, string> = {
  Learn: "Understand the concept with explanations and visual guides",
  Practice: "Test your knowledge with practice questions",
  Master: "Prove your mastery with a timed challenge",
  Assignment: "Complete your assignment work",
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
  not_started: "badge-default",
  in_progress: "badge-accent",
  completed: "badge-success",
};

function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="card-base overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary/50 transition-colors"
      >
        <span className="flex items-center gap-2">{icon} {title}</span>
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 fade-in-panel">
          {children}
        </div>
      )}
    </section>
  );
}

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
  const [showCompletion, setShowCompletion] = useState(false);
  const [learningReport, setLearningReport] = useState<LearningReport | null>(null);
  const lessonStartSentRef = useRef(!!initialTask.startedAt);
  const learnViewSentRef = useRef(!!initialTask.progressMeta?.learnCompleted);

  const [devMode, setDevMode] = useState(false);
  const [showFirstTaskIntro, setShowFirstTaskIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("studyflow_first_task_intro_seen");
  });

  const handleFirstTaskDismiss = useCallback(() => {
    localStorage.setItem("studyflow_first_task_intro_seen", "true");
    setShowFirstTaskIntro(false);
  }, []);

  useEffect(() => {
    if (task.status === "completed" && task.progress >= 100) {
      setShowCompletion(true);
    }
  }, [task]);

  const refreshTask = useCallback(async () => {
    const res = await fetch(`/api/tasks/${task.id}`);
    if (res.ok) {
      const updated = await res.json();
      setTask(updated);
    }
  }, [task.id]);

  const applyProgressUpdate = useCallback(async (updates: any) => {
    try {
      await updateTaskProgress(task.id, updates);
      await refreshTask();
    } catch (error) {
      console.error("[TaskWorkspaceClient] failed to update task progress", { error });
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
    if (action === "increase") { await applyProgressUpdate({ manualDelta: 10 }); return; }
    if (action === "decrease") { await applyProgressUpdate({ manualDelta: -10 }); return; }
    if (action === "complete") { await applyProgressUpdate({ markCompleted: true }); return; }
    await applyProgressUpdate({ reset: true });
  };

  const handlePracticeComplete = async (result: { 
    score: number; 
    weakAreas: string[];
    stats?: ReturnType<typeof generateLearningStats>;
    feedback?: ReturnType<typeof generateUnderstandingFeedback>;
  }) => {
    if (result.stats && result.feedback) {
      const report = generateLearningReport(
        result.stats,
        result.weakAreas,
        taskData.subject
      );
      setLearningReport(report);
    }
    
    await applyProgressUpdate({ 
      lessonEvent: "practice_completed", 
      lessonScore: result.score 
    });
  };

  const handleMasterComplete = async (result: { score: number; passed: boolean; weakAreas: string[] }) => {
    if (result.passed) {
      await applyProgressUpdate({ lessonEvent: "master_completed" });
    } else {
      await applyProgressUpdate({ lessonEvent: "master_failed", lessonScore: result.score });
      alert("Score below 80%. Please review the material and retry.");
    }
  };

  const progressMeta = task.progressMeta ?? {};
  const learnCompleted = !!progressMeta.learnCompleted;
  const practiceCompleted = !!progressMeta.practiceCompleted;
  const masterCompleted = !!progressMeta.masterCompleted;
  const isCompleted = task.status === "completed" || task.progress >= 100;

  const currentStage = (() => {
    if (isCompleted) return "Completed";
    if (!learnCompleted) return "Learn Mode";
    if (!practiceCompleted) return "Practice Mode";
    if (!masterCompleted) return "Master Mode";
    return "Completed";
  })();

  const lessonProgressState: LessonProgressState = {
    learnCompleted, practiceCompleted, masterCompleted,
    progress: task.progress ?? 0,
  };

  const buildStageStatuses = (): StageStatus[] => {
    const stages: LearningStage[] = ["Learn", "Practice", "Master"];
    if (hasAssignment) stages.push("Assignment");
    return stages.map((stage) => {
      let completed = false, current = false, locked = false;
      switch (stage) {
        case "Learn":
          completed = learnCompleted;
          current = activeTab === "Learn" && !learnCompleted;
          locked = false;
          break;
        case "Practice":
          completed = practiceCompleted;
          current = activeTab === "Practice" && !practiceCompleted;
          locked = !learnCompleted;
          break;
        case "Master":
          completed = masterCompleted;
          current = activeTab === "Master" && !masterCompleted;
          locked = !practiceCompleted;
          break;
        case "Assignment":
          completed = isCompleted;
          current = activeTab === "Assignment" && !isCompleted;
          locked = !masterCompleted && !isCompleted;
          break;
      }
      return { stage, completed, current, locked };
    });
  };

  const stageStatuses = buildStageStatuses();

  const completedActivities: string[] = [];
  const remainingActivities: string[] = [];
  if (learnCompleted) completedActivities.push("✓ Learn");
  else remainingActivities.push("Learn Mode");
  if (practiceCompleted) completedActivities.push("✓ Practice Questions");
  else remainingActivities.push("Practice Questions");
  if (masterCompleted) completedActivities.push("✓ Master Test");
  else remainingActivities.push("Master Test");
  if (hasAssignment && isCompleted) completedActivities.push("✓ Assignment");
  else if (hasAssignment) remainingActivities.push("Assignment");

  const getNextAction = (): NextAction | null => {
    if (isCompleted) return null;
    if (!learnCompleted) return { label: "Start by learning the concept", action: "Start Learning", targetTab: "Learn" };
    if (!practiceCompleted) return { label: "Complete Practice", action: "Continue Practice", targetTab: "Practice" };
    if (!masterCompleted) return { label: "Take Master Test", action: "Start Test", targetTab: "Master" };
    if (hasAssignment && !isCompleted) return { label: "Complete your assignment", action: "Open Assignment", targetTab: "Assignment" };
    return null;
  };

  const nextAction = getNextAction();

  const handleStageClick = (stage: LearningStage) => setActiveTab(stage as TabType);

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
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

  if (hasAssignment && assignment) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="border-b border-border bg-card px-4 sm:px-6 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-foreground">{task.title}</h1>
              <span className="badge-accent px-1 py-1 rounded-md">{task.subject}</span>
              <span className={`badge ${statusPillClassMap[task.status]} px-1 py-1 rounded-md`}>
                {statusLabelMap[task.status]}
              </span>
            </div>
            <div className="flex items-center gap-3 caption">
              <span className="flex items-center gap-1"><Calendar size={12} /> Due: —</span>
              <span className="flex items-center gap-1"><Clock size={12} /> 2h</span>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <AssignmentWorkspace
            assignment={assignment}
            taskId={task.id}
            taskProgress={task.progress}
            onTaskRefresh={refreshTask}
          />
        </div>
        <FloatingNotebook taskId={task.id} taskTitle={task.title} />
      </div>
    );
  }

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

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CompletionCelebration
          progress={task.progress}
          timeSpent={task.startedAt && task.completedAt
            ? `${Math.round((new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()) / 3600000)} hours`
            : "~2 hours"
          }
          accuracy={learningReport?.score || 85}
          completedSections={completedActivities}
          onBackToDashboard={() => window.location.href = "/"}
          learningReport={learningReport || undefined}
        />
      </div>
    );
  }

  const lessonTabs: TabType[] = ["Learn", "Practice", "Master"];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={staggerItem} className="card-base p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-1 min-w-0">
                    <h1
                      className="text-xl sm:text-2xl font-bold text-foreground truncate cursor-default select-none"
                      onDoubleClick={() => setDevMode((p) => !p)}
                      title={devMode ? "Dev mode active" : undefined}
                    >
                      {taskData.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="badge-accent px-2 py-1 rounded-md">{taskData.subject}</span>
                      <span className={`badge-accent px-2 py-1 rounded-md`}>
                        {statusLabelMap[task.status]}
                      </span>
                      {currentStage !== "Completed" && (
                        <span className="badge-accent px-1 py-1 rounded-md">{currentStage}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 caption">
                  {task.deadline && task.deadline !== "TBD" && task.deadline !== "null" && (() => { const d = new Date(task.deadline); return isValidDate(d) ? (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  ) : null; })()}
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    2h
                  </span>
                </div>
              </div>
            </motion.div>

          {showFirstTaskIntro && (
            <motion.div variants={staggerItem}>
              <FirstTaskIntro onDismiss={handleFirstTaskDismiss} />
            </motion.div>
          )}

        <div className="border-b border-border mb-6">
          <div className="flex overflow-x-auto gap-1 scrollbar-none">
            {lessonTabs.map((tab) => {
              const IconComponent = tabIcons[tab];
              const isActive = activeTab === tab;
              const stageInfo = stageStatuses.find(s => s.stage === tab);
              const isLocked = stageInfo?.locked ?? false;
              const isStageCompleted = stageInfo?.completed ?? false;

              return (
                <Tooltip
                  key={tab}
                  content={isLocked ? "Complete previous stage first" : tabDescriptions[tab]}
                  side="bottom"
                >
                  <button
                    onClick={() => !isLocked && setActiveTab(tab)}
                    disabled={isLocked}
                    className={`tab-button ${isActive ? "active" : ""} ${isStageCompleted && !isActive ? "text-success" : ""}`}
                  >
                    <IconComponent size={15} />
                    <span>{tab}</span>
                    {isStageCompleted && <CheckCircle2 size={13} className="text-success" />}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 lg:self-start space-y-4">
            <LearningStatusCard
              progressState={lessonProgressState}
              completedActivities={completedActivities}
              remainingActivities={remainingActivities}
              nextAction={nextAction}
              estimatedMinutes={120}
              onProgressAction={handleManualProgressAction}
              onStartAction={handleStageClick}
            />

            {devMode && (
              <div className="card-base p-3 border-dashed border-warning/30">
                <p className="uppercase-label text-warning mb-2">Dev Tools</p>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => handleManualProgressAction("increase")} className="btn-sm btn-secondary">+10%</button>
                  <button onClick={() => handleManualProgressAction("decrease")} className="btn-sm btn-secondary">-10%</button>
                  <button onClick={() => handleManualProgressAction("complete")} className="btn-sm btn-danger">Complete</button>
                  <button onClick={() => handleManualProgressAction("reset")} className="btn-sm btn-ghost text-destructive">Reset</button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === "Learn" && (
                <motion.div
                  key="learn"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <div className="bg-accent/5 rounded-xl p-5 border border-accent/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap className="w-5 h-5 text-accent" />
                          <span className="uppercase-label text-accent">Learning Module</span>
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">{task.title}</h2>
                        <p className="caption max-w-2xl">{learningContent.overview}</p>
                      </div>
                      <div className="hidden lg:block">
                        <Brain className="w-12 h-12 text-accent/20" />
                      </div>
                    </div>
                  </div>

                  <section className="card-base overflow-hidden">
                    <div className="px-4 py-3 text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border">
                      <Eye size={15} /> Visual Concept Map
                    </div>
                    <div className="p-4">
                      {task.visualData ? (
                        <div className="w-full min-h-75">
                          <NewVisualRenderer data={task.visualData} />
                        </div>
                      ) : hasLearningMaps ? (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {mapOptions.map((mapOption) => (
                              <button
                                key={mapOption.id}
                                onClick={() => setSelectedPresetId(mapOption.id)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                  selectedPresetId === mapOption.id
                                    ? "btn-primary btn-sm"
                                    : "btn-secondary btn-sm"
                                }`}
                              >
                                {mapOption.icon} {mapOption.label}
                              </button>
                            ))}
                          </div>
                          {selectedMap && selectedVisualType ? (
                            <OldVisualRenderer data={selectedMap.data} />
                          ) : (
                            <p className="caption">Select a map to view the visualization.</p>
                          )}
                        </div>
                      ) : (
                        <p className="caption">No visualization available for this topic.</p>
                      )}
                    </div>
                  </section>

                  {learningContent.keyPoints && learningContent.keyPoints.length > 0 && (
                    <CollapsibleSection
                      title="Key Points"
                      icon={<Target size={15} />}
                      defaultOpen={false}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                        {learningContent.keyPoints.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50">
                            <CheckCircle2 size={14} className="text-accent shrink-0 mt-0.5" />
                            <p className="text-sm text-foreground/80">{point}</p>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}

                  {learningContent.example && (
                    <CollapsibleSection
                      title="Example"
                      icon={<Lightbulb size={15} />}
                      defaultOpen={false}
                    >
                      <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 mt-1">
                        <p className="text-sm text-foreground/80 leading-relaxed">{learningContent.example}</p>
                      </div>
                    </CollapsibleSection>
                  )}

                  {learningContent.steps && learningContent.steps.length > 0 && (
                    <CollapsibleSection
                      title="Step by Step"
                      icon={<ListChecks size={15} />}
                      defaultOpen={false}
                    >
                      <div className="space-y-2 mt-1">
                        {learningContent.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                            <div className="shrink-0 w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </div>
                            <p className="text-sm text-foreground/80">{step}</p>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}

                  {learningContent.proTip && (
                    <CollapsibleSection
                      title="Pro Tip"
                      icon={<Sparkles size={15} />}
                      defaultOpen={false}
                    >
                      <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 mt-1">
                        <p className="text-sm text-warning">{learningContent.proTip}</p>
                      </div>
                    </CollapsibleSection>
                  )}

                  <div className="text-center caption pt-2">
                    Keep exploring — you're making progress!
                  </div>
                </motion.div>
              )}

              {activeTab === "Practice" && (
                <motion.div
                  key="practice"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {!hasPracticeQuestions ? (
                    <div className="card-base">
                    <EmptyState
                      icon={<Zap size={32} />}
                      title="Practice questions coming soon"
                      description="Start with the Learn section first. Practice questions will be generated based on what you learn."
                    />
                    </div>
                  ) : (
                    <PracticeMode
                      questions={practiceQuestions}
                      subject={taskData.subject}
                      onComplete={handlePracticeComplete}
                    />
                  )}
                </motion.div>
              )}

              {activeTab === "Master" && (
                <motion.div
                  key="master"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {!hasMasterQuestions ? (
                    <div className="card-base">
                    <EmptyState
                      icon={<Trophy size={32} />}
                      title="Mastery challenge locked"
                      description="Complete the Practice section to unlock the Mastery challenge and prove your understanding."
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
        </div>
        <FloatingNotebook taskId={task.id} taskTitle={task.title} />
      </div>
    </PageTransition>
  );
}

function isValidDate(d: Date): boolean {
  return d instanceof Date && !isNaN(d.getTime());
}
