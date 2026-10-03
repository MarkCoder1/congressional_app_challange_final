"use client";

// /components/questions/diagram-label-question.tsx
//
// Place each label into its correct diagram region. Renders a structured
// geometric diagram (CSS / positioned divs) — never an external image — and
// supports both HTML5 drag-and-drop and an accessible select fallback.

import { useState } from "react";
import { X } from "lucide-react";
import type { DiagramLabelQuestion } from "@/types/question";

interface Props {
  question: DiagramLabelQuestion;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

export function DiagramLabelQuestion({ question, value, onChange }: Props) {
  const map = value ?? {};
  const [draggedLabel, setDraggedLabel] = useState<string | null>(null);
  const [overRegion, setOverRegion] = useState<string | null>(null);

  function place(labelId: string, regionId: string | null) {
    const next = { ...map };
    if (!regionId) delete next[labelId];
    else next[labelId] = regionId;
    onChange(next);
  }

  const unplaced = question.labels.filter((l) => !map[l.id]);
  const regionHas = (regionId: string) =>
    question.labels.filter((l) => map[l.id] === regionId);

  const ratio = question.aspectRatio ?? 1.6;

  return (
    <div className="space-y-4">
      {question.title && (
        <p className="text-sm font-medium text-foreground">{question.title}</p>
      )}

      {/* Diagram */}
      <div
        className="relative w-full overflow-hidden rounded-xl border-2 border-border bg-bg-sunken"
        style={{ aspectRatio: String(ratio) }}
        aria-label="Diagram"
      >
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {question.regions.map((region) => {
          const placed = regionHas(region.id);
          const isOver = overRegion === region.id && draggedLabel !== null;
          return (
            <div
              key={region.id}
              role="region"
              aria-label={`Region: ${region.label}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (overRegion !== region.id) setOverRegion(region.id);
              }}
              onDragLeave={() => setOverRegion((o) => (o === region.id ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedLabel) place(draggedLabel, region.id);
                setDraggedLabel(null);
                setOverRegion(null);
              }}
              className={`absolute flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-1 text-center transition-colors ${
                isOver
                  ? "border-primary bg-accent/15"
                  : placed.length > 0
                    ? "border-primary/40 bg-card"
                    : "border-border bg-card/70"
              }`}
              style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                width: `${region.width}%`,
                height: `${region.height}%`,
              }}
            >
              <span className="pointer-events-none text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {region.label}
              </span>
              {placed.length > 0 && (
                <div className="mt-1 flex flex-wrap justify-center gap-1">
                  {placed.map((lbl) => (
                    <span
                      key={lbl.id}
                      className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {lbl.text}
                      <button
                        type="button"
                        aria-label={`Remove "${lbl.text}" from ${region.label}`}
                        onClick={() => place(lbl.id, null)}
                        className="rounded p-0.5 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {/* accessible fallback: per-region select for placed items stays in chip above */}
            </div>
          );
        })}

        {/* region count badge */}
        <div className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm ring-1 ring-border">
          {question.regions.length} regions · {question.labels.length} labels
        </div>
      </div>

      {/* Unplaced tray */}
      <div className="rounded-lg border border-dashed border-border bg-bg-sunken p-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Labels to place
        </p>
        {unplaced.length === 0 ? (
          <p className="text-xs text-muted-foreground">All labels placed.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unplaced.map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 shadow-sm"
              >
                <span
                  draggable
                  onDragStart={(e) => {
                    setDraggedLabel(label.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => setDraggedLabel(null)}
                  className="cursor-grab select-none text-sm font-medium text-foreground active:cursor-grabbing"
                >
                  {label.text}
                </span>
                <select
                  value=""
                  onChange={(e) => place(label.id, e.target.value)}
                  aria-label={`Place "${label.text}" into a region`}
                  className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="" disabled>
                    Place…
                  </option>
                  {question.regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Placed labels quick-reassign via select (for keyboard users) */}
      {question.labels.filter((l) => map[l.id]).length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Reassign placed labels</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {question.labels
              .filter((l) => map[l.id])
              .map((label) => (
                <label
                  key={label.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
                >
                  <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                    {label.text}
                  </span>
                  <select
                    value={map[label.id] ?? ""}
                    onChange={(e) => place(label.id, e.target.value || null)}
                    aria-label={`Move "${label.text}" to another region`}
                    className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="">Unplaced</option>
                    {question.regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Drag a label onto a region, or use its menu to place it.
      </p>
    </div>
  );
}
