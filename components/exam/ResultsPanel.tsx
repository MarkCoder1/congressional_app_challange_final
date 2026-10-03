"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ExamContent } from "@/types/task";
import { Target, TrendingUp, Flag, BarChart3, RotateCcw } from "lucide-react";

interface Props {
  examContent: ExamContent;
  taskId: string;
  onRetakeMock?: () => void;
  onNavigate?: (section: "practice" | "review" | "study-plan" | "mock-exam" | "topics") => void;
  onPracticeTopic?: (topicId: string) => void;
  onReviewTopic?: (topicId: string) => void;
}

export function ResultsPanel({ examContent, onRetakeMock, onNavigate, onPracticeTopic, onReviewTopic }: Props) {
  const history = examContent.mockTestHistory ?? [];
  const latest = history.length > 0 ? history[history.length - 1] : examContent.mockTest?.result ? examContent.mockTest : null;
  // If mockTest is in_progress without result, history may be empty
  const result = latest && "result" in latest ? (latest as any).result ?? (latest as any) : latest && (latest as any).overallScore !== undefined ? latest : null;
  // Normalize: history entries are MockTestAttempt with result, or if examContent.mockTest is completed with result
  const mockResult = examContent.mockTest?.result ?? (history.length > 0 ? history[history.length - 1].result : null) ?? result;

  if (!mockResult || !("overallScore" in mockResult)) {
    return (
      <div className="card-base p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <BarChart3 size={24} />
        </div>
        <h2 className="mt-4 text-lg font-semibold">No results yet</h2>
        <p className="caption mx-auto mt-2 max-w-md">Complete a mock test to see your exam readiness, strengths, weaknesses, and topic breakdown.</p>
      </div>
    );
  }

  const r = mockResult as any;
  const topicPerformance = r.topicPerformance ?? [];
  const strengths: string[] = r.strengths ?? [];
  const weaknesses: string[] = r.weaknesses ?? [];
  const overallScore: number = r.overallScore ?? 0;
  const correctCount: number = r.correctCount ?? 0;
  const totalQuestions: number = r.totalQuestions ?? 0;

  return (
    <div className="space-y-6">
      <div className="card-base p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Mock Test Results</h2>
            <p className="caption">Completed {r.completedAt ? new Date(r.completedAt).toLocaleString() : ""}</p>
          </div>
          <div className="text-right">
            <p className="uppercase-label text-primary">Overall Score</p>
            <p className="text-3xl font-bold text-foreground">{overallScore}%</p>
            <p className="caption">{correctCount} / {totalQuestions} correct</p>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={overallScore} className="h-2" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-base p-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-success" />
            <h3 className="text-sm font-semibold">Strengths</h3>
          </div>
          {strengths.length === 0 ? (
            <p className="caption mt-2">No strong topics yet. Keep practicing!</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {strengths.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card-base p-5">
          <div className="flex items-center gap-2">
            <Flag size={16} className="text-destructive" />
            <h3 className="text-sm font-semibold">Weaknesses</h3>
          </div>
          {weaknesses.length === 0 ? (
            <p className="caption mt-2">No weaknesses — excellent!</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {weaknesses.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card-base p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Target size={16} className="text-primary" /> Topic Breakdown
        </h3>
        {topicPerformance.length === 0 ? (
          <p className="caption mt-2">No topic data.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {topicPerformance.map((p: any) => (
              <div key={p.topicId} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{p.topic}</span>
                  <Badge variant={p.mastery === "Mastered" || p.mastery === "Strong" ? "success" : p.mastery === "Developing" ? "warning" : "destructive"} className="text-[11px]">
                    {p.mastery} · {p.accuracy}%
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={p.accuracy} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">
                    {p.correct}/{p.attempted}
                  </span>
                </div>
                <p className="caption mt-1">{p.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-base p-5">
        <h3 className="text-sm font-semibold">Recommended Next Steps</h3>
        {weaknesses.length > 0 ? (
          <>
            <p className="caption mt-2">
              Focus your next study sessions on <span className="font-medium text-foreground">{weaknesses.slice(0, 2).join(" and ")}</span>. Your study plan has been updated to prioritize these topics with targeted practice and spaced reviews.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {weaknesses.slice(0, 2).map((w) => {
                const topicId = topicPerformance.find((p: any) => p.topic === w)?.topicId;
                return (
                  <Button
                    key={w}
                    size="sm"
                    onClick={() => {
                      if (topicId && onPracticeTopic) onPracticeTopic(topicId);
                      else if (onNavigate) onNavigate("practice");
                    }}
                  >
                    Practice {w}
                  </Button>
                );
              })}
              {weaknesses.slice(0, 1).map((w) => {
                const topicId = topicPerformance.find((p: any) => p.topic === w)?.topicId;
                return (
                  <Button
                    key={`review-${w}`}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (topicId && onReviewTopic) onReviewTopic(topicId);
                      else if (onNavigate) onNavigate("review");
                    }}
                  >
                    Review {w}
                  </Button>
                );
              })}
              <Button size="sm" variant="ghost" onClick={() => onNavigate?.("study-plan")}>
                Study Plan
              </Button>
            </div>
          </>
        ) : (
          <p className="caption mt-2">All topics look strong. Your study plan will shift to mixed practice and maintenance reviews to keep you sharp for exam day.</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {onRetakeMock && (
            <Button variant="outline" size="sm" onClick={onRetakeMock}>
              <RotateCcw size={14} /> Retake Mock Test
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onNavigate?.("study-plan")}>
            Study Plan
          </Button>
        </div>
      </div>

      {history.length > 1 && (
        <div className="card-base p-5">
          <h3 className="text-sm font-semibold">History ({history.length} attempts)</h3>
          <ul className="mt-3 space-y-1">
            {history
              .slice()
              .reverse()
              .slice(0, 5)
              .map((h: any) => (
                <li key={h.id} className="flex items-center justify-between text-sm">
                  <span>{h.completedAt ? new Date(h.completedAt).toLocaleDateString() : h.createdAt ? new Date(h.createdAt).toLocaleDateString() : h.id}</span>
                  <span className="font-medium">{h.result?.overallScore ?? "?"}% · {h.result?.correctCount ?? "?"}/{h.result?.totalQuestions ?? "?"}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
