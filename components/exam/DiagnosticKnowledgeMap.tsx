"use client";

// /components/exam/DiagnosticKnowledgeMap.tsx
//
// Phase 2 results view: a visual Knowledge Map of the exam topics coloured by
// mastery, an interactive topic-detail panel, Strong/Developing/Needs Review
// summary, and a Recommended Focus (weakest topic) call-out. Pure CSS layout —
// no third-party visualization library.

import { useState } from "react";
import {
  Brain,
  CheckCircle2,
  FileQuestion,
  Flag,
  RotateCcw,
  Target,
  TrendingUp,
} from "lucide-react";
import type {
  DiagnosticResult,
  DiagnosticTopicPerformance,
  TopicMasteryLevel,
} from "@/types/task";

const MASTERY_STYLE: Record<
  TopicMasteryLevel,
  {
    dot: string;
    badge: string;
    ring: string;
    accent: string;
    label: string;
  }
> = {
  Mastered: {
    dot: "bg-success",
    badge: "badge-success",
    ring: "border-success/40",
    accent: "text-success",
    label: "Mastered",
  },
  Strong: {
    dot: "bg-success",
    badge: "badge-success",
    ring: "border-success/30",
    accent: "text-success",
    label: "Strong",
  },
  Developing: {
    dot: "bg-warning",
    badge: "badge-warning",
    ring: "border-warning/40",
    accent: "text-warning",
    label: "Developing",
  },
  "Needs Review": {
    dot: "bg-destructive",
    badge: "badge-destructive",
    ring: "border-destructive/40",
    accent: "text-destructive",
    label: "Needs Review",
  },
};

interface Props {
  result: DiagnosticResult;
  topicsAssessed: number;
  totalTopics: number;
  subject: string;
  onRetake?: () => void;
  retaking?: boolean;
}

export function DiagnosticKnowledgeMap({
  result,
  topicsAssessed,
  totalTopics,
  subject,
  onRetake,
  retaking,
}: Props) {
  const [selected, setSelected] = useState<DiagnosticTopicPerformance | null>(
    null,
  );

  const perTopic = result.topicPerformance ?? [];
  // Mastered is grouped with Strong for the summary (both success).
  const strong = perTopic.filter((p) => p.mastery === "Strong" || p.mastery === "Mastered");
  const developing = perTopic.filter((p) => p.mastery === "Developing");
  const needsReview = perTopic.filter((p) => p.mastery === "Needs Review");

  const active = selected ?? perTopic[0] ?? null;

  return (
    <div className="space-y-5">
      {/* Completion header */}
      <div className="card-base p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-tint text-success">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Diagnostic Complete
              </h2>
              <p className="caption">
                Topics assessed: {topicsAssessed} / {totalTopics}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="uppercase-label text-primary">Overall Score</p>
            <p className="text-3xl font-bold text-foreground">
              {result.overallScore}%
            </p>
          </div>
        </div>
      </div>

      {/* Knowledge Map */}
      <div className="card-base p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <Brain size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Knowledge Map
          </h3>
          <span className="caption">tap a topic for details</span>
        </div>

        <div className="flex flex-col items-center">
          {/* Subject root */}
          <div className="relative">
            <div className="rounded-xl border border-primary/30 bg-primary-tint px-5 py-3 text-center">
              <p className="text-sm font-bold text-primary">{subject}</p>
            </div>
          </div>

          {/* Connectors + topic nodes */}
          <div className="mt-0 w-full max-w-2xl">
            {/* vertical connector line */}
            <div className="mx-auto h-6 w-px bg-border" />
            {/* horizontal connector line */}
            <div className="relative mx-auto h-px w-4/5 bg-border" />
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {perTopic.map((p) => {
                const style = MASTERY_STYLE[p.mastery];
                const isActive = active?.topicId === p.topicId;
                return (
                  <button
                    key={p.topicId}
                    type="button"
                    onClick={() => setSelected(p)}
                    aria-pressed={isActive}
                    className={`rounded-xl border-2 p-4 text-left transition-all duration-150 ${
                      isActive
                        ? `border-accent bg-secondary/40 ring-2 ring-accent/20`
                        : `${style.ring} border bg-card hover:shadow-sm`
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-sm font-bold text-foreground">
                        {p.topic}
                      </span>
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} />
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-foreground">
                        {p.accuracy}%
                      </span>
                      <span className={`text-[11px] font-semibold uppercase tracking-wide ${style.accent}`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="caption mt-1.5">
                      {p.correct}/{p.attempted} correct
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Topic detail panel */}
        {active && <TopicDetail performance={active} />}
      </div>

      {/* Strong / Developing / Needs Review summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <TopicGroup
          title="Strong Topics"
          icon={<TrendingUp size={16} />}
          tone="success"
          items={strong.map((p) => p.topic)}
          empty="None yet"
        />
        <TopicGroup
          title="Developing"
          icon={<Target size={16} />}
          tone="warning"
          items={developing.map((p) => p.topic)}
          empty="None yet"
        />
        <TopicGroup
          title="Needs Review"
          icon={<Flag size={16} />}
          tone="destructive"
          items={needsReview.map((p) => p.topic)}
          empty="None — great job!"
        />
      </div>

      {/* Recommended focus */}
      <div className="card-base border-destructive/30 p-5">
        <div className="flex items-center gap-2">
          <Flag size={18} className="text-destructive" />
          <h3 className="text-sm font-semibold text-foreground">
            Recommended Focus
          </h3>
        </div>
        {result.recommendedFocus ? (
          <p className="mt-2 text-lg font-bold text-foreground">
            {result.recommendedFocus}
          </p>
        ) : (
          <p className="mt-2 text-sm text-foreground">
            All topics look strong — keep reviewing everything evenly.
          </p>
        )}
        {result.recommendedFocus && (
          <p className="caption mt-1">
            Start with {result.recommendedFocus} before moving to the next topic.
          </p>
        )}
      </div>

      {/* Retake */}
      {onRetake && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={onRetake}
            disabled={retaking}
            className="btn-secondary btn-sm"
          >
            {retaking ? (
              "Preparing new diagnostic…"
            ) : (
              <>
                <RotateCcw size={15} /> Retake Diagnostic
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function TopicDetail({ performance }: { performance: DiagnosticTopicPerformance }) {
  const style = MASTERY_STYLE[performance.mastery];
  return (
    <div className="mt-5 rounded-xl border border-border bg-secondary/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileQuestion size={17} className="text-primary" />
          <h4 className="text-base font-bold text-foreground">
            {performance.topic}
          </h4>
        </div>
        <span className={`badge ${style.badge}`}>{style.label}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Accuracy" value={`${performance.accuracy}%`} />
        <Stat label="Attempted" value={`${performance.attempted}`} />
        <Stat label="Correct" value={`${performance.correct}`} />
      </div>

      <p className="caption mt-4">{performance.explanation}</p>
      <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 p-3">
        <p className="text-sm font-medium text-accent">
          <span className="uppercase-label text-accent">Recommended action: </span>
          {performance.recommendedAction}
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="caption">{label}</p>
    </div>
  );
}

function TopicGroup({
  title,
  icon,
  tone,
  items,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  tone: "success" | "warning" | "destructive";
  items: string[];
  empty: string;
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : "text-destructive";
  return (
    <div className="card-base p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className={toneClass}>{icon}</span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="caption">{items.length}</span>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((name) => (
            <li key={name} className="flex items-center gap-2 text-sm text-foreground/80">
              <span className={`h-1.5 w-1.5 rounded-full ${tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-destructive"}`} />
              {name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="caption">{empty}</p>
      )}
    </div>
  );
}
