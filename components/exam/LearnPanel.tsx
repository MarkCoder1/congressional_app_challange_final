"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { QuestionRenderer } from "@/components/questions/question-renderer";
import { QuestionResult } from "@/components/questions/question-result";
import { evaluateQuestion } from "@/lib/questions/evaluate";
import type { ExamContent, Task } from "@/types/task";
import type { Question, QuestionAnswer } from "@/types/question";
import { BookOpen, Target, TrendingUp, TrendingDown, Minus, CheckCircle2, Play } from "lucide-react";

interface LearnContent {
  explanation: string;
  keyConcepts: string[];
  example: string;
  commonMistakes: string[];
  whatYouShouldKnow: string[];
  formulas?: string[];
}

interface Props {
  task: Task;
  examContent: ExamContent;
  onExamContent: (next: ExamContent) => void;
  initialTopicId?: string;
  onContinueToPractice?: (topicId: string) => void;
}

export function LearnPanel({ task, examContent, onExamContent, initialTopicId, onContinueToPractice }: Props) {
  const topics = examContent.topics ?? [];
  const adaptive = examContent.adaptive ?? null;
  // Check for pending topic from Study Plan's "Start Learn" (via localStorage)
  const getPendingTopic = () => {
    try {
      const pending = localStorage.getItem(`studyflow:exam:${task.id}:nextLearnTopic`);
      if (pending) {
        localStorage.removeItem(`studyflow:exam:${task.id}:nextLearnTopic`);
        // Also clear the generic nextTopic to avoid confusion with Practice
        // Keep it for Practice, but Learn has priority
        return pending;
      }
    } catch {}
    return null;
  };
  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => {
    const pending = (() => {
      try {
        return localStorage.getItem(`studyflow:exam:${task.id}:nextLearnTopic`);
      } catch {
        return null;
      }
    })();
    if (pending) {
      try {
        localStorage.removeItem(`studyflow:exam:${task.id}:nextLearnTopic`);
      } catch {}
      const exists = topics.find((t) => t.id === pending);
      if (exists) return pending;
    }
    return initialTopicId ?? topics[0]?.id ?? "";
  });
  const [learnContent, setLearnContent] = useState<LearnContent | null>(null);
  const [checkQuestions, setCheckQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const [checkAnswers, setCheckAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [checkSubmitted, setCheckSubmitted] = useState(false);
  const [checkResults, setCheckResults] = useState<Record<string, ReturnType<typeof evaluateQuestion>>>({});

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) ?? topics[0];
  const adaptiveTopic = selectedTopicId ? adaptive?.topics[selectedTopicId] : null;

  // Handle case where topics were initially empty (e.g., examContent not yet loaded) and now have data
  useEffect(() => {
    if (!selectedTopicId && topics.length > 0) {
      const firstId = topics[0].id;
      setSelectedTopicId(firstId);
      // loadLearn will be triggered by the selectedTopicId effect below
    }
  }, [topics, selectedTopicId]);

  async function loadLearn(topicId: string) {
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return;
    setSelectedTopicId(topicId);
    setLoading(true);
    setError(null);
    setLearnContent(null);
    setCheckQuestions([]);
    setShowCheck(false);
    setCheckAnswers({});
    setCheckSubmitted(false);
    setCheckResults({});

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`/api/tasks/${task.id}/learn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id, topic: topic.name }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any).error || `Failed to load learn content (${res.status})`);
      if (!data.learnContent) throw new Error("Invalid learn content response");
      setLearnContent(data.learnContent);
      setCheckQuestions((data.checkQuestions as Question[]) ?? []);
    } catch (e) {
      clearTimeout(timeout);
      if (e instanceof DOMException && e.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(e instanceof Error ? e.message : "Failed to load learn content");
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedTopicId && !learnContent && !loading) {
      loadLearn(selectedTopicId);
    }
  }, [selectedTopicId]);

  // Also handle initialTopicId change from Study Plan
  useEffect(() => {
    if (initialTopicId && initialTopicId !== selectedTopicId) {
      loadLearn(initialTopicId);
    }
  }, [initialTopicId]);

  async function handleSubmitCheck() {
    const results: Record<string, ReturnType<typeof evaluateQuestion>> = {};
    let correctCount = 0;
    for (const q of checkQuestions) {
      const ans = checkAnswers[q.id];
      const ev = evaluateQuestion(q, ans ?? undefined);
      results[q.id] = ev;
      if (ev.correct) correctCount++;
      // Record each answer via adaptive (real learning evidence)
      try {
        await fetch(`/api/tasks/${task.id}/adaptive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "record",
            topicId: q.topicId ?? selectedTopicId,
            topic: q.topic ?? selectedTopic?.name ?? selectedTopicId,
            questionId: q.id,
            questionType: q.type,
            correct: ev.correct,
            score: ev.score,
            difficulty: q.difficulty,
          }),
        });
      } catch {}
    }
    setCheckResults(results);
    setCheckSubmitted(true);

    // Refresh task to get updated adaptive
    try {
      const freshRes = await fetch(`/api/tasks/${task.id}`);
      if (freshRes.ok) {
        const freshTask = await freshRes.json();
        if (freshTask.examContent) onExamContent(freshTask.examContent as ExamContent);
      }
    } catch {}
  }

  if (topics.length === 0) {
    return (
      <div className="card-base p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <BookOpen size={24} />
        </div>
        <h2 className="mt-4 text-lg font-semibold">No topics</h2>
        <p className="caption mt-2">Add exam topics to start learning.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Topic selector */}
      <div className="card-base p-4">
        <h3 className="text-sm font-semibold">Choose a topic to learn</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {topics.map((t) => {
            const isSelected = t.id === selectedTopicId;
            const ad = adaptive?.topics[t.id];
            return (
              <button
                key={t.id}
                onClick={() => loadLearn(t.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"}`}
              >
                {t.name} {ad ? `· ${ad.masteryScore}%` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {selectedTopic && (
        <div className="card-base p-5">
          <h3 className="text-base font-bold">{selectedTopic.name}</h3>
          {adaptiveTopic ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant={adaptiveTopic.masteryLevel === "Mastered" || adaptiveTopic.masteryLevel === "Strong" ? "success" : adaptiveTopic.masteryLevel === "Developing" ? "warning" : "destructive"}>
                {adaptiveTopic.masteryLevel} · {adaptiveTopic.masteryScore}%
              </Badge>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                {adaptiveTopic.trend === "improving" ? <TrendingUp size={12} /> : adaptiveTopic.trend === "declining" ? <TrendingDown size={12} /> : <Minus size={12} />} {adaptiveTopic.trend}
              </span>
              <span className="caption">· {adaptiveTopic.correct}/{adaptiveTopic.attempts} · {adaptiveTopic.accuracy}%</span>
              <span className={`badge text-[11px] ${adaptiveTopic.priority === "high" ? "badge-destructive" : adaptiveTopic.priority === "medium" ? "badge-warning" : "badge-success"}`}>{adaptiveTopic.priority}</span>
            </div>
          ) : (
            <p className="caption mt-2">Not assessed yet — learn will build your baseline.</p>
          )}
          {adaptiveTopic && <p className="caption mt-2 italic">“{adaptiveTopic.reason}” — {adaptiveTopic.recommendedAction}</p>}
        </div>
      )}

      {loading ? (
        <div className="card-base p-10 text-center">
          <p className="text-sm text-muted-foreground">Generating learning content for {selectedTopic?.name}…</p>
          <p className="caption mt-1">Using Groq AI with your exam context.</p>
        </div>
      ) : error ? (
        <div className="card-base p-6">
          <p className="text-sm text-destructive">{error}</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => selectedTopicId && loadLearn(selectedTopicId)}>
            Retry
          </Button>
        </div>
      ) : learnContent ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen size={16} className="text-primary" /> What you should know
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed">
              <p className="text-foreground">{learnContent.explanation}</p>
              <div>
                <h4 className="text-sm font-semibold">Key concepts</h4>
                <ul className="mt-1 list-disc pl-5 space-y-1">
                  {learnContent.keyConcepts.map((c, i) => (
                    <li key={i} className="text-sm">{c}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary-tint p-3">
                <h4 className="text-sm font-semibold">Example</h4>
                <p className="mt-1 text-sm">{learnContent.example}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Common mistakes</h4>
                <ul className="mt-1 list-disc pl-5 space-y-1">
                  {learnContent.commonMistakes.map((c, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold">What you should know for the exam</h4>
                <ul className="mt-1 list-disc pl-5 space-y-1">
                  {learnContent.whatYouShouldKnow.map((c, i) => (
                    <li key={i} className="text-sm">{c}</li>
                  ))}
                </ul>
              </div>
              {learnContent.formulas && learnContent.formulas.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold">Key formulas / relationships</h4>
                  <ul className="mt-1 list-disc pl-5 space-y-1">
                    {learnContent.formulas.map((f, i) => (
                      <li key={i} className="font-mono text-sm">{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {!showCheck ? (
            <div className="flex justify-center">
              <Button onClick={() => setShowCheck(true)} disabled={checkQuestions.length === 0}>
                <Target size={16} /> Check your understanding ({checkQuestions.length} questions)
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Target size={16} className="text-primary" /> Check for understanding
              </h3>
              <p className="caption">Answer these to see how well you’ve understood. Only your actual answers will affect mastery.</p>
              {checkQuestions.map((q, idx) => (
                <div key={q.id} className="card-base p-5">
                  <p className="text-xs font-semibold text-muted-foreground">Question {idx + 1} of {checkQuestions.length} · {q.type}</p>
                  <h4 className="mt-2 text-sm font-semibold">{q.prompt}</h4>
                  <div className="mt-3">
                    <QuestionRenderer question={q} value={checkAnswers[q.id] ?? null} onChange={(v) => setCheckAnswers((prev) => ({ ...prev, [q.id]: v }))} />
                  </div>
                  {checkSubmitted && checkResults[q.id] && (
                    <QuestionResult status={checkResults[q.id].status} score={checkResults[q.id].score} explanation={checkResults[q.id].feedback ?? q.explanation} />
                  )}
                </div>
              ))}
              {!checkSubmitted ? (
                <div className="flex justify-center">
                  <Button
                    onClick={handleSubmitCheck}
                    disabled={Object.keys(checkAnswers).length < checkQuestions.length || Object.values(checkAnswers).some((v) => v === null || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0))}
                  >
                    Submit check
                  </Button>
                </div>
              ) : (
                <div className="card-base p-5 border-success/20 bg-success-tint">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-success" />
                    <h4 className="text-sm font-semibold">Check complete</h4>
                  </div>
                  <p className="caption mt-1">
                    You got {Object.values(checkResults).filter((r) => r.correct).length} / {checkQuestions.length} correct.{" "}
                    {Object.values(checkResults).some((r) => !r.correct) ? "Review the explanations and try practice for the same topic." : "Great — you’re ready for practice!"}
                  </p>
                  <p className="caption mt-1">Mastery was only updated based on your actual answers — simply opening Learn did not grant mastery.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => onContinueToPractice?.(selectedTopicId)}>
                      <Play size={14} /> Continue to Practice for {selectedTopic?.name}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowCheck(false)}>
                      Back to content
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
