export type GraphInput = {
  points: { x: number; y: number }[];
  equation?: string;
  xLabel?: string;
  yLabel?: string;
};

export type TimelineInput = {
  events: {
    date: string;
    title: string;
    description: string;
  }[];
};

export type FlowInput = {
  steps: {
    title: string;
    description: string;
  }[];
};

export type NodeMapInput = {
  nodes: {
    id: string;
    label: string;
    connections: string[];
  }[];
};

export type DiagramInput = {
  parts: {
    label: string;
    description: string;
    position: { x: number; y: number };
  }[];
};

export type ComparisonInput = {
  items: {
    title: string;
    points: string[];
  }[];
};

export type TableInput = {
  columns: string[];
  rows: (string | number)[][];
};

export type CardsInput = {
  cards: {
    title: string;
    content: string;
  }[];
};

export type ListInput = {
  items: string[];
};
