"use client";

// /components/questions/categorization-question.tsx
//
// Place each item into a category column. Native HTML5 drag-and-drop is
// provided for mouse/trackpad, and each item also has an accessible select so
// the task works on touch and with a keyboard / screen reader. Clicking a
// placed item returns it to the unassigned tray.

import { useState } from "react";
import { X } from "lucide-react";
import type { CategorizationQuestion } from "@/types/question";

interface Props {
  question: CategorizationQuestion;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

export function CategorizationQuestion({ question, value, onChange }: Props) {
  const map = value ?? {};
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [overCategory, setOverCategory] = useState<string | null>(null);

  function assign(itemId: string, categoryId: string | null) {
    const next = { ...map };
    if (categoryId === null || categoryId === "") delete next[itemId];
    else next[itemId] = categoryId;
    onChange(next);
  }

  const unassigned = question.items.filter((i) => !map[i.id]);
  const categoryHas = (categoryId: string) =>
    question.items.filter((i) => map[i.id] === categoryId);

  return (
    <div>
      {/* Unassigned tray */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
        }}
        className="mb-3 rounded-lg border border-dashed border-border bg-bg-sunken p-3"
      >
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Items
        </p>
        {unassigned.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            All items placed. Click a placed item to move it again.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unassigned.map((item) => (
              <Chip
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
                    onChange={(e) => assign(item.id, e.target.value)}
                    aria-label={`Move "${item.text}" to a category`}
                    className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="" disabled>
                      Choose category…
                    </option>
                    {question.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.text}
                      </option>
                    ))}
                  </select>
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Category columns */}
      <div className="grid gap-3 sm:grid-cols-2">
        {question.categories.map((category) => {
          const isOver = overCategory === category.id && draggedItem !== null;
          return (
            <div
              key={category.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (overCategory !== category.id) setOverCategory(category.id);
              }}
              onDragLeave={() =>
                setOverCategory((o) => (o === category.id ? null : o))
              }
              onDrop={(e) => {
                e.preventDefault();
                if (draggedItem) assign(draggedItem, category.id);
                setDraggedItem(null);
                setOverCategory(null);
              }}
              className={`min-h-28 rounded-lg border-2 p-3 transition-colors ${
                isOver ? "border-primary bg-accent/10" : "border-border bg-card"
              }`}
            >
              <p className="mb-2 text-sm font-semibold text-foreground">
                {category.text}
              </p>
              <div className="flex flex-wrap gap-2">
                {categoryHas(category.id).map((item) => (
                  <Chip
                    key={item.id}
                    text={item.text}
                    draggable
                    onDragStart={(e) => {
                      setDraggedItem(item.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDraggedItem(null)}
                    onRemove={() => assign(item.id, null)}
                    select={
                      <select
                        value={category.id}
                        onChange={(e) => assign(item.id, e.target.value)}
                        aria-label={`Move "${item.text}" to another category`}
                        className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {question.categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.text}
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
    </div>
  );
}

function Chip({
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
          aria-label={`Remove "${text}" from this category`}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X size={13} />
        </button>
      )}
    </span>
  );
}
