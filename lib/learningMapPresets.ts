/**
 * LEARNING MAP PRESETS SYSTEM
 *
 * This is a scalable, preset-based visual learning system ready for AI integration.
 *
 * ARCHITECTURE:
 * - Each subject has predefined visual preset templates
 * - Presets define STRUCTURE and LAYOUT (not content)
 * - AI (future) will only inject content into these preset structures
 * - No dynamic structure generation
 *
 * AI INTEGRATION PATTERN:
 * Instead of:  const data = task.learningMaps;
 * Future use: const data = await getAIGeneratedMaps(task, presetId);
 */

import { Subject } from "./types";

// ============================================================================
// VISUAL PRESET TYPE DEFINITIONS
// ============================================================================

export type PresetType =
  | "timeline"
  | "node-map"
  | "graph"
  | "table"
  | "flow"
  | "cards"
  | "diagram"
  | "process"
  | "list"
  | "comparison";

export interface TimelineEvent {
  year: string | number;
  title: string;
  description: string;
  icon?: string;
  details?: string[];
}

export interface TimelinePreset {
  type: "timeline";
  title: string;
  description: string;
  events: TimelineEvent[];
}

export interface NodeMapNode {
  id: string;
  label: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  position?: { x: number; y: number };
  children?: string[];
  details?: string[];
}

export interface NodeMapPreset {
  type: "node-map";
  title: string;
  description: string;
  nodes: NodeMapNode[];
  centerNode?: string;
}

export interface GraphDataPoint {
  x: string | number;
  y: number;
  label?: string;
  annotation?: string;
}

export interface GraphPreset {
  type: "graph";
  title: string;
  description: string;
  xAxisLabel: string;
  yAxisLabel: string;
  data: GraphDataPoint[];
  graphType: "line" | "bar" | "scatter";
}

export interface TableColumn {
  key: string;
  header: string;
  type?: "text" | "number" | "formula";
}

export interface TableRow {
  [key: string]: string | number;
}

export interface TablePreset {
  type: "table";
  title: string;
  description: string;
  columns: TableColumn[];
  rows: TableRow[];
}

export interface FlowStep {
  id: string;
  title: string;
  description: string;
  inputs?: string[];
  outputs?: string[];
  icon?: string;
  nextSteps?: string[];
  previousSteps?: string[];
}

export interface FlowPreset {
  type: "flow";
  title: string;
  description: string;
  steps: FlowStep[];
  startStep: string;
  endStep: string;
}

export interface Card {
  id: string;
  title: string;
  content: string;
  icon?: string;
  color?: string;
  tags?: string[];
  example?: string;
}

export interface CardsPreset {
  type: "cards";
  title: string;
  description: string;
  cards: Card[];
  layout?: "grid" | "carousel";
}

export interface DiagramElement {
  id: string;
  type: "box" | "circle" | "arrow" | "text" | "line";
  label?: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  connections?: string[];
  color?: string;
  icon?: string;
}

export interface DiagramPreset {
  type: "diagram";
  title: string;
  description: string;
  elements: DiagramElement[];
  background?: string;
  gridEnabled?: boolean;
}

export interface ProcessStage {
  id: string;
  name: string;
  description: string;
  duration?: string;
  inputs?: string[];
  outputs?: string[];
  icon?: string;
  details?: Record<string, string>;
}

export interface ProcessPreset {
  type: "process";
  title: string;
  description: string;
  stages: ProcessStage[];
  totalDuration?: string;
}

export interface ListItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  details?: string[];
  level?: number;
}

export interface ListPreset {
  type: "list";
  title: string;
  description: string;
  items: ListItem[];
  listStyle?: "ordered" | "unordered" | "nested";
}

export interface ComparisonItem {
  id: string;
  label: string;
  properties: Record<string, string | number | boolean>;
  icon?: string;
  color?: string;
}

export interface ComparisonPreset {
  type: "comparison";
  title: string;
  description: string;
  items: ComparisonItem[];
  propertyLabels: Record<string, string>;
}

export type LearningPreset =
  | TimelinePreset
  | NodeMapPreset
  | GraphPreset
  | TablePreset
  | FlowPreset
  | CardsPreset
  | DiagramPreset
  | ProcessPreset
  | ListPreset
  | ComparisonPreset;

export interface PresetOption {
  id: string;
  label: string;
  description: string;
  type: PresetType;
  icon: string;
}

// ============================================================================
// SUBJECT PRESET REGISTRY
// ============================================================================

export const subjectPresets: Record<Subject, PresetOption[]> = {
  Math: [
    {
      id: "definitions",
      label: "Definitions",
      description: "Key mathematical concepts and terms",
      type: "cards",
      icon: "📝",
    },
    {
      id: "formulas",
      label: "Formulas",
      description: "Mathematical formulas and equations",
      type: "table",
      icon: "📐",
    },
    {
      id: "graph-behavior",
      label: "Graph Behavior",
      description: "Visual representations and graph analysis",
      type: "graph",
      icon: "📈",
    },
    {
      id: "solving-methods",
      label: "Solving Methods",
      description: "Step-by-step problem-solving approaches",
      type: "flow",
      icon: "🔧",
    },
    {
      id: "applications",
      label: "Applications",
      description: "Real-world uses and examples",
      type: "cards",
      icon: "🌍",
    },
    {
      id: "common-mistakes",
      label: "Common Mistakes",
      description: "Errors to avoid and how to prevent them",
      type: "list",
      icon: "⚠️",
    },
  ],

  History: [
    {
      id: "timeline",
      label: "Timeline",
      description: "Chronological sequence of events",
      type: "timeline",
      icon: "📅",
    },
    {
      id: "causes",
      label: "Causes",
      description: "Root factors and origins of events",
      type: "node-map",
      icon: "🔍",
    },
    {
      id: "effects",
      label: "Effects",
      description: "Consequences and outcomes",
      type: "node-map",
      icon: "💥",
    },
    {
      id: "key-figures",
      label: "Key Figures",
      description: "Important people and leaders",
      type: "cards",
      icon: "👥",
    },
    {
      id: "events-breakdown",
      label: "Events Breakdown",
      description: "Detailed breakdown of major events",
      type: "flow",
      icon: "🪧",
    },
    {
      id: "comparison",
      label: "Comparison",
      description: "Compare different time periods or events",
      type: "comparison",
      icon: "⚖️",
    },
  ],

  Science: [
    {
      id: "concept",
      label: "Concept",
      description: "Core scientific concepts",
      type: "cards",
      icon: "💡",
    },
    {
      id: "process",
      label: "Process",
      description: "Sequential stages of scientific processes",
      type: "flow",
      icon: "⚙️",
    },
    {
      id: "diagram",
      label: "Diagram",
      description: "Visual scientific representations",
      type: "diagram",
      icon: "🖼️",
    },
    {
      id: "experiments",
      label: "Experiments",
      description: "Experimental procedures and protocols",
      type: "process",
      icon: "🧪",
    },
    {
      id: "applications",
      label: "Applications",
      description: "Practical real-world applications",
      type: "cards",
      icon: "🏭",
    },
    {
      id: "comparison",
      label: "Comparison",
      description: "Compare related concepts or organisms",
      type: "comparison",
      icon: "🔄",
    },
  ],

  Physics: [
    {
      id: "formulas",
      label: "Formulas",
      description: "Physics equations and formulas",
      type: "table",
      icon: "∑",
    },
    {
      id: "graphs",
      label: "Graphs",
      description: "Physics relationships and data visualization",
      type: "graph",
      icon: "📊",
    },
    {
      id: "concepts",
      label: "Concepts",
      description: "Core physics principles",
      type: "cards",
      icon: "🌀",
    },
    {
      id: "diagrams",
      label: "Diagrams",
      description: "Force and field diagrams",
      type: "diagram",
      icon: "📐",
    },
    {
      id: "problem-solving",
      label: "Problem Solving",
      description: "Step-by-step solution methods",
      type: "flow",
      icon: "🧮",
    },
    {
      id: "real-world",
      label: "Real-World Examples",
      description: "Physics in technology and nature",
      type: "cards",
      icon: "🚀",
    },
  ],

  Programming: [
    {
      id: "concepts",
      label: "Concepts",
      description: "Programming principles and patterns",
      type: "cards",
      icon: "💻",
    },
    {
      id: "syntax",
      label: "Syntax",
      description: "Code structure and language rules",
      type: "list",
      icon: "{}",
    },
    {
      id: "flow",
      label: "Logic Flow",
      description: "Program execution and control flow",
      type: "flow",
      icon: "🔄",
    },
    {
      id: "code-examples",
      label: "Code Examples",
      description: "Practical code implementations",
      type: "cards",
      icon: "📝",
    },
    {
      id: "debugging",
      label: "Debugging",
      description: "Error finding and fixing strategies",
      type: "list",
      icon: "🐛",
    },
    {
      id: "diagram",
      label: "Architecture",
      description: "System and architecture diagrams",
      type: "diagram",
      icon: "🏗️",
    },
  ],

  Biology: [
    {
      id: "definitions",
      label: "Definitions",
      description: "Biological terms and vocabulary",
      type: "cards",
      icon: "📚",
    },
    {
      id: "structure",
      label: "Structure",
      description: "Anatomical organization and components",
      type: "diagram",
      icon: "🧬",
    },
    {
      id: "process",
      label: "Process",
      description: "Biological processes and functions",
      type: "flow",
      icon: "⚡",
    },
    {
      id: "comparison",
      label: "Comparison",
      description: "Compare organisms or systems",
      type: "comparison",
      icon: "🔄",
    },
    {
      id: "life-cycle",
      label: "Life Cycle",
      description: "Stages of development and reproduction",
      type: "timeline",
      icon: "🌱",
    },
    {
      id: "ecosystems",
      label: "Ecosystems",
      description: "Relationships in natural systems",
      type: "node-map",
      icon: "🌍",
    },
  ],

  Spanish: [
    {
      id: "vocabulary",
      label: "Vocabulary",
      description: "Words and phrases by category",
      type: "cards",
      icon: "📖",
    },
    {
      id: "grammar-rules",
      label: "Grammar",
      description: "Grammar rules and patterns",
      type: "table",
      icon: "✏️",
    },
    {
      id: "pronunciation",
      label: "Pronunciation",
      description: "Sound patterns and phonetics",
      type: "list",
      icon: "🔊",
    },
    {
      id: "culture",
      label: "Culture",
      description: "Cultural context and traditions",
      type: "cards",
      icon: "🎭",
    },
    {
      id: "dialogues",
      label: "Conversations",
      description: "Common dialogue patterns",
      type: "flow",
      icon: "💬",
    },
    {
      id: "comparison",
      label: "Comparisons",
      description: "Compare English and Spanish structure",
      type: "comparison",
      icon: "⚖️",
    },
  ],

  English: [
    {
      id: "vocabulary",
      label: "Vocabulary",
      description: "Word meanings and usage",
      type: "cards",
      icon: "📖",
    },
    {
      id: "literary-devices",
      label: "Literary Devices",
      description: "Writing techniques and effects",
      type: "list",
      icon: "✨",
    },
    {
      id: "writing-structure",
      label: "Writing Structure",
      description: "Essay and composition organization",
      type: "flow",
      icon: "📝",
    },
    {
      id: "grammar",
      label: "Grammar",
      description: "Grammar rules and mechanics",
      type: "table",
      icon: "✏️",
    },
    {
      id: "text-analysis",
      label: "Text Analysis",
      description: "Themes and literary elements",
      type: "node-map",
      icon: "🔍",
    },
    {
      id: "genres",
      label: "Genres",
      description: "Literary genres and forms",
      type: "cards",
      icon: "📚",
    },
  ],

  Literature: [
    {
      id: "themes",
      label: "Themes",
      description: "Central themes and ideas",
      type: "cards",
      icon: "🎭",
    },
    {
      id: "characters",
      label: "Characters",
      description: "Character analysis and development",
      type: "cards",
      icon: "👤",
    },
    {
      id: "plot-structure",
      label: "Plot Structure",
      description: "Story organization and arc",
      type: "timeline",
      icon: "📈",
    },
    {
      id: "literary-analysis",
      label: "Literary Analysis",
      description: "Techniques and interpretation",
      type: "node-map",
      icon: "🔍",
    },
    {
      id: "symbolism",
      label: "Symbolism",
      description: "Symbols and their meanings",
      type: "cards",
      icon: "🖼️",
    },
    {
      id: "comparison",
      label: "Comparison",
      description: "Compare works or authors",
      type: "comparison",
      icon: "⚖️",
    },
  ],

  Geography: [
    {
      id: "maps",
      label: "Maps",
      description: "Geographic regions and locations",
      type: "diagram",
      icon: "🗺️",
    },
    {
      id: "regions",
      label: "Regions",
      description: "Regional characteristics",
      type: "cards",
      icon: "🌍",
    },
    {
      id: "climate",
      label: "Climate",
      description: "Climate zones and patterns",
      type: "table",
      icon: "🌤️",
    },
    {
      id: "resources",
      label: "Resources",
      description: "Natural resources distribution",
      type: "list",
      icon: "⛏️",
    },
    {
      id: "case-studies",
      label: "Case Studies",
      description: "Detailed regional analyses",
      type: "cards",
      icon: "📋",
    },
    {
      id: "comparison",
      label: "Comparison",
      description: "Compare geographic features",
      type: "comparison",
      icon: "⚖️",
    },
  ],

  Chemistry: [
    {
      id: "reactions",
      label: "Reactions",
      description: "Chemical reaction types",
      type: "list",
      icon: "⚗️",
    },
    {
      id: "equations",
      label: "Equations",
      description: "Chemical equations and balancing",
      type: "table",
      icon: "⚛️",
    },
    {
      id: "structures",
      label: "Structures",
      description: "Molecular and electron structures",
      type: "diagram",
      icon: "🧬",
    },
    {
      id: "concepts",
      label: "Concepts",
      description: "Core chemistry concepts",
      type: "cards",
      icon: "💡",
    },
    {
      id: "process",
      label: "Lab Process",
      description: "Laboratory procedures",
      type: "process",
      icon: "🧪",
    },
    {
      id: "applications",
      label: "Applications",
      description: "Real-world chemistry uses",
      type: "cards",
      icon: "🏭",
    },
  ],

  Economics: [
    {
      id: "concepts",
      label: "Concepts",
      description: "Economic principles and theories",
      type: "cards",
      icon: "💰",
    },
    {
      id: "graphs-models",
      label: "Graphs & Models",
      description: "Economic data and models",
      type: "graph",
      icon: "📊",
    },
    {
      id: "systems",
      label: "Systems",
      description: "Economic systems and structures",
      type: "comparison",
      icon: "🏢",
    },
    {
      id: "timeline",
      label: "Trends",
      description: "Economic trends over time",
      type: "timeline",
      icon: "📈",
    },
    {
      id: "case-studies",
      label: "Case Studies",
      description: "Real-world economic examples",
      type: "cards",
      icon: "🌐",
    },
    {
      id: "policy",
      label: "Policy",
      description: "Government economic policies",
      type: "list",
      icon: "⚖️",
    },
  ],
};

// ============================================================================
// MOCK PRESET DATA (Subject-Specific Examples)
// ============================================================================

/**
 * MATH PRESET EXAMPLES
 */
export const mathDefinitionsPreset: CardsPreset = {
  type: "cards",
  title: "Mathematical Definitions",
  description: "Key concepts and their formal definitions",
  cards: [
    {
      id: "quadratic-def",
      title: "Quadratic Function",
      content: "A polynomial function of degree 2",
      icon: "📊",
      color: "bg-blue-100",
      example: "f(x) = ax² + bx + c, where a ≠ 0",
      tags: ["algebra", "functions"],
    },
    {
      id: "parabola-def",
      title: "Parabola",
      content: "The graph of a quadratic function",
      icon: "📈",
      color: "bg-purple-100",
      example: "U-shaped curve opening up or down",
      tags: ["geometry", "graphs"],
    },
    {
      id: "vertex-def",
      title: "Vertex",
      content: "The turning point of a parabola",
      icon: "📍",
      color: "bg-green-100",
      example: "Maximum or minimum point at (h, k)",
      tags: ["parabola", "extrema"],
    },
    {
      id: "discriminant-def",
      title: "Discriminant",
      content: "Determines the nature of roots: Δ = b² - 4ac",
      icon: "🎯",
      color: "bg-yellow-100",
      example: "Δ > 0: two real roots; Δ = 0: one root; Δ < 0: no real roots",
      tags: ["roots", "classification"],
    },
  ],
};

export const mathFormulasPreset: TablePreset = {
  type: "table",
  title: "Essential Math Formulas",
  description: "Key formulas for quadratic functions",
  columns: [
    { key: "formula-name", header: "Formula", type: "text" },
    { key: "expression", header: "Expression", type: "text" },
    { key: "purpose", header: "Purpose", type: "text" },
  ],
  rows: [
    {
      "formula-name": "Quadratic Formula",
      expression: "x = (-b ± √(b² - 4ac)) / 2a",
      purpose: "Find roots of any quadratic",
    },
    {
      "formula-name": "Vertex Formula",
      expression: "Vertex = (-b/2a, f(-b/2a))",
      purpose: "Find turning point",
    },
    {
      "formula-name": "Axis of Symmetry",
      expression: "x = -b/2a",
      purpose: "Line of symmetry",
    },
    {
      "formula-name": "Discriminant",
      expression: "Δ = b² - 4ac",
      purpose: "Determine root types",
    },
  ],
};

export const mathGraphBehaviorPreset: GraphPreset = {
  type: "graph",
  title: "Parabola Graph Analysis",
  description: "How quadratic functions behave graphically",
  xAxisLabel: "x",
  yAxisLabel: "f(x) = x² - 4x + 3",
  graphType: "line",
  data: [
    { x: -1, y: 8, label: "Point 1" },
    { x: 0, y: 3, label: "y-intercept" },
    { x: 1, y: 0, label: "Root" },
    { x: 2, y: -1, label: "Vertex region" },
    { x: 3, y: 0, label: "Root" },
    { x: 4, y: 3 },
    { x: 5, y: 8 },
  ],
};

export const mathSolvingMethodsPreset: FlowPreset = {
  type: "flow",
  title: "Quadratic Solving Methods",
  description: "Different approaches to solving quadratic equations",
  startStep: "identify",
  endStep: "verify",
  steps: [
    {
      id: "identify",
      title: "Identify the Equation",
      description: "Write equation in standard form ax² + bx + c = 0",
      icon: "1️⃣",
      outputs: ["ready-to-solve"],
      nextSteps: ["analyze"],
    },
    {
      id: "analyze",
      title: "Analyze Factorability",
      description: "Determine if trinomial can be factored easily",
      icon: "2️⃣",
      inputs: ["ready-to-solve"],
      outputs: ["factorable", "not-factorable"],
      nextSteps: ["factoring", "formula"],
    },
    {
      id: "factoring",
      title: "Try Factoring",
      description: "Find two binomials whose product equals the trinomial",
      icon: "3️⃣",
      inputs: ["factorable"],
      outputs: ["roots-found"],
      nextSteps: ["verify"],
    },
    {
      id: "formula",
      title: "Use Quadratic Formula",
      description: "Apply formula when factoring is difficult",
      icon: "4️⃣",
      inputs: ["not-factorable"],
      outputs: ["roots-calculated"],
      nextSteps: ["verify"],
    },
    {
      id: "verify",
      title: "Verify Solutions",
      description: "Substitute roots back into original equation",
      icon: "✓",
      inputs: ["roots-found", "roots-calculated"],
      outputs: ["verified"],
    },
  ],
};

export const mathApplicationsPreset: CardsPreset = {
  type: "cards",
  title: "Quadratic Applications",
  description: "Real-world uses of quadratic relationships",
  cards: [
    {
      id: "app-projectile",
      title: "Projectile Motion",
      content: "Parabolas model arcs in sports and physics.",
      icon: "🏀",
    },
    {
      id: "app-optimization",
      title: "Optimization",
      content: "Quadratics help find maximum profit or minimum cost.",
      icon: "📈",
    },
  ],
};

export const mathCommonMistakesPreset: ListPreset = {
  type: "list",
  title: "Common Quadratic Mistakes",
  description: "Errors to avoid while solving",
  items: [
    {
      id: "mistake-sign",
      title: "Sign errors with b",
      description: "Treat negative b carefully in formulas.",
      icon: "➖",
    },
    {
      id: "mistake-plusminus",
      title: "Forgetting +/-",
      description: "Quadratic formula gives two branches.",
      icon: "⚠️",
    },
  ],
};

/**
 * HISTORY PRESET EXAMPLES
 */
export const historyTimelinePreset: TimelinePreset = {
  type: "timeline",
  title: "World War I Timeline",
  description: "Key events from 1914 to 1918",
  events: [
    {
      year: 1914,
      title: "Assassination & July Crisis",
      description:
        "Archduke Franz Ferdinand assassinated; alliance system triggered",
      icon: "⚔️",
      details: [
        "June 28: Assassination in Sarajevo",
        "July: Declarations of war",
      ],
    },
    {
      year: 1915,
      title: "Trench Warfare Established",
      description: "Static front lines form across Western Europe",
      icon: "🕳️",
      details: ["Millions in trenches", "Machine guns dominate"],
    },
    {
      year: 1916,
      title: "Major Battles - Somme & Verdun",
      description: "Two of the deadliest battles in human history",
      icon: "💥",
      details: ["1 million+ casualties", "Minimal territorial gains"],
    },
    {
      year: 1917,
      title: "US Enters & Russian Revolution",
      description: "United States joins; Russia exits war",
      icon: "🇺🇸",
      details: ["April: US declaration", "November: Bolshevik Revolution"],
    },
    {
      year: 1918,
      title: "War Ends",
      description: "Armistice signed; Central Powers surrender",
      icon: "🕊️",
      details: ["November 11: Ceasefire", "14.5 million total casualties"],
    },
  ],
};

export const historyCausesPreset: NodeMapPreset = {
  type: "node-map",
  title: "Causes of World War I",
  description: "Root factors leading to the Great War",
  centerNode: "wwi-outbreak",
  nodes: [
    {
      id: "wwi-outbreak",
      label: "WWI Outbreak",
      title: "World War I",
      description: "Global conflict 1914-1918",
      icon: "⚔️",
      color: "red",
      children: ["militarism", "alliances", "imperialism", "nationalism"],
    },
    {
      id: "militarism",
      label: "Militarism",
      title: "Arms Race",
      description: "Massive military buildup and competition",
      icon: "🎖️",
      color: "orange",
      details: [
        "Naval competition (Britain vs Germany)",
        "Large standing armies",
        "Military planning",
      ],
    },
    {
      id: "alliances",
      label: "Alliances",
      title: "Alliance System",
      description: "Web of mutual defense agreements",
      icon: "🤝",
      color: "yellow",
      details: [
        "Triple Alliance (Germany, Austria, Italy)",
        "Triple Entente (France, Russia, Britain)",
      ],
    },
    {
      id: "imperialism",
      label: "Imperialism",
      title: "Colonial Rivalries",
      description: "Competition for colonies and resources",
      icon: "🌍",
      color: "green",
      details: [
        "African colonies",
        "Eastern European territories",
        "Economic competition",
      ],
    },
    {
      id: "nationalism",
      label: "Nationalism",
      title: "National Fervor",
      description: "Intense national pride and ethnic tensions",
      icon: "🚩",
      color: "blue",
      details: ["Serbian nationalism", "Pan-Slavism", "German ambitions"],
    },
  ],
};

export const historyEffectsPreset: NodeMapPreset = {
  type: "node-map",
  title: "Effects of World War I",
  description: "Political, social, and economic consequences",
  centerNode: "wwi-effects",
  nodes: [
    {
      id: "wwi-effects",
      label: "WWI Effects",
      title: "Aftermath",
      description: "Major outcomes after 1918",
      icon: "💥",
      children: ["political", "economic", "social"],
    },
    {
      id: "political",
      label: "Political",
      title: "Map Changes",
      description: "Empires collapsed and borders changed.",
      icon: "🗺️",
    },
    {
      id: "economic",
      label: "Economic",
      title: "Debt and Reparations",
      description: "War debt and reparations destabilized economies.",
      icon: "💸",
    },
    {
      id: "social",
      label: "Social",
      title: "Generational Impact",
      description: "Mass casualties and trauma changed societies.",
      icon: "🕯️",
    },
  ],
};

export const historyKeyFiguresPreset: CardsPreset = {
  type: "cards",
  title: "WWI Key Figures",
  description: "Leaders and people who influenced the war",
  cards: [
    {
      id: "franz",
      title: "Franz Ferdinand",
      content: "His assassination triggered the July Crisis in 1914.",
      icon: "👤",
    },
    {
      id: "wilson",
      title: "Woodrow Wilson",
      content: "US president who proposed the Fourteen Points.",
      icon: "🇺🇸",
    },
  ],
};

export const historyEventsBreakdownPreset: FlowPreset = {
  type: "flow",
  title: "WWI Events Breakdown",
  description: "How the conflict escalated and concluded",
  startStep: "spark",
  endStep: "armistice",
  steps: [
    { id: "spark", title: "Sarajevo Assassination", description: "Initial trigger in June 1914", icon: "1️⃣", nextSteps: ["alliances"] },
    { id: "alliances", title: "Alliance Activation", description: "Mutual defense pacts spread conflict", icon: "2️⃣", nextSteps: ["total-war"] },
    { id: "total-war", title: "Trench Warfare Era", description: "Stalemate and attrition on Western Front", icon: "3️⃣", nextSteps: ["armistice"] },
    { id: "armistice", title: "Armistice", description: "Fighting ended on November 11, 1918", icon: "4️⃣" },
  ],
};

export const historyComparisonPreset: ComparisonPreset = {
  type: "comparison",
  title: "Europe Before vs After WWI",
  description: "Compare structural differences around the war",
  propertyLabels: {
    alliances: "Alliance Climate",
    borders: "Borders",
    power: "Power Balance",
  },
  items: [
    { id: "before", label: "Before 1914", properties: { alliances: "Rigid blocs", borders: "Imperial", power: "Multi-empire" } },
    { id: "after", label: "After 1918", properties: { alliances: "Rebuilding", borders: "Redrawn", power: "Shifting" } },
  ],
};

/**
 * SCIENCE PRESET EXAMPLES
 */
export const sciencePhotosynthesisProcessPreset: FlowPreset = {
  type: "flow",
  title: "Photosynthesis Process",
  description: "Step-by-step breakdown of how plants convert light to energy",
  startStep: "light-capture",
  endStep: "glucose-storage",
  steps: [
    {
      id: "light-capture",
      title: "Light Capture",
      description: "Chlorophyll absorbs photons in thylakoid membranes",
      icon: "☀️",
      outputs: ["energy-excited"],
      nextSteps: ["water-split"],
    },
    {
      id: "water-split",
      title: "Water Splitting (Photolysis)",
      description: "H₂O splits into H⁺, O₂, and electrons",
      icon: "💧",
      inputs: ["energy-excited"],
      outputs: ["atp-generated", "nadph-generated"],
      nextSteps: ["atp-transport"],
    },
    {
      id: "atp-transport",
      title: "Electron Transport",
      description: "Electrons move through proteins; energy pumps H⁺",
      icon: "⚡",
      inputs: ["atp-generated"],
      outputs: ["chemiosmotic-gradient"],
      nextSteps: ["atp-synthesis"],
    },
    {
      id: "atp-synthesis",
      title: "ATP Synthesis",
      description: "Chemiosmotic gradient drives ATP synthase",
      icon: "🔋",
      inputs: ["chemiosmotic-gradient"],
      outputs: ["atp-ready"],
      nextSteps: ["calvin-cycle"],
    },
    {
      id: "calvin-cycle",
      title: "Calvin Cycle (Dark Reactions)",
      description: "CO₂ fixed into glucose using ATP and NADPH",
      icon: "🌿",
      inputs: ["atp-ready"],
      outputs: ["glucose-formed"],
      nextSteps: ["glucose-storage"],
    },
    {
      id: "glucose-storage",
      title: "Glucose Storage",
      description: "Glucose stored as starch or used for energy",
      icon: "🍬",
      inputs: ["glucose-formed"],
    },
  ],
};

/**
 * PHYSICS PRESET EXAMPLES
 */
export const physicsFormulasPreset: TablePreset = {
  type: "table",
  title: "Core Physics Formulas",
  description: "Essential equations for mechanics and energy",
  columns: [
    { key: "concept", header: "Concept", type: "text" },
    { key: "formula", header: "Formula", type: "text" },
    { key: "variables", header: "Variables", type: "text" },
  ],
  rows: [
    {
      concept: "Newton's 2nd Law",
      formula: "F = ma",
      variables: "F (force), m (mass), a (acceleration)",
    },
    {
      concept: "Kinetic Energy",
      formula: "KE = ½mv²",
      variables: "m (mass), v (velocity)",
    },
    {
      concept: "Potential Energy",
      formula: "PE = mgh",
      variables: "m (mass), g (gravity), h (height)",
    },
    {
      concept: "Momentum",
      formula: "p = mv",
      variables: "m (mass), v (velocity)",
    },
    {
      concept: "Work",
      formula: "W = Fd cos(θ)",
      variables: "F (force), d (distance), θ (angle)",
    },
  ],
};

/**
 * PROGRAMMING PRESET EXAMPLES
 */
export const programmingConceptsPreset: CardsPreset = {
  type: "cards",
  title: "Core Programming Concepts",
  description: "Fundamental ideas in software development",
  cards: [
    {
      id: "variables",
      title: "Variables",
      content: "Named containers that store data values in memory",
      icon: "🏷️",
      color: "bg-blue-100",
      example: "let count = 5; const name = 'Alice';",
      tags: ["data", "storage"],
    },
    {
      id: "functions",
      title: "Functions",
      content: "Reusable blocks of code that perform specific tasks",
      icon: "🔧",
      color: "bg-purple-100",
      example: "function greet(name) { return `Hello, ${name}`; }",
      tags: ["modularity", "reuse"],
    },
    {
      id: "loops",
      title: "Loops",
      content: "Repeat code blocks while a condition is true",
      icon: "🔄",
      color: "bg-green-100",
      example: "for (let i = 0; i < 10; i++) { console.log(i); }",
      tags: ["iteration", "repetition"],
    },
    {
      id: "conditionals",
      title: "Conditionals",
      content: "Execute code based on true/false conditions",
      icon: "🔀",
      color: "bg-yellow-100",
      example: "if (x > 5) { /* do something */ } else { /* do other */ }",
      tags: ["logic", "branching"],
    },
  ],
};

/**
 * BIOLOGY PRESET EXAMPLES
 */
export const biologyMitosisProcessPreset: TimelinePreset = {
  type: "timeline",
  title: "Mitosis Stages",
  description: "Cell division phases from start to finish",
  events: [
    {
      year: "Stage 1",
      title: "Prophase",
      description: "Chromosomes condense; spindle fibers form",
      icon: "🧬",
      details: ["Centrioles move to poles", "Nuclear envelope breaks down"],
    },
    {
      year: "Stage 2",
      title: "Metaphase",
      description: "Chromosomes align at cell equator",
      icon: "📍",
      details: [
        "Spindle fibers attach to centromeres",
        "Chromosomes at metaphase plate",
      ],
    },
    {
      year: "Stage 3",
      title: "Anaphase",
      description: "Sister chromatids separate and move to poles",
      icon: "➡️",
      details: ["Chromosomes pulled apart", "Each pole gets identical set"],
    },
    {
      year: "Stage 4",
      title: "Telophase",
      description: "Nuclear envelopes reform; cytokinesis begins",
      icon: "💫",
      details: ["Spindle fibers disappear", "Two identical nuclei form"],
    },
    {
      year: "Stage 5",
      title: "Cytokinesis",
      description: "Cytoplasm divides; two daughter cells form",
      icon: "✂️",
      details: ["Cleavage furrow forms", "Cell completely divides"],
    },
  ],
};

export const biologyDefinitionsPreset: CardsPreset = {
  type: "cards",
  title: "Photosynthesis Definitions",
  description: "Core vocabulary for plant energy conversion",
  cards: [
    {
      id: "chlorophyll",
      title: "Chlorophyll",
      content: "Pigment that absorbs light energy.",
      icon: "🌿",
    },
    {
      id: "calvin",
      title: "Calvin Cycle",
      content: "Stage where carbon is fixed into sugars.",
      icon: "🔁",
    },
  ],
};

export const biologyStructurePreset: DiagramPreset = {
  type: "diagram",
  title: "Chloroplast Structure",
  description: "Key structures involved in photosynthesis",
  elements: [
    {
      id: "outer-membrane",
      type: "box",
      label: "Outer Membrane",
      position: { x: 20, y: 20 },
      size: { width: 160, height: 60 },
    },
    {
      id: "thylakoid",
      type: "circle",
      label: "Thylakoid",
      position: { x: 220, y: 45 },
      size: { width: 70, height: 70 },
    },
  ],
};

export const biologyComparisonPreset: ComparisonPreset = {
  type: "comparison",
  title: "Photosynthesis vs Respiration",
  description: "How energy storage compares to energy release",
  propertyLabels: {
    purpose: "Purpose",
    location: "Location",
    products: "Products",
  },
  items: [
    {
      id: "photo",
      label: "Photosynthesis",
      properties: {
        purpose: "Store light energy",
        location: "Chloroplasts",
        products: "Glucose + Oxygen",
      },
    },
    {
      id: "resp",
      label: "Respiration",
      properties: {
        purpose: "Release chemical energy",
        location: "Mitochondria",
        products: "ATP + CO2 + Water",
      },
    },
  ],
};

/**
 * CHEMISTRY PRESET EXAMPLES
 */
export const chemistryReactionsPreset: TablePreset = {
  type: "table",
  title: "Types of Chemical Reactions",
  description: "Classification of major reaction types",
  columns: [
    { key: "type", header: "Reaction Type", type: "text" },
    { key: "pattern", header: "General Pattern", type: "text" },
    { key: "example", header: "Example", type: "text" },
  ],
  rows: [
    {
      type: "Synthesis",
      pattern: "A + B → AB",
      example: "2H₂ + O₂ → 2H₂O",
    },
    {
      type: "Decomposition",
      pattern: "AB → A + B",
      example: "2H₂O₂ → 2H₂O + O₂",
    },
    {
      type: "Single Displacement",
      pattern: "A + BC → AC + B",
      example: "Fe + CuSO₄ → FeSO₄ + Cu",
    },
    {
      type: "Double Displacement",
      pattern: "AB + CD → AD + CB",
      example: "HCl + NaOH → NaCl + H₂O",
    },
    {
      type: "Combustion",
      pattern: "Hydrocarbon + O₂ → CO₂ + H₂O",
      example: "CH₄ + 2O₂ → CO₂ + 2H₂O",
    },
  ],
};

/**
 * ECONOMICS PRESET EXAMPLES
 */
export const economicsSupplyDemandPreset: GraphPreset = {
  type: "graph",
  title: "Supply and Demand",
  description: "Market equilibrium analysis",
  xAxisLabel: "Quantity",
  yAxisLabel: "Price",
  graphType: "line",
  data: [
    { x: 10, y: 500, label: "Supply starts" },
    { x: 20, y: 400 },
    { x: 30, y: 300, label: "Equilibrium" },
    { x: 40, y: 200 },
    { x: 50, y: 100, label: "Supply end" },
  ],
};

// ============================================================================
// UTILITY FUNCTIONS FOR AI INTEGRATION
// ============================================================================

/**
 * Get available presets for a subject
 * @param subject The subject to get presets for
 * @returns Array of available preset options
 */
export function getPresetsForSubject(subject: Subject): PresetOption[] {
  return subjectPresets[subject] || [];
}

/**
 * Get a specific preset by ID
 * Ready for future AI integration:
 * Future: async function getPresetData(presetId: string, taskId: string)
 * Current: loads mock data
 */
export function getPresetData(presetId: string): LearningPreset | null {
  const presetMap: Record<string, LearningPreset> = {
    // Math presets
    definitions: mathDefinitionsPreset,
    formulas: mathFormulasPreset,
    "graph-behavior": mathGraphBehaviorPreset,
    "solving-methods": mathSolvingMethodsPreset,
    applications: mathApplicationsPreset,
    "common-mistakes": mathCommonMistakesPreset,

    // History presets
    timeline: historyTimelinePreset,
    causes: historyCausesPreset,
    effects: historyEffectsPreset,
    "key-figures": historyKeyFiguresPreset,
    "events-breakdown": historyEventsBreakdownPreset,
    comparison: historyComparisonPreset,

    // Science presets
    process: sciencePhotosynthesisProcessPreset,

    // Physics presets
    "physics-formulas": physicsFormulasPreset,

    // Programming presets
    concepts: programmingConceptsPreset,

    // Biology presets
    // NOTE: Subject-aware calls should prefer getPresetDataForSubject for colliding IDs.
    "bio-definitions": biologyDefinitionsPreset,
    "life-cycle": biologyMitosisProcessPreset,
    structure: biologyStructurePreset,

    // Chemistry presets
    reactions: chemistryReactionsPreset,

    // Economics presets
    "graphs-models": economicsSupplyDemandPreset,
  };

  return presetMap[presetId] || null;
}

export function getPresetDataForSubject(
  subject: Subject,
  presetId: string,
): LearningPreset | null {
  const presetBySubject: Partial<Record<Subject, Record<string, LearningPreset>>> = {
    Math: {
      definitions: mathDefinitionsPreset,
      formulas: mathFormulasPreset,
      "graph-behavior": mathGraphBehaviorPreset,
      "solving-methods": mathSolvingMethodsPreset,
      applications: mathApplicationsPreset,
      "common-mistakes": mathCommonMistakesPreset,
    },
    History: {
      timeline: historyTimelinePreset,
      causes: historyCausesPreset,
      effects: historyEffectsPreset,
      "key-figures": historyKeyFiguresPreset,
      "events-breakdown": historyEventsBreakdownPreset,
      comparison: historyComparisonPreset,
    },
    Biology: {
      definitions: biologyDefinitionsPreset,
      process: sciencePhotosynthesisProcessPreset,
      structure: biologyStructurePreset,
      comparison: biologyComparisonPreset,
      "life-cycle": biologyMitosisProcessPreset,
    },
  };

  return presetBySubject[subject]?.[presetId] ?? null;
}

/**
 * Create a new learning map instance from preset
 * Structure ready for AI injection
 */
export function createLearningMapInstance(
  presetId: string,
  taskData?: Record<string, unknown>,
): LearningPreset | null {
  // Future AI integration point:
  // const aiData = await generatePresetContent(presetId, taskData);
  // return { ...basePreset, ...aiData };

  return getPresetData(presetId);
}
