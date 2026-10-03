"use client";

// /components/exam/ExamDiagnosticPanel.tsx
//
// Diagnostic flow: introduction -> quiz -> results, built on the shared
// Question Type Engine.
// - Generation, submission, and answer persistence go through the existing
//   backend ({ id }/diagnostic route) which reuses the app's AI + task storage.
// - Questions are rendered via the shared <QuestionRenderer /> and evaluated
//   deterministically with evaluateQuestion(); the completed diagnostic is
//   stored in examContent and survives refresh.

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ScanSearch, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "@/components/questions/question-renderer";
import { questionTypeLabel } from "@/lib/questions/registry";
import { DiagnosticKnowledgeMap } from "./DiagnosticKnowledgeMap";
import type { Question, QuestionAnswer } from "@/types/question";
import type { ExamContent, ExamDiagnostic } from "@/types/task";

interface Props {
  examContent: ExamContent;
  taskId: string;
  subject: string;
  onExamContent: (next: ExamContent) => void;
}

interface DynamicResult {
  diagnostic: ExamDiagnostic;
  preparationProgress?: number;
  topics?: ExamContent["topics"];
  adaptive?: ExamContent["adaptive"];
}

const UPDATE_ERROR =
  "Couldn't prepare the diagnostic. Try again.";

// A question is "answered" when it holds a non-empty value for its type.
function isAnswered(answer: QuestionAnswer | undefined): boolean {
  if (answer === undefined || answer === null) return false;
  if (typeof answer === "string") return answer.trim() !== "";
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === "number") return Number.isFinite(answer);
  return Object.keys(answer).length > 0;
}

export function ExamDiagnosticPanel({
  examContent,
  taskId,
  subject,
  onExamContent,
}: Props) {
  const diagnostic = examContent.diagnostic;
  const topics = examContent.topics ?? [];
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>(
    diagnostic?.answers ?? {},
  );
  const [loading, setLoading] = useState<"generate" | "submit" | "retake" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);
  const busyRef = useRef(false);

  const questions: Question[] = diagnostic?.questions ?? [];

  // ---- view determination ----
  const isCompleted = diagnostic?.status === "completed" && !!diagnostic.result;

  if (topics.length === 0) {
    return (
      <EmptyPanel
        icon={<ScanSearch size={26} />}
        title="No exam topics have been added yet."
        body="Add topics before starting the diagnostic."
      />
    );
  }

  if (isCompleted && diagnostic?.result) {
    return (
      <DiagnosticKnowledgeMap
        result={diagnostic.result}
        topicsAssessed={diagnostic.result.topicPerformance.length}
        totalTopics={topics.length}
        subject={subject}
        onRetake={() => handleAction("retake")}
        retaking={loading === "retake"}
      />
    );
  }

  // ---------------- QUIZ ----------------
  async function handleAction(
    action: "generate" | "submit" | "retake",
    payload?: { answers?: Record<string, QuestionAnswer> },
  ) {
    if (busyRef.current) return;
    busyRef.current = true;
    setError(null);
    setLoading(action);
    try {
      const res = await fetch(`/api/tasks/${taskId}/diagnostic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload ? { action, ...payload } : { action }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error || UPDATE_ERROR);
      }
      const dynamic: DynamicResult = body as DynamicResult;
      if (dynamic?.diagnostic) {
        onExamContent({
          ...examContent,
          preparationProgress:
            dynamic.preparationProgress ??
            examContent.preparationProgress ??
            0,
          topics: dynamic.topics ?? examContent.topics,
          diagnostic: dynamic.diagnostic,
          adaptive: dynamic.adaptive ?? examContent.adaptive,
        });
      }
      if (action === "generate" || action === "retake") {
        // A fresh attempt starts with no answers at the first question.
        setAnswers({});
        setQuizIndex(0);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : UPDATE_ERROR);
    } finally {
      busyRef.current = false;
      setLoading(null);
    }
  }

  function saveAnswers(next: Record<string, QuestionAnswer>) {
    setAnswers(next);
    setValidation(null);
    // Best-effort persistence of in-progress answers so a refresh doesn't
    // lose them. Fire-and-forget; the completed result is the source of truth.
    fetch(`/api/tasks/${taskId}/diagnostic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", answers: next }),
    }).catch(() => {});
  }

  const current = questions[quizIndex] ?? null;
  const isLast = quizIndex === questions.length - 1;

  function handleNext() {
    if (!current) return;
    if (!isAnswered(answers[current.id])) {
      setValidation("Select an answer to continue.");
      return;
    }
    setValidation(null);
    if (isLast) {
      handleAction("submit", { answers });
    } else {
      setQuizIndex((i) => i + 1);
    }
  }

  // ---------------- INTRO (no diagnostic started) ----------------
  const showIntro = !diagnostic || questions.length === 0;

  if (showIntro) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <div className="card-base p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-tint text-primary">
            <ScanSearch size={26} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-foreground">
            Let&apos;s assess what you know
          </h2>
          <p className="caption mx-auto mt-2 max-w-md">
            Answer a few questions across your exam topics. Your results will
            help StudyFlow identify what to focus on first.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-2 text-sm text-foreground sm:flex-row sm:gap-6">
            <span className="inline-flex items-center gap-1.5">
              <span className="font-semibold text-primary">{topics.length}</span>
              topic{topics.length === 1 ? "" : "s"}
            </span>
            <span className="hidden text-muted-foreground sm:inline">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={15} className="text-muted-foreground" />
              ~5–10 minutes
            </span>
          </div>

          {error && <ErrorNote message={error} />}

          <Button
            className="mt-6 w-full sm:w-auto"
            onClick={() => handleAction("generate")}
            loading={loading === "generate"}
            disabled={loading === "generate"}
          >
            {loading === "generate" ? "Preparing your diagnostic…" : "Start Diagnostic"}
          </Button>
        </div>
      </div>
    );
  }

  // ---------------- QUIZ SPECIFIC ----------------
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Top bar */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <ScanSearch size={15} className="text-primary" /> Diagnostic
          </span>
          <span className="caption">
            Question {quizIndex + 1} of {questions.length}
          </span>
        </div>
        <Progress
          value={((quizIndex + 1) / questions.length) * 100}
          className="h-2"
        />
      </div>

      {/* Question card */}
      {current && (
        <div className="card-base p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground/80">
              <ScanSearch size={12} className="text-muted-foreground" />
              {current.topic ?? "General"}
            </span>
            <span className="badge-accent rounded-md px-2 py-0.5 text-[11px] uppercase tracking-wide">
              {questionTypeLabel(current.type)}
            </span>
          </div>

          <h3 className="mb-4 text-base font-semibold leading-relaxed text-foreground sm:text-lg">
            {current.prompt}
          </h3>

          <QuestionRenderer
            question={current}
            value={answers[current.id] ?? null}
            onChange={(value) =>
              saveAnswers({ ...answers, [current.id]: value })
            }
          />

          {validation && (
            <p className="mt-4 text-sm font-medium text-destructive">
              {validation}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => quizIndex > 0 && setQuizIndex((i) => i - 1)}
              disabled={quizIndex === 0}
            >
              <ChevronLeft size={16} /> Back
            </Button>

            {!isLast ? (
              <Button onClick={handleNext}>
                Next <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                loading={loading === "submit"}
                disabled={loading === "submit"}
              >
                {loading === "submit" ? "Submitting…" : "Finish Diagnostic"}
              </Button>
            )}
          </div>
        </div>
      )}

      {error && <ErrorNote message={error} />}
    </div>
  );
}

function EmptyPanel({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="card-base mx-auto max-w-md p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
      <p className="caption mx-auto mt-2 max-w-sm">{body}</p>
    </div>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p className="mx-auto mt-4 max-w-md rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm font-medium text-destructive">
      {message}
    </p>
  );
}
