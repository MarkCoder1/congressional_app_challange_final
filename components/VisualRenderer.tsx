"use client";

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
  switch (data.type) {
    case "process":
      return (
        <div className={className}>
          <ProcessFlow data={data} />
        </div>
      );
    case "timeline":
      return (
        <div className={className}>
          <Timeline data={data} />
        </div>
      );
    case "graph":
      return (
        <div className={className}>
          <Graph data={data} />
        </div>
      );
    case "concept_map":
      return (
        <div className={className}>
          <ConceptMap data={data} />
        </div>
      );
    case "cycle":
      return (
        <div className={className}>
          <Cycle data={data} />
        </div>
      );
    case "comparison":
      return (
        <div className={className}>
          <Comparison data={data} />
        </div>
      );
    case "hierarchy":
      return (
        <div className={className}>
          <Hierarchy data={data} />
        </div>
      );
    case "treemap":
      return (
        <div className={className}>
          <Treemap data={data} />
        </div>
      );
    case "radar":
      return (
        <div className={className}>
          <RadarChart data={data} />
        </div>
      );
    case "gantt":
      return (
        <div className={className}>
          <GanttChart data={data} />
        </div>
      );
    case "heatmap":
      return (
        <div className={className}>
          <Heatmap data={data} />
        </div>
      );
    case "chord":
      return (
        <div className={className}>
          <ChordDiagram data={data} />
        </div>
      );
    default:
      return (
        <div className="text-center text-muted-foreground p-8 border border-border rounded-lg">
          No visual available for this content typesss
        </div>
      );
  }
}