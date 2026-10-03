"use client";

import { Target, TrendingUp, TrendingDown, Minus, Info, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdaptiveState } from "@/types/task";
import { rankTopicsByPriority, getNextLearningAction } from "@/lib/adaptive/engine";

interface Props {
  adaptive: AdaptiveState | null | undefined;
  examDate?: string;
  onClear?: () => void;
}

const TREND_ICON = {
  improving: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};

const PRIORITY_BADGE: Record<string, "destructive" | "warning" | "success"> = {
  high: "destructive",
  medium: "warning",
  low: "success",
};

const MASTERY_BADGE: Record<string, "success" | "warning" | "destructive" | "muted"> = {
  Mastered: "success",
  Strong: "success",
  Developing: "warning",
  "Needs Review": "destructive",
};

export function AdaptiveOverview({ adaptive, examDate, onClear }: Props) {
  if (!adaptive || Object.keys(adaptive.topics).length === 0) {
    return (
      <div className="card-base p-6">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Adaptive Learning</h3>
        </div>
        <p className="caption mt-2">Complete the diagnostic to unlock your adaptive plan. Your weak areas will be ranked and your next step will adapt.</p>
      </div>
    );
  }

  const ranked = rankTopicsByPriority(adaptive, examDate);
  const next = getNextLearningAction(adaptive, examDate);
  const focus = next.topicId ? adaptive.topics[next.topicId] : ranked[0];

  return (
    <div className="space-y-4">
      {/* Current Focus */}
      <div className="card-base p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="uppercase-label text-primary">Your current focus</p>
            <h3 className="mt-1 text-lg font-bold text-foreground">
              {focus ? focus.topic : next.topic ?? "Mixed practice"}
            </h3>
            {focus && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={MASTERY_BADGE[focus.masteryLevel] ?? "muted"} className="text-xs">
                  {focus.masteryLevel} · {focus.masteryScore}%
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  {(() => {
                    const Icon = TREND_ICON[focus.trend] ?? Minus;
                    return <Icon size={12} />;
                  })()}
                  {focus.trend}
                </span>
                <span className="caption">· {focus.attempts} attempts · {focus.accuracy}% accuracy</span>
              </div>
            )}
            <p className="caption mt-2 max-w-prose">{next.why}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-foreground">Recommended:</span>
              <Badge variant="muted">{next.label}</Badge>
              {next.reason && <span className="caption">· {next.reason}</span>}
            </div>
          </div>
          {onClear && (
            <Button variant="ghost" size="sm" onClick={onClear} className="shrink-0">
              <RefreshCcw size={14} /> Reset
            </Button>
          )}
        </div>

        {/* Why this? collapsible */}
        <details className="mt-4 rounded-lg border border-border bg-secondary/20 p-3">
          <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-foreground">
            <Info size={12} /> Why this?
          </summary>
          <p className="caption mt-2 leading-relaxed">
            {focus
              ? `You are practicing "${focus.topic}" because ${focus.reason}. Mastery ${focus.masteryScore}% (${focus.masteryLevel}), accuracy ${focus.accuracy}% over ${focus.attempts} attempts, trend ${focus.trend}. ${focus.explanation}`
              : next.why}
          </p>
        </details>
      </div>

      {/* Compact topic list */}
      <div className="card-base p-5">
        <h4 className="text-sm font-semibold text-foreground">Topics by priority</h4>
        <p className="caption">Ranked by mastery, mistakes, trend, and exam proximity.</p>
        <ul className="mt-4 space-y-2">
          {ranked.map((t) => {
            const TrendIcon = TREND_ICON[t.trend] ?? Minus;
            return (
              <li
                key={t.topicId}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{t.topic}</p>
                  <p className="caption truncate">{t.reason}</p>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <span className="inline-flex items-center gap-1 text-[11px]">
                    <Badge variant={MASTERY_BADGE[t.masteryLevel] ?? "muted"} className="px-2 py-0.5 text-[11px]">{t.masteryLevel} {t.masteryScore}%</Badge>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <TrendIcon size={11} /> {t.trend} · <Badge variant={PRIORITY_BADGE[t.priority] ?? "muted"} className="px-1.5 py-0.5 text-[10px]">{t.priority}</Badge>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
