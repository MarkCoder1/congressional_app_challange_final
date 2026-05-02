"use client";

import { CardsInput } from "@/lib/visualInputs";

function isCardsInput(data: unknown): data is CardsInput {
  if (!data || typeof data !== "object") return false;
  return Array.isArray((data as CardsInput).cards);
}

export function CardsView({ data }: { data: unknown }) {
  if (!isCardsInput(data) || data.cards.length === 0) {
    return <p className="text-sm text-muted-foreground">Cards data is invalid.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {data.cards.map((card) => (
        <div key={card.title} className="rounded-lg border border-border p-3">
          <h4 className="font-semibold">{card.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{card.content}</p>
        </div>
      ))}
    </div>
  );
}
