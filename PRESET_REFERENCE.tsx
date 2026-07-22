/**
 * QUICK REFERENCE: AI-Ready Learning Preset System
 * 
 * Everything you need to know to work with the preset system.
 */

// ============================================================================
// IMPORT PRESETS
// ============================================================================

import {
  // Utility functions
  getPresetsForSubject,      // Get all presets for a subject
  getPresetData,             // Get specific preset by ID
  createLearningMapInstance, // Create new instance
  
  // Types
  PresetType,
  PresetOption,
  LearningPreset,
  
  // Specific preset types
  TimelinePreset,
  NodeMapPreset,
  GraphPreset,
  TablePreset,
  FlowPreset,
  CardsPreset,
  DiagramPreset,
  ProcessPreset,
  ListPreset,
  ComparisonPreset,
} from "@/lib/learningMapPresets";

import { Subject, TaskLearningMap } from "@/lib/types";

// ============================================================================
// CORE OPERATIONS
// ============================================================================

// Get all available presets for a subject
const mathPresets: PresetOption[] = getPresetsForSubject("Math");
const historyPresets: PresetOption[] = getPresetsForSubject("History");

// Get specific preset data
const defPreset = getPresetData("definitions");           // Returns CardsPreset
const timelinePreset = getPresetData("timeline");         // Returns TimelinePreset
const causesPreset = getPresetData("causes");             // Returns NodeMapPreset

// Create a new instance (future: AI will fill this)
const instance = createLearningMapInstance("definitions");

// ============================================================================
// PRESET TYPES OVERVIEW
// ============================================================================

/**
 * TIMELINE - Chronological events
 * Best for: History, Biology (life cycles), Economics (trends)
 */
const timeline: TimelinePreset = {
  type: "timeline",
  title: "Events Over Time",
  description: "...",
  events: [
    { year: 2020, title: "Event 1", description: "...", icon: "📅" },
    { year: 2021, title: "Event 2", description: "...", details: [] },
  ],
};

/**
 * NODE-MAP - Interconnected concepts
 * Best for: History (causes/effects), Biology (ecosystems), English (themes)
 */
const nodeMap: NodeMapPreset = {
  type: "node-map",
  title: "Related Concepts",
  description: "...",
  centerNode: "main",
  nodes: [
    { id: "main", label: "Central", title: "...", description: "...", 
      icon: "🎯", children: ["node1", "node2"] },
    { id: "node1", label: "Concept 1", title: "...", description: "..." },
  ],
};

/**
 * GRAPH - Data visualization
 * Best for: Physics, Economics, Math (functions)
 */
const graph: GraphPreset = {
  type: "graph",
  title: "Data Analysis",
  description: "...",
  xAxisLabel: "X",
  yAxisLabel: "Y",
  graphType: "line",
  data: [
    { x: 1, y: 10, label: "Point 1", annotation: "Notable" },
    { x: 2, y: 20, label: "Point 2" },
  ],
};

/**
 * TABLE - Structured data comparison
 * Best for: Chemistry, Physics, Language grammar
 */
const table: TablePreset = {
  type: "table",
  title: "Structured Data",
  description: "...",
  columns: [
    { key: "col1", header: "Column 1", type: "text" },
    { key: "col2", header: "Column 2", type: "number" },
  ],
  rows: [
    { col1: "Row 1", col2: 100 },
    { col1: "Row 2", col2: 200 },
  ],
};

/**
 * FLOW - Step-by-step process
 * Best for: Science (photosynthesis), Programming, Math (solving)
 */
const flow: FlowPreset = {
  type: "flow",
  title: "Process Steps",
  description: "...",
  startStep: "step1",
  endStep: "step3",
  steps: [
    {
      id: "step1",
      title: "Start",
      description: "Initial step",
      icon: "1️⃣",
      outputs: ["step2"],
      nextSteps: ["step2"],
    },
    {
      id: "step2",
      title: "Middle",
      description: "Processing",
      icon: "2️⃣",
      inputs: ["step1"],
      outputs: ["step3"],
      nextSteps: ["step3"],
    },
    {
      id: "step3",
      title: "End",
      description: "Final step",
      icon: "3️⃣",
      inputs: ["step2"],
    },
  ],
};

/**
 * CARDS - Individual concept cards
 * Best for: Math, History, Literature, Programming
 */
const cards: CardsPreset = {
  type: "cards",
  title: "Concepts",
  description: "...",
  layout: "grid",
  cards: [
    {
      id: "card1",
      title: "Concept 1",
      content: "Description here",
      icon: "📝",
      color: "bg-blue-100",
      example: "Example usage",
      tags: ["tag1", "tag2"],
    },
    {
      id: "card2",
      title: "Concept 2",
      content: "Description here",
      icon: "🔧",
    },
  ],
};

/**
 * DIAGRAM - Visual representation
 * Best for: Biology (structure), Chemistry (molecules), Geography (maps)
 */
const diagram: DiagramPreset = {
  type: "diagram",
  title: "Visual Structure",
  description: "...",
  background: "white",
  gridEnabled: true,
  elements: [
    {
      id: "box1",
      type: "box",
      label: "Element 1",
      position: { x: 100, y: 100 },
      size: { width: 80, height: 60 },
      color: "blue",
      connections: ["arrow1"],
    },
    {
      id: "arrow1",
      type: "arrow",
      position: { x: 180, y: 100 },
      connections: ["box2"],
    },
    {
      id: "box2",
      type: "box",
      label: "Element 2",
      position: { x: 260, y: 100 },
    },
  ],
};

/**
 * PROCESS - Multi-stage process with details
 * Best for: Science (experiments), Chemistry (lab procedures)
 */
const process: ProcessPreset = {
  type: "process",
  title: "Multi-Stage Process",
  description: "...",
  totalDuration: "2 hours",
  stages: [
    {
      id: "stage1",
      name: "Stage 1: Setup",
      description: "Preparation phase",
      duration: "30 min",
      icon: "⚙️",
      outputs: ["stage1-output"],
    },
    {
      id: "stage2",
      name: "Stage 2: Execution",
      description: "Main process",
      duration: "1 hour",
      inputs: ["stage1-output"],
      outputs: ["stage2-output"],
    },
  ],
};

/**
 * LIST - Structured list format
 * Best for: Programming (syntax), Chemistry (reactions), Geography (resources)
 */
const list: ListPreset = {
  type: "list",
  title: "Structured Items",
  description: "...",
  listStyle: "nested",
  items: [
    {
      id: "item1",
      title: "First Item",
      description: "Description",
      icon: "✓",
      level: 0,
      details: ["Detail 1", "Detail 2"],
    },
    {
      id: "item2",
      title: "Sub-item",
      description: "Nested item",
      level: 1,
    },
  ],
};

/**
 * COMPARISON - Side-by-side comparison
 * Best for: History (periods), Biology (organisms), Economics (systems)
 */
const comparison: ComparisonPreset = {
  type: "comparison",
  title: "Comparative Analysis",
  description: "...",
  propertyLabels: {
    prop1: "Property 1",
    prop2: "Property 2",
  },
  items: [
    {
      id: "item1",
      label: "Item A",
      icon: "🔵",
      color: "blue",
      properties: {
        prop1: "Value A1",
        prop2: "Value A2",
      },
    },
    {
      id: "item2",
      label: "Item B",
      icon: "🔴",
      color: "red",
      properties: {
        prop1: "Value B1",
        prop2: "Value B2",
      },
    },
  ],
};

// ============================================================================
// SUBJECT PRESET MAPPINGS
// ============================================================================

const subjectMapping = {
  Math: [
    "definitions",         // Cards: Terms
    "math-formulas",       // Table: Equations
    "graph-behavior",      // Graph: Visualizations
    "solving-methods",     // Flow: Steps
    "applications",        // Cards: Uses
    "common-mistakes",     // List: Errors
  ],
  History: [
    "timeline",            // Timeline: Events
    "causes",              // Node-Map: Origins
    "effects",             // Node-Map: Consequences
    "key-figures",         // Cards: People
    "events-breakdown",    // Flow: Breakdown
    "comparison",          // Comparison: Periods
  ],
  Science: [
    "concept",             // Cards: Ideas
    "process",             // Flow: Steps
    "diagram",             // Diagram: Visuals
    "experiments",         // Process: Procedures
    "applications",        // Cards: Uses
    "comparison",          // Comparison: Concepts
  ],
  Physics: [
    "physics-formulas",    // Table: Equations
    "graphs",              // Graph: Data
    "concepts",            // Cards: Principles
    "diagrams",            // Diagram: Forces
    "problem-solving",     // Flow: Methods
    "real-world",          // Cards: Examples
  ],
  Programming: [
    "concepts",            // Cards: Ideas
    "syntax",              // List: Rules
    "flow",                // Flow: Logic
    "code-examples",       // Cards: Code
    "debugging",           // List: Strategies
    "diagram",             // Diagram: Architecture
  ],
  Biology: [
    "definitions",         // Cards: Terms
    "structure",           // Diagram: Organization
    "process",             // Flow: Functions
    "comparison",          // Comparison: Organisms
    "life-cycle",          // Timeline: Stages
    "ecosystems",          // Node-Map: Relationships
  ],
  Spanish: [
    "vocabulary",          // Cards: Words
    "grammar-rules",       // Table: Grammar
    "pronunciation",       // List: Sounds
    "culture",             // Cards: Context
    "dialogues",           // Flow: Conversations
    "comparison",          // Comparison: Languages
  ],
  English: [
    "vocabulary",          // Cards: Words
    "literary-devices",    // List: Techniques
    "writing-structure",   // Flow: Organization
    "grammar",             // Table: Rules
    "text-analysis",       // Node-Map: Themes
    "genres",              // Cards: Types
  ],
  Literature: [
    "themes",              // Cards: Ideas
    "characters",          // Cards: Analysis
    "plot-structure",      // Timeline: Arc
    "literary-analysis",   // Node-Map: Techniques
    "symbolism",           // Cards: Meanings
    "comparison",          // Comparison: Works
  ],
  Geography: [
    "maps",                // Diagram: Regions
    "regions",             // Cards: Characteristics
    "climate",             // Table: Zones
    "resources",           // List: Distribution
    "case-studies",        // Cards: Analyses
    "comparison",          // Comparison: Features
  ],
  Chemistry: [
    "reactions",           // List: Types
    "equations",           // Table: Formulas
    "structures",          // Diagram: Molecules
    "concepts",            // Cards: Principles
    "process",             // Process: Lab
    "applications",        // Cards: Uses
  ],
  Economics: [
    "concepts",            // Cards: Principles
    "graphs-models",       // Graph: Visualization
    "systems",             // Comparison: Types
    "timeline",            // Timeline: Trends
    "case-studies",        // Cards: Examples
    "policy",              // List: Tools
  ],
};

// ============================================================================
// USING IN COMPONENTS
// ============================================================================

// Get presets for task
function TaskPresetSelector({ subject }: { subject: Subject }) {
  const presets = getPresetsForSubject(subject);
  
  return (
    <div>
      <h3>Select Learning Perspective</h3>
      {presets.map((preset) => (
        <button key={preset.id}>
          {preset.icon} {preset.label}
          <p>{preset.description}</p>
        </button>
      ))}
    </div>
  );
}

// Render preset
// NOTE: This is example code. Actual renderers are in components/visuals/
// function PresetDisplay({ presetId }: { presetId: string }) {
//   const preset = getPresetData(presetId);
//   
//   if (!preset) return <div>Preset not found</div>;
//   
//   // Type narrowing based on preset.type
//   if (preset.type === "timeline") {
//     return <TimelineView preset={preset} />;
//   }
//   if (preset.type === "cards") {
//     return <CardsView preset={preset} />;
//   }
//   // ... handle other types
// }

// ============================================================================
// TASK STRUCTURE WITH LEARNING MAPS
// ============================================================================

const taskExample = {
  id: "1",
  title: "Quadratic Functions",
  subject: "Math" as Subject,
  learningMaps: [
    { presetId: "definitions", subject: "Math" as Subject },
    { presetId: "math-formulas", subject: "Math" as Subject },
    { presetId: "graph-behavior", subject: "Math" as Subject },
    { presetId: "solving-methods", subject: "Math" as Subject },
  ] as TaskLearningMap[],
};

// ============================================================================
// AI INTEGRATION PATTERN (FUTURE)
// ============================================================================

/**
 * Current: Uses mock data
 */
function getCurrentFlow() {
  const preset = getPresetData("definitions");
  // Returns: mathDefinitionsPreset with mock cards
}

/**
 * Future: Replace with AI
 */
// async function getFutureFlow(taskId: string, presetId: string) {
//   // Instead of getPresetData, call AI:
//   // const aiPreset = await generatePresetContent(taskId, presetId);
//   // Returns: Preset with AI-generated content
//   // Same structure, different data source
// }

// ============================================================================
// EXTENDING SYSTEM
// ============================================================================

// Add new preset:
// 1. Create type: export interface YourPreset { type: "your-type"; ... }
// 2. Update LearningPreset union
// 3. Add to PresetType union
// 4. Create export function: export function getYourPresetData()
// 5. Create renderer: function YourRenderer({ preset })
// 6. Add to subjectPresets registry

// Add new subject:
// 1. Add to Subject type in types.ts
// 2. Add entry to subjectPresets
// 3. Create mock data functions
// 4. Use in tasks with learningMaps array

export {};
