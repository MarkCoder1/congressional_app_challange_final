"use client";

// /components/questions/graph-question.tsx
//
// Interactive graph renderer. Draws a lightweight SVG coordinate plane and
// supports four deterministic interactions without adding a chart dependency:
//  - select-point   -> click a labelled point
//  - select-region  -> click a labelled region (axis/area)
//  - numeric        -> type a value (e.g. slope, intercept)
//  - choose-graph   -> pick the matching description from options
//
// All geometry is derived from structured JSON (xMin/xMax/yMin/yMax/points/lines).

import { Input } from "@/components/ui/input";
import { parseNumeric } from "@/lib/questions/normalize";
import type { GraphQuestion } from "@/types/question";
import type { QuestionAnswer } from "@/types/question";

interface Props {
  question: GraphQuestion;
  value: QuestionAnswer;
  onChange: (value: QuestionAnswer) => void;
}

const W = 400;
const H = 280;
const PAD = 36;

function toSvgX(x: number, q: GraphQuestion) {
  const span = q.xMax - q.xMin || 1;
  return PAD + ((x - q.xMin) / span) * (W - PAD * 2);
}
function toSvgY(y: number, q: GraphQuestion) {
  const span = q.yMax - q.yMin || 1;
  return H - PAD - ((y - q.yMin) / span) * (H - PAD * 2);
}

export function GraphQuestion({ question, value, onChange }: Props) {
  const q = question;

  // numeric interaction
  if (q.interaction === "numeric") {
    const numValue = typeof value === "number" ? value : undefined;
    const text = numValue === undefined ? "" : String(numValue);
    return (
      <div className="space-y-4">
        <GraphCanvas question={q} selectedId={typeof value === "string" ? value : null} onSelect={() => {}} />
        <div className="flex max-w-xs items-center gap-2">
          <Input
            type="text"
            inputMode="decimal"
            value={text}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw.trim() === "") {
                onChange(null);
                return;
              }
              const n = parseNumeric(raw);
              if (Number.isFinite(n)) onChange(n);
            }}
            placeholder="Enter value"
            aria-label="Your numerical answer"
            className="text-base"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Enter a number{typeof q.tolerance === "number" && q.tolerance > 0 ? ` (within ${q.tolerance})` : ""}.
        </p>
      </div>
    );
  }

  // choose-graph: reference canvas + option cards
  if (q.interaction === "choose-graph") {
    const selected = typeof value === "string" ? value : "";
    return (
      <div className="space-y-4">
        <GraphCanvas question={q} selectedId={null} onSelect={() => {}} />
        <div className="grid gap-2">
          {(q.options ?? []).map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange(opt.id)}
                className={`rounded-xl border-2 p-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isSelected
                    ? "border-primary bg-accent/10"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span className="font-medium text-foreground">{opt.text}</span>
              </button>
            );
          })}
          {(!q.options || q.options.length === 0) && (
            <p className="text-xs text-muted-foreground">No options provided.</p>
          )}
        </div>
      </div>
    );
  }

  // select-point / select-region
  const selectedId = typeof value === "string" ? value : "";
  const isPoint = q.interaction === "select-point";
  const items = isPoint ? (q.points ?? []) : (q.regions ?? []);
  return (
    <div className="space-y-3">
      <GraphCanvas
        question={q}
        selectedId={selectedId}
        onSelect={(id) => onChange(id)}
      />
      {/* Accessible list fallback */}
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((it) => {
          const id = (it as { id: string }).id;
          const label = (it as { label?: string }).label ?? id;
          const isSelected = selectedId === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(id)}
              className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isSelected
                  ? "border-primary bg-accent/10 text-primary"
                  : "border-border bg-card hover:bg-secondary/40 text-foreground"
              }`}
            >
              {label}
              {"x" in it && "y" in it ? ` (${(it as { x: number; y: number }).x}, ${(it as { x: number; y: number }).y})` : ""}
            </button>
          );
        })}
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground">No selectable items.</p>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Click a {isPoint ? "point on the graph" : "region"} or choose from the list.
      </p>
    </div>
  );
}

function GraphCanvas({
  question,
  selectedId,
  onSelect,
}: {
  question: GraphQuestion;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const q = question;
  const xSteps = 5;
  const ySteps = 5;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {q.title && (
        <div className="border-b border-border px-3 py-2">
          <p className="text-sm font-medium text-foreground">{q.title}</p>
        </div>
      )}
      <div className="p-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={q.title ?? "Graph"}
        >
          {/* grid */}
          {Array.from({ length: xSteps + 1 }).map((_, i) => {
            const x = PAD + (i / xSteps) * (W - PAD * 2);
            return <line key={`vx${i}`} x1={x} y1={PAD} x2={x} y2={H - PAD} stroke="hsl(var(--border))" strokeWidth={0.8} opacity={0.6} />;
          })}
          {Array.from({ length: ySteps + 1 }).map((_, i) => {
            const y = PAD + (i / ySteps) * (H - PAD * 2);
            return <line key={`hy${i}`} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="hsl(var(--border))" strokeWidth={0.8} opacity={0.6} />;
          })}

          {/* axes */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="hsl(var(--foreground))" strokeWidth={1.2} />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="hsl(var(--foreground))" strokeWidth={1.2} />

          {/* axis labels */}
          <text x={W - PAD} y={H - PAD + 18} textAnchor="end" fontSize={10} fill="hsl(var(--muted-foreground))">
            {q.xLabel ?? "x"}
          </text>
          <text x={PAD - 8} y={PAD - 6} textAnchor="end" fontSize={10} fill="hsl(var(--muted-foreground))">
            {q.yLabel ?? "y"}
          </text>

          {/* lines */}
          {(q.lines ?? []).map((ln) => (
            <line
              key={ln.id}
              x1={toSvgX(ln.fromX, q)}
              y1={toSvgY(ln.fromY, q)}
              x2={toSvgX(ln.toX, q)}
              y2={toSvgY(ln.toY, q)}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}

          {/* regions (for select-region) */}
          {(q.regions ?? []).map((r) => {
            const isSelected = selectedId === r.id;
            // interpret r.x/y/width/height as data coords? For region we treat them as already in data space proportions
            // To keep simple, regions are rendered as overlay rects in SVG data space when interaction is select-region:
            // Use percentage of inner area.
            const rx = PAD + (r.x / 100) * (W - PAD * 2);
            const ry = PAD + (r.y / 100) * (H - PAD * 2);
            const rw = (r.width / 100) * (W - PAD * 2);
            const rh = (r.height / 100) * (H - PAD * 2);
            return (
              <g key={r.id} onClick={() => onSelect(r.id)} style={{ cursor: "pointer" }}>
                <rect
                  x={rx}
                  y={ry}
                  width={rw}
                  height={rh}
                  rx={6}
                  fill={isSelected ? "hsl(var(--primary) / 0.15)" : "hsl(var(--secondary))"}
                  stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}
                  strokeWidth={isSelected ? 2 : 1.2}
                  strokeDasharray={isSelected ? undefined : "6 4"}
                />
                <text x={rx + rw / 2} y={ry + rh / 2} textAnchor="middle" dominantBaseline="middle" fontSize={10} fontWeight={600} fill="hsl(var(--foreground))">
                  {r.label}
                </text>
              </g>
            );
          })}

          {/* points */}
          {(q.points ?? []).map((pt) => {
            const cx = toSvgX(pt.x, q);
            const cy = toSvgY(pt.y, q);
            const isSelected = selectedId === pt.id;
            return (
              <g key={pt.id} onClick={() => onSelect(pt.id)} style={{ cursor: "pointer" }}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 9 : 7}
                  fill={isSelected ? "hsl(var(--primary))" : "hsl(var(--card))"}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
                {isSelected && <circle cx={cx} cy={cy} r={3} fill="white" />}
                <text x={cx} y={cy - 12} textAnchor="middle" fontSize={9} fontWeight={600} fill="hsl(var(--foreground))">
                  {pt.label ?? pt.id}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[10px] text-muted-foreground">
          <span>
            x: [{q.xMin}, {q.xMax}]
          </span>
          <span>y: [{q.yMin}, {q.yMax}]</span>
        </div>
      </div>
    </div>
  );
}
