"use client";

import { ListInput } from "@/lib/visualInputs";

function isListInput(data: unknown): data is ListInput {
  if (!data || typeof data !== "object") return false;
  return Array.isArray((data as ListInput).items);
}

export function ListView({ data }: { data: unknown }) {
  if (!isListInput(data) || data.items.length === 0) {
    return <p className="text-sm text-muted-foreground">List data is invalid.</p>;
  }

  return (
    <ul className="list-disc list-inside space-y-2 text-sm">
      {data.items.map((item) => (
        <li key={item} className="rounded-md border border-border px-3 py-2">
          {item}
        </li>
      ))}
    </ul>
  );
}
