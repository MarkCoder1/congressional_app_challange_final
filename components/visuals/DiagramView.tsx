"use client";

import { DiagramInput } from "@/lib/visualInputs";

function isDiagramInput(data: unknown): data is DiagramInput {
  if (!data || typeof data !== "object") return false;
  return Array.isArray((data as DiagramInput).parts);
}

export function DiagramView({ data }: { data: unknown }) {
  if (!isDiagramInput(data) || data.parts.length === 0) {
    return <p className="text-sm text-muted-foreground">Diagram data is invalid.</p>;
  }

  return (
    <div className="relative h-80 w-full rounded-lg border border-border bg-card overflow-hidden">
      {data.parts.map((part) => (
        <div
          key={part.label}
          className="absolute rounded-md border border-accent/40 bg-accent/10 px-2 py-1 w-44"
          style={{ left: `${part.position.x}%`, top: `${part.position.y}%`, transform: "translate(-50%, -50%)" }}
        >
          <p className="text-xs font-semibold text-foreground">{part.label}</p>
          <p className="text-xs text-muted-foreground">{part.description}</p>
        </div>
      ))}
    </div>
  );
}
