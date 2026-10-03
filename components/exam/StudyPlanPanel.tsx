"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ExamContent, StudyPlan, StudySession, Task } from "@/types/task";
import { Calendar, Clock, Target, BookOpen, Repeat, CheckCircle2, XCircle, SkipForward, RefreshCw, Sparkles } from "lucide-react";

interface Props {
  task: Task;
  examContent: ExamContent;
  onExamContent: (next: ExamContent) => void;
  onNavigate?: (section: "practice" | "review" | "diagnostic" | "study-plan" | "learn") => void;
  onLearnTopic?: (topicId: string) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
}

function daysRemaining(examDate?: string): string {
  if (!examDate) return "Exam date not set";
  const exam = new Date(examDate + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 3600 * 24));
  if (diff < 0) return "Exam has passed";
  if (diff === 0) return "Exam today";
  if (diff === 1) return "1 day remaining";
  return `${diff} days remaining`;
}

function groupByDate(sessions: StudySession[]): Record<string, StudySession[]> {
  const g: Record<string, StudySession[]> = {};
  for (const s of sessions) {
    if (!g[s.date]) g[s.date] = [];
    g[s.date].push(s);
  }
  return g;
}

export function StudyPlanPanel({ task, examContent, onExamContent, onNavigate, onLearnTopic }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [dailyMinutes, setDailyMinutes] = useState<number>(examContent.availableDailyMinutes ?? 60);

  const studyPlan = examContent.studyPlan ?? null;
  const topics = examContent.topics ?? [];
  const examDate = examContent.examDate;
  const today = new Date().toISOString().split("T")[0];

  const totalPlanned = studyPlan ? studyPlan.sessions.reduce((a, b) => a + b.durationMinutes, 0) : 0;
  const completedMinutes = studyPlan ? studyPlan.sessions.filter((s) => s.status === "completed").reduce((a, b) => a + b.durationMinutes, 0) : 0;
  const remainingMinutes = totalPlanned - completedMinutes;
  const progress = totalPlanned > 0 ? Math.round((completedMinutes / totalPlanned) * 100) : 0;

  const grouped = useMemo(() => (studyPlan ? groupByDate(studyPlan.sessions) : {}), [studyPlan]);
  const todaySessions = grouped[today] ?? [];
  const upcomingDates = Object.keys(grouped).filter((d) => d > today).sort();
  const dueReviews = (studyPlan?.reviews ?? []).filter((r) => r.nextReviewAt && r.nextReviewAt <= today);
  const upcomingReviews = (studyPlan?.reviews ?? []).filter((r) => r.nextReviewAt && r.nextReviewAt > today).sort((a, b) => (a.nextReviewAt ?? "").localeCompare(b.nextReviewAt ?? ""));

  const topicsNeedingAttention = useMemo(() => {
    if (!examContent.adaptive) return [];
    return Object.values(examContent.adaptive.topics)
      .filter((t) => t.masteryLevel === "Needs Review" || t.masteryLevel === "Developing")
      .map((t) => t.topic);
  }, [examContent.adaptive]);

  useEffect(() => {
    if (examContent.availableDailyMinutes !== undefined && examContent.availableDailyMinutes !== dailyMinutes) {
      setDailyMinutes(examContent.availableDailyMinutes);
    }
  }, [examContent.availableDailyMinutes]);

  async function handleAction(action: string, payload: Record<string, unknown> = {}) {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}/study-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.studyPlan) {
        onExamContent({
          ...examContent,
          studyPlan: data.studyPlan as StudyPlan,
          preparationProgress: data.preparationProgress ?? examContent.preparationProgress,
          availableDailyMinutes: (data as any).availableDailyMinutes ?? examContent.availableDailyMinutes,
        });
      } else if ((data as any).availableDailyMinutes !== undefined) {
        onExamContent({ ...examContent, availableDailyMinutes: (data as any).availableDailyMinutes });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(null);
    }
  }

  async function handleDailyMinutesChange(newVal: number) {
    const clamped = Math.max(15, Math.min(90, Math.round(newVal)));
    setDailyMinutes(clamped);
    // Persist and recalculate if plan exists, otherwise just persist the setting via generate with new value on next generate
    // For immediate persistence, call recalculate/generate with new value
    if (studyPlan) {
      await handleAction("recalculate", { availableDailyMinutes: clamped });
    } else {
      // Persist the setting without generating a plan yet: update examContent directly via a lightweight call
      // We do this by calling generate with the new value but if no plan exists, it will generate a new plan
      // For now, just update local examContent optimistically; the next generate will use the new value
      onExamContent({ ...examContent, availableDailyMinutes: clamped });
      try {
        await fetch(`/api/tasks/${task.id}/study-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "generate", availableDailyMinutes: clamped }),
        }).then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.studyPlan) {
            onExamContent({ ...examContent, studyPlan: data.studyPlan as StudyPlan, availableDailyMinutes: clamped, preparationProgress: data.preparationProgress ?? examContent.preparationProgress });
          }
        });
      } catch {}
    }
  }

  async function handleComplete(sessionId: string) {
    await handleAction("complete", { sessionId });
  }
  async function handleMissed(sessionId: string) {
    await handleAction("missed", { sessionId });
  }
  async function handleSkip(sessionId: string) {
    await handleAction("skip", { sessionId });
  }

  async function fetchAiExplanation() {
    setAiLoading(true);
    setAiExplanation(null);
    try {
      const deterministicWhy = studyPlan
        ? `You're spending more time on ${topicsNeedingAttention.slice(0, 2).join(" and ") || "your weakest topics"} because mastery is low and the exam is ${daysRemaining(examDate)}.`
        : "Complete diagnostic to get personalized why.";

      try {
        const res = await fetch(`/api/tasks/${task.id}/study-plan/explain`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.explanation) {
          setAiExplanation(data.explanation);
          return;
        }
        if (!res.ok) {
          console.warn("[StudyPlanPanel] AI explain failed", data.error);
        }
      } catch {}
      setAiExplanation(deterministicWhy);
    } finally {
      setAiLoading(false);
    }
  }

  if (topics.length === 0) {
    return (
      <div className="card-base p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <BookOpen size={24} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">No topics yet</h2>
        <p className="caption mx-auto mt-2 max-w-md">Add exam topics first to generate a study plan.</p>
      </div>
    );
  }

  if (!examDate) {
    return (
      <div className="card-base p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <Calendar size={24} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">Exam date not set</h2>
        <p className="caption mx-auto mt-2 max-w-md">Set an exam date to generate your personalized study plan.</p>
      </div>
    );
  }

  if (!studyPlan) {
    return (
      <div className="space-y-4">
        <div className="card-base p-6">
          <h2 className="text-lg font-semibold text-foreground">Study Plan</h2>
          <p className="caption mt-1">Generate a personalized plan based on your adaptive mastery, priority, and exam date.</p>
          <p className="caption mt-2">
            <span className="font-medium">Exam date:</span> {examDate} · {daysRemaining(examDate)} · {topics.length} topics
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Available daily study time:</span>
              <select
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="rounded-md border border-border bg-card px-2 py-1 text-sm"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
              </select>
              <input
                type="number"
                min={15}
                max={90}
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Math.max(15, Math.min(90, Number(e.target.value) || 15)))}
                className="w-20 rounded-md border border-border bg-card px-2 py-1 text-sm"
                placeholder="Custom"
              />
              <span className="caption">min/day (15–90)</span>
            </div>
            <p className="caption">Changing this will affect how your study time is distributed. Less time per day means fewer minutes per topic, but every topic still gets minimum exposure.</p>
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => handleAction("generate", { availableDailyMinutes: dailyMinutes })} disabled={loading === "generate"}>
              {loading === "generate" ? "Generating…" : `Generate Study Plan (${dailyMinutes} min/day)`}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-base p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Study Plan</h2>
            <p className="caption mt-1 flex flex-wrap items-center gap-2">
              <Calendar size={14} /> {examDate} · {daysRemaining(examDate)} · v{studyPlan.planVersion} · {studyPlan.sessions.length} sessions
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => handleAction("recalculate")} disabled={!!loading}>
              <RefreshCw size={14} /> {loading === "recalculate" ? "Recalculating…" : "Recalculate"}
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Plan progress</span>
            <span className="text-xs font-semibold text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="caption mt-1">{completedMinutes} / {totalPlanned} min completed · {remainingMinutes} min remaining</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Daily study time:</span>
          <select
            value={dailyMinutes}
            onChange={(e) => {
              const v = Number(e.target.value);
              handleDailyMinutesChange(v);
            }}
            className="rounded-md border border-border bg-card px-2 py-1 text-sm"
          >
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
          </select>
          <input
            type="number"
            min={15}
            max={90}
            value={dailyMinutes}
            onChange={(e) => {
              const v = Math.max(15, Math.min(90, Number(e.target.value) || 15));
              handleDailyMinutesChange(v);
            }}
            className="w-20 rounded-md border border-border bg-card px-2 py-1 text-sm"
          />
          <span className="caption">min/day</span>
          <span className="caption">· Changing this recalculates your plan and preserves completed sessions.</span>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>

      {/* Today */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock size={16} className="text-primary" /> Today — {formatDate(today)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaySessions.length === 0 ? (
            <p className="caption">No sessions planned for today. Enjoy the break or recalculate to fill gaps.</p>
          ) : (
            <ul className="space-y-3">
              {todaySessions.map((s) => (
                <li key={s.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{s.topicName}</p>
                      <p className="caption mt-0.5">
                        {s.type === "learn" ? <BookOpen size={12} className="inline" /> : s.type === "practice" ? <Target size={12} className="inline" /> : <Repeat size={12} className="inline" />} {s.type} · {s.durationMinutes} min · priority {s.priority} · {s.source}
                      </p>
                      <p className="caption mt-1 italic">“{s.reason}”</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant={s.status === "completed" ? "success" : s.status === "missed" ? "destructive" : s.status === "skipped" ? "outline" : "muted"} className="text-[11px]">
                          {s.status}
                        </Badge>
                        <span className="caption">{s.date}</span>
                      </div>
                    </div>
                    {s.status === "planned" && (
                      <div className="flex shrink-0 flex-col gap-1">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            if (s.type === "learn" && onLearnTopic) {
                              onLearnTopic(s.topicId);
                            } else if (onNavigate) {
                              if (s.type === "review") onNavigate("review");
                              else if (s.type === "learn") onNavigate("learn");
                              else onNavigate("practice");
                            }
                            try {
                              localStorage.setItem(`studyflow:exam:${task.id}:nextTopic`, s.topicId);
                              localStorage.setItem(`studyflow:exam:${task.id}:nextLearnTopic`, s.topicId);
                            } catch {}
                          }}
                          disabled={!!loading}
                        >
                          {s.type === "review" ? <Repeat size={14} /> : s.type === "learn" ? <BookOpen size={14} /> : <Target size={14} />} Start
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleComplete(s.id)} disabled={!!loading}>
                          <CheckCircle2 size={14} /> Complete
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleSkip(s.id)} disabled={!!loading}>
                          <SkipForward size={14} /> Skip
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleMissed(s.id)} disabled={!!loading}>
                          <XCircle size={14} /> Missed
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Upcoming */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Upcoming — Next 7 days</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingDates.length === 0 ? (
            <p className="caption">No upcoming sessions.</p>
          ) : (
            <div className="space-y-4">
              {upcomingDates.slice(0, 7).map((d) => (
                <div key={d}>
                  <p className="text-sm font-semibold text-foreground">{formatDate(d)}</p>
                  <ul className="mt-1 space-y-2">
                    {(grouped[d] ?? []).map((s) => (
                      <li key={s.id} className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2">
                        <span className="text-sm text-foreground">{s.topicName} · {s.type} · {s.durationMinutes} min</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="muted" className="text-[11px]">{s.status}</Badge>
                          {s.status === "planned" && (onNavigate || onLearnTopic) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                              onClick={() => {
                                if (s.type === "learn" && onLearnTopic) onLearnTopic(s.topicId);
                                else if (onNavigate) {
                                  if (s.type === "review") onNavigate("review");
                                  else if (s.type === "learn") onNavigate("learn");
                                  else onNavigate("practice");
                                }
                                try {
                                  localStorage.setItem(`studyflow:exam:${task.id}:nextTopic`, s.topicId);
                                  localStorage.setItem(`studyflow:exam:${task.id}:nextLearnTopic`, s.topicId);
                                } catch {}
                              }}
                            >
                              Start
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {upcomingDates.length > 7 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-primary">Show full plan ({upcomingDates.length - 7} more days)</summary>
                  <div className="mt-3 space-y-4">
                    {upcomingDates.slice(7).map((d) => (
                      <div key={d}>
                        <p className="text-sm font-semibold text-foreground">{formatDate(d)}</p>
                        <ul className="mt-1 space-y-1">
                          {(grouped[d] ?? []).map((s) => (
                            <li key={s.id} className="text-sm text-muted-foreground">{s.topicName} · {s.type} · {s.durationMinutes} min · {s.status}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Repeat size={16} className="text-primary" /> Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Due Reviews ({dueReviews.length})</h4>
            {dueReviews.length === 0 ? (
              <p className="caption mt-1">No reviews due today.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {dueReviews.map((r) => (
                  <li key={r.topicId} className="rounded-md border border-warning/30 bg-warning-tint px-3 py-2">
                    <p className="text-sm font-medium text-foreground">{topics.find((t) => t.id === r.topicId)?.name ?? r.topicId}</p>
                    <p className="caption">Next: {r.nextReviewAt} · interval {r.intervalDays} days · {r.reviewCount} reviews</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Upcoming Reviews</h4>
            {upcomingReviews.length === 0 ? (
              <p className="caption mt-1">No upcoming reviews.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {upcomingReviews.slice(0, 5).map((r) => (
                  <li key={r.topicId} className="flex items-center justify-between text-sm">
                    <span>{topics.find((t) => t.id === r.topicId)?.name ?? r.topicId}</span>
                    <span className="caption">{r.nextReviewAt} · {r.intervalDays}d</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Plan Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="caption">Total planned</p>
            <p className="text-lg font-bold text-foreground">{totalPlanned} min</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="caption">Completed</p>
            <p className="text-lg font-bold text-success">{completedMinutes} min</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="caption">Remaining</p>
            <p className="text-lg font-bold text-foreground">{remainingMinutes} min</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="caption">Topics needing attention</p>
            <p className="text-lg font-bold text-foreground">{topicsNeedingAttention.length}</p>
            <p className="caption truncate">{topicsNeedingAttention.join(", ") || "None"}</p>
          </div>
          <div className="col-span-2">
            <p className="caption">Topics covered: {new Set(studyPlan.sessions.map((s) => s.topicId)).size} / {topics.length}</p>
            <p className="caption">{progress}% of planned study completed</p>
          </div>
        </CardContent>
      </Card>

      {/* Why this plan */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles size={16} className="text-primary" /> Why this plan?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed">
          <p>
            {topicsNeedingAttention.length > 0
              ? `You're spending more time on ${topicsNeedingAttention.slice(0, 2).join(" and ")} because mastery is low and recent performance shows gaps.`
              : "Your plan balances all topics evenly because mastery is strong across the board."}{" "}
            {dueReviews.length > 0 ? `You have ${dueReviews.length} overdue review${dueReviews.length === 1 ? "" : "s"} prioritized.` : ""} {examDate ? `Exam is ${daysRemaining(examDate).toLowerCase()}.` : ""}
          </p>
          <Button size="sm" variant="outline" onClick={fetchAiExplanation} disabled={aiLoading}>
            <Sparkles size={12} /> {aiLoading ? "Generating…" : "Explain with AI"}
          </Button>
          {aiExplanation && (
            <div className="mt-2 rounded-lg border border-primary/20 bg-primary-tint p-3 text-sm">
              {aiExplanation}
            </div>
          )}
          <p className="caption">
            Numerical decisions (priority, durations, dates) are deterministic. AI only explains, never decides.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
