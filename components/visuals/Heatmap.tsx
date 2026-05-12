"use client";

import ReactECharts from "echarts-for-react";
import type { HeatmapData } from "@/types/visuals";

type HeatmapProps = {
  data: HeatmapData;
};

export function Heatmap({ data }: HeatmapProps) {
  const { xLabels, yLabels, data: matrix } = data;

  if (!matrix?.length) return null;

  const seriesData: [number, number, number][] = [];

  for (let i = 0; i < yLabels.length; i++) {
    for (let j = 0; j < xLabels.length; j++) {
      seriesData.push([j, i, matrix[i]?.[j] ?? 0]);
    }
  }

  const values = seriesData.map((d) => d[2]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const option = {
    tooltip: { position: "top" },
    grid: { height: "70%", top: "10%" },
    xAxis: {
      type: "category",
      data: xLabels,
      splitArea: { show: true },
    },
    yAxis: {
      type: "category",
      data: yLabels,
      splitArea: { show: true },
    },
    visualMap: {
      min,
      max,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "0%",
    },
    series: [
      {
        name: "Heatmap",
        type: "heatmap",
        data: seriesData,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 500 }} />;
}