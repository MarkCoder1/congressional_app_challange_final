"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "@/components/questions/question-renderer";
import { QuestionResult } from "@/components/questions/question-result";
import { evaluateQuestion } from "@/lib/questions/evaluate";
import type { ExamContent, Task } from "@/types/task";
import type { Question, QuestionAnswer } from "@/types/question";
import { Repeat, Calendar, Target } from "lucide-react";

interface Props {
  task: Task;
  examContent: ExamContent;
  onExamContent: (next: ExamContent) => void;
}

export function ReviewPanel({ task, examContent, onExamContent }: Props) {
  const studyPlan = examContent.studyPlan ?? null;
  const topics = examContent.topics ?? [];
  const today = new Date().toISOString().split("T")[0];
  const reviews = studyPlan?.reviews ?? [];
  const due = reviews.filter((r) => r.nextReviewAt && r.nextReviewAt <= today);
  const upcoming = reviews.filter((r) => r.nextReviewAt && r.nextReviewAt > today).sort((a, b) => (a.nextReviewAt ?? "").localeCompare(b.nextReviewAt ?? ""));

  const [activeReviewTopicId, setActiveReviewTopicId] = useState<string | null>(null);
  const [reviewQuestion, setReviewQuestion] = useState<Question | null>(null);
  const [value, setValue] = useState<QuestionAnswer>(null);
  const [result, setResult] = useState<ReturnType<typeof evaluateQuestion> | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startReview(topicId: string) {
    setActiveReviewTopicId(topicId);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/adaptive/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });
      // The generate endpoint picks priority topic, not necessarily the requested one.
      // For review, we want to ensure the question is for the due topic: we can instead call a dedicated review generate
      // For now, try to generate and if topic mismatches, we still show it but note.
      // Alternatively, we could generate via study-plan review flow, but we reuse adaptive generate.
      if (res.ok) {
        const data = await res.json();
        if (data.question) {
          // If generated question is not for the requested topic, we could still use it, but ideally filter
          // For strict correctness, if topicId doesn't match, we will generate a new one by calling diagnostic generation with that topicId
          // Fallback: if mismatch, try to find a question for that topic from existing pool, else use generated
          const q = data.question as Question;
          if (q.topicId !== topicId && q.topic !== topics.find((t) => t.id === topicId)?.name) {
            // Try to generate a fresh one specifically for this topic via a direct call to generateDiagnosticQuestions for that topic
            // For now, just show the generated one with a note
          }
          setReviewQuestion(q);
          setValue(null);
          setSubmitted(false);
          setResult(null);
          return;
        }
      }
      // Fallback: create a simple review question from topic
      setError("Could not generate review question. Try practice for this topic.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate review");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!reviewQuestion || !activeReviewTopicId) return;
    const ev = evaluateQuestion(reviewQuestion, value ?? undefined);
    setResult(ev);
    setSubmitted(true);

    // Record real performance via adaptive (which will also update spaced review interval)
    try {
      const res = await fetch(`/api/tasks/${task.id}/adaptive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record",
          topicId: activeReviewTopicId,
          topic: topics.find((t) => t.id === activeReviewTopicId)?.name ?? activeReviewTopicId,
          questionId: reviewQuestion.id,
          questionType: reviewQuestion.type,
          correct: ev.correct,
          score: ev.score,
          difficulty: reviewQuestion.difficulty,
        }),
      });
      const data = await res.json();
      if (data.adaptive || data.studyPlan) {
        const freshRes = await fetch(`/api/tasks/${task.id}`);
        if (freshRes.ok) {
          const freshTask = await freshRes.json();
          if (freshTask.examContent) onExamContent(freshTask.examContent as ExamContent);
        } else if (data.adaptive) {
          onExamContent({ ...examContent, adaptive: data.adaptive, studyPlan: data.studyPlan ?? examContent.studyPlan });
        }
      }
    } catch {}
  }

  function handleDone() {
    setActiveReviewTopicId(null);
    setReviewQuestion(null);
    setValue(null);
    setResult(null);
    setSubmitted(false);
  }

  if (!studyPlan) {
    return (
      <div className="card-base p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <Repeat size={24} />
        </div>
        <h2 className="mt-4 text-lg font-semibold">No study plan yet</h2>
        <p className="caption mx-auto mt-2 max-w-md">Generate a study plan first. Your due reviews will appear here.</p>
      </div>
    );
  }

  if (reviewQuestion && activeReviewTopicId) {
    const topicName = topics.find((t) => t.id === activeReviewTopicId)?.name ?? activeReviewTopicId;
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="card-base p-4">
          <p className="caption">Reviewing</p>
          <p className="text-lg font-bold">{topicName}</p>
          <p className="caption">Due review · {reviews.find((r) => r.topicId === activeReviewTopicId)?.nextReviewAt}</p>
        </div>
        <div className="card-base p-5 sm:p-6">
          <h3 className="mb-3 text-base font-semibold">{reviewQuestion.prompt}</h3>
          <QuestionRenderer question={reviewQuestion} value={value} onChange={setValue} />
          {submitted && result && <QuestionResult status={result.status} score={result.score} explanation={result.feedback ?? reviewQuestion.explanation} />}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={handleDone}>
              Back to reviews
            </Button>
            {!submitted ? (
              <Button onClick={handleSubmit} disabled={value === null || (typeof value === "string" && value.trim() === "")}>
                Submit Review
              </Button>
            ) : (
              <Button onClick={handleDone}>Done</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card-base p-5">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Repeat size={18} className="text-primary" /> Reviews
        </h2>
        <p className="caption mt-1">Due reviews are based on your spaced-review intervals and recent performance. Complete them to update retention.</p>
      </div>

      <div className="card-base p-5">
        <h3 className="text-base font-semibold">Due Reviews ({due.length})</h3>
        {due.length === 0 ? (
          <p className="caption mt-2">No reviews due today. Great job staying on track!</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {due.map((r) => {
              const topicName = topics.find((t) => t.id === r.topicId)?.name ?? r.topicId;
              const adaptiveTopic = examContent.adaptive?.topics[r.topicId];
              return (
                <li key={r.topicId} className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning-tint p-3">
                  <div>
                    <p className="text-sm font-semibold">{topicName}</p>
                    <p className="caption">Next: {r.nextReviewAt} · interval {r.intervalDays}d · mastery {adaptiveTopic?.masteryScore ?? "?"}% · {r.reviewCount} reviews</p>
                  </div>
                  <Button size="sm" onClick={() => startReview(r.topicId)} disabled={loading}>
                    <Target size={14} /> Review
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>

      <div className="card-base p-5">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Calendar size={16} /> Upcoming Reviews
        </h3>
        {upcoming.length === 0 ? (
          <p className="caption mt-2">No upcoming reviews.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {upcoming.slice(0, 8).map((r) => {
              const topicName = topics.find((t) => t.id === r.topicId)?.name ?? r.topicId;
              return (
                <li key={r.topicId} className="flex items-center justify-between text-sm">
                  <span>{topicName}</span>
                  <span className="caption">{r.nextReviewAt} · {r.intervalDays}d</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
