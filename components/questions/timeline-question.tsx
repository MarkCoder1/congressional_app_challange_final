"use client";

// /components/questions/timeline-question.tsx
//
// Arrange events in chronological order. Mirrors the ordering-question
// interaction (drag + move up/down) but renders as a vertical timeline.

import { useMemo, useRef, useState } from "react";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import type { TimelineQuestion } from "@/types/question";

interface Props {
  question: TimelineQuestion;
  value: string[];
  onChange: (value: string[]) => void;
}

export function TimelineQuestion({ question, value, onChange }: Props) {
  const baseOrder = useMemo(() => question.events.map((e) => e.id), [question]);
  const order =
    Array.isArray(value) && value.length === question.events.length ? value : baseOrder;

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }
  function handleDrop(targetIndex: number) {
    const from = dragIndexRef.current;
    setDraggedIndex(null);
    setOverIndex(null);
    dragIndexRef.current = null;
    if (from === null || from === targetIndex) return;
    move(from, targetIndex);
  }

  const eventById = useMemo(() => new Map(question.events.map((e) => [e.id, e])), [question]);

  return (
    <div>
      <div className="relative pl-6">
        {/* vertical line */}
        <div className="absolute bottom-2 left-[11px] top-2 w-0.5 rounded bg-border" aria-hidden="true" />
        <ol className="space-y-3" aria-label="Timeline events">
          {order.map((id, index) => {
            const ev = eventById.get(id);
            if (!ev) return null;
            const isDragging = draggedIndex === index;
            const isOver = overIndex === index && draggedIndex !== null && draggedIndex !== index;
            return (
              <li
                key={id}
                draggable
                onDragStart={(e) => {
                  dragIndexRef.current = index;
                  setDraggedIndex(index);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (overIndex !== index) setOverIndex(index);
                }}
                onDragLeave={() => setOverIndex((o) => (o === index ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(index);
                }}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setOverIndex(null);
                  dragIndexRef.current = null;
                }}
                className={`relative flex items-start gap-3 rounded-xl border-2 bg-card px-3 py-3 transition-all ${
                  isDragging ? "border-primary bg-accent/10 opacity-60" : isOver ? "border-primary/60" : "border-border"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[18px] top-4 h-3 w-3 rounded-full border-2 border-primary bg-card"
                />
                <span
                  aria-hidden="true"
                  className="hidden cursor-grab text-muted-foreground active:cursor-grabbing sm:inline-flex"
                >
                  <GripVertical size={16} />
                </span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{ev.label}</p>
                  {(ev.date || ev.detail) && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ev.date && <span className="font-medium">{ev.date}</span>}
                      {ev.date && ev.detail ? " · " : ""}
                      {ev.detail}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-0.5 sm:flex-row">
                  <MoveButton label={`Move "${ev.label}" earlier`} disabled={index === 0} onClick={() => move(index, index - 1)}>
                    <ChevronUp size={14} />
                  </MoveButton>
                  <MoveButton label={`Move "${ev.label}" later`} disabled={index === order.length - 1} onClick={() => move(index, index + 1)}>
                    <ChevronDown size={14} />
                  </MoveButton>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Drag to reorder, or use the up / down buttons. Earliest at the top.</p>
    </div>
  );
}

function MoveButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-35"
    >
      {children}
    </button>
  );
}
