"use client";

import { ComparisonInput } from "@/lib/visualInputs";

function isComparisonInput(data: unknown): data is ComparisonInput {
  if (!data || typeof data !== "object") return false;
  return Array.isArray((data as ComparisonInput).items);
}

export function ComparisonView({ data }: { data: unknown }) {
  if (!isComparisonInput(data) || data.items.length === 0) {
    return <p className="text-sm text-muted-foreground">Comparison data is invalid.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {data.items.map((item) => (
        <div key={item.title} className="rounded-lg border border-border p-3">
          <h4 className="font-semibold">{item.title}</h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
            {item.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
