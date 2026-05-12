"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { GraphData } from "@/types/visuals";

export function Graph({ data }: { data: GraphData }) {
  const chartData = data.points?.map((p) => ({ x: p.x, y: p.y, label: p.label })) || [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
          {data.title}
        </h3>
        {data.equation && (
          <code className="text-sm block mt-1 text-muted-foreground font-mono">{data.equation}</code>
        )}
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="x" label={{ value: data.xLabel, position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: data.yLabel, angle: -90, position: "insideLeft" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelFormatter={(label) => `x = ${label}`}
              formatter={(value) => [`${value}`, data.yLabel]}
            />
            <Line
              type="monotone"
              dataKey="y"
              stroke="hsl(var(--accent))"
              strokeWidth={3}
              dot={{ r: 4, fill: "hsl(var(--accent))", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}