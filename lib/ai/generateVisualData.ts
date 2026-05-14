import Groq from "groq-sdk";
import { VisualData, VisualType, GraphData } from "@/types/visuals";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

interface GenerateVisualOptions {
  topic: string;
  subject: string;
  description: string;
  visualType?: VisualType;
}

export async function generateVisualData(
  options: GenerateVisualOptions,
): Promise<VisualData> {
  const { topic, subject, description, visualType } = options;

  console.log("[generateVisualData] start", {
    topic,
    subject,
    descriptionLength: description.length,
    visualType: visualType || "auto-detect",
    hasGroqKey: !!process.env.GROQ_API_KEY,
  });

  if (!process.env.GROQ_API_KEY) {
    console.warn("No GROQ API key – using rich fallback visual");
    console.log(
      "[generateVisualData] returning fallback because API key is missing",
      {
        topic,
        subject,
      },
    );
    return getRichFallbackVisual(topic, subject);
  }

  const detectionInstruction = visualType
    ? `Use visual type: ${visualType}`
    : `First, analyze the content and determine the best visual type from these options:
- process (step‑by‑step flows)
- timeline (chronological events)
- graph (mathematical functions / data)
- concept_map (relationships between ideas)
- cycle (repeating processes)
- comparison (side‑by‑side)
- hierarchy (tree structures)
- treemap (hierarchical proportions, budget allocation, market share)
- radar (skill comparisons, multi-attribute assessment)
- gantt (project schedules, task timelines with dependencies)
- heatmap (density, correlation matrix, intensity)
- chord (relationships, trade flows, networks)

Return the visual type as "detectedType", then fill the full schema for that type.`;

  const prompt = `
You are an expert educational data visualization designer. Convert the following content into a **rich, interactive-ready** visual data structure.

Topic: "${topic}"
Subject: "${subject}"
Description: "${description}"

${detectionInstruction}

**CRITICAL RULES:**
- Every visual MUST have at least 3 items (steps, events, nodes, etc.)
- For graphs: generate **at least 10 points** covering the relevant range (e.g., for a quadratic from x=-2 to x=5, step 0.5).
- All relationships MUST be explicitly defined (edges in concept map, arrows in process, etc.).
- Each item MUST have a description that is at least 10 words long.
- Return ONLY valid JSON. Do NOT wrap the JSON in markdown or extra text.

**SCHEMAS (use exactly these structures):**

1. process:
{
  "type": "process",
  "title": "string",
  "steps": [{ "id": "string", "title": "string", "description": "string (10+ words)", "explanation": "string (optional)" }],
  "inputs": ["string"] (optional),
  "outputs": ["string"] (optional)
}

2. timeline:
{
  "type": "timeline",
  "title": "string",
  "events": [{ "date": "string", "title": "string", "description": "string (10+ words)", "details": ["string", "string"] }]
}

3. graph:
{
  "type": "graph",
  "title": "string",
  "xLabel": "string",
  "yLabel": "string",
  "equation": "string (e.g., f(x) = x² - 4x + 3)",
  "points": [{ "x": number, "y": number, "label": "string (optional)" }],
  "graphType": "line"
}

4. concept_map:
{
  "type": "concept_map",
  "title": "string",
  "nodes": [{ "id": "string", "label": "string", "description": "string (10+ words)", "icon": "string (optional)" }],
  "edges": [{ "from": "string", "to": "string", "label": "string (optional)" }],
  "centerNode": "string (optional)"
}

5. cycle:
{
  "type": "cycle",
  "title": "string",
  "stages": [{ "id": "string", "name": "string", "description": "string (10+ words)" }],
  "direction": "clockwise"
}

6. comparison:
{
  "type": "comparison",
  "title": "string",
  "categories": ["string", "string", "string"],
  "items": [{ "name": "string", "values": { "category1": "value", "category2": "value", ... } }]
}

7. hierarchy:
{
  "type": "hierarchy",
  "title": "string",
  "root": {
    "id": "string",
    "label": "string",
    "description": "string (10+ words)",
    "children": [...]
  }
}

8. treemap:
{
  "type": "treemap",
  "title": "string",
  "data": [
    { "name": "Category A", "value": 100, "children": [...] }
  ]
}

9. radar:
{
  "type": "radar",
  "title": "string",
  "categories": ["Math", "Physics", "Biology"],
  "series": [
    { "name": "Student A", "values": [85, 70, 90] }
  ]
}

10. gantt:
{
  "type": "gantt",
  "title": "string",
  "tasks": [
    { "id": "1", "name": "Task 1", "start": "2025-01-01", "end": "2025-01-10", "progress": 50 }
  ]
}

11. heatmap:
{
  "type": "heatmap",
  "title": "string",
  "xLabels": ["Mon", "Tue", "Wed"],
  "yLabels": ["Week1", "Week2"],
  "data": [[10,20,30],[40,50,60]]
}

12. chord:
{
  "type": "chord",
  "title": "string",
  "matrix": [[0,5,2],[5,0,3],[2,3,0]],
  "labels": ["A", "B", "C"]
}

Now, generate the visual data. Return ONLY the JSON object.`;

  try {
    console.log("Generating visual data with AI:", {
      topic,
      subject,
      visualType: visualType || "auto-detect",
    });
    console.log("[generateVisualData] prompt prepared", {
      promptLength: prompt.length,
      detectionMode: visualType ? "forced" : "auto-detect",
    });

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    console.log("AI completion received");

    const content = completion.choices[0]?.message?.content;
    console.log("AI raw response content:", content);
    console.log("[generateVisualData] response metadata", {
      hasContent: !!content,
      contentLength: content?.length ?? 0,
      choiceCount: completion.choices.length,
    });
    if (!content) throw new Error("Empty response");

    let parsed = JSON.parse(content);
    console.log("AI parsed response:", parsed);
    console.log("[generateVisualData] parsed response keys", {
      keys: Object.keys(parsed || {}),
    });
    let visualData: VisualData | null = null;

    // Flexible extraction (same as before)
    if (parsed.visualData && parsed.visualData.type) {
      console.log(
        "[generateVisualData] extracted visualData from visualData wrapper",
        {
          type: parsed.visualData.type,
        },
      );
      visualData = parsed.visualData;
    } else if (parsed.type && parsed.type !== "detectedType") {
      console.log(
        "[generateVisualData] extracted visualData from top-level type",
        {
          type: parsed.type,
        },
      );
      visualData = parsed as VisualData;
    } else if (parsed.detectedType && parsed.visualData) {
      console.log(
        "[generateVisualData] extracted visualData from detectedType wrapper",
        {
          detectedType: parsed.detectedType,
        },
      );
      visualData = parsed.visualData;
    } else if (
      parsed.process ||
      parsed.timeline ||
      parsed.graph ||
      parsed.concept_map ||
      parsed.cycle ||
      parsed.comparison ||
      parsed.hierarchy ||
      parsed.treemap ||
      parsed.radar ||
      parsed.gantt ||
      parsed.heatmap ||
      parsed.chord
    ) {
      console.log(
        "[generateVisualData] extracting visualData from keyed schema response",
      );
      if (parsed.process)
        visualData = { type: "process", ...parsed.process } as VisualData;
      else if (parsed.timeline)
        visualData = { type: "timeline", ...parsed.timeline } as VisualData;
      else if (parsed.graph)
        visualData = { type: "graph", ...parsed.graph } as VisualData;
      else if (parsed.concept_map)
        visualData = {
          type: "concept_map",
          ...parsed.concept_map,
        } as VisualData;
      else if (parsed.cycle)
        visualData = { type: "cycle", ...parsed.cycle } as VisualData;
      else if (parsed.comparison)
        visualData = { type: "comparison", ...parsed.comparison } as VisualData;
      else if (parsed.hierarchy)
        visualData = { type: "hierarchy", ...parsed.hierarchy } as VisualData;
      else if (parsed.treemap)
        visualData = { type: "treemap", ...parsed.treemap } as VisualData;
      else if (parsed.radar)
        visualData = { type: "radar", ...parsed.radar } as VisualData;
      else if (parsed.gantt)
        visualData = { type: "gantt", ...parsed.gantt } as VisualData;
      else if (parsed.heatmap)
        visualData = { type: "heatmap", ...parsed.heatmap } as VisualData;
      else if (parsed.chord)
        visualData = { type: "chord", ...parsed.chord } as VisualData;
    }

    if (!visualData || !visualData.type) {
      console.warn("Could not parse visualData from AI, using fallback");
      console.warn("[generateVisualData] visualData extraction failed", {
        keys: Object.keys(parsed || {}),
      });
      return getRichFallbackVisual(topic, subject);
    }

    console.log("[generateVisualData] validating and enriching visual data", {
      type: visualData.type,
    });
    visualData = validateAndEnrichVisualData(visualData, topic, subject);
    console.log("Final visual data:", visualData);
    console.log("[generateVisualData] final visual data ready", {
      type: visualData.type,
      title: visualData.title,
    });
    return visualData;
  } catch (error) {
    console.error("Visual generation failed:", error);
    console.error("[generateVisualData] falling back after error", {
      topic,
      subject,
      visualType: visualType || "auto-detect",
    });
    return getRichFallbackVisual(topic, subject);
  }
}

// (keep the rest of the helper functions unchanged)
function validateAndEnrichVisualData(
  data: VisualData,
  topic: string,
  subject: string,
): VisualData {
  if (data.type === "graph") {
    const graph = data as GraphData;
    let points = graph.points || [];
    console.log("[generateVisualData] graph enrichment check", {
      title: graph.title,
      pointCount: points.length,
      hasEquation: !!graph.equation,
    });
    if (points.length < 5 && graph.equation) {
      const generated = generatePointsFromEquation(graph.equation);
      console.log("[generateVisualData] generated points from equation", {
        generatedCount: generated.length,
        existingCount: points.length,
      });
      if (generated.length > points.length) {
        graph.points = generated;
      }
    }
    if (!graph.xLabel) graph.xLabel = "x";
    if (!graph.yLabel) graph.yLabel = "y";
    if (!graph.title) graph.title = `${topic} Graph`;
  }
  return data;
}

function generatePointsFromEquation(eq: string): { x: number; y: number }[] {
  try {
    console.log("[generateVisualData] generating points from equation", {
      equation: eq,
    });
    let sanitized = eq
      .replace(/\s/g, "")
      .replace(/x²/g, "x^2")
      .replace(/²/g, "^2");
    const fn = new Function("x", "return " + sanitized.replace(/\^/g, "**"));
    const points = [];
    for (let x = -2; x <= 5; x += 0.5) {
      const y = fn(x);
      if (isFinite(y)) points.push({ x, y });
    }
    console.log("[generateVisualData] equation-to-points result", {
      pointCount: points.length,
    });
    return points;
  } catch (e) {
    console.warn(
      "[generateVisualData] equation parsing failed, using fallback points",
      {
        equation: eq,
        error: e,
      },
    );
    return [
      { x: -2, y: 4 },
      { x: -1, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 4 },
      { x: 3, y: 9 },
      { x: 4, y: 16 },
      { x: 5, y: 25 },
    ];
  }
}

function getRichFallbackVisual(topic: string, subject: string): VisualData {
  // (keep your existing fallback logic unchanged)
  console.log("[generateVisualData] building rich fallback visual", {
    topic,
    subject,
  });
  // If topic explicitly refers to photosynthesis, prefer a photosynthesis concept map
  if (topic.toLowerCase().includes("photosynth")) {
    console.log(
      "[generateVisualData] fallback branch selected: concept_map photosynthesis",
    );
    return {
      type: "concept_map",
      title: `Photosynthesis: ${topic}`,
      nodes: [
        {
          id: "sunlight",
          label: "Sunlight",
          description:
            "Provides the energy needed for photosynthesis in plants; absorbed by chlorophyll.",
          icon: "☀️",
        },
        {
          id: "chlorophyll",
          label: "Chlorophyll",
          description:
            "Pigment in chloroplasts that captures light energy and initiates the photosynthetic process.",
          icon: "🌿",
        },
        {
          id: "water",
          label: "Water (H2O)",
          description:
            "Absorbed by roots and split during the light reactions to release oxygen and electrons.",
          icon: "💧",
        },
        {
          id: "carbon",
          label: "Carbon Dioxide (CO2)",
          description:
            "Taken in from the atmosphere and fixed into organic molecules during the Calvin cycle.",
          icon: "🫧",
        },
        {
          id: "glucose",
          label: "Glucose (C6H12O6)",
          description:
            "Primary sugar product of photosynthesis used by plants for growth and metabolism.",
          icon: "🍬",
        },
        {
          id: "oxygen",
          label: "Oxygen (O2)",
          description:
            "Byproduct of the light reactions released into the atmosphere, essential for aerobic life.",
          icon: "🌬️",
        },
      ],
      edges: [
        { from: "sunlight", to: "chlorophyll", label: "absorbed by" },
        { from: "water", to: "chlorophyll", label: "split in light reactions" },
        { from: "carbon", to: "glucose", label: "fixed into" },
        { from: "chlorophyll", to: "glucose", label: "drives production of" },
        { from: "water", to: "oxygen", label: "produces" },
      ],
      centerNode: "chlorophyll",
    };
  }

  if (
    subject.toLowerCase().includes("bio") ||
    subject.toLowerCase().includes("respiratory")
  ) {
    console.log(
      "[generateVisualData] fallback branch selected: concept_map respiratory",
    );
    return {
      type: "concept_map",
      title: `${topic} System`,
      nodes: [
        {
          id: "nose",
          label: "Nose/Mouth",
          description: "Entry point for air; filters and warms incoming air.",
          icon: "👃",
        },
        {
          id: "pharynx",
          label: "Pharynx",
          description: "Passageway for air and food; connects nose to larynx.",
          icon: "🫁",
        },
        {
          id: "larynx",
          label: "Larynx",
          description: "Voice box; contains vocal cords; protects trachea.",
          icon: "🎤",
        },
        {
          id: "trachea",
          label: "Trachea",
          description: "Windpipe; carries air to bronchi; lined with cilia.",
          icon: "🌬️",
        },
        {
          id: "bronchi",
          label: "Bronchi",
          description:
            "Two branches into lungs; further divide into bronchioles.",
          icon: "🌿",
        },
        {
          id: "lungs",
          label: "Lungs",
          description: "Main organs of gas exchange; contain alveoli.",
          icon: "🫁",
        },
        {
          id: "alveoli",
          label: "Alveoli",
          description: "Tiny air sacs where oxygen and CO2 exchange occurs.",
          icon: "🫧",
        },
      ],
      edges: [
        { from: "nose", to: "pharynx", label: "air flows to" },
        { from: "pharynx", to: "larynx", label: "air passes through" },
        { from: "larynx", to: "trachea", label: "leads to" },
        { from: "trachea", to: "bronchi", label: "splits into" },
        { from: "bronchi", to: "lungs", label: "enters" },
        { from: "lungs", to: "alveoli", label: "contains" },
      ],
      centerNode: "lungs",
    };
  }
  if (
    subject.toLowerCase().includes("math") ||
    topic.toLowerCase().includes("quadratic")
  ) {
    console.log("[generateVisualData] fallback branch selected: graph math");
    return {
      type: "graph",
      title: `${topic} Visualization`,
      xLabel: "x",
      yLabel: "f(x)",
      equation: "f(x) = x² - 4x + 3",
      points: [
        { x: -2, y: 15 },
        { x: -1, y: 8 },
        { x: 0, y: 3 },
        { x: 1, y: 0 },
        { x: 2, y: -1 },
        { x: 3, y: 0 },
        { x: 4, y: 3 },
        { x: 5, y: 8 },
      ],
      graphType: "line",
    };
  }
  console.log(
    "the ai response: " +
      JSON.stringify({
        type: "process",
        title: `${topic} Overview`,
        steps: [
          {
            id: "1",
            title: "Understanding Basics",
            description: `Learn the fundamental principles of ${topic}.`,
            explanation: "Start with core definitions and simple examples.",
          },
          {
            id: "2",
            title: "Applying Concepts",
            description: `Explore how ${topic} is used in real scenarios.`,
            explanation: "Practice with guided examples and identify patterns.",
          },
          {
            id: "3",
            title: "Mastering Advanced Topics",
            description: `Dive deeper into complex aspects of ${topic}.`,
            explanation: "Solve challenging problems and analyze edge cases.",
          },
        ],
        inputs: ["Curiosity", "Time"],
        outputs: ["Knowledge", "Skills"],
      }),
  );

  return {
    type: "process",
    title: `${topic} Overview`,
    steps: [
      {
        id: "1",
        title: "Understanding Basics",
        description: `Learn the fundamental principles of ${topic}.`,
        explanation: "Start with core definitions and simple examples.",
      },
      {
        id: "2",
        title: "Applying Concepts",
        description: `Explore how ${topic} is used in real scenarios.`,
        explanation: "Practice with guided examples and identify patterns.",
      },
      {
        id: "3",
        title: "Mastering Advanced Topics",
        description: `Dive deeper into complex aspects of ${topic}.`,
        explanation: "Solve challenging problems and analyze edge cases.",
      },
    ],
    inputs: ["Curiosity", "Time"],
    outputs: ["Knowledge", "Skills"],
  };
}
