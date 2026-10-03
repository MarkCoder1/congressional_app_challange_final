"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExamTopic, AdaptiveState, StudyPlan } from "@/types/task";
import { generateStudyPlan, STUDY_PLAN_CONFIG } from "@/lib/exam/studyPlan";
import { calculateTopicScores } from "@/lib/exam/studyPlan";
import { getBaseInterval } from "@/lib/exam/spacedReview";
import {
  weakTopicFixture,
  strongTopicFixture,
  decliningFixture,
  repeatedMistakesFixture,
  mixedPerformanceFixture,
} from "@/lib/adaptive/fixtures";

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
function today(): string {
  return new Date().toISOString().split("T")[0];
}

const BASE_TOPICS: ExamTopic[] = [
  { id: "t-a", name: "Algebra" },
  { id: "t-b", name: "Geometry" },
  { id: "t-c", name: "Statistics" },
  { id: "t-d", name: "Calculus" },
];

type FixtureKey =
  | "30days"
  | "7days"
  | "tomorrow"
  | "oneWeak"
  | "multiWeak"
  | "strong"
  | "declining"
  | "overdue"
  | "missed"
  | "limitedTime";

const FIXTURES: Record<FixtureKey, { label: string; examDays: number; adaptive: () => AdaptiveState; daily?: number; note: string }> = {
  "30days": { label: "Exam in 30 days", examDays: 30, adaptive: weakTopicFixture, note: "Long horizon, balanced allocation" },
  "7days": { label: "Exam in 7 days", examDays: 7, adaptive: weakTopicFixture, note: "Urgency boosts weak topics" },
  tomorrow: { label: "Exam tomorrow", examDays: 1, adaptive: weakTopicFixture, note: "Only today available" },
  oneWeak: { label: "One very weak topic", examDays: 14, adaptive: () => weakTopicFixture(), note: "Quadratic 20% vs others 90% → weak gets most time" },
  multiWeak: { label: "Multiple weak topics", examDays: 14, adaptive: mixedPerformanceFixture, note: "All topics low-mid → distributed" },
  strong: { label: "Strong/improving", examDays: 14, adaptive: strongTopicFixture, note: "All high → review + maintenance" },
  declining: { label: "Declining topic", examDays: 14, adaptive: decliningFixture, note: "Declining trend adds priority" },
  overdue: { label: "Overdue reviews", examDays: 14, adaptive: repeatedMistakesFixture, note: "Repeated mistakes + review due" },
  missed: { label: "Missed sessions", examDays: 14, adaptive: mixedPerformanceFixture, note: "Generate then miss a session" },
  limitedTime: { label: "Limited time (15 min/day)", examDays: 14, adaptive: weakTopicFixture, daily: 15, note: "Daily cap forces min sessions" },
};

export default function StudyPlanHarnessPage() {
  const [key, setKey] = useState<FixtureKey>("30days");
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [debug, setDebug] = useState(false);
  const [availableDaily, setAvailableDaily] = useState<number | undefined>(undefined);

  const fixture = FIXTURES[key];
  const examDate = addDays(today(), fixture.examDays);
  const adaptive = useMemo(() => fixture.adaptive(), [fixture]);
  const daily = availableDaily ?? fixture.daily ?? 60;

  const topicScores = useMemo(() => calculateTopicScores(BASE_TOPICS, adaptive, [], examDate, today()), [adaptive, examDate]);

  function handleGenerate() {
    const p = generateStudyPlan({
      examDate,
      currentDate: today(),
      topics: BASE_TOPICS,
      adaptive,
      existingPlan: null,
      availableDailyMinutes: daily,
      estimatedMinutes: 300,
      nowIso: new Date().toISOString(),
    });
    setPlan(p);
  }

  function handleRecalc() {
    const p = generateStudyPlan({
      examDate,
      currentDate: today(),
      topics: BASE_TOPICS,
      adaptive,
      existingPlan: plan,
      availableDailyMinutes: daily,
      estimatedMinutes: 300,
      nowIso: new Date().toISOString(),
    });
    setPlan(p);
  }

  function handleComplete() {
    if (!plan || plan.sessions.length === 0) return;
    const firstPlanned = plan.sessions.find((s) => s.status === "planned");
    if (!firstPlanned) return;
    const updated: StudyPlan = {
      ...plan,
      sessions: plan.sessions.map((s) => (s.id === firstPlanned.id ? { ...s, status: "completed" as const } : s)),
    };
    setPlan(updated);
  }

  function handleMiss() {
    if (!plan) return;
    const firstPlanned = plan.sessions.find((s) => s.status === "planned");
    if (!firstPlanned) return;
    const missed: StudyPlan = {
      ...plan,
      sessions: plan.sessions.map((s) => (s.id === firstPlanned.id ? { ...s, status: "missed" as const } : s)),
    };
    // Recalc remaining
    const recalc = generateStudyPlan({
      examDate,
      currentDate: today(),
      topics: BASE_TOPICS,
      adaptive,
      existingPlan: missed,
      availableDailyMinutes: daily,
      estimatedMinutes: 300,
      nowIso: new Date().toISOString(),
    });
    setPlan(recalc);
  }

  function handleReset() {
    setPlan(null);
  }

  const totalPlanned = plan ? plan.sessions.reduce((a, b) => a + b.durationMinutes, 0) : 0;
  const completed = plan ? plan.sessions.filter((s) => s.status === "completed").reduce((a, b) => a + b.durationMinutes, 0) : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Study Plan — Dev Harness</h1>
        <p className="caption mt-1">Deterministic fixtures for Study Plan + Spaced Review. Route: /dev/study-plan</p>
        <p className="caption">Not linked from production navigation. Tests real calculations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Fixtures</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {Object.entries(FIXTURES).map(([k, v]) => (
            <Button key={k} size="sm" variant={key === k ? "default" : "outline"} onClick={() => { setKey(k as FixtureKey); setPlan(null); }}>
              {v.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Current Fixture: {fixture.label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Exam:</span> {examDate} ({fixture.examDays} days) · <span className="font-medium">Daily:</span> {daily} min · {fixture.note}</p>
          <p><span className="font-medium">Base intervals:</span> Needs Review {getBaseInterval("Needs Review")}d, Developing {getBaseInterval("Developing")}d, Strong {getBaseInterval("Strong")}d, Mastered {getBaseInterval("Mastered")}d</p>
          <p><span className="font-medium">Config:</span> MIN {STUDY_PLAN_CONFIG.MIN_SESSION_MINUTES} · MAX {STUDY_PLAN_CONFIG.MAX_SESSION_MINUTES} · DAILY MAX {STUDY_PLAN_CONFIG.MAX_DAILY_MINUTES}</p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs">Daily minutes:</label>
            <input
              type="number"
              value={daily}
              onChange={(e) => setAvailableDaily(Number(e.target.value) || 60)}
              className="w-20 rounded border border-border px-2 py-1 text-sm"
              min={15}
              max={180}
            />
            <Badge variant="muted">{today()} → {examDate}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleGenerate}>Generate Plan</Button>
          <Button size="sm" variant="outline" onClick={handleRecalc} disabled={!plan}>Recalculate</Button>
          <Button size="sm" variant="secondary" onClick={handleComplete} disabled={!plan}>Complete Session</Button>
          <Button size="sm" variant="secondary" onClick={handleMiss} disabled={!plan}>Miss Session</Button>
          <Button size="sm" variant="ghost" onClick={handleReset}>Reset</Button>
          <Button size="sm" variant="outline" onClick={() => setDebug(!debug)}>{debug ? "Hide Debug" : "Show Debug"}</Button>
        </CardContent>
      </Card>

      {plan ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Plan Summary — v{plan.planVersion} · {plan.sessions.length} sessions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-lg border border-border p-3">
                <p className="caption">Total planned</p>
                <p className="text-lg font-bold">{totalPlanned} min</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="caption">Completed</p>
                <p className="text-lg font-bold text-success">{completed} min</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="caption">Generated</p>
                <p className="text-sm">{new Date(plan.generatedAt).toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="caption">Topics</p>
                <p className="text-sm">{BASE_TOPICS.map((t) => t.name).join(", ")}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sessions by date</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(
                plan.sessions.reduce((acc: Record<string, typeof plan.sessions>, s) => {
                  if (!acc[s.date]) acc[s.date] = [];
                  acc[s.date].push(s);
                  return acc;
                }, {}),
              )
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, sessions]) => (
                  <div key={date} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-semibold">{date} · {sessions.reduce((a, b) => a + b.durationMinutes, 0)} min</p>
                    <ul className="mt-1 space-y-1">
                      {sessions.map((s) => (
                        <li key={s.id} className="flex items-center justify-between text-sm">
                          <span>{s.topicName} · {s.type} · {s.durationMinutes} min · p{s.priority} · {s.source}</span>
                          <Badge variant={s.status === "completed" ? "success" : s.status === "missed" ? "destructive" : "muted"} className="text-[11px]">{s.status}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {plan.reviews.map((r) => (
                  <li key={r.topicId} className="flex items-center justify-between">
                    <span>{BASE_TOPICS.find((t) => t.id === r.topicId)?.name ?? r.topicId}</span>
                    <span className="caption">next {r.nextReviewAt} · {r.intervalDays}d · {r.reviewCount} reviews</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="caption">No plan generated yet. Click Generate Plan.</p>
          </CardContent>
        </Card>
      )}

      {debug && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-semibold">Topic scores</p>
              <pre className="mt-1 overflow-auto rounded bg-secondary p-3 text-xs">{JSON.stringify(topicScores, null, 2)}</pre>
            </div>
            <div>
              <p className="text-xs font-semibold">Plan JSON</p>
              <pre className="mt-1 max-h-96 overflow-auto rounded bg-secondary p-3 text-xs">{JSON.stringify(plan, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
