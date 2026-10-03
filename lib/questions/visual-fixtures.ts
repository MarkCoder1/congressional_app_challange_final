// /lib/questions/visual-fixtures.ts
//
// Deterministic mock fixtures for the six visual question types. Used by the
// dev test harness and by unit tests. Never used as fallback production data.

import type {
  DiagramLabelQuestion,
  GraphQuestion,
  TimelineQuestion,
  FlowchartQuestion,
  ScenarioQuestion,
  ErrorDetectionQuestion,
} from "@/types/question";

export const diagramLabelFixture: DiagramLabelQuestion = {
  id: "visual-dl-1",
  type: "diagram-label",
  topicId: "bio-cell",
  topic: "Cell Structure",
  difficulty: "medium",
  prompt: "Label the parts of the plant cell diagram.",
  explanation: "The nucleus controls the cell, the cell wall provides support, chloroplasts make food, and the vacuole stores water.",
  title: "Plant Cell",
  aspectRatio: 1.6,
  regions: [
    { id: "r1", label: "Nucleus", x: 38, y: 28, width: 18, height: 14 },
    { id: "r2", label: "Cell Wall", x: 4, y: 6, width: 92, height: 86 },
    { id: "r3", label: "Chloroplast", x: 62, y: 54, width: 16, height: 12 },
    { id: "r4", label: "Vacuole", x: 34, y: 58, width: 22, height: 18 },
  ],
  labels: [
    { id: "l1", text: "Nucleus" },
    { id: "l2", text: "Cell Wall" },
    { id: "l3", text: "Chloroplast" },
    { id: "l4", text: "Vacuole" },
  ],
  correctPlacements: {
    l1: "r1",
    l2: "r2",
    l3: "r3",
    l4: "r4",
  },
};

export const graphSelectPointFixture: GraphQuestion = {
  id: "visual-g-1",
  type: "graph",
  topicId: "math-graph",
  topic: "Coordinate Plane",
  difficulty: "medium",
  prompt: "Which point lies on the line y = x?",
  explanation: "Points on y = x have equal x and y coordinates. Only (2, 2) satisfies this.",
  title: "Points on a Plane",
  xLabel: "x",
  yLabel: "y",
  xMin: -5,
  xMax: 5,
  yMin: -5,
  yMax: 5,
  points: [
    { id: "p1", x: 2, y: 2, label: "A" },
    { id: "p2", x: 2, y: 3, label: "B" },
    { id: "p3", x: -1, y: 1, label: "C" },
    { id: "p4", x: 0, y: -2, label: "D" },
  ],
  lines: [{ id: "ln1", fromX: -5, fromY: -5, toX: 5, toY: 5 }],
  interaction: "select-point",
  correctAnswer: "p1",
};

export const graphNumericFixture: GraphQuestion = {
  id: "visual-g-2",
  type: "graph",
  topicId: "math-slope",
  topic: "Slope",
  difficulty: "medium",
  prompt: "What is the slope of the line shown?",
  explanation: "Slope is rise over run. From (-2, -2) to (2, 2) the slope is 1.",
  title: "Line Slope",
  xLabel: "x",
  yLabel: "y",
  xMin: -5,
  xMax: 5,
  yMin: -5,
  yMax: 5,
  points: [
    { id: "p1", x: -2, y: -2, label: "P1" },
    { id: "p2", x: 2, y: 2, label: "P2" },
  ],
  lines: [{ id: "ln1", fromX: -4, fromY: -4, toX: 4, toY: 4 }],
  interaction: "numeric",
  correctValue: 1,
  tolerance: 0.1,
};

export const graphChooseFixture: GraphQuestion = {
  id: "visual-g-3",
  type: "graph",
  topicId: "math-graph",
  topic: "Graph Choice",
  difficulty: "easy",
  prompt: "Which description matches the graph?",
  explanation: "The line passes through the origin with positive slope.",
  title: "Line Through Origin",
  xLabel: "x",
  yLabel: "y",
  xMin: -5,
  xMax: 5,
  yMin: -5,
  yMax: 5,
  points: [],
  lines: [{ id: "ln1", fromX: -5, fromY: -5, toX: 5, toY: 5 }],
  interaction: "choose-graph",
  options: [
    { id: "a", text: "A line with positive slope through the origin" },
    { id: "b", text: "A horizontal line at y = 2" },
    { id: "c", text: "A vertical line at x = 1" },
  ],
  correctAnswer: "a",
};

export const timelineFixture: TimelineQuestion = {
  id: "visual-tl-1",
  type: "timeline",
  topicId: "hist-events",
  topic: "World History",
  difficulty: "medium",
  prompt: "Put these events in chronological order (earliest first).",
  explanation: "Printing press (1440) → French Revolution (1789) → Moon landing (1969) → Fall of Berlin Wall (1989).",
  events: [
    { id: "e1", label: "French Revolution begins", date: "1789", detail: "Storming of the Bastille" },
    { id: "e2", label: "Apollo 11 Moon Landing", date: "1969", detail: "Neil Armstrong steps on the Moon" },
    { id: "e3", label: "Fall of the Berlin Wall", date: "1989", detail: "Germany reunification begins" },
    { id: "e4", label: "Gutenberg Printing Press", date: "1440", detail: "Movable type invented" },
  ],
  correctOrder: ["e4", "e1", "e2", "e3"],
};

export const flowchartFixture: FlowchartQuestion = {
  id: "visual-fc-1",
  type: "flowchart",
  topicId: "sci-method",
  topic: "Scientific Method",
  difficulty: "easy",
  prompt: "Arrange the steps of the scientific method in the correct order.",
  explanation: "The scientific method flows from question → research → hypothesis → experiment → analysis → conclusion.",
  nodes: [
    { id: "n1", text: "Ask a Question" },
    { id: "n2", text: "Do Background Research" },
    { id: "n3", text: "Construct a Hypothesis" },
    { id: "n4", text: "Test with an Experiment" },
    { id: "n5", text: "Analyze Data" },
    { id: "n6", text: "Draw a Conclusion" },
  ],
  edges: [
    { from: "n1", to: "n2" },
    { from: "n2", to: "n3" },
    { from: "n3", to: "n4" },
    { from: "n4", to: "n5" },
    { from: "n5", to: "n6" },
  ],
  correctOrder: ["n1", "n2", "n3", "n4", "n5", "n6"],
};

export const scenarioFixture: ScenarioQuestion = {
  id: "visual-sc-1",
  type: "scenario",
  topicId: "bio-plants",
  topic: "Plant Growth",
  difficulty: "medium",
  prompt: "Based on the data, which conclusion is best supported?",
  explanation: "Plants in sunlight grew taller on average, supporting that light increases growth.",
  context:
    "A student grew two groups of bean plants for two weeks. Group A was placed on a sunny windowsill; Group B was kept in a dark closet. Both groups received the same water and soil.",
  evidence: [
    {
      id: "ev1",
      title: "Height after 14 days",
      kind: "table",
      content: "Group A (sun): 12cm, 14cm, 13cm\nGroup B (dark): 4cm, 5cm, 3cm",
    },
    {
      id: "ev2",
      title: "Observation",
      kind: "text",
      content: "Group B plants were pale and spindly; Group A plants were green and sturdy.",
    },
  ],
  options: [
    { id: "a", text: "Sunlight has no effect on plant growth" },
    { id: "b", text: "Sunlight increases plant growth and health" },
    { id: "c", text: "Darkness makes plants grow faster" },
    { id: "d", text: "Water alone determines growth" },
  ],
  correctAnswer: "b",
};

export const errorDetectionFixture: ErrorDetectionQuestion = {
  id: "visual-ed-1",
  type: "error-detection",
  topicId: "math-algebra",
  topic: "Algebra",
  difficulty: "medium",
  prompt: "Which step contains the first error?",
  explanation: "Step 2 incorrectly adds 3 instead of subtracting it. 2x + 3 = 11 → 2x = 8, not 14.",
  problem: "Solve for x: 2x + 3 = 11",
  steps: [
    { id: "s1", text: "Step 1: 2x + 3 = 11" },
    { id: "s2", text: "Step 2: 2x = 11 + 3 → 2x = 14" },
    { id: "s3", text: "Step 3: x = 14 / 2 → x = 7" },
    { id: "s4", text: "Step 4: Check: 2(7) + 3 = 17 ≠ 11, so x = 7" },
  ],
  errorStepId: "s2",
  fixExplanation: "Subtract 3 from both sides: 2x = 8, so x = 4.",
};

export const allVisualFixtures = [
  diagramLabelFixture,
  graphSelectPointFixture,
  graphNumericFixture,
  graphChooseFixture,
  timelineFixture,
  flowchartFixture,
  scenarioFixture,
  errorDetectionFixture,
] as const;
