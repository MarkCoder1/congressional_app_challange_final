"use client";

import { NodeMapInput } from "@/lib/visualInputs";

function isNodeMapInput(data: unknown): data is NodeMapInput {
  if (!data || typeof data !== "object") return false;
  return Array.isArray((data as NodeMapInput).nodes);
}

export function NodeMapView({ data }: { data: unknown }) {
  if (!isNodeMapInput(data) || data.nodes.length === 0) {
    return <p className="text-sm text-muted-foreground">Node map data is invalid.</p>;
  }

  const width = 700;
  const height = 360;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.33;
  const positions = new Map<string, { x: number; y: number }>();

  data.nodes.forEach((node, idx) => {
    const angle = (idx / data.nodes.length) * Math.PI * 2;
    positions.set(node.id, {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-lg border border-border bg-card">
      {data.nodes.flatMap((node) =>
        node.connections.map((connectionId) => {
          const from = positions.get(node.id);
          const to = positions.get(connectionId);
          if (!from || !to) return null;
          return (
            <line
              key={`${node.id}-${connectionId}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="currentColor"
              opacity="0.35"
            />
          );
        }),
      )}
      {data.nodes.map((node) => {
        const pos = positions.get(node.id);
        if (!pos) return null;
        return (
          <g key={node.id}>
            <circle cx={pos.x} cy={pos.y} r="28" fill="hsl(var(--accent))" opacity="0.18" />
            <circle cx={pos.x} cy={pos.y} r="20" fill="hsl(var(--accent))" />
            <text x={pos.x} y={pos.y + 42} textAnchor="middle" fontSize="12" fill="currentColor">
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
