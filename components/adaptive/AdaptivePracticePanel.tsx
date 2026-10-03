"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "@/components/questions/question-renderer";
import { QuestionResult } from "@/components/questions/question-result";
import { evaluateQuestion } from "@/lib/questions/evaluate";
import { selectNextQuestion } from "@/lib/adaptive/engine";
import type { ExamContent, Task } from "@/types/task";
import type { Question, QuestionAnswer } from "@/types/question";
import { RefreshCw, Play } from "lucide-react";

interface Props {
  task: Task;
  examContent: ExamContent;
  onExamContent: (next: ExamContent) => void;
}

export function AdaptivePracticePanel({ task, examContent, onExamContent }: Props) {
  const adaptive = examContent.adaptive ?? null;
  const [practiceQuestion, setPracticeQuestion] = useState<Question | null>(null);
  const [selectionReason, setSelectionReason] = useState<string>("");
  const [value, setValue] = useState<QuestionAnswer>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof evaluateQuestion> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topics = useMemo(() => examContent.topics ?? [], [examContent.topics]);
  const diagnosticQuestions = useMemo(() => examContent.diagnostic?.questions ?? [], [examContent.diagnostic]);

  const hasAdaptive = adaptive && Object.keys(adaptive.topics).length > 0;
  const hasQuestions = diagnosticQuestions.length > 0;

  const nextSelection = useMemo(() => {
    if (!hasAdaptive || !hasQuestions) return null;
    return selectNextQuestion({
      topics,
      questions: diagnosticQuestions,
      state: adaptive!,
      examDate: examContent.examDate,
    });
  }, [adaptive, topics, diagnosticQuestions, examContent.examDate, hasAdaptive, hasQuestions]);

  // Auto-start practice for pending topic from Study Plan (e.g., "Start" on a study session)
  useEffect(() => {
    if (!hasAdaptive || practiceQuestion || loading) return;
    try {
      const pending = localStorage.getItem(`studyflow:exam:${task.id}:nextTopic`);
      if (pending) {
        localStorage.removeItem(`studyflow:exam:${task.id}:nextTopic`);
        // generate for that specific topic
        (async () => {
          setLoading(true);
          setError(null);
          try {
            const res = await fetch(`/api/tasks/${task.id}/adaptive/generate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ topicId: pending }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to generate");
            if (data.question) {
              setPracticeQuestion(data.question as Question);
              setSelectionReason(data.reason ?? `Practice for ${topics.find((t) => t.id === pending)?.name ?? pending}`);
              setValue(null);
              setSubmitted(false);
              setResult(null);
            }
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not start practice for that topic.");
          } finally {
            setLoading(false);
          }
        })();
      }
    } catch {}
  }, [hasAdaptive, practiceQuestion, loading, task.id, topics]);

  async function handleStartPractice() {
    if (!adaptive) {
      // init adaptive if missing (should be seeded from diagnostic)
      setLoading(true);
      try {
        const res = await fetch(`/api/tasks/${task.id}/adaptive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "init" }),
        });
        const data = await res.json();
        if (data.adaptive) {
          onExamContent({ ...examContent, adaptive: data.adaptive });
        }
      } finally {
        setLoading(false);
      }
      return;
    }
    if (nextSelection?.question) {
      setPracticeQuestion(nextSelection.question);
      setSelectionReason(nextSelection.reason);
      setValue(null);
      setSubmitted(false);
      setResult(null);
    }
  }

  async function handleGenerateNew(topicId?: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}/adaptive/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(topicId ? { topicId } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not generate question");
      if (data.question) {
        setPracticeQuestion(data.question as Question);
        setSelectionReason(data.reason ?? "Generated targeted practice for your weakest topic.");
        setValue(null);
        setSubmitted(false);
        setResult(null);
      } else {
        throw new Error("No question generated");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate a new question. Try again.");
      // fallback to pool if available
      if (nextSelection?.question) {
        setPracticeQuestion(nextSelection.question);
        setSelectionReason(nextSelection.reason);
        setValue(null);
        setSubmitted(false);
        setResult(null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!practiceQuestion) return;
    const ev = evaluateQuestion(practiceQuestion, value ?? undefined);
    setResult(ev);
    setSubmitted(true);

    // Record performance deterministically
    const topicId = practiceQuestion.topicId ?? practiceQuestion.topic ?? "general";
    const topic = practiceQuestion.topic ?? topicId;
    try {
      const res = await fetch(`/api/tasks/${task.id}/adaptive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record",
          topicId,
          topic,
          questionId: practiceQuestion.id,
          questionType: practiceQuestion.type,
          correct: ev.correct,
          score: ev.score,
          difficulty: practiceQuestion.difficulty,
        }),
      });
      const data = await res.json();
      if (data.adaptive) {
        onExamContent({ ...examContent, adaptive: data.adaptive });
      }
    } catch (e) {
      console.error("Failed to record adaptive", e);
    }
  }

  function handleNext() {
    setPracticeQuestion(null);
    setValue(null);
    setSubmitted(false);
    setResult(null);
    // Trigger next selection on next render via nextSelection memo
  }

  if (!hasAdaptive) {
    return (
      <div className="card-base p-6">
        <h3 className="text-base font-semibold text-foreground">Adaptive Practice</h3>
        <p className="caption mt-2">
          Complete the diagnostic to unlock adaptive practice. Your practice will prioritize your weakest topics and adapt difficulty based on performance.
        </p>
        {topics.length > 0 && (
          <Button className="mt-4" onClick={handleStartPractice} disabled={loading}>
            <Play size={14} /> {loading ? "Initializing…" : "Initialize Adaptive Practice"}
          </Button>
        )}
      </div>
    );
  }

  if (practiceQuestion) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="card-base p-5">
          <p className="caption">Adaptive selection</p>
          <p className="text-sm text-muted-foreground">{selectionReason}</p>
          {practiceQuestion.difficulty && (
            <p className="caption mt-1">Difficulty: {practiceQuestion.difficulty}</p>
          )}
        </div>
        <div className="card-base p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="badge-accent rounded-md px-2 py-0.5 text-[11px] uppercase tracking-wide">{practiceQuestion.type}</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground/80">
              {practiceQuestion.topic ?? "General"}
            </span>
          </div>
          <h3 className="mb-4 text-base font-semibold leading-relaxed text-foreground sm:text-lg">
            {practiceQuestion.prompt}
          </h3>
          <QuestionRenderer question={practiceQuestion} value={value} onChange={setValue} />
          {submitted && result && (
            <QuestionResult status={result.status} score={result.score} explanation={result.feedback ?? practiceQuestion.explanation} />
          )}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={handleNext}>
              <RefreshCw size={14} /> Next
            </Button>
            {!submitted ? (
              <Button onClick={handleSubmit} disabled={value === null || (typeof value === "string" && value.trim() === "") || (Array.isArray(value) && value.length === 0)}>
                Submit
              </Button>
            ) : (
              <Button onClick={handleNext}>Continue</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card-base p-6">
        <h3 className="text-base font-semibold text-foreground">Adaptive Practice</h3>
        <p className="caption mt-1">Practice prioritizes your weakest topics and adapts difficulty. After each answer, mastery and priority are recalculated.</p>
        {nextSelection && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary-tint p-3">
            <p className="text-sm font-medium text-primary">Up next: {nextSelection.topic ?? "Mixed"} {nextSelection.difficulty ? `· ${nextSelection.difficulty}` : ""}</p>
            <p className="caption mt-1">{nextSelection.reason}</p>
          </div>
        )}
        {error && <p className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={handleStartPractice} disabled={!nextSelection?.question || loading}>
            <Play size={14} /> {loading ? "Loading…" : "Practice weakest topic"}
          </Button>
          <Button variant="outline" onClick={() => handleGenerateNew()} disabled={loading}>
            {loading ? "Generating…" : "Generate new question"}
          </Button>
        </div>
        {!hasQuestions && <p className="caption mt-3">No prepared questions. Generate a new targeted question.</p>}
        {loading && <p className="caption mt-2">Generating question… please wait.</p>}
      </div>
    </div>
  );
}
