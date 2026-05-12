"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ComparisonData } from "@/types/visuals";

export function Comparison({ data }: { data: ComparisonData }) {
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null);

  return (
    <div className="space-y-4 overflow-x-auto">
      <h3 className="text-xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
        {data.title}
      </h3>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-3 text-left bg-secondary/30 border border-border rounded-tl-lg">Feature</th>
            {data.items.map((item) => (
              <th key={item.name} className="p-3 text-left bg-secondary/30 border border-border">
                <div className="flex items-center gap-2">
                  {item.icon && <span className="text-lg">{item.icon}</span>}
                  <span className="font-semibold">{item.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.categories.map((category) => (
            <tr
              key={category}
              className="transition-all duration-200 hover:bg-accent/5"
              onMouseEnter={() => setHighlightedItem(null)}
            >
              <td className="p-3 border border-border font-medium bg-secondary/10">{category}</td>
              {data.items.map((item) => (
                <td
                  key={`${item.name}-${category}`}
                  className="p-3 border border-border"
                  onMouseEnter={() => setHighlightedItem(item.name)}
                  style={{ opacity: highlightedItem === item.name ? 1 : highlightedItem ? 0.6 : 1 }}
                >
                  {item.values[category]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}