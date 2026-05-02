"use client";

import { FlowInput } from "@/lib/visualInputs";

function isFlowInput(data: unknown): data is FlowInput {
  if (!data || typeof data !== "object") return false;
  return Array.isArray((data as FlowInput).steps);
}

export function FlowView({ data }: { data: unknown }) {
  if (!isFlowInput(data) || data.steps.length === 0) {
    return <p className="text-sm text-muted-foreground">Flow data is invalid.</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {data.steps.map((step, idx) => (
        <div key={`${step.title}-${idx}`} className="flex items-center gap-2">
          <div className="rounded-lg border border-border px-3 py-2 min-w-40 max-w-48">
            <p className="text-sm font-semibold">{step.title}</p>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </div>
          {idx < data.steps.length - 1 ? (
            <div className="text-accent font-semibold text-lg">→</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
