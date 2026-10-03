"use client";

// /components/questions/drag-drop-question.tsx
//
// Drag each item into a labelled drop zone (or use the accessible select).
// Placements are keyed by itemId -> zoneId. A placed item can be moved again.

import { useState } from "react";
import { X } from "lucide-react";
import type { DragDropQuestion } from "@/types/question";

interface Props {
  question: DragDropQuestion;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

export function DragDropQuestion({ question, value, onChange }: Props) {
  const map = value ?? {};
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [overZone, setOverZone] = useState<string | null>(null);

  function place(itemId: string, zoneId: string | null) {
    const next = { ...map };
    if (zoneId === null || zoneId === "") delete next[itemId];
    else next[itemId] = zoneId;
    onChange(next);
  }

  const unplaced = question.items.filter((i) => !map[i.id]);
  const zoneHas = (zoneId: string) =>
    question.items.filter((i) => map[i.id] === zoneId);

  return (
    <div>
      {/* Item tray */}
      <div className="mb-3 rounded-lg border border-dashed border-border bg-bg-sunken p-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Items to place
        </p>
        {unplaced.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            All items placed.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unplaced.map((item) => (
              <DraggableChip
                key={item.id}
                text={item.text}
                draggable
                onDragStart={(e) => {
                  setDraggedItem(item.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => setDraggedItem(null)}
                select={
                  <select
                    value=""
                    onChange={(e) => place(item.id, e.target.value)}
                    aria-label={`Place "${item.text}" into a zone`}
                    className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="" disabled>
                      Choose zone…
                    </option>
                    {question.dropZones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.text}
                      </option>
                    ))}
                  </select>
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Drop zones */}
      <div className="grid gap-3 sm:grid-cols-2">
        {question.dropZones.map((zone) => {
          const isOver = overZone === zone.id && draggedItem !== null;
          return (
            <div
              key={zone.id}
              role="region"
              aria-label={`Drop zone: ${zone.text}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (overZone !== zone.id) setOverZone(zone.id);
              }}
              onDragLeave={() => setOverZone((o) => (o === zone.id ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedItem) place(draggedItem, zone.id);
                setDraggedItem(null);
                setOverZone(null);
              }}
              className={`min-h-24 rounded-lg border-2 border-dashed p-3 transition-colors ${
                isOver ? "border-primary bg-accent/10" : "border-border bg-card"
              }`}
            >
              <p className="mb-2 text-sm font-semibold text-foreground">{zone.text}</p>
              <div className="flex flex-wrap gap-2">
                {zoneHas(zone.id).map((item) => (
                  <DraggableChip
                    key={item.id}
                    text={item.text}
                    draggable
                    onDragStart={(e) => {
                      setDraggedItem(item.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDraggedItem(null)}
                    onRemove={() => place(item.id, null)}
                    select={
                      <select
                        value={zone.id}
                        onChange={(e) => place(item.id, e.target.value)}
                        aria-label={`Move "${item.text}" to another zone`}
                        className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {question.dropZones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.text}
                          </option>
                        ))}
                      </select>
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Drag an item into a zone, or choose a zone from its menu.
      </p>
    </div>
  );
}

function DraggableChip({
  text,
  draggable,
  onDragStart,
  onDragEnd,
  onRemove,
  select,
}: {
  text: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onRemove?: () => void;
  select?: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 shadow-sm">
      {select ?? <span className="sr-only">Place this item</span>}
      <span
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className="cursor-grab select-none text-sm font-medium text-foreground active:cursor-grabbing"
      >
        {text}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove "${text}"`}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X size={13} />
        </button>
      )}
    </span>
  );
}
