"use client";

// /components/questions/ordering-question.tsx
//
// Arrange items in the correct order. Supports native HTML5 drag-and-drop
// (mouse / trackpad) and, for touch/keyboard accessibility, move-up / move-down
// buttons. The value is the ordered array of item ids.

import { useMemo, useRef, useState } from "react";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import type { OrderingQuestion } from "@/types/question";

interface Props {
  question: OrderingQuestion;
  value: string[];
  onChange: (value: string[]) => void;
}

export function OrderingQuestion({ question, value, onChange }: Props) {
  // When the student hasn't answered, start from the provided item order.
  const baseOrder = useMemo(() => question.items.map((i) => i.id), [question]);
  const order =
    Array.isArray(value) && value.length === question.items.length
      ? value
      : baseOrder;

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

  const itemById = useMemo(
    () => new Map(question.items.map((i) => [i.id, i])),
    [question],
  );

  return (
    <div>
      <ol className="space-y-2" aria-label="Ordered items">
        {order.map((id, index) => {
          const item = itemById.get(id);
          if (!item) return null;
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
              className={`flex items-center gap-2 rounded-lg border-2 bg-card px-3 py-2.5 transition-all ${
                isDragging
                  ? "border-primary bg-accent/10 opacity-60"
                  : isOver
                    ? "border-primary/60"
                    : "border-border"
              }`}
            >
              <span
                aria-hidden="true"
                className="cursor-grab text-muted-foreground active:cursor-grabbing"
              >
                <GripVertical size={18} />
              </span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                {item.text}
              </span>
              <div className="flex shrink-0 flex-col gap-0.5 sm:flex-row">
                <MoveButton
                  label={`Move "${item.text}" up`}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ChevronUp size={16} />
                </MoveButton>
                <MoveButton
                  label={`Move "${item.text}" down`}
                  disabled={index === order.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ChevronDown size={16} />
                </MoveButton>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-muted-foreground">
        Drag items to reorder, or use the up / down buttons.
      </p>
    </div>
  );
}

function MoveButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
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
