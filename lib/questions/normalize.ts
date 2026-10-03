// /lib/questions/normalize.ts
//
// Shared deterministic normalization helpers used by the evaluator and by the
// question renderers. Kept dependency-free so they can run in unit tests and in
// the server for persisted-data handling.

import type {
  Question,
  DiagramRegion,
  GraphPoint,
  GraphSeries,
  GraphLine,
  GraphInteraction,
  TimelineEvent,
  FlowchartEdge,
  ScenarioEvidence,
} from "@/types/question";

// Trim, collapse internal runs of whitespace, and (optionally) lowercase.
export function normalizeText(value: string, lower = true): string {
  const collapsed = value.replace(/\s+/g, " ").trim();
  return lower ? collapsed.toLowerCase() : collapsed;
}

// Strip surrounding units/commas/currency and parse a numeric string.
// Returns NaN when it cannot be parsed.
export function parseNumeric(value: string): number {
  const cleaned = value
    .replace(/[,%$€£]/g, "")
    .replace(/\s+/g, "")
    .trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

// Acceptable text answers are matched case-insensitively (and by folded
// whitespace) unless the question requires exact case.
export function matchesAcceptedAnswer(
  answer: string,
  accepted: string[],
  caseSensitive = false,
): boolean {
  const a = normalizeText(answer, !caseSensitive);
  return accepted.some((acc) => normalizeText(acc, !caseSensitive) === a);
}

/**
 * Convert a persisted / AI-returned object into the shared Question shape.
 *
 * Handles two shapes:
 *  - the current structured Question (has `prompt`), passed through
 *  - the legacy Phase 2 diagnostic shape (has `question` instead of `prompt`)
 *    produced by earlier generators, so previously stored diagnostics still
 *    render unchanged.
 *
 * Returns null for anything it cannot understand (never fabricates).
 */
export function normalizeQuestion(raw: unknown): Question | null {
  if (!raw || typeof raw !== "object") return null;
  const q = raw as Record<string, unknown>;

  const id = typeof q.id === "string" && q.id.trim() ? q.id : "";
  const type = typeof q.type === "string" ? q.type.toLowerCase() : "";
  const prompt =
    typeof q.prompt === "string"
      ? q.prompt.trim()
      : typeof q.question === "string"
        ? q.question.trim()
        : "";

  if (!id || !type || !prompt) return null;

  const base = {
    id,
    type,
    topicId: typeof q.topicId === "string" ? q.topicId : undefined,
    topic: typeof q.topic === "string" ? q.topic : undefined,
    difficulty: isDifficulty(q.difficulty) ? q.difficulty : undefined,
    prompt,
    explanation: typeof q.explanation === "string" ? q.explanation : undefined,
  };

  // Contained types that only need the base weight of the shared model.
  if (type === "multiple-choice" || type === "true-false") {
    let options = toOptions(q.options);
    let correctAnswer = "";
    if (type === "true-false") {
      if (options.length === 0) {
        options = [
          { id: "true", text: "True" },
          { id: "false", text: "False" },
        ];
      }
      const rawCorrect = String(q.correctAnswer ?? "").toLowerCase();
      correctAnswer =
        rawCorrect === "false"
          ? "false"
          : rawCorrect === "true" || rawCorrect.startsWith("t")
            ? "true"
            : "true";
    } else {
      correctAnswer = typeof q.correctAnswer === "string" ? q.correctAnswer : "";
      // Resolve by id, else by text, else default to first option.
      if (!options.some((o) => o.id === correctAnswer)) {
        const byText = options.find((o) => o.text === correctAnswer);
        correctAnswer = byText ? byText.id : options[0]?.id ?? "";
      }
    }
    if (options.length === 0 || !correctAnswer) return null;
    return { ...base, options, correctAnswer } as Question;
  }
  if (type === "multi-select") {
    const options = toOptions(q.options);
    const correctAnswers = toStringArray(q.correctAnswers ?? q.correctAnswer);
    if (options.length === 0 || correctAnswers.length === 0) return null;
    return { ...base, options, correctAnswers } as Question;
  }
  if (type === "numeric") {
    const n = Number(q.correctAnswer);
    if (!Number.isFinite(n)) return null;
    return {
      ...base,
      correctAnswer: n,
      tolerance: typeof q.tolerance === "number" ? q.tolerance : 0,
      unit: typeof q.unit === "string" ? q.unit : undefined,
    } as Question;
  }
  if (type === "short-answer") {
    const acceptedAnswers = toStringArray(q.acceptedAnswers);
    if (acceptedAnswers.length === 0) return null;
    return {
      ...base,
      placeholder: typeof q.placeholder === "string" ? q.placeholder : undefined,
      acceptedAnswers,
      caseSensitive: q.caseSensitive === true,
    } as Question;
  }
  if (type === "fill-blank") {
    const text = typeof q.text === "string" ? q.text : "";
    const acceptedAnswers = toStringArray(q.acceptedAnswers);
    if (!text || acceptedAnswers.length === 0) return null;
    return {
      ...base,
      text,
      acceptedAnswers,
      caseSensitive: q.caseSensitive === true,
    } as Question;
  }
  if (type === "matching") {
    const leftItems = toPairs(q.leftItems);
    const rightItems = toPairs(q.rightItems);
    const correctPairs = toPairMappings(q.correctPairs);
    if (leftItems.length === 0 || rightItems.length === 0) return null;
    return { ...base, leftItems, rightItems, correctPairs } as Question;
  }
  if (type === "ordering") {
    const items = toPairs(q.items);
    const correctOrder = toStringArray(q.correctOrder);
    if (items.length === 0 || correctOrder.length === 0) return null;
    return { ...base, items, correctOrder } as Question;
  }
  if (type === "categorization") {
    const categories = toPairs(q.categories);
    const items = toPairs(q.items);
    const correctCategories = toStringMap(q.correctCategories);
    if (categories.length === 0 || items.length === 0) return null;
    return { ...base, categories, items, correctCategories } as Question;
  }
  if (type === "drag-drop") {
    const items = toPairs(q.items);
    const dropZones = toPairs(q.dropZones);
    const correctPlacements = toStringMap(q.correctPlacements);
    if (items.length === 0 || dropZones.length === 0) return null;
    return { ...base, items, dropZones, correctPlacements } as Question;
  }

  // ---- visual types (Phase 4) ----
  if (type === "diagram-label") {
    const regions = toDiagramRegions(q.regions);
    const labels = toPairs(q.labels);
    const correctPlacements = toStringMap(q.correctPlacements);
    if (regions.length === 0 || labels.length === 0) return null;
    return {
      ...base,
      title: typeof q.title === "string" ? q.title : undefined,
      aspectRatio: finiteNumber(q.aspectRatio, 1.5),
      regions,
      labels,
      correctPlacements,
    } as Question;
  }
  if (type === "graph") {
    const xMin = finiteNumber(q.xMin, -10);
    const xMax = finiteNumber(q.xMax, 10);
    const yMin = finiteNumber(q.yMin, -10);
    const yMax = finiteNumber(q.yMax, 10);
    const interaction = isGraphInteraction(q.interaction) ? q.interaction : "numeric";
    const series = toGraphSeries(q.series);
    const points = toGraphPoints(q.points);
    const lines = toGraphLines(q.lines);
    const regions = toDiagramRegions(q.regions);
    const options = toPairs(q.options);
    if (
      interaction === "numeric" &&
      !Number.isFinite(Number(q.correctValue))
    ) {
      return null;
    }
    return {
      ...base,
      title: typeof q.title === "string" ? q.title : undefined,
      xLabel: typeof q.xLabel === "string" ? q.xLabel : undefined,
      yLabel: typeof q.yLabel === "string" ? q.yLabel : undefined,
      xMin,
      xMax,
      yMin,
      yMax,
      interaction,
      series,
      points,
      lines,
      regions,
      options,
      correctAnswer:
        interaction !== "numeric" && typeof q.correctAnswer === "string"
          ? q.correctAnswer
          : undefined,
      correctValue:
        interaction === "numeric" ? Number(q.correctValue) : undefined,
      tolerance: typeof q.tolerance === "number" ? q.tolerance : 0,
    } as Question;
  }
  if (type === "timeline") {
    const events = toTimelineEvents(q.events);
    const correctOrder = toStringArray(q.correctOrder);
    if (events.length === 0 || correctOrder.length === 0) return null;
    return { ...base, events, correctOrder } as Question;
  }
  if (type === "flowchart") {
    const nodes = toPairs(q.nodes);
    const edges = toFlowchartEdges(q.edges);
    const correctOrder = toStringArray(q.correctOrder);
    if (nodes.length === 0 || correctOrder.length === 0) return null;
    return { ...base, nodes, edges, correctOrder } as Question;
  }
  if (type === "scenario") {
    const context = typeof q.context === "string" ? q.context.trim() : "";
    const options = toPairs(q.options);
    const correctAnswer = typeof q.correctAnswer === "string" ? q.correctAnswer : "";
    if (!context || options.length === 0 || !correctAnswer) return null;
    if (!options.some((o) => o.id === correctAnswer)) return null;
    return {
      ...base,
      context,
      evidence: toScenarioEvidence(q.evidence),
      options,
      correctAnswer,
    } as Question;
  }
  if (type === "error-detection") {
    const problem = typeof q.problem === "string" ? q.problem.trim() : "";
    const steps = toPairs(q.steps);
    const errorStepId = typeof q.errorStepId === "string" ? q.errorStepId : "";
    if (!problem || steps.length === 0 || !errorStepId) return null;
    if (!steps.some((s) => s.id === errorStepId)) return null;
    return {
      ...base,
      problem,
      steps,
      errorStepId,
      fixExplanation:
        typeof q.fixExplanation === "string" ? q.fixExplanation : undefined,
    } as Question;
  }

  return null;
}

function isDifficulty(v: unknown): v is "easy" | "medium" | "hard" {
  return v === "easy" || v === "medium" || v === "hard";
}

function toOptions(raw: unknown): { id: string; text: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { id: string; text: string }[] = [];
  raw.forEach((opt, idx) => {
    if (typeof opt === "string" && opt.trim()) {
      out.push({ id: `opt${idx + 1}`, text: opt.trim() });
      return;
    }
    if (opt && typeof opt === "object") {
      const o = opt as Record<string, unknown>;
      const text = typeof o.text === "string" ? o.text : "";
      const idRaw = typeof o.id === "string" && o.id.trim() ? o.id : `opt${idx + 1}`;
      if (text.trim()) out.push({ id: idRaw, text });
    }
  });
  return out;
}

function toPairs(raw: unknown): { id: string; text: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { id: string; text: string }[] = [];
  raw.forEach((p, idx) => {
    if (p && typeof p === "object") {
      const o = p as Record<string, unknown>;
      const text = typeof o.text === "string" ? o.text : "";
      const id = typeof o.id === "string" && o.id.trim() ? o.id : `item${idx + 1}`;
      if (text.trim()) out.push({ id, text });
    }
  });
  return out;
}

function toPairMappings(raw: unknown): { leftId: string; rightId: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { leftId: string; rightId: string }[] = [];
  for (const entry of raw) {
    if (entry && typeof entry === "object") {
      const o = entry as Record<string, unknown>;
      const leftId = typeof o.leftId === "string" ? o.leftId : "";
      const rightId = typeof o.rightId === "string" ? o.rightId : "";
      if (leftId && rightId) out.push({ leftId, rightId });
    }
  }
  return out;
}

function toStringArray(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((v): v is string => typeof v === "string" && v.trim() !== "");
  }
  return typeof raw === "string" && raw.trim() ? [raw] : [];
}

function toStringMap(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" && v.trim()) out[k] = v;
  }
  return out;
}

function finiteNumber(raw: unknown, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function pct(raw: unknown, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : fallback;
}

function toDiagramRegions(raw: unknown): DiagramRegion[] {
  if (!Array.isArray(raw)) return [];
  const out: DiagramRegion[] = [];
  for (const entry of raw) {
    if (entry && typeof entry === "object") {
      const o = entry as Record<string, unknown>;
      const id = typeof o.id === "string" && o.id.trim() ? o.id : "";
      const label = typeof o.label === "string" ? o.label : "";
      if (!id || !label.trim()) continue;
      out.push({
        id,
        label,
        x: pct(o.x, 0),
        y: pct(o.y, 0),
        width: pct(o.width, 10),
        height: pct(o.height, 10),
      });
    }
  }
  return out;
}

function isGraphInteraction(v: unknown): v is GraphInteraction {
  return (
    v === "select-point" ||
    v === "select-region" ||
    v === "numeric" ||
    v === "choose-graph"
  );
}

function toGraphSeries(raw: unknown): GraphSeries[] {
  if (!Array.isArray(raw)) return [];
  const out: GraphSeries[] = [];
  for (const entry of raw) {
    if (entry && typeof entry === "object") {
      const o = entry as Record<string, unknown>;
      const id = typeof o.id === "string" && o.id.trim() ? o.id : "";
      const name = typeof o.name === "string" ? o.name : id;
      if (id) out.push({ id, name });
    }
  }
  return out;
}

function toGraphPoints(raw: unknown): GraphPoint[] {
  if (!Array.isArray(raw)) return [];
  const out: GraphPoint[] = [];
  for (const entry of raw) {
    if (entry && typeof entry === "object") {
      const o = entry as Record<string, unknown>;
      const id = typeof o.id === "string" && o.id.trim() ? o.id : "";
      const x = Number(o.x);
      const y = Number(o.y);
      if (!id || !Number.isFinite(x) || !Number.isFinite(y)) continue;
      out.push({
        id,
        x,
        y,
        label: typeof o.label === "string" ? o.label : undefined,
        seriesId: typeof o.seriesId === "string" ? o.seriesId : undefined,
      });
    }
  }
  return out;
}

function toGraphLines(raw: unknown): GraphLine[] {
  if (!Array.isArray(raw)) return [];
  const out: GraphLine[] = [];
  for (const entry of raw) {
    if (entry && typeof entry === "object") {
      const o = entry as Record<string, unknown>;
      const id = typeof o.id === "string" && o.id.trim() ? o.id : "";
      const fromX = Number(o.fromX);
      const fromY = Number(o.fromY);
      const toX = Number(o.toX);
      const toY = Number(o.toY);
      if (
        !id ||
        !Number.isFinite(fromX) ||
        !Number.isFinite(fromY) ||
        !Number.isFinite(toX) ||
        !Number.isFinite(toY)
      ) {
        continue;
      }
      out.push({ id, fromX, fromY, toX, toY });
    }
  }
  return out;
}

function toTimelineEvents(raw: unknown): TimelineEvent[] {
  if (!Array.isArray(raw)) return [];
  const out: TimelineEvent[] = [];
  for (const entry of raw) {
    if (entry && typeof entry === "object") {
      const o = entry as Record<string, unknown>;
      const id = typeof o.id === "string" && o.id.trim() ? o.id : "";
      const label = typeof o.label === "string" ? o.label : "";
      if (!id || !label.trim()) continue;
      out.push({
        id,
        label,
        date: typeof o.date === "string" ? o.date : undefined,
        detail: typeof o.detail === "string" ? o.detail : undefined,
      });
    }
  }
  return out;
}

function toFlowchartEdges(raw: unknown): FlowchartEdge[] {
  if (!Array.isArray(raw)) return [];
  const out: FlowchartEdge[] = [];
  for (const entry of raw) {
    if (entry && typeof entry === "object") {
      const o = entry as Record<string, unknown>;
      const from = typeof o.from === "string" ? o.from : "";
      const to = typeof o.to === "string" ? o.to : "";
      if (from && to) out.push({ from, to });
    }
  }
  return out;
}

function toScenarioEvidence(raw: unknown): ScenarioEvidence[] {
  if (!Array.isArray(raw)) return [];
  const out: ScenarioEvidence[] = [];
  for (const entry of raw) {
    if (entry && typeof entry === "object") {
      const o = entry as Record<string, unknown>;
      const id = typeof o.id === "string" && o.id.trim() ? o.id : "";
      const content = typeof o.content === "string" ? o.content : "";
      if (!id || !content.trim()) continue;
      out.push({
        id,
        title: typeof o.title === "string" ? o.title : undefined,
        kind:
          o.kind === "text" || o.kind === "list" || o.kind === "table"
            ? o.kind
            : undefined,
        content,
      });
    }
  }
  return out;
}
