"use client";

import { useState, useMemo } from "react";
import {
  GraduationCap,
  Calendar,
  Clock,
  Target,
  ListChecks,
  BookOpen,
  ScanSearch,
  Route,
  Repeat,
  FileQuestion,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { FloatingNotebook } from "@/components/floating-notebook";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ExamContent, ExamTopic, Task } from "@/types/task";
import { ExamDiagnosticPanel } from "./ExamDiagnosticPanel";
import { AdaptiveOverview } from "@/components/adaptive/AdaptiveOverview";
import { AdaptivePracticePanel } from "@/components/adaptive/AdaptivePracticePanel";
import { StudyPlanPanel } from "./StudyPlanPanel";
import { ReviewPanel } from "./ReviewPanel";
import { MockTestPanel } from "./MockTestPanel";
import { ResultsPanel } from "./ResultsPanel";
import { LearnPanel } from "./LearnPanel";

export type ExamSection =
  | "overview"
  | "topics"
  | "diagnostic"
  | "study-plan"
  | "learn"
  | "practice"
  | "review"
  | "mock-exam"
  | "results";

const SECTIONS: { key: ExamSection; label: string; icon: typeof BookOpen }[] = [
  { key: "overview", label: "Overview", icon: Route },
  { key: "topics", label: "Topics", icon: ListChecks },
  { key: "diagnostic", label: "Diagnostic", icon: ScanSearch },
  { key: "study-plan", label: "Study Plan", icon: BookOpen },
  { key: "learn", label: "Learn", icon: BookOpen },
  { key: "practice", label: "Practice", icon: Target },
  { key: "review", label: "Review", icon: Repeat },
  { key: "mock-exam", label: "Mock Exam", icon: FileQuestion },
  { key: "results", label: "Results", icon: BarChart3 },
];

const ACTIVE_SECTIONS: ExamSection[] = ["overview", "topics", "diagnostic", "study-plan", "learn", "practice", "review", "mock-exam", "results"];

// ── Days remaining helpers ──
type DaysRemaining =
  | { kind: "today"; label: string }
  | { kind: "count"; days: number; label: string }
  | { kind: "past"; label: string }
  | { kind: "missing"; label: string };

function getDaysRemaining(examDate?: string): DaysRemaining {
  if (!examDate) return { kind: "missing", label: "Exam date not set" };
  const exam = new Date(examDate + "T00:00:00");
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = exam.getTime() - todayStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

  if (diffDays < 0) return { kind: "past", label: "Exam date has passed" };
  if (diffDays === 0) return { kind: "today", label: "Exam is today" };
  if (diffDays === 1) return { kind: "count", days: 1, label: "1 day remaining" };
  return { kind: "count", days: diffDays, label: `${diffDays} days remaining` };
}

function formatExamDate(examDate?: string): string {
  if (!examDate) return "";
  const d = new Date(examDate + "T00:00:00");
  if (isNaN(d.getTime())) return examDate;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ExamPreparationWorkspace({ task }: { task: Task }) {
  const [activeSection, setActiveSection] = useState<ExamSection>("overview");
  const [examContent, setExamContent] = useState<ExamContent>(() => ({
    ...(task.examContent ?? {
      topics: [],
      preparationProgress: 0,
    }),
  }));
  const [learnTopicId, setLearnTopicId] = useState<string | undefined>(undefined);

  const examDate = examContent.examDate;
  const topics = examContent.topics ?? [];
  const preparationProgress = examContent.preparationProgress ?? 0;
  const days = useMemo(() => getDaysRemaining(examDate), [examDate]);

  const daysBadge = () => {
    if (days.kind === "missing") {
      return (
        <span className="badge-muted rounded-md px-2 py-1">{days.label}</span>
      );
    }
    if (days.kind === "past") {
      return (
        <span className="badge-destructive rounded-md px-2 py-1">{days.label}</span>
      );
    }
    if (days.kind === "today") {
      return (
        <span className="badge-warning rounded-md px-2 py-1">{days.label}</span>
      );
    }
    return (
      <span className="badge-accent rounded-md px-2 py-1">{days.label}</span>
    );
  };

  const handleNavigateToLearn = (topicId: string) => {
    setLearnTopicId(topicId);
    setActiveSection("learn");
  };
  const handleNavigateToPractice = (topicId: string) => {
    try {
      localStorage.setItem(`studyflow:exam:${task.id}:nextTopic`, topicId);
    } catch {}
    setActiveSection("practice");
  };
  const handleNavigateToReview = (topicId: string) => {
    try {
      localStorage.setItem(`studyflow:exam:${task.id}:nextTopic`, topicId);
    } catch {}
    setActiveSection("review");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          {/* Header */}
          <div className="card-base p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary">
                  <GraduationCap size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">
                      {task.title}
                    </h1>
                    <span className="badge-accent rounded-md px-2 py-1">
                      Exam Preparation
                    </span>
                  </div>
                  <p className="caption mt-1.5">{task.subject}</p>
                </div>
              </div>

              <div className="flex flex-row flex-wrap items-center gap-x-5 gap-y-3 lg:justify-end">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">
                    {formatExamDate(examDate) || "Exam date not set"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted-foreground" />
                  {daysBadge()}
                </div>
              </div>
            </div>

            {/* Preparation progress */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="uppercase-label text-primary">Preparation</p>
                <span className="text-sm font-semibold text-primary">
                  {preparationProgress}%
                </span>
              </div>
              <Progress value={preparationProgress} />
            </div>
          </div>

          {/* Navigation */}
          <nav
            className="mt-6 overflow-x-auto border-b border-border"
            aria-label="Exam preparation sections"
          >
            <div className="flex min-w-max gap-1 pb-px">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.key;
                const isAvailable = ACTIVE_SECTIONS.includes(section.key);
                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => isAvailable && setActiveSection(section.key)}
                    disabled={!isAvailable}
                    className={`flex items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? "border-primary text-primary"
                        : isAvailable
                          ? "border-transparent text-muted-foreground hover:text-foreground"
                          : "border-transparent text-muted-foreground/50"
                    }`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <Icon size={15} />
                    <span>{section.label}</span>
                    {!isAvailable && (
                      <span className="text-[10px] uppercase tracking-wide opacity-60">
                        soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="mt-6 min-w-0">
            {activeSection === "overview" && (
              <OverviewSection
                examDate={examDate}
                topics={topics}
                preparationProgress={preparationProgress}
                diagnostic={examContent.diagnostic}
                adaptive={examContent.adaptive}
                studyPlan={examContent.studyPlan}
                mockTest={examContent.mockTest}
                mockTestHistory={examContent.mockTestHistory}
                onNavigate={setActiveSection}
              />
            )}
            {activeSection === "topics" && (
              <TopicsSection
                topics={topics}
                adaptive={examContent.adaptive}
                studyPlan={examContent.studyPlan}
                onNavigate={setActiveSection}
                onLearn={handleNavigateToLearn}
                onPractice={handleNavigateToPractice}
                onReview={handleNavigateToReview}
              />
            )}
            {activeSection === "diagnostic" && (
              <ExamDiagnosticPanel
                examContent={examContent}
                taskId={task.id}
                subject={task.subject}
                onExamContent={setExamContent}
              />
            )}
            {activeSection === "practice" && (
              <AdaptivePracticePanel
                task={task}
                examContent={examContent}
                onExamContent={setExamContent}
              />
            )}
            {activeSection === "study-plan" && (
              <StudyPlanPanel
                task={task}
                examContent={examContent}
                onExamContent={setExamContent}
                onNavigate={(section) => setActiveSection(section as ExamSection)}
                onLearnTopic={handleNavigateToLearn}
              />
            )}
            {activeSection === "learn" && (
              <LearnPanel
                task={task}
                examContent={examContent}
                onExamContent={setExamContent}
                initialTopicId={learnTopicId}
                onContinueToPractice={(topicId) => handleNavigateToPractice(topicId)}
              />
            )}
            {activeSection === "review" && (
              <ReviewPanel
                task={task}
                examContent={examContent}
                onExamContent={setExamContent}
              />
            )}
            {activeSection === "mock-exam" && (
              <MockTestPanel
                examContent={examContent}
                taskId={task.id}
                subject={task.subject}
                onExamContent={setExamContent}
              />
            )}
            {activeSection === "results" && (
              <ResultsPanel
                examContent={examContent}
                taskId={task.id}
                onRetakeMock={() => setActiveSection("mock-exam")}
                onNavigate={setActiveSection}
                onPracticeTopic={handleNavigateToPractice}
                onReviewTopic={handleNavigateToReview}
              />
            )}
            {!ACTIVE_SECTIONS.includes(activeSection) && (
              <div className="card-base p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                  <GraduationCap size={24} />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  Coming soon
                </h2>
                <p className="caption mx-auto mt-2 max-w-md">
                  This section will be available in a future phase of Exam
                  Preparation.
                </p>
              </div>
            )}
          </div>
        </div>
        <FloatingNotebook taskId={task.id} taskTitle={task.title} />
      </div>
    </PageTransition>
  );
}

function OverviewSection({
  examDate,
  topics,
  preparationProgress,
  diagnostic,
  adaptive,
  studyPlan,
  mockTest,
  mockTestHistory,
  onNavigate,
}: {
  examDate?: string;
  topics: ExamTopic[];
  preparationProgress: number;
  diagnostic?: ExamContent["diagnostic"];
  adaptive?: ExamContent["adaptive"];
  studyPlan?: ExamContent["studyPlan"];
  mockTest?: ExamContent["mockTest"];
  mockTestHistory?: ExamContent["mockTestHistory"];
  onNavigate: (section: ExamSection) => void;
}) {
  const completed = diagnostic?.status === "completed";
  const score = diagnostic?.result ? diagnostic.result.overallScore : undefined;
  const today = new Date().toISOString().split("T")[0];
  const todaySessions = studyPlan?.sessions.filter((s) => s.date === today) ?? [];
  const dueReviews = studyPlan?.reviews.filter((r) => r.nextReviewAt && r.nextReviewAt <= today) ?? [];
  const recentMocks = mockTestHistory?.slice(-2).reverse() ?? (mockTest?.result ? [mockTest] : []);

  // Readiness breakdown from adaptive or diagnostic
  const readiness = (() => {
    if (adaptive && Object.keys(adaptive.topics).length > 0) {
      const all = Object.values(adaptive.topics);
      const byLevel = {
        Mastered: all.filter((t) => t.masteryLevel === "Mastered").length,
        Strong: all.filter((t) => t.masteryLevel === "Strong").length,
        Developing: all.filter((t) => t.masteryLevel === "Developing").length,
        "Needs Review": all.filter((t) => t.masteryLevel === "Needs Review").length,
      };
      const notAssessed = topics.length - all.length;
      return { ...byLevel, NotAssessed: notAssessed > 0 ? notAssessed : 0, total: topics.length };
    }
    if (diagnostic?.result) {
      const perf = diagnostic.result.topicPerformance;
      const byLevel = {
        Mastered: perf.filter((p) => p.mastery === "Mastered").length,
        Strong: perf.filter((p) => p.mastery === "Strong").length,
        Developing: perf.filter((p) => p.mastery === "Developing").length,
        "Needs Review": perf.filter((p) => p.mastery === "Needs Review").length,
      };
      return { ...byLevel, NotAssessed: 0, total: topics.length };
    }
    return { Mastered: 0, Strong: 0, Developing: 0, "Needs Review": 0, NotAssessed: topics.length, total: topics.length };
  })();

  // Next action via adaptive
  let nextAction: { label: string; reason: string; target: ExamSection } | null = null;
  if (!completed) {
    nextAction = { label: "Complete Diagnostic", reason: "Diagnostic not yet completed — this builds your adaptive baseline.", target: "diagnostic" };
  } else if (adaptive && Object.keys(adaptive.topics).length > 0) {
    try {
      const { getNextLearningAction } = require("@/lib/adaptive/engine");
      const action = getNextLearningAction(adaptive, examDate, topics);
      const map: Record<string, ExamSection> = {
        review_concept: "study-plan",
        practice_weak: "practice",
        practice_mixed: "practice",
        reinforce_strong: "practice",
        retake_diagnostic: "diagnostic",
        mastery_check: "mock-exam",
        continue_learning: "study-plan",
      };
      nextAction = { label: action.label, reason: action.why, target: map[action.action] ?? "practice" };
    } catch {
      nextAction = { label: "Continue Study Plan", reason: "Keep following your personalized plan.", target: "study-plan" };
    }
  } else if (studyPlan) {
    nextAction = { label: "Follow Study Plan", reason: "Your study plan is ready.", target: "study-plan" };
  }

  // Top priorities from adaptive
  const topPriorities = (() => {
    if (!adaptive || Object.keys(adaptive.topics).length === 0) return [];
    try {
      const { rankTopicsByPriority } = require("@/lib/adaptive/engine");
      return rankTopicsByPriority(adaptive, examDate).slice(0, 3);
    } catch {
      return [];
    }
  })();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-base p-5">
          <p className="uppercase-label text-primary mb-2">Exam Date</p>
          <p className="text-lg font-semibold text-foreground">{formatExamDate(examDate) || "Exam date not set"}</p>
          <p className="caption mt-1">{examDate ? `${(() => { const d = new Date(examDate + "T00:00:00"); const now = new Date(); const diff = Math.ceil((d.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / (1000*3600*24)); return diff <0 ? "Passed" : diff===0 ? "Today" : `${diff} days left`; })()}` : "Set date to generate plan"}</p>
        </div>
        <div className="card-base p-5">
          <p className="uppercase-label text-primary mb-2">Topics</p>
          <p className="text-lg font-semibold text-foreground">{topics.length ? `${topics.length} topics` : "No topics yet"}</p>
          <p className="caption mt-1">{readiness.Mastered + readiness.Strong} mastered/strong · {readiness["Needs Review"]} needs review · {readiness.NotAssessed} not assessed</p>
        </div>
        <div className="card-base p-5">
          <p className="uppercase-label text-primary mb-2">Preparation</p>
          <p className="text-lg font-semibold text-foreground">{preparationProgress}%</p>
          <Progress value={preparationProgress} className="h-1.5 mt-2" />
          <p className="caption mt-1">
            {diagnostic?.status !== "completed" ? "Complete diagnostic to start" : studyPlan ? `${studyPlan.sessions.filter((s) => s.status === "completed").length}/${studyPlan.sessions.length} sessions` : "Generate study plan"}
            {mockTest?.result ? ` · Mock ${mockTest.result.overallScore}%` : ""}
          </p>
        </div>
        <div className="card-base p-5">
          <p className="uppercase-label text-primary mb-2">Diagnostic</p>
          {completed ? (
            <p className="flex items-center gap-2 text-lg font-semibold text-success"><CheckCircle2 size={18} /> Complete</p>
          ) : (
            <p className="text-lg font-semibold text-foreground">{diagnostic?.status === "in_progress" ? "In Progress" : "Not Started"}</p>
          )}
          {completed && score !== undefined && <p className="caption mt-1">{score}% overall · {diagnostic?.result?.topicPerformance.length ?? 0} topics assessed</p>}
          {!completed && <p className="caption mt-1">Needed for adaptive plan</p>}
        </div>
      </div>

      {/* Current readiness */}
      <div className="card-base p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Target size={14} className="text-primary" /> Current Readiness</h3>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
          <div className="rounded-lg border border-success/20 bg-success-tint p-3"><p className="text-lg font-bold text-success">{readiness.Mastered}</p><p className="caption">Mastered</p></div>
          <div className="rounded-lg border border-success/20 bg-success-tint p-3"><p className="text-lg font-bold text-success">{readiness.Strong}</p><p className="caption">Strong</p></div>
          <div className="rounded-lg border border-warning/20 bg-warning-tint p-3"><p className="text-lg font-bold text-warning">{readiness.Developing}</p><p className="caption">Developing</p></div>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3"><p className="text-lg font-bold text-destructive">{readiness["Needs Review"]}</p><p className="caption">Needs Review</p></div>
          <div className="rounded-lg border border-border bg-secondary/30 p-3"><p className="text-lg font-bold">{readiness.NotAssessed}</p><p className="caption">Not Assessed</p></div>
        </div>
        {readiness.NotAssessed > 0 && !completed && <p className="caption mt-2">Complete diagnostic to assess all topics.</p>}
      </div>

      {/* Next action */}
      {nextAction && (
        <div className="card-base p-5 border-primary/20 bg-primary-tint">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="uppercase-label text-primary">Next up</p>
              <h3 className="text-base font-bold text-foreground mt-1">{nextAction.label}</h3>
              <p className="caption mt-1 max-w-prose">{nextAction.reason}</p>
            </div>
            <button onClick={() => onNavigate(nextAction.target)} className="btn-primary btn-sm shrink-0">Go →</button>
          </div>
        </div>
      )}

      {/* Top priorities */}
      <div className="card-base p-5">
        <h3 className="text-sm font-semibold">Top Priorities</h3>
        {topPriorities.length === 0 ? (
          <p className="caption mt-2">{completed ? "All topics look balanced. Keep following your study plan." : "Complete diagnostic to see priorities: low mastery + recent mistakes + exam urgency."}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {topPriorities.map((t: any) => (
              <li key={t.topicId} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.topic}</p>
                  <p className="caption truncate">{t.reason} · {t.trend}</p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-bold">{t.masteryScore}%</p>
                  <p className="caption">{t.masteryLevel}</p>
                </div>
                <span className={`ml-2 badge ${t.priority === "high" ? "badge-destructive" : t.priority === "medium" ? "badge-warning" : "badge-success"} text-[11px]`}>{t.priority}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Today's plan */}
      <div className="card-base p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Clock size={14} /> Today's Plan — {formatExamDate(today) || today}</h3>
        {todaySessions.length === 0 ? (
          <p className="caption mt-2">{studyPlan ? "No sessions for today. Check upcoming or generate a plan." : "No study plan yet. Complete diagnostic and generate a plan."}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {todaySessions.slice(0, 3).map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{s.topicName} · {s.type} · {s.durationMinutes} min</p>
                  <p className="caption">{s.reason}</p>
                </div>
                <span className={`badge text-[11px] ${s.status === "completed" ? "badge-success" : s.status === "missed" ? "badge-destructive" : "badge-muted"}`}>{s.status}</span>
              </li>
            ))}
            {todaySessions.length > 3 && <p className="caption">+{todaySessions.length - 3} more today</p>}
          </ul>
        )}
        {todaySessions.length > 0 && <button onClick={() => onNavigate("study-plan")} className="btn-secondary btn-sm mt-3">Open Study Plan</button>}
      </div>

      {/* Recent performance */}
      <div className="card-base p-5">
        <h3 className="text-sm font-semibold">Recent Performance</h3>
        {recentMocks.length === 0 && (!adaptive || Object.keys(adaptive.topics).length === 0) ? (
          <p className="caption mt-2">No assessment activity yet. Diagnostic, practice, and mock results will appear here.</p>
        ) : (
          <ul className="mt-3 space-y-1">
            {recentMocks.map((m: any) => (
              <li key={m.id ?? m.completedAt} className="flex items-center justify-between text-sm">
                <span>Mock Test · {m.completedAt ? new Date(m.completedAt).toLocaleDateString() : ""}</span>
                <span className="font-medium">{m.result?.overallScore ?? m.overallScore ?? "?"}%</span>
              </li>
            ))}
            {adaptive && adaptive.history.slice(-3).reverse().map((h) => (
              <li key={h.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{h.topic} · {h.questionType} · {h.correct ? "✓" : "✗"}</span>
                <span className="caption">{new Date(h.timestamp).toLocaleDateString()} · {h.score}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {dueReviews.length > 0 && (
        <div className="card-base p-5 border-warning/30 bg-warning-tint">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Repeat size={14} /> Reviews Due: {dueReviews.length}</h3>
          <p className="caption mt-1">{dueReviews.map((r) => topics.find((t) => t.id === r.topicId)?.name ?? r.topicId).join(", ")} — review soon to keep retention.</p>
          <button onClick={() => onNavigate("review")} className="btn-secondary btn-sm mt-3">Go to Review</button>
        </div>
      )}

      {completed && (
        <div className="card-base p-5 border-primary/20 bg-primary-tint">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2"><FileQuestion size={14} className="text-primary" /> Mock Exam</h3>
              <p className="caption mt-1">Simulate the real exam with {Math.max(10, Math.min(20, topics.length * 3))} questions across all topics.</p>
            </div>
            <button onClick={() => onNavigate("mock-exam")} className="btn-primary btn-sm shrink-0">Take Mock Exam →</button>
          </div>
        </div>
      )}

      {adaptive && <AdaptiveOverview adaptive={adaptive} examDate={examDate} />}

      {!adaptive && completed && (
        <div className="card-base p-5">
          <p className="caption">Adaptive insights will appear once your diagnostic is processed. Refresh or revisit Practice to see your personalized focus.</p>
        </div>
      )}
    </div>
  );
}

const TOPIC_STATUS_LABEL: Record<
  NonNullable<ExamTopic["status"]>,
  { label: string; variant: "muted" | "success" | "warning" | "destructive" }
> = {
  not_assessed: { label: "Not assessed", variant: "muted" },
  strong: { label: "Strong", variant: "success" },
  mastered: { label: "Mastered", variant: "success" },
  developing: { label: "Developing", variant: "warning" },
  needs_work: { label: "Needs review", variant: "destructive" },
};

function TopicsSection({
  topics,
  adaptive,
  studyPlan,
  onNavigate,
  onLearn,
  onPractice,
  onReview,
}: {
  topics: ExamTopic[];
  adaptive?: ExamContent["adaptive"];
  studyPlan?: ExamContent["studyPlan"];
  onNavigate: (section: ExamSection) => void;
  onLearn?: (topicId: string) => void;
  onPractice?: (topicId: string) => void;
  onReview?: (topicId: string) => void;
}) {
  if (topics.length === 0) {
    return (
      <div className="card-base p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <ListChecks size={24} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">No topics added yet</h2>
        <p className="caption mx-auto mt-2 max-w-md">Add the chapters or topics covered by this exam.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card-base p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Exam Topics — Learning Map</h2>
          <span className="caption">{topics.length} topics</span>
        </div>
        <ul className="space-y-3">
          {topics.map((topic) => {
            const ad = adaptive?.topics[topic.id];
            const review = studyPlan?.reviews.find((r) => r.topicId === topic.id);
            const info = TOPIC_STATUS_LABEL[topic.status ?? "not_assessed"];
            const masteryPct = ad ? `${ad.masteryScore}%` : "—";
            const masteryLevel = ad ? ad.masteryLevel : "Not Assessed";
            const priority = ad ? ad.priority : "—";
            const trend = ad ? ad.trend : "—";
            const attempts = ad ? `${ad.correct}/${ad.attempts}` : "0/0";
            const lastActivity = ad?.lastAttemptAt ? new Date(ad.lastAttemptAt).toLocaleDateString() : "—";
            const nextReview = review?.nextReviewAt ?? "—";
            const recommended = ad ? ad.recommendedAction : "Complete diagnostic to assess";

            return (
              <li key={topic.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{topic.name}</span>
                      <Badge variant={info.variant} className="text-[11px]">{ad ? masteryLevel : info.label}</Badge>
                      {ad && <span className={`badge text-[11px] ${ad.priority === "high" ? "badge-destructive" : ad.priority === "medium" ? "badge-warning" : "badge-success"}`}>{ad.priority}</span>}
                    </div>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div><p className="caption">Mastery</p><p className="font-semibold">{masteryPct} · {masteryLevel}</p></div>
                      <div><p className="caption">Trend</p><p className="font-medium capitalize">{trend}</p></div>
                      <div><p className="caption">Attempts</p><p className="font-medium">{attempts} · {ad ? `${ad.accuracy}%` : "—"}</p></div>
                      <div><p className="caption">Last activity</p><p className="font-medium">{lastActivity}</p></div>
                      <div><p className="caption">Next review</p><p className="font-medium">{nextReview}</p></div>
                      <div className="col-span-2 sm:col-span-3"><p className="caption">Recommended</p><p className="font-medium text-primary">{recommended}</p></div>
                    </div>
                    {ad && <p className="caption mt-2 italic">“{ad.reason}”</p>}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      onClick={() => (onLearn ? onLearn(topic.id) : onNavigate("learn"))}
                      className="btn-secondary btn-sm text-xs"
                    >
                      Learn
                    </button>
                    <button
                      onClick={() => (onPractice ? onPractice(topic.id) : onNavigate("practice"))}
                      className="btn-primary btn-sm text-xs"
                    >
                      Practice
                    </button>
                    <button
                      onClick={() => (onReview ? onReview(topic.id) : onNavigate("review"))}
                      className="btn-secondary btn-sm text-xs"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="caption mt-4">Mastery, priority, and reviews are driven by your actual diagnostic and practice performance via the adaptive engine. Topics with no data show “Not Assessed”.</p>
      </div>
    </div>
  );
}
