"use client";

// /components/questions/flowchart-question.tsx
//
// Arrange the steps of a process. Renders nodes as connected cards in a
// vertical flow; ordering interaction mirrors timeline/ordering (drag + move).

import { useMemo, useRef, useState } from "react";
import { GripVertical, ChevronUp, ChevronDown, ArrowDown } from "lucide-react";
import type { FlowchartQuestion } from "@/types/question";

interface Props {
  question: FlowchartQuestion;
  value: string[];
  onChange: (value: string[]) => void;
}

export function FlowchartQuestion({ question, value, onChange }: Props) {
  const baseOrder = useMemo(() => question.nodes.map((n) => n.id), [question]);
  const order = Array.isArray(value) && value.length === question.nodes.length ? value : baseOrder;

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

  const nodeById = useMemo(() => new Map(question.nodes.map((n) => [n.id, n])), [question]);

  return (
    <div>
      <ol className="space-y-0" aria-label="Flowchart steps">
        {order.map((id, index) => {
          const node = nodeById.get(id);
          if (!node) return null;
          const isDragging = draggedIndex === index;
          const isOver = overIndex === index && draggedIndex !== null && draggedIndex !== index;
          return (
            <li key={id} className="flex flex-col items-center">
              <div
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
                className={`flex w-full max-w-md items-center gap-3 rounded-xl border-2 bg-card px-4 py-3 shadow-sm transition-all ${
                  isDragging ? "border-primary bg-accent/10 opacity-60" : isOver ? "border-primary/60" : "border-border"
                }`}
              >
                <span aria-hidden="true" className="cursor-grab text-muted-foreground active:cursor-grabbing">
                  <GripVertical size={16} />
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{node.text}</span>
                <div className="flex shrink-0 flex-col gap-0.5 sm:flex-row">
                  <MoveButton label={`Move "${node.text}" up`} disabled={index === 0} onClick={() => move(index, index - 1)}>
                    <ChevronUp size={14} />
                  </MoveButton>
                  <MoveButton label={`Move "${node.text}" down`} disabled={index === order.length - 1} onClick={() => move(index, index + 1)}>
                    <ChevronDown size={14} />
                  </MoveButton>
                </div>
              </div>
              {index < order.length - 1 && (
                <span aria-hidden="true" className="flex h-6 items-center text-muted-foreground">
                  <ArrowDown size={16} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-center text-xs text-muted-foreground">Drag steps to reorder, or use the up / down buttons.</p>
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
