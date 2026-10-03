"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuestionRenderer } from "@/components/questions/question-renderer";
import { questionTypeLabel } from "@/lib/questions/registry";
import type { Question, QuestionAnswer } from "@/types/question";
import type { ExamContent, MockTestAttempt } from "@/types/task";
import { ChevronLeft, ChevronRight, FileQuestion, Clock } from "lucide-react";

interface Props {
  examContent: ExamContent;
  taskId: string;
  // subject kept for future AI personalization, not currently used
  subject: string;
  onExamContent: (next: ExamContent) => void;
}

function isAnswered(a: QuestionAnswer | undefined): boolean {
  if (a === undefined || a === null) return false;
  if (typeof a === "string") return a.trim() !== "";
  if (Array.isArray(a)) return a.length > 0;
  if (typeof a === "number") return Number.isFinite(a);
  return Object.keys(a).length > 0;
}

export function MockTestPanel({ examContent, taskId, onExamContent }: Props) {
  const mockTest: MockTestAttempt | undefined = examContent.mockTest;
  const topics = examContent.topics ?? [];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>(mockTest?.answers ?? {});
  const [loading, setLoading] = useState<"generate" | "submit" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);

  const questions: Question[] = mockTest?.questions ?? [];
  const isCompleted = mockTest?.status === "completed" && !!mockTest.result;

  if (topics.length === 0) {
    return (
      <div className="card-base mx-auto max-w-md p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <FileQuestion size={24} />
        </div>
        <h2 className="mt-4 text-lg font-semibold">No topics</h2>
        <p className="caption mt-2">Add exam topics to generate a mock test.</p>
      </div>
    );
  }

  if (!mockTest || questions.length === 0) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <div className="card-base p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-tint text-primary">
            <FileQuestion size={26} />
          </div>
          <h2 className="mt-5 text-xl font-bold">Ready for a mock exam?</h2>
          <p className="caption mx-auto mt-2 max-w-md">
            Simulate the real exam with questions covering all your topics and supported formats. Your answers will be evaluated deterministically and update your adaptive plan.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>{topics.length} topics</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} /> ~15–20 min
            </span>
          </div>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          <Button
            className="mt-6 w-full sm:w-auto"
            onClick={async () => {
              setError(null);
              setLoading("generate");
              try {
                const res = await fetch(`/api/tasks/${taskId}/mock-test`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "generate" }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to generate");
                if (data.mockTest) {
                  onExamContent({ ...examContent, mockTest: data.mockTest });
                  setAnswers({});
                  setIndex(0);
                }
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed");
              } finally {
                setLoading(null);
              }
            }}
            disabled={loading === "generate"}
          >
            {loading === "generate" ? "Generating…" : "Start Mock Test"}
          </Button>
        </div>
      </div>
    );
  }

  if (isCompleted && mockTest.result) {
    // Completed should be shown via Results tab, but we show a summary here too
    return (
      <div className="card-base p-6 text-center">
        <h3 className="text-lg font-semibold">Mock test completed</h3>
        <p className="caption mt-1">Score: {mockTest.result.overallScore}% · {mockTest.result.correctCount}/{mockTest.result.totalQuestions}</p>
        <p className="caption mt-2">View detailed results in the Results tab.</p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={async () => {
            setError(null);
            setLoading("generate");
            try {
              const res = await fetch(`/api/tasks/${taskId}/mock-test`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "generate" }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              onExamContent({ ...examContent, mockTest: data.mockTest });
              setAnswers(data.mockTest.answers ?? {});
              setIndex(0);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed");
            } finally {
              setLoading(null);
            }
          }}
        >
          Retake Mock Test
        </Button>
      </div>
    );
  }

  const current = questions[index];
  const isLast = index === questions.length - 1;

  async function saveAnswers(next: Record<string, QuestionAnswer>) {
    setAnswers(next);
    setValidation(null);
    // Fire-and-forget persistence
    fetch(`/api/tasks/${taskId}/mock-test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", answers: next }),
    }).catch(() => {});
  }

  async function handleSubmit() {
    if (!current) return;
    if (!isAnswered(answers[current.id])) {
      setValidation("Select an answer to continue.");
      return;
    }
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    setLoading("submit");
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}/mock-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submit failed");
      const updatedMock = data.mockTest as MockTestAttempt;
      const updatedExamContent: ExamContent = {
        ...examContent,
        mockTest: updatedMock,
        mockTestHistory: data.mockTestHistory ?? examContent.mockTestHistory,
        adaptive: data.adaptive ?? examContent.adaptive,
        studyPlan: data.studyPlan ?? examContent.studyPlan,
        preparationProgress: data.preparationProgress ?? examContent.preparationProgress,
      };
      // The mock-test route already updates adaptive via applyDiagnosticToAdaptive, but our current route doesn't return adaptive/studyPlan
      // We need to fetch the latest task to get adaptive updates, or we can just merge what we have
      // For now, fetch fresh task
      try {
        const freshRes = await fetch(`/api/tasks/${taskId}`);
        if (freshRes.ok) {
          const freshTask = await freshRes.json();
          if (freshTask.examContent) {
            onExamContent(freshTask.examContent as ExamContent);
          } else {
            onExamContent(updatedExamContent);
          }
        } else {
          onExamContent(updatedExamContent);
        }
      } catch {
        onExamContent(updatedExamContent);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <FileQuestion size={15} className="text-primary" /> Mock Test
          </span>
          <span className="caption">
            Question {index + 1} of {questions.length}
          </span>
        </div>
        <Progress value={((index + 1) / questions.length) * 100} className="h-2" />
      </div>

      {current && (
        <div className="card-base p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground/80">
              {current.topic ?? "General"}
            </span>
            <span className="badge-accent rounded-md px-2 py-0.5 text-[11px] uppercase tracking-wide">
              {questionTypeLabel(current.type)}
            </span>
            {current.difficulty && (
              <span className="badge-muted rounded-md px-2 py-0.5 text-[11px]">{current.difficulty}</span>
            )}
          </div>
          <h3 className="mb-4 text-base font-semibold leading-relaxed text-foreground sm:text-lg">
            {current.prompt}
          </h3>
          <QuestionRenderer
            question={current}
            value={answers[current.id] ?? null}
            onChange={(v) => saveAnswers({ ...answers, [current.id]: v })}
          />
          {validation && <p className="mt-4 text-sm font-medium text-destructive">{validation}</p>}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={() => index > 0 && setIndex((i) => i - 1)} disabled={index === 0}>
              <ChevronLeft size={16} /> Back
            </Button>
            {!isLast ? (
              <Button onClick={handleSubmit}>Next <ChevronRight size={16} /></Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading === "submit"}>
                {loading === "submit" ? "Submitting…" : "Submit Mock Test"}
              </Button>
            )}
          </div>
        </div>
      )}
      {error && <p className="mx-auto mt-4 max-w-md rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
