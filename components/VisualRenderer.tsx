"use client";

import { useEffect } from "react";
import { VisualData } from "@/types/visuals";
import { ProcessFlow } from "@/components/visuals/ProcessFlow";
import { Timeline } from "@/components/visuals/Timeline";
import { Graph } from "@/components/visuals/Graph";
import { ConceptMap } from "@/components/visuals/ConceptMap";
import { Cycle } from "@/components/visuals/Cycle";
import { Comparison } from "@/components/visuals/Comparison";
import { Hierarchy } from "@/components/visuals/Hierarchy";
import { Treemap } from "@/components/visuals/Treemap";
import { RadarChart } from "@/components/visuals/RadarChart";
import { GanttChart } from "@/components/visuals/GanttChart";
import { Heatmap } from "@/components/visuals/Heatmap";
import { ChordDiagram } from "@/components/visuals/ChordDiagram";

export function VisualRenderer({ data, className = "" }: { data: VisualData; className?: string }) {
  useEffect(() => {
    console.log("[VisualRenderer] rendering visual", {
      type: data.type,
      title: data.title,
      className,
    });
  }, [className, data]);

  switch (data.type) {
    case "process":
      console.log("[VisualRenderer] selected ProcessFlow");
      return (
        <div className={className}>
          <ProcessFlow data={data} />
        </div>
      );
    case "timeline":
      console.log("[VisualRenderer] selected Timeline");
      return (
        <div className={className}>
          <Timeline data={data} />
        </div>
      );
    case "graph":
      console.log("[VisualRenderer] selected Graph");
      return (
        <div className={className}>
          <Graph data={data} />
        </div>
      );
    case "concept_map":
      console.log("[VisualRenderer] selected ConceptMap");
      return (
        <div className={className}>
          <ConceptMap data={data} />
        </div>
      );
    case "cycle":
      console.log("[VisualRenderer] selected Cycle");
      return (
        <div className={className}>
          <Cycle data={data} />
        </div>
      );
    case "comparison":
      console.log("[VisualRenderer] selected Comparison");
      return (
        <div className={className}>
          <Comparison data={data} />
        </div>
      );
    case "hierarchy":
      console.log("[VisualRenderer] selected Hierarchy");
      return (
        <div className={className}>
          <Hierarchy data={data} />
        </div>
      );
    case "treemap":
      console.log("[VisualRenderer] selected Treemap");
      return (
        <div className={className}>
          <Treemap data={data} />
        </div>
      );
    case "radar":
      console.log("[VisualRenderer] selected RadarChart");
      return (
        <div className={className}>
          <RadarChart data={data} />
        </div>
      );
    case "gantt":
      console.log("[VisualRenderer] selected GanttChart");
      return (
        <div className={className}>
          <GanttChart data={data} />
        </div>
      );
    case "heatmap":
      console.log("[VisualRenderer] selected Heatmap");
      return (
        <div className={className}>
          <Heatmap data={data} />
        </div>
      );
    case "chord":
      console.log("[VisualRenderer] selected ChordDiagram");
      return (
        <div className={className}>
          <ChordDiagram data={data} />
        </div>
      );
    default:
      const fallbackData = data as { type?: string; title?: string };
      console.warn("[VisualRenderer] no renderer available for visual type", {
        type: fallbackData.type,
        title: fallbackData.title,
      });
      return (
        <div className="text-center text-muted-foreground p-8 border border-border rounded-lg">
          No visual available for this content typesss
        </div>
      );
  }
}