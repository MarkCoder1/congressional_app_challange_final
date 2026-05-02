# 🧠 AI-Ready Visual Learning System Documentation

## Overview

This is a **scalable, preset-based visual learning system** designed to be completely ready for future AI integration. The system separates **visual structure** from **content injection**, allowing AI to seamlessly generate learning maps without changing the underlying architecture.

---

## 🏗️ Architecture

### Core Concept

```
Subject → Preset Options → Preset Selection → Visual Renderer → Mock/AI Content
```

**Key Principle:** AI will only **inject content** into predefined preset structures. It will NEVER generate the structure itself.

### File Structure

```
lib/
  ├── learningMapPresets.ts    # Preset definitions, types, and mock data
  ├── types.ts                 # Type exports, including TaskLearningMap
  └── mockTasks.ts            # Mock tasks with learningMaps array

components/
  └── preset-renderer.tsx      # Reference component for rendering presets
```

---

## 📋 System Components

### 1. **Preset Type Definitions** (`learningMapPresets.ts`)

Each preset type defines a specific visual structure:

```typescript
export type PresetType =
  | "timeline" // Chronological events
  | "node-map" // Interconnected concepts
  | "graph" // Data visualization
  | "table" // Structured data
  | "flow" // Sequential steps
  | "cards" // Card-based layout
  | "diagram" // Visual diagrams
  | "process" // Multi-stage process
  | "list" // Structured list
  | "comparison"; // Comparative table
```

### 2. **Subject Preset Registry** (`subjectPresets`)

Each subject has predefined preset options:

```typescript
Math: [
  { id: "definitions", label: "Definitions", type: "cards", icon: "📝" },
  { id: "formulas", label: "Formulas", type: "table", icon: "📐" },
  { id: "graph-behavior", label: "Graph Behavior", type: "graph", icon: "📈" },
  // ... more presets
];

History: [
  { id: "timeline", label: "Timeline", type: "timeline", icon: "📅" },
  { id: "causes", label: "Causes", type: "node-map", icon: "🔍" },
  // ... more presets
];
```

### 3. **Task Integration** (`mockTasks.ts`)

Tasks now include `learningMaps` array showing which presets are available:

```typescript
{
  id: "1",
  title: "Quadratic Functions & Equations",
  subject: "Math",
  learningMaps: [
    { presetId: "definitions", subject: "Math" },
    { presetId: "math-formulas", subject: "Math" },
    { presetId: "graph-behavior", subject: "Math" },
    { presetId: "solving-methods", subject: "Math" },
  ]
}
```

### 4. **Preset Renderer Component** (`preset-renderer.tsx`)

Reference implementation showing how to:

- Load preset options
- Render selector UI
- Display selected preset
- Handle all 10 preset types

---

## 🚀 How It Works

### Current Flow (Mock Data)

```
1. User selects task
2. Component loads presetOptions for subject via getPresetsForSubject()
3. User clicks preset button
4. Component calls getPresetData(presetId)
5. Returns mock LearningPreset object
6. PresetContent component renders based on preset.type
7. Content displays with mock data
```

### Future Flow (AI Integration)

```
1. User selects task
2. Component loads presetOptions for subject
3. User clicks preset button
4. Component calls: const aiContent = await generatePresetContent(taskId, presetId)
5. Returns AI-generated LearningPreset with same structure
6. PresetContent renders AI-generated content
7. Rendering logic unchanged - completely scalable
```

---

## 📚 Subject Preset Breakdown

### Math (6 presets)

- **Definitions** (cards): Key concepts
- **Formulas** (table): Equations and formulas
- **Graph Behavior** (graph): Visual analysis
- **Solving Methods** (flow): Step-by-step approaches
- **Applications** (cards): Real-world uses
- **Common Mistakes** (list): Errors to avoid

### History (6 presets)

- **Timeline** (timeline): Chronological events
- **Causes** (node-map): Root factors
- **Effects** (node-map): Consequences
- **Key Figures** (cards): Important people
- **Events Breakdown** (flow): Detailed breakdown
- **Comparison** (comparison): Period/event comparison

### Science (6 presets)

- **Concept** (cards): Core ideas
- **Process** (flow): Sequential stages
- **Diagram** (diagram): Visual representations
- **Experiments** (process): Procedures
- **Applications** (cards): Practical uses
- **Comparison** (comparison): Related concepts

### Physics (6 presets)

- **Formulas** (table): Equations
- **Graphs** (graph): Data visualization
- **Concepts** (cards): Principles
- **Diagrams** (diagram): Force diagrams
- **Problem Solving** (flow): Methods
- **Real-World Examples** (cards): Technology

### Programming (6 presets)

- **Concepts** (cards): Principles
- **Syntax** (list): Language rules
- **Logic Flow** (flow): Control flow
- **Code Examples** (cards): Implementations
- **Debugging** (list): Strategies
- **Architecture** (diagram): System design

### Biology (6 presets)

- **Definitions** (cards): Terminology
- **Structure** (diagram): Organization
- **Process** (flow): Functions
- **Comparison** (comparison): Organisms
- **Life Cycle** (timeline): Stages
- **Ecosystems** (node-map): Relationships

### Spanish (6 presets)

- **Vocabulary** (cards): Words/phrases
- **Grammar** (table): Rules
- **Pronunciation** (list): Phonetics
- **Culture** (cards): Context
- **Conversations** (flow): Dialogues
- **Comparisons** (comparison): English/Spanish

### English (6 presets)

- **Vocabulary** (cards): Word meanings
- **Literary Devices** (list): Techniques
- **Writing Structure** (flow): Essay org
- **Grammar** (table): Mechanics
- **Text Analysis** (node-map): Themes
- **Genres** (cards): Types

### Literature (6 presets)

- **Themes** (cards): Central ideas
- **Characters** (cards): Analysis
- **Plot Structure** (timeline): Story arc
- **Literary Analysis** (node-map): Techniques
- **Symbolism** (cards): Meanings
- **Comparison** (comparison): Works/authors

### Geography (6 presets)

- **Maps** (diagram): Regions
- **Regions** (cards): Characteristics
- **Climate** (table): Zones
- **Resources** (list): Distribution
- **Case Studies** (cards): Analyses
- **Comparison** (comparison): Features

### Chemistry (6 presets)

- **Reactions** (list): Types
- **Equations** (table): Formulas
- **Structures** (diagram): Molecules
- **Concepts** (cards): Principles
- **Lab Process** (process): Procedures
- **Applications** (cards): Uses

### Economics (6 presets)

- **Concepts** (cards): Principles
- **Graphs & Models** (graph): Data viz
- **Systems** (comparison): Structures
- **Trends** (timeline): Over time
- **Case Studies** (cards): Examples
- **Policy** (list): Tools

---

## 💻 Usage Examples

### Load Presets for a Subject

```typescript
import { getPresetsForSubject } from "@/lib/learningMapPresets";

const presets = getPresetsForSubject("Math");
// Returns array of PresetOption objects with icons and descriptions
```

### Get a Specific Preset

```typescript
import { getPresetData } from "@/lib/learningMapPresets";

const preset = getPresetData("definitions");
// Returns: CardsPreset with mock card data
```

### Use in Component

```typescript
import { PresetRenderer } from "@/components/preset-renderer";

export default function TaskPage() {
  return (
    <PresetRenderer
      subject="Math"
      taskTitle="Quadratic Functions"
    />
  );
}
```

---

## 🤖 AI Integration Points

### 1. Content Generation

Replace in `preset-renderer.tsx`:

```typescript
// Current
const selectedPreset = selectedPresetId
  ? getPresetData(selectedPresetId)
  : null;

// Future
const selectedPreset = selectedPresetId
  ? await generatePresetContent(taskId, selectedPresetId)
  : null;
```

### 2. Mock Data Replacement

In `learningMapPresets.ts`, replace presets:

```typescript
// Current
export const mathDefinitionsPreset: CardsPreset = {
  type: "cards",
  cards: [
    {
      /* mock card */
    },
  ],
};

// Future - AI generates this
async function generateMathDefinitionsPreset(taskId: string) {
  const aiContent = await callAIAPI(taskId, "definitions");
  return createCardsPreset(aiContent);
}
```

### 3. Dynamic Preset Selection

Tasks can dynamically list which presets the AI should generate:

```typescript
{
  id: "1",
  learningMaps: [
    { presetId: "definitions", subject: "Math" },
    { presetId: "math-formulas", subject: "Math" },
    // AI fills all these in with generated content
  ]
}
```

---

## ✨ Key Features

### ✅ Scalable

- 12 subjects × 6+ presets per subject = **72+ preset combinations**
- Add new subject: just add to `subjectPresets` registry
- Add new preset type: create renderer + export type

### ✅ Type-Safe

- Full TypeScript support for all preset types
- Compile-time checking prevents errors
- IDE autocomplete for all preset properties

### ✅ Modular

- Each preset type has isolated renderer
- Easy to customize individual renderers
- No cross-preset dependencies

### ✅ AI-Ready

- Content completely separated from structure
- AI can generate content for any subject/preset
- Rendering logic unchanged when AI integrates

### ✅ Visual-First

- 10 different visual representations
- Each subject has optimal presets for its domain
- No generic text blocks

### ✅ No Backend Required

- All preset definitions in frontend code
- Mock data embedded for immediate use
- Future: replace mock with AI calls

---

## 🔧 Extending the System

### Add New Preset Type

1. Create type in `learningMapPresets.ts`:

```typescript
export interface CustomPreset {
  type: "custom";
  // your structure
}
```

2. Update `LearningPreset` union
3. Create renderer in `preset-renderer.tsx`
4. Use in `subjectPresets`

### Add New Subject

1. Add to `Subject` type in `types.ts`
2. Create presets array in `subjectPresets`
3. Create mock preset data functions
4. Use in tasks

### Customize Renderer

Edit `preset-renderer.tsx` components:

- Change colors/layout
- Add animations
- Add interactivity
- Integrate charting libraries

---

## 📊 Mock Data Examples

### Timeline (History)

```typescript
const historyTimelinePreset: TimelinePreset = {
  type: "timeline",
  events: [
    { year: 1914, title: "WWI Begins", ... },
    { year: 1918, title: "War Ends", ... },
  ]
};
```

### Node Map (History - Causes)

```typescript
const historyCausesPreset: NodeMapPreset = {
  type: "node-map",
  nodes: [
    { id: "militarism", label: "Militarism", ... },
    { id: "alliances", label: "Alliances", ... },
  ]
};
```

### Cards (Math)

```typescript
const mathDefinitionsPreset: CardsPreset = {
  type: "cards",
  cards: [{ title: "Quadratic Function", content: "...", example: "..." }],
};
```

All mock data is subject-specific and properly structured.

---

## 🎯 Next Steps

1. **Use PresetRenderer Component**
   - Import into task workspace pages
   - Pass subject and taskTitle props
   - Users can select presets

2. **Integrate with Task Pages**
   - Add preset selector to task view
   - Display selected preset content
   - Store user selection

3. **Add AI Integration** (Future)
   - Create AI content generation function
   - Replace `getPresetData()` calls
   - Test with real AI content

4. **Enhance Renderers** (Future)
   - Add interactive features
   - Integrate visualization libraries
   - Add animations
   - Support user annotations

---

## 📝 Summary

This system provides a **complete, AI-ready learning map framework** that is:

- **Structured**: Predefined presets for each subject
- **Visual**: 10 different rendering types
- **Scalable**: 72+ subject-preset combinations
- **Type-Safe**: Full TypeScript support
- **Modular**: Easy to customize and extend
- **AI-Ready**: Content injection without restructuring

The system is **production-ready** with mock data and can integrate AI content generation at any time without changing rendering logic.
