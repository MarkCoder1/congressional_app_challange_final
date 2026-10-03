"use client";

// /app/dev/visual-questions/page.tsx
//
// Development-only harness for the six visual question types. Lets you
// manually test rendering, interaction, submit, correct/incorrect/partial,
// and reset for each deterministic fixture. Not linked from navigation.

import { useMemo, useState } from "react";
import { QuestionRenderer } from "@/components/questions/question-renderer";
import { QuestionResult } from "@/components/questions/question-result";
import { evaluateQuestion } from "@/lib/questions/evaluate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Question, QuestionAnswer } from "@/types/question";
import {
  diagramLabelFixture,
  graphSelectPointFixture,
  graphNumericFixture,
  graphChooseFixture,
  timelineFixture,
  flowchartFixture,
  scenarioFixture,
  errorDetectionFixture,
} from "@/lib/questions/visual-fixtures";

const FIXTURES: { key: string; label: string; question: Question }[] = [
  { key: "diagram-label", label: "Diagram Label", question: diagramLabelFixture },
  { key: "graph-point", label: "Graph — Select Point", question: graphSelectPointFixture },
  { key: "graph-numeric", label: "Graph — Numeric", question: graphNumericFixture },
  { key: "graph-choose", label: "Graph — Choose", question: graphChooseFixture },
  { key: "timeline", label: "Timeline", question: timelineFixture },
  { key: "flowchart", label: "Flowchart", question: flowchartFixture },
  { key: "scenario", label: "Scenario", question: scenarioFixture },
  { key: "error-detection", label: "Error Detection", question: errorDetectionFixture },
];

function correctAnswerFor(q: Question): QuestionAnswer {
  switch (q.type) {
    case "diagram-label":
      return (q as typeof diagramLabelFixture).correctPlacements;
    case "graph": {
      const g = q as typeof graphSelectPointFixture;
      if (g.interaction === "numeric") return (g as typeof graphNumericFixture).correctValue ?? 0;
      return (g.correctAnswer as string) ?? "";
    }
    case "timeline":
      return (q as typeof timelineFixture).correctOrder;
    case "flowchart":
      return (q as typeof flowchartFixture).correctOrder;
    case "scenario":
      return (q as typeof scenarioFixture).correctAnswer;
    case "error-detection":
      return (q as typeof errorDetectionFixture).errorStepId;
    default:
      return null;
  }
}

function wrongAnswerFor(q: Question): QuestionAnswer {
  switch (q.type) {
    case "diagram-label": {
      const dl = q as typeof diagramLabelFixture;
      // swap first two placements to create partial/wrong
      const keys = Object.keys(dl.correctPlacements);
      if (keys.length < 2) return { [keys[0]]: "wrong" };
      const a = keys[0];
      const b = keys[1];
      return { ...dl.correctPlacements, [a]: dl.correctPlacements[b], [b]: dl.correctPlacements[a] };
    }
    case "graph": {
      const g = q as typeof graphSelectPointFixture;
      if (g.interaction === "numeric") return 999;
      if (g.interaction === "choose-graph") {
        const opts = (g as typeof graphChooseFixture).options ?? [];
        const wrong = opts.find((o) => o.id !== g.correctAnswer);
        return wrong ? wrong.id : "wrong";
      }
      // select-point / select-region: pick a different point
      const pts = (g as typeof graphSelectPointFixture).points ?? [];
      const wrongPt = pts.find((p) => p.id !== g.correctAnswer);
      return wrongPt ? wrongPt.id : "wrong";
    }
    case "timeline": {
      const tl = q as typeof timelineFixture;
      return [...tl.correctOrder].reverse();
    }
    case "flowchart": {
      const fc = q as typeof flowchartFixture;
      return [...fc.correctOrder].reverse();
    }
    case "scenario": {
      const sc = q as typeof scenarioFixture;
      const wrong = sc.options.find((o) => o.id !== sc.correctAnswer);
      return wrong ? wrong.id : "wrong";
    }
    case "error-detection": {
      const ed = q as typeof errorDetectionFixture;
      const wrong = ed.steps.find((s) => s.id !== ed.errorStepId);
      return wrong ? wrong.id : "wrong";
    }
    default:
      return null;
  }
}

function partialAnswerFor(q: Question): QuestionAnswer | null {
  if (q.type === "diagram-label") {
    const dl = q as typeof diagramLabelFixture;
    const entries = Object.entries(dl.correctPlacements);
    if (entries.length < 2) return null;
    // only first half correct
    const half = Math.floor(entries.length / 2);
    const partial: Record<string, string> = {};
    entries.slice(0, half).forEach(([k, v]) => (partial[k] = v));
    // make rest wrong
    entries.slice(half).forEach(([k]) => (partial[k] = "wrong-region"));
    return partial;
  }
  if (q.type === "timeline") {
    const tl = q as typeof timelineFixture;
    // one in correct position, rest shuffled
    const arr = [...tl.correctOrder];
    if (arr.length >= 3) {
      const tmp = arr[1];
      arr[1] = arr[2];
      arr[2] = tmp;
    }
    return arr;
  }
  if (q.type === "flowchart") {
    const fc = q as typeof flowchartFixture;
    const arr = [...fc.correctOrder];
    if (arr.length >= 3) {
      const tmp = arr[1];
      arr[1] = arr[2];
      arr[2] = tmp;
    }
    return arr;
  }
  return null;
}

function HarnessItem({ question }: { question: Question }) {
  const [value, setValue] = useState<QuestionAnswer>(null);
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    if (!submitted) return null;
    return evaluateQuestion(question, value ?? undefined);
  }, [question, value, submitted]);

  const correct = correctAnswerFor(question);
  const wrong = wrongAnswerFor(question);
  const partial = partialAnswerFor(question);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {question.prompt}
          <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {question.type}
          </span>
        </CardTitle>
        <CardDescription>
          {question.topic ?? question.topicId} · {question.difficulty ?? "medium"} · id: {question.id}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <QuestionRenderer question={question} value={value} onChange={(v) => { setValue(v); setSubmitted(false); }} />

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setSubmitted(true)}>
            Submit
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setValue(null); setSubmitted(false); }}>
            Reset
          </Button>
          <Button size="sm" variant="secondary" onClick={() => { setValue(correct); setSubmitted(false); }}>
            Set correct
          </Button>
          <Button size="sm" variant="secondary" onClick={() => { setValue(wrong); setSubmitted(false); }}>
            Set wrong
          </Button>
          {partial && (
            <Button size="sm" variant="secondary" onClick={() => { setValue(partial); setSubmitted(false); }}>
              Set partial
            </Button>
          )}
        </div>

        {submitted && result && (
          <QuestionResult status={result.status} score={result.score} explanation={result.feedback ?? question.explanation} />
        )}

        <details className="rounded-lg border border-border bg-bg-sunken p-3">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground">Debug</summary>
          <pre className="mt-2 overflow-auto text-xs">{JSON.stringify({ value, correct, result }, null, 2)}</pre>
        </details>
      </CardContent>
    </Card>
  );
}

export default function VisualQuestionsHarnessPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Visual Questions — Dev Harness</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Development-only. Test rendering, interaction, submit, correct / incorrect / partial, and reset for each visual type. Not linked from production navigation.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Route: /dev/visual-questions · Fixtures from lib/questions/visual-fixtures.ts</p>
      </div>

      <Tabs defaultValue={FIXTURES[0].key} className="w-full">
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          {FIXTURES.map((f) => (
            <TabsTrigger key={f.key} value={f.key} className="text-xs">
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {FIXTURES.map((f) => (
          <TabsContent key={f.key} value={f.key} className="mt-4">
            <HarnessItem question={f.question} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
