"use client";

import { GraphInput } from "@/lib/visualInputs";

function isGraphInput(data: unknown): data is GraphInput {
  if (!data || typeof data !== "object") return false;
  const maybe = data as GraphInput;
  return Array.isArray(maybe.points);
}

export function GraphView({ data }: { data: unknown }) {
  if (!isGraphInput(data) || data.points.length === 0) {
    return <p className="text-sm text-muted-foreground">Graph data is invalid.</p>;
  }

  const width = 640;
  const height = 320;
  const pad = 40;
  const xVals = data.points.map((p) => p.x);
  const yVals = data.points.map((p) => p.y);
  const minX = Math.min(...xVals);
  const maxX = Math.max(...xVals);
  const minY = Math.min(...yVals);
  const maxY = Math.max(...yVals);

  const mapX = (x: number) =>
    pad + ((x - minX) / Math.max(1, maxX - minX)) * (width - pad * 2);
  const mapY = (y: number) =>
    height - pad - ((y - minY) / Math.max(1, maxY - minY)) * (height - pad * 2);

  const points = data.points.map((p) => `${mapX(p.x)},${mapY(p.y)}`).join(" ");

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-lg border border-border bg-card">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="currentColor" opacity="0.4" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="currentColor" opacity="0.4" />
        <polyline fill="none" stroke="hsl(var(--accent))" strokeWidth="3" points={points} />
        {data.points.map((point) => (
          <circle key={`${point.x}-${point.y}`} cx={mapX(point.x)} cy={mapY(point.y)} r="4" fill="hsl(var(--accent))" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{data.xLabel ?? "X-axis"}</span>
        <span>{data.equation ?? ""}</span>
        <span>{data.yLabel ?? "Y-axis"}</span>
      </div>
    </div>
  );
}
