// /app/api/tasks/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createTask } from "@/lib/tasks";
import { Task, TaskType } from "@/types/task";
import { generateTaskContent } from "@/lib/ai/generateTaskContent";
import { generateVisualData } from "@/lib/ai/generateVisualData";
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
    progress:
      typeof t.progress === "number"
        ? t.progress
        : t.progress === "100%"
          ? 100
          : 0,
    dependencies: t.dependsOn
      ? Array.isArray(t.dependsOn)
        ? t.dependsOn
        : [t.dependsOn]
      : [],
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
  let xLabels: string[] = [],
    yLabels: string[] = [],
    matrix: number[][] = [];
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
      if (
        fromIdx !== undefined &&
        toIdx !== undefined &&
        typeof flow.value === "number"
      ) {
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

  console.log("[create-task route] transformToVisualData input", {
    presetId,
    type,
    dataKeys: Object.keys(data),
  });

  if (isHeatmapData(data)) {
    console.log("[create-task route] detected heatmap visual data");
    return convertToHeatmap(data);
  }
  if (
    type === "gantt" ||
    presetId.toLowerCase().includes("gantt") ||
    isGanttData(data)
  ) {
    console.log("[create-task route] detected gantt visual data");
    return convertToGantt(data);
  }
  if (
    type === "radar" ||
    presetId.toLowerCase().includes("radar") ||
    isRadarData(data)
  ) {
    console.log("[create-task route] detected radar visual data");
    return convertToRadar(data);
  }
  if (type === "treemap" || presetId.toLowerCase().includes("treemap")) {
    const treemapData = convertToTreemapData(data);
    console.log("[create-task route] treemap conversion result", {
      presetId,
      nodeCount: treemapData.length,
    });
    if (treemapData.length > 0)
      return {
        type: "treemap",
        title: presetId || "Treemap",
        data: treemapData,
      };
  }
  if (
    type.includes("chord") ||
    presetId.toLowerCase().includes("chord") ||
    isChordData(data)
  ) {
    console.log("[create-task route] detected chord visual data");
    return convertToChord(data);
  }

  switch (visual.type) {
    case "process":
      console.log("[create-task route] normalizing process visual");
      return {
        type: "process",
        title: presetId || "Process",
        steps: data.steps || [],
        inputs: data.inputs,
        outputs: data.outputs,
      };
    case "timeline":
      console.log("[create-task route] normalizing timeline visual");
      return {
        type: "timeline",
        title: presetId || "Timeline",
        events: data.events || [],
      };
    case "graph":
      console.log("[create-task route] normalizing graph visual");
      return {
        type: "graph",
        title: presetId || "Graph",
        xLabel: data.xLabel || "x",
        yLabel: data.yLabel || "y",
        points: data.points || [],
        graphType: data.graphType || "line",
      };
    case "concept_map":
      console.log("[create-task route] normalizing concept map visual");
      return {
        type: "concept_map",
        title: presetId || "Concept Map",
        nodes: data.nodes || [],
        edges: data.edges || [],
      };
    case "cycle":
      console.log("[create-task route] normalizing cycle visual");
      return {
        type: "cycle",
        title: presetId || "Cycle",
        stages: data.stages || [],
      };
    case "comparison":
      console.log("[create-task route] normalizing comparison visual");
      return {
        type: "comparison",
        title: presetId || "Comparison",
        categories: data.categories || [],
        items: data.items || [],
      };
    case "hierarchy":
      console.log("[create-task route] normalizing hierarchy visual");
      return {
        type: "hierarchy",
        title: presetId || "Hierarchy",
        root: data.root || {},
      };
    default:
      console.warn("[create-task route] unable to normalize visual", {
        visualType: visual.type,
        presetId,
        dataKeys: Object.keys(data),
      });
      return undefined;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("[create-task route] incoming request body", {
      title: body?.title,
      subject: body?.subject,
      type: body?.type,
      descriptionLength:
        typeof body?.description === "string" ? body.description.length : 0,
      hasResources: !!body?.resources,
      hasAssignments: Array.isArray(body?.assignments),
    });

    if (!body.title || !body.subject || !body.description) {
      console.warn("[create-task route] missing required fields", {
        hasTitle: !!body.title,
        hasSubject: !!body.subject,
        hasDescription: !!body.description,
      });
      return NextResponse.json(
        { error: "Missing required fields: title, subject, description" },
        { status: 400 },
      );
    }

    console.log("[create-task route] generating task content", {
      title: body.title,
      subject: body.subject,
      taskType: body.type === "assignment" ? "assignment" : "lesson",
    });

    const generated = await generateTaskContent({
      title: body.title,
      subject: body.subject,
      description: body.description,
      type: body.type === "assignment" ? "assignment" : "lesson",
    });

    console.log("[create-task route] task content generated", {
      hasLearningContent: !!generated.learningContent,
      learningMapsCount: generated.learningMaps?.length ?? 0,
      practiceCount: generated.practice?.length ?? 0,
      masterCount: generated.master?.length ?? 0,
      hasAssignmentContent: !!generated.assignmentContent,
    });

    let visualData: VisualData | undefined = undefined;
    try {
      console.log(
        "[create-task route] generating visualData via generateVisualData",
        {
          title: body.title,
          subject: body.subject,
        },
      );
      visualData = await generateVisualData({
        topic: body.title,
        subject: body.subject,
        description: body.description,
      });
      console.log("[create-task route] generateVisualData result", {
        visualType: visualData?.type,
      });
    } catch (err) {
      console.error("[create-task route] generateVisualData failed", err);
      visualData = undefined;
    }

    if (!visualData) {
      console.warn(
        "[create-task route] no visual data generated, using fallback process visual",
      );
      visualData = {
        type: "process",
        title: body.title,
        steps: [
          {
            id: "1",
            title: "Review",
            description: "Review the learning content.",
          },
          {
            id: "2",
            title: "Practice",
            description: "Test your understanding with practice questions.",
          },
          {
            id: "3",
            title: "Master",
            description: "Challenge yourself with master questions.",
          },
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
      deadline: body.deadline || null,
      difficulty: body.difficulty || "medium",
      estimatedMinutes: body.estimatedMinutes ?? undefined,
      progress: 0,
      status: "not_started",
      startedAt: undefined,
      completedAt: undefined,
      lastActivityAt: new Date().toISOString(),
      progressMeta: {
        assignmentSectionsCompleted: [],
      },
      learningContent: generated.learningContent!,
      learningMaps: generated.learningMaps!,
      practice: sanitizeQuestions(generated.practice),
      master: sanitizeQuestions(generated.master),
      assignmentContent: generated.assignmentContent,
      resources: body.resources || {},
      assignments: body.assignments || [],
      visualData: visualData,
    };

    console.log("[create-task route] persisting task", {
      taskId: task.id,
      title: task.title,
      type: task.type,
      hasVisualData: !!task.visualData,
      visualType: task.visualData?.type,
    });

    createTask(task);
    console.log("[create-task route] task persisted successfully", {
      taskId: task.id,
    });
    return NextResponse.json({ id: task.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
