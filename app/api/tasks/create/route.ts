// /app/api/tasks/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createTask } from "@/lib/tasks";
import { Task, TaskType } from "@/types/task";
import { generateTaskContent } from "@/lib/ai/generateTaskContent";
import { randomUUID } from "crypto";
import { VisualData, TreemapNode } from "@/types/visuals";

function sanitizeQuestions(questions: any[] = []) {
  return questions.map((q) => {
    const options = q.options || [
      { id: "opt1", text: "Option 1" },
      { id: "opt2", text: "Option 2" },
      { id: "opt3", text: "Option 3" },
      { id: "opt4", text: "Option 4" },
    ];
    return {
      id: q.id || randomUUID(),
      text: q.text || "",
      options: options,
      hint: q.hint,
      correctAnswer: q.correctAnswer || options[0]?.id || "",
      explanation: q.explanation ?? "No explanation provided.",
      category: q.category || "general",
    };
  });
}

// ========== TREEMAP CONVERSION ==========
function convertToTreemapData(obj: Record<string, any>): TreemapNode[] {
  const result: TreemapNode[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) continue;
    if (typeof val === "number") {
      result.push({ name: key, value: val });
      continue;
    }
    if (typeof val === "object") {
      if (val.percentage !== undefined && typeof val.percentage === "number") {
        const node: TreemapNode = { name: key, value: val.percentage };
        if (val.subCategories && typeof val.subCategories === "object") {
          node.children = convertToTreemapData(val.subCategories);
        }
        result.push(node);
      } else {
        const children = convertToTreemapData(val);
        if (children.length > 0) {
          const total = children.reduce((sum, c) => sum + c.value, 0);
          result.push({ name: key, value: total, children });
        } else {
          result.push({ name: key, value: 0 });
        }
      }
    }
  }
  return result;
}

// ========== RADAR DETECTION ==========
function isRadarData(data: any): boolean {
  if (!data || typeof data !== "object") return false;
  if (data.subjects && data.scores) return true;
  if (data.categories && data.series) return true;
  const values = Object.values(data);
  return values.length > 0 && values.every((v) => typeof v === "number");
}

function convertToRadar(data: any): VisualData {
  let categories: string[] = [];
  let values: number[] = [];
  if (data.subjects && data.scores) {
    categories = data.subjects;
    values = data.scores;
  } else if (data.categories && data.series && data.series[0]?.values) {
    categories = data.categories;
    values = data.series[0].values;
  } else {
    categories = Object.keys(data);
    values = Object.values(data) as number[];
  }
  return {
    type: "radar",
    title: "Radar Chart",
    categories,
    series: [{ name: "Scores", values }],
  };
}

// ========== GANTT DETECTION ==========
function isGanttData(data: any): boolean {
  return !!(data.tasks && Array.isArray(data.tasks) && data.tasks[0]?.start);
}

function convertToGantt(data: any): VisualData {
  let tasks = data.tasks || [];
  if (!Array.isArray(tasks)) tasks = [];
  const normalized = tasks.map((t: any, idx: number) => ({
    id: t.id || `task-${idx}`,
    name: t.name || t.title || `Task ${idx + 1}`,
    start: t.start || "Day 1",
    end: t.end || "Day 1",
    progress: typeof t.progress === "number" ? t.progress : (t.progress === "100%" ? 100 : 0),
    dependencies: t.dependsOn ? (Array.isArray(t.dependsOn) ? t.dependsOn : [t.dependsOn]) : [],
  }));
  return { type: "gantt", title: "Gantt Chart", tasks: normalized };
}

// ========== HEATMAP DETECTION ==========
function isHeatmapData(data: any): boolean {
  if (!data || typeof data !== "object") return false;
  if (data.regions && data.species && data.density) return true;
  if (data.regions && data.species && data.densityMatrix) return true;
  if (data.xLabels && data.yLabels && data.data) return true;
  return false;
}

function convertToHeatmap(data: any): VisualData {
  let xLabels: string[] = [], yLabels: string[] = [], matrix: number[][] = [];
  if (data.regions && data.species) {
    xLabels = data.regions;
    yLabels = data.species;
    if (data.densityMatrix && typeof data.densityMatrix === "object") {
      matrix = xLabels.map((region) => data.densityMatrix[region] || []);
    } else if (data.density && Array.isArray(data.density)) {
      matrix = data.density;
    } else {
      matrix = xLabels.map(() => yLabels.map(() => 0));
    }
  } else if (data.xLabels && data.yLabels && data.data) {
    xLabels = data.xLabels;
    yLabels = data.yLabels;
    matrix = data.data;
  }
  return { type: "heatmap", title: "Heatmap", xLabels, yLabels, data: matrix };
}

// ========== CHORD DIAGRAM DETECTION ==========
function isChordData(data: any): boolean {
  if (!data || typeof data !== "object") return false;
  if (data.countries && data.tradeFlows) return true;
  if (data.matrix && data.labels) return true;
  return false;
}

function convertToChord(data: any): VisualData {
  let labels: string[] = [];
  let matrix: number[][] = [];
  if (data.countries && data.tradeFlows) {
    labels = data.countries;
    const n = labels.length;
    matrix = Array(n)
      .fill(null)
      .map(() => Array(n).fill(0));
    const index = Object.fromEntries(labels.map((name, i) => [name, i]));
    for (const flow of data.tradeFlows) {
      const fromIdx = index[flow.from];
      const toIdx = index[flow.to];
      if (fromIdx !== undefined && toIdx !== undefined && typeof flow.value === "number") {
        matrix[fromIdx][toIdx] = flow.value;
      }
    }
  } else if (data.matrix && data.labels) {
    labels = data.labels;
    matrix = data.matrix;
  } else {
    labels = Object.keys(data);
    const n = labels.length;
    matrix = Array(n)
      .fill(null)
      .map(() => Array(n).fill(0));
    const index = Object.fromEntries(labels.map((name, i) => [name, i]));
    for (const [from, toObj] of Object.entries(data)) {
      const i = index[from];
      if (i === undefined) continue;
      for (const [to, val] of Object.entries(toObj as Record<string, number>)) {
        const j = index[to];
        if (j !== undefined && typeof val === "number") {
          matrix[i][j] = val;
        }
      }
    }
  }
  return { type: "chord", title: "Chord Diagram", matrix, labels };
}

// ========== MAIN TRANSFORMATION ==========
function transformToVisualData(visual: any): VisualData | undefined {
  if (!visual) return undefined;
  const data = visual.data || {};
  const presetId = visual.presetId || "";
  const type = (visual.type || "").toLowerCase();

  if (isHeatmapData(data)) return convertToHeatmap(data);
  if (type === "gantt" || presetId.toLowerCase().includes("gantt") || isGanttData(data)) return convertToGantt(data);
  if (type === "radar" || presetId.toLowerCase().includes("radar") || isRadarData(data)) return convertToRadar(data);
  if (type === "treemap" || presetId.toLowerCase().includes("treemap")) {
    const treemapData = convertToTreemapData(data);
    if (treemapData.length > 0) return { type: "treemap", title: presetId || "Treemap", data: treemapData };
  }
  if (type.includes("chord") || presetId.toLowerCase().includes("chord") || isChordData(data)) return convertToChord(data);

  switch (visual.type) {
    case "process":
      return { type: "process", title: presetId || "Process", steps: data.steps || [], inputs: data.inputs, outputs: data.outputs };
    case "timeline":
      return { type: "timeline", title: presetId || "Timeline", events: data.events || [] };
    case "graph":
      return { type: "graph", title: presetId || "Graph", xLabel: data.xLabel || "x", yLabel: data.yLabel || "y", points: data.points || [], graphType: data.graphType || "line" };
    case "concept_map":
      return { type: "concept_map", title: presetId || "Concept Map", nodes: data.nodes || [], edges: data.edges || [] };
    case "cycle":
      return { type: "cycle", title: presetId || "Cycle", stages: data.stages || [] };
    case "comparison":
      return { type: "comparison", title: presetId || "Comparison", categories: data.categories || [], items: data.items || [] };
    case "hierarchy":
      return { type: "hierarchy", title: presetId || "Hierarchy", root: data.root || {} };
    default:
      return undefined;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.subject || !body.description) {
      return NextResponse.json(
        { error: "Missing required fields: title, subject, description" },
        { status: 400 }
      );
    }

    const generated = await generateTaskContent({
      title: body.title,
      subject: body.subject,
      description: body.description,
      type: body.type === "assignment" ? "assignment" : "lesson",
    });

    let visualData: VisualData | undefined = undefined;
    if (generated.learningMaps && generated.learningMaps.length > 0) {
      const raw = generated.learningMaps[0];
      visualData = transformToVisualData(raw);
      console.log("Transformed visualData:", JSON.stringify(visualData, null, 2));
    }

    if (!visualData) {
      visualData = {
        type: "process",
        title: body.title,
        steps: [
          { id: "1", title: "Review", description: "Review the learning content." },
          { id: "2", title: "Practice", description: "Test your understanding with practice questions." },
          { id: "3", title: "Master", description: "Challenge yourself with master questions." },
        ],
        inputs: ["Curiosity"],
        outputs: ["Knowledge"],
      };
    }

    const task: Task = {
      id: randomUUID(),
      title: body.title,
      subject: body.subject,
      description: body.description,
      type: (body.type === "assignment" ? "assignment" : "lesson") as TaskType,
      deadline: body.deadline || "TBD",
      progress: 0,
      status: "learning",
      learningContent: generated.learningContent!,
      learningMaps: generated.learningMaps!,
      practice: sanitizeQuestions(generated.practice),
      master: sanitizeQuestions(generated.master),
      assignmentContent: generated.assignmentContent,
      resources: body.resources || {},
      assignments: body.assignments || [],
      visualData: visualData,
    };

    createTask(task);
    return NextResponse.json({ id: task.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}