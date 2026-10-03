"use client";

import { useState } from "react";
import { AdaptiveOverview } from "@/components/adaptive/AdaptiveOverview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionRenderer } from "@/components/questions/question-renderer";
import { selectNextQuestion, getNextLearningAction, rankTopicsByPriority, adaptDifficulty } from "@/lib/adaptive/engine";
import type { Question } from "@/types/question";
import type { AdaptiveState } from "@/types/task";
import {
  weakTopicFixture,
  strongTopicFixture,
  improvingFixture,
  decliningFixture,
  repeatedMistakesFixture,
  mixedPerformanceFixture,
  allTopics,
} from "@/lib/adaptive/fixtures";
import { diagramLabelFixture } from "@/lib/questions/visual-fixtures";

const FIXTURES: Record<string, { label: string; build: () => AdaptiveState }> = {
  weak: { label: "Weak topic (A 20%, B 90%)", build: weakTopicFixture },
  strong: { label: "Strong (all high)", build: strongTopicFixture },
  improving: { label: "Improving (40→80)", build: improvingFixture },
  declining: { label: "Declining (90→45)", build: decliningFixture },
  repeated: { label: "Repeated mistakes (3 in a row)", build: repeatedMistakesFixture },
  mixed: { label: "Mixed performance", build: mixedPerformanceFixture },
};

// Small question pool for selection demo (one per topic)
const POOL: Question[] = [
  { id: "q1", type: "multiple-choice", topicId: "t-a", topic: "Quadratic Equations", prompt: "Solve x²=4", difficulty: "medium", options: [{ id: "a", text: "2" }, { id: "b", text: "-2" }], correctAnswer: "a" } as Question,
  { id: "q2", type: "multiple-choice", topicId: "t-b", topic: "Linear Functions", prompt: "Slope of y=2x+1?", difficulty: "easy", options: [{ id: "a", text: "2" }, { id: "b", text: "1" }], correctAnswer: "a" } as Question,
  { id: "q3", type: "multiple-choice", topicId: "t-c", topic: "Geometry", prompt: "Area of circle r=1?", difficulty: "hard", options: [{ id: "a", text: "π" }, { id: "b", text: "2π" }], correctAnswer: "a" } as Question,
  diagramLabelFixture as unknown as Question,
];

export default function AdaptiveHarnessPage() {
  const [key, setKey] = useState<keyof typeof FIXTURES>("weak");
  const [state, setState] = useState<AdaptiveState>(() => FIXTURES.weak.build());
  // Stable exam date for demo (5 days from now)
  const examDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split("T")[0];
  })();

  function load(k: keyof typeof FIXTURES) {
    setKey(k);
    setState(FIXTURES[k].build());
  }

  const ranked = rankTopicsByPriority(state, examDate);
  const nextAction = getNextLearningAction(state, undefined, allTopics());
  const selection = selectNextQuestion({ topics: allTopics(), questions: POOL, state });

  const difficultyDemo = {
    easy: adaptDifficulty("easy", [100, 100, 100], 3),
    mediumWeak: adaptDifficulty("medium", [0, 0, 20], 3),
    mediumStrong: adaptDifficulty("medium", [100, 80, 90], 3),
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Adaptive Learning — Dev Harness</h1>
        <p className="caption mt-1">Deterministic fixtures. Inspect mastery, trend, priority, next action, selection, and difficulty. Route: /dev/adaptive</p>
        <p className="caption">Not linked from production navigation.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Fixtures</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {Object.entries(FIXTURES).map(([k, v]) => (
            <Button key={k} size="sm" variant={key === k ? "default" : "outline"} onClick={() => load(k as keyof typeof FIXTURES)}>
              {v.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <AdaptiveOverview adaptive={state} examDate={examDate} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Next Action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-semibold">Action:</span> {nextAction.action} — {nextAction.label}</p>
            <p><span className="font-semibold">Topic:</span> {nextAction.topic ?? "(none)"}</p>
            <p><span className="font-semibold">Reason:</span> {nextAction.reason}</p>
            <p className="caption leading-relaxed"><span className="font-medium">Why:</span> {nextAction.why}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Question Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-semibold">Selected:</span> {selection.question?.id ?? "none"} — {selection.question?.prompt ?? selection.reason}</p>
            <p><span className="font-semibold">Topic:</span> {selection.topic ?? "-"}</p>
            <p><span className="font-semibold">Reason:</span> {selection.reason}</p>
            {selection.question && <p><span className="font-semibold">Difficulty:</span> {selection.question.difficulty ?? "-"}</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ranked Topics (by priority)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded bg-secondary p-3 text-xs">{JSON.stringify(ranked.map((t) => ({ topic: t.topic, mastery: t.masteryScore, level: t.masteryLevel, trend: t.trend, priority: t.priority, score: t.priorityScore, reason: t.reason, next: t.nextAction })), null, 2)}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Difficulty Adaptation Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>easy + strong (100,100,100) → {difficultyDemo.easy}</p>
          <p>medium + weak (0,0,20) → {difficultyDemo.mediumWeak}</p>
          <p>medium + strong (100,80,90) → {difficultyDemo.mediumStrong}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Live Practice Demo (first selected question)</CardTitle>
        </CardHeader>
        <CardContent>
          {selection.question ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">{selection.question.prompt}</p>
              <QuestionRenderer question={selection.question} value={null} onChange={() => {}} />
              <p className="caption">Interact, then check adaptive update via recording. (This harness is read-only; use Exam Practice to persist.)</p>
            </div>
          ) : (
            <p className="caption">No question available.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">History (last 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded bg-secondary p-3 text-xs">{JSON.stringify(state.history.slice(-10), null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
