"use client";

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RadarData } from "@/types/visuals";

export function RadarChart({ data }: { data: RadarData }) {
  // Transform data to format expected by Recharts
  const chartData = data.categories.map((category, idx) => {
    const point: any = { subject: category };
    data.series.forEach((series) => {
      point[series.name] = series.values[idx];
    });
    return point;
  });

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
        {data.title}
      </h3>
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--foreground))" }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
              }}
            />
            {data.series.map((series, idx) => (
              <Radar
                key={series.name}
                name={series.name}
                dataKey={series.name}
                stroke={colors[idx % colors.length]}
                fill={colors[idx % colors.length]}
                fillOpacity={0.3}
              />
            ))}
          </RechartsRadar>
        </ResponsiveContainer>
      </div>
    </div>
  );
}