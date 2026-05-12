// /types/visuals.ts

// ============================================================================
// VISUAL SCHEMA REGISTRY - Core Types
// ============================================================================

export type VisualType = 
  | "process"
  | "timeline"
  | "graph"
  | "concept_map"
  | "cycle"
  | "comparison"
  | "hierarchy"
  | "treemap"
  | "radar"
  | "gantt"
  | "heatmap"
  | "chord";
// ============================================================================
// SCHEMA DEFINITIONS - Each visual has its own input structure
// ============================================================================

// Process Flow Schema
export interface ProcessFlowData {
  type: "process";
  title: string;
  steps: {
    id: string;
    title: string;
    description: string;
    icon?: string;
    explanation?: string;
  }[];
  inputs?: string[];
  outputs?: string[];
}

// Timeline Schema
export interface TimelineData {
  type: "timeline";
  title: string;
  events: {
    date: string;
    title: string;
    description: string;
    details?: string[];
  }[];
}

// Graph Schema
export interface GraphData {
  type: "graph";
  title: string;
  xLabel: string;
  yLabel: string;
  equation?: string;
  points?: { x: number; y: number; label?: string }[];
  graphType: "line" | "bar" | "scatter";
}

// Concept Map Schema
export interface ConceptMapData {
  type: "concept_map";
  title: string;
  nodes: {
    id: string;
    label: string;
    description: string;
    icon?: string;
  }[];
  edges: {
    from: string;
    to: string;
    label?: string;
  }[];
  centerNode?: string;
}

// Cycle Schema
export interface CycleData {
  type: "cycle";
  title: string;
  stages: {
    id: string;
    name: string;
    description: string;
    icon?: string;
  }[];
  direction?: "clockwise" | "counterclockwise";
}

// Comparison Schema
export interface ComparisonData {
  type: "comparison";
  title: string;
  categories: string[];
  items: {
    name: string;
    values: Record<string, string>;
    icon?: string;
  }[];
}

// Hierarchy Schema
export interface HierarchyData {
  type: "hierarchy";
  title: string;
  root: {
    id: string;
    label: string;
    description: string;
    children: HierarchyNode[];
  };
}

export interface HierarchyNode {
  id: string;
  label: string;
  description: string;
  children?: HierarchyNode[];
}

// ============================================================================
// UNION TYPE
// ============================================================================


// Update VisualData union
export type VisualData =
  | ProcessFlowData
  | TimelineData
  | GraphData
  | ConceptMapData
  | CycleData
  | ComparisonData
  | HierarchyData
  | TreemapData
  | RadarData
  | GanttData
  | HeatmapData
  | ChordData;

// ============================================================================
// SCHEMA REGISTRY - For AI to know what fields to fill
// ============================================================================

export const visualSchemas: Record<VisualType, string[]> = {
  process: ["steps (array of {title, description})", "inputs (optional)", "outputs (optional)"],
  timeline: ["events (array of {date, title, description})"],
  graph: ["xLabel", "yLabel", "points (array of {x, y})", "graphType"],
  concept_map: ["nodes (array of {id, label})", "edges (array of {from, to})"],
  cycle: ["stages (array of {name, description})"],
  comparison: ["categories", "items (array of {name, values})"],
  hierarchy: ["root (with children)"],
  treemap: ["data (array of {name, value, children?})"],
  radar: ["categories (array of strings)", "series (array of {name, values})"],
  gantt: ["tasks (array of {id, name, start, end, progress, dependencies?})"],
  heatmap: ["xLabels", "yLabels", "data (2D array of numbers)"],
  chord: ["matrix (square number[][])", "labels (string[])"],
};

// ============================================================================
// VISUAL DETECTION LOGIC - Type inference from content
// ============================================================================

export function detectVisualType(content: {
  title: string;
  description: string;
  steps?: string[];
  events?: any[];
  hasDates?: boolean;
  hasNumbers?: boolean;
  isComparison?: boolean;
}): VisualType {
  // Check for timeline patterns (dates, chronological order)
  if (content.hasDates || content.title?.toLowerCase().includes("timeline") ||
      content.title?.toLowerCase().includes("history") ||
      content.title?.toLowerCase().includes("evolution")) {
    return "timeline";
  }
  
  // Check for process patterns (steps, inputs/outputs)
  if (content.steps && content.steps.length > 0 ||
      content.title?.toLowerCase().includes("process") ||
      content.title?.toLowerCase().includes("steps") ||
      content.description?.toLowerCase().includes("how")) {
    return "process";
  }
  
  // Check for math/science patterns (graphs)
  if (content.hasNumbers ||
      content.title?.toLowerCase().includes("graph") ||
      content.title?.toLowerCase().includes("function") ||
      content.title?.toLowerCase().includes("equation")) {
    return "graph";
  }
  
  // Check for comparison patterns
  if (content.isComparison ||
      content.title?.toLowerCase().includes("versus") ||
      content.title?.toLowerCase().includes("vs") ||
      content.title?.toLowerCase().includes("compare")) {
    return "comparison";
  }
  
  // Check for cycle patterns
  if (content.title?.toLowerCase().includes("cycle") ||
      content.title?.toLowerCase().includes("loop") ||
      content.description?.toLowerCase().includes("returns to")) {
    return "cycle";
  }
  
  // Check for hierarchy patterns
  if (content.title?.toLowerCase().includes("structure") ||
      content.title?.toLowerCase().includes("hierarchy") ||
      content.title?.toLowerCase().includes("classification")) {
    return "hierarchy";
  }
  
  // Default to concept map for relationships
  return "concept_map";
}



// ========== NEW TYPES ==========

// Treemap
export interface TreemapData {
  type: "treemap";
  title: string;
  data: TreemapNode[];
}

export interface TreemapNode {
  name: string;
  value: number;
  children?: TreemapNode[];
}

// Radar Chart
export interface RadarData {
  type: "radar";
  title: string;
  categories: string[];      // e.g., ["Math", "Physics", "Biology"]
  series: RadarSeries[];
}

export interface RadarSeries {
  name: string;               // e.g., "Student A"
  values: number[];
}

// Gantt Chart
export interface GanttData {
  type: "gantt";
  title: string;
  tasks: GanttTask[];
}

export interface GanttTask {
  id: string;
  name: string;
  start: Date | string;      // ISO date or "day 1", "Q1" etc.
  end: Date | string;
  dependencies?: string[];    // IDs of tasks that must finish before this starts
  progress?: number;          // 0-100
}

// Heatmap
export interface HeatmapData {
  type: "heatmap";
  title: string;
  xLabels: string[];
  yLabels: string[];
  data: number[][];           // 2D array of values
  colorScale?: [string, string]; // low, high colors
}

// Chord Diagram
export interface ChordData {
  type: "chord";
  title: string;
  matrix: number[][];         // square matrix of connections
  labels: string[];           // names for rows/cols
}

