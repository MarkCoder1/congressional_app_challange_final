"use client";

import { PresetType } from "@/lib/learningMapPresets";
import { CardsView } from "./CardsView";
import { ComparisonView } from "./ComparisonView";
import { DiagramView } from "./DiagramView";
import { FlowView } from "./FlowView";
import { GraphView } from "./GraphView";
import { ListView } from "./ListView";
import { NodeMapView } from "./NodeMapView";
import { TableView } from "./TableView";
import { TimelineView } from "./TimelineView";

export function VisualRenderer({
  type,
  data,
}: {
  type: PresetType;
  data: unknown;
}) {
  switch (type) {
    case "graph":
      return <GraphView data={data} />;
    case "timeline":
      return <TimelineView data={data} />;
    case "flow":
    case "process":
      return <FlowView data={data} />;
    case "node-map":
      return <NodeMapView data={data} />;
    case "diagram":
      return <DiagramView data={data} />;
    case "comparison":
      return <ComparisonView data={data} />;
    case "table":
      return <TableView data={data} />;
    case "cards":
      return <CardsView data={data} />;
    case "list":
      return <ListView data={data} />;
    default:
      return <p className="text-sm text-muted-foreground">Unsupported visual type.</p>;
  }
}
