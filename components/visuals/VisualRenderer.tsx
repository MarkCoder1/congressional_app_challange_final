"use client";

import { useEffect } from "react";
import { VisualData } from "@/types/visuals";
import { ProcessFlow } from "./ProcessFlow";
import { Timeline } from "./Timeline";
import { Graph } from "./Graph";
import { ConceptMap } from "./ConceptMap";
import { Cycle } from "./Cycle";
import { Comparison } from "./Comparison";
import { Hierarchy } from "./Hierarchy";
import { Treemap } from "./Treemap";
import { RadarChart } from "./RadarChart";
import { GanttChart } from "./GanttChart";
import { Heatmap } from "./Heatmap";
import { ChordDiagram } from "./ChordDiagram";

export function VisualRenderer({ data, className = "" }: { data: VisualData; className?: string }) {
  useEffect(() => {
    console.log("[LegacyVisualRenderer] rendering visual", {
      type: data.type,
      title: data.title,
      className,
    });
  }, [className, data]);

  switch (data.type) {
    case "process":
      console.log("[LegacyVisualRenderer] selected ProcessFlow");
      return (
        <div className={className}>
          <ProcessFlow data={data} />
        </div>
      );
    case "timeline":
      console.log("[LegacyVisualRenderer] selected Timeline");
      return (
        <div className={className}>
          <Timeline data={data} />
        </div>
      );
    case "graph":
      console.log("[LegacyVisualRenderer] selected Graph");
      return (
        <div className={className}>
          <Graph data={data} />
        </div>
      );
    case "concept_map":
      console.log("[LegacyVisualRenderer] selected ConceptMap");
      return (
        <div className={className}>
          <ConceptMap data={data} />
        </div>
      );
    case "cycle":
      console.log("[LegacyVisualRenderer] selected Cycle");
      return (
        <div className={className}>
          <Cycle data={data} />
        </div>
      );
    case "comparison":
      console.log("[LegacyVisualRenderer] selected Comparison");
      return (
        <div className={className}>
          <Comparison data={data} />
        </div>
      );
    case "hierarchy":
      console.log("[LegacyVisualRenderer] selected Hierarchy");
      return (
        <div className={className}>
          <Hierarchy data={data} />
        </div>
      );
    case "treemap":
      console.log("[LegacyVisualRenderer] selected Treemap");
      return (
        <div className={className}>
          <Treemap data={data} />
        </div>
      );
    case "radar":
      console.log("[LegacyVisualRenderer] selected RadarChart");
      return (
        <div className={className}>
          <RadarChart data={data} />
        </div>
      );
    case "gantt":
      console.log("[LegacyVisualRenderer] selected GanttChart");
      return (
        <div className={className}>
          <GanttChart data={data} />
        </div>
      );
    case "heatmap":
      console.log("[LegacyVisualRenderer] selected Heatmap");
      return (
        <div className={className}>
          <Heatmap data={data} />
        </div>
      );
    case "chord":
      console.log("[LegacyVisualRenderer] selected ChordDiagram");
      return (
        <div className={className}>
          <ChordDiagram data={data} />
        </div>
      );
    default:
      const fallbackData = data as { type?: string; title?: string };
      console.warn("[LegacyVisualRenderer] no renderer available for visual type", {
        type: fallbackData.type,
        title: fallbackData.title,
      });
      return (
        <div className="text-center text-muted-foreground p-8 border border-border rounded-lg">
          No visual available for this content type
        </div>
      );
  }
}