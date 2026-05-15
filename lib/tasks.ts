// /lib/tasks.ts
import "server-only";
import { db } from "./db";
import {
  LearningContent,
  MasterQuestion,
  PracticeQuestion,
  Task,
  TaskStatus,
  TaskType,
} from "@/types/task";
import { TaskRow } from "@/types/db";
import {
  TaskProgressUpdateInput,
  completeTask as completeTaskProgress,
  resetTaskProgress as resetProgress,
  updateTaskProgress as computeTaskProgress,
} from "@/lib/progress/taskProgressEngine";

// ========== Helper Functions ==========
function safeJsonParse<T>(jsonStr: string | null | undefined, fallback: T): T {
  if (!jsonStr) return fallback;
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return fallback;
  }
}

function normalizePracticeQuestions(questions: any[]): PracticeQuestion[] {
  if (!Array.isArray(questions)) return [];
  return questions.map((q) => ({
    id: q.id || crypto.randomUUID?.() || Math.random().toString(),
    text: q.text || "",
    options: q.options || [],
    correctAnswer: q.correctAnswer || "",
    hint: q.hint,
    explanation: q.explanation ?? "No explanation provided.",
    category: q.category || "general",
  }));
}

function normalizeMasterQuestions(questions: any[]): MasterQuestion[] {
  if (!Array.isArray(questions)) return [];
  return questions.map((q) => ({
    id: q.id || crypto.randomUUID?.() || Math.random().toString(),
    text: q.text || "",
    options: q.options || [],
    correctAnswer: q.correctAnswer || "",
    explanation: q.explanation ?? "No explanation provided.",
    hint: q.hint ?? "No hint available",
    category: q.category || "general",
  }));
}

function extractExtendedFields(resources: Record<string, any>): {
  deadline?: string;
  progress?: number;
  learningContent: LearningContent;
} {
  return {
    deadline: resources.deadline || "TBD",
    progress: typeof resources.progress === "number" ? resources.progress : 0,
    learningContent: resources.learningContent || {
      overview: "No overview available.",
      keyPoints: [],
      example: "No example provided.",
      steps: [],
    },
  };
}

function normalizeTaskStatus(
  status: string | null | undefined,
  progress = 0,
): TaskStatus {
  if (status === "completed") return "completed";
  if (status === "in_progress") return "in_progress";
  if (status === "not_started") return "not_started";

  if (
    status === "learning" ||
    status === "practice" ||
    status === "mastering"
  ) {
    return progress > 0 ? "in_progress" : "not_started";
  }

  return progress > 0 ? "in_progress" : "not_started";
}

// ========== Public API ==========
export function createTask(task: Task) {
  const now = new Date().toISOString();
  const mergedResources = {
    ...task.resources,
    deadline: task.deadline,
    progress: task.progress ?? 0,
    learningContent: task.learningContent,
  };

  const normalizedStatus = normalizeTaskStatus(task.status, task.progress);

  const stmt = db.prepare(`
    INSERT INTO tasks
      (
        id, title, subject, description, type, resources, learningMaps, practice, master,
        assignments, progress, status, started_at, completed_at, last_activity_at,
        progress_meta, visualData, assignmentContent, deadline
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    task.id,
    task.title,
    task.subject,
    task.description,
    task.type,
    JSON.stringify(mergedResources),
    JSON.stringify(task.learningMaps || []),
    JSON.stringify(task.practice || []),
    JSON.stringify(task.master || []),
    JSON.stringify(task.assignments || []),
    task.progress ?? 0,
    normalizedStatus,
    task.startedAt ?? (task.progress > 0 ? now : null),
    task.completedAt ?? (task.progress >= 100 ? now : null),
    task.lastActivityAt ?? now,
    JSON.stringify(task.progressMeta ?? {}),
    JSON.stringify(task.visualData ?? {}),
    JSON.stringify(task.assignmentContent ?? {}),
    task.deadline || null          // ← Now correctly placed
  );
}

export function getTaskById(id: string): Task | null {
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    | TaskRow
    | undefined;
  if (!row) return null;

  const resources = safeJsonParse<Record<string, any>>(row.resources, {});
  const learningMaps = safeJsonParse(row.learningMaps, []);
  const practice = normalizePracticeQuestions(safeJsonParse(row.practice, []));
  const master = normalizeMasterQuestions(safeJsonParse(row.master, []));
  const assignments = safeJsonParse(row.assignments, []);
  const { deadline, learningContent } = extractExtendedFields(resources);
  const visualData = safeJsonParse(row.visualData, undefined);
  const assignmentContent = safeJsonParse(row.assignmentContent, undefined);
  const progress = row.progress ?? 0;
  const status = normalizeTaskStatus(row.status, progress);
  const progressMeta = safeJsonParse(row.progress_meta, {});

  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    description: row.description,
    type: row.type as TaskType,
    progress,
    status,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    lastActivityAt: row.last_activity_at ?? undefined,
    progressMeta,
    deadline,
    learningContent,
    resources,
    learningMaps,
    practice,
    master,
    assignments,
    visualData,
    assignmentContent,
  };
}

function persistTaskProgress(id: string, task: Task): void {
  const nextResources = {
    ...task.resources,
    deadline: task.deadline,
    progress: task.progress,
    learningContent: task.learningContent,
  };

  db.prepare(
    `
      UPDATE tasks
      SET
        progress = ?,
        status = ?,
        started_at = ?,
        completed_at = ?,
        last_activity_at = ?,
        progress_meta = ?,
        resources = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
  ).run(
    task.progress,
    task.status,
    task.startedAt ?? null,
    task.completedAt ?? null,
    task.lastActivityAt ?? null,
    JSON.stringify(task.progressMeta ?? {}),
    JSON.stringify(nextResources),
    id,
  );
}

export function updateTaskProgress(
  id: string,
  updatesOrProgress: TaskProgressUpdateInput | number,
): Task | null {
  const currentTask = getTaskById(id);
  if (!currentTask) return null;

  const updates: TaskProgressUpdateInput =
    typeof updatesOrProgress === "number"
      ? { manualProgress: updatesOrProgress }
      : updatesOrProgress;

  const nextProgress = computeTaskProgress(currentTask, updates);
  const updatedTask: Task = {
    ...currentTask,
    ...nextProgress,
  };

  persistTaskProgress(id, updatedTask);
  return getTaskById(id);
}

export function updateTaskStatus(id: string, status: TaskStatus): Task | null {
  return updateTaskProgress(id, { status });
}

export function completeTask(id: string): Task | null {
  const currentTask = getTaskById(id);
  if (!currentTask) return null;

  const updatedTask: Task = {
    ...currentTask,
    ...completeTaskProgress(currentTask),
  };

  persistTaskProgress(id, updatedTask);
  return getTaskById(id);
}

export function resetTask(id: string): Task | null {
  const currentTask = getTaskById(id);
  if (!currentTask) return null;

  const updatedTask: Task = {
    ...currentTask,
    ...resetProgress(currentTask),
  };

  persistTaskProgress(id, updatedTask);
  return getTaskById(id);
}

// ========== Get All Tasks ==========
export function getAllTasks(): Task[] {
  const rows = db
    .prepare("SELECT * FROM tasks ORDER BY updated_at DESC")
    .all() as TaskRow[];

  return rows.map((row) => {
    const resources = safeJsonParse<Record<string, any>>(row.resources, {});
    const learningMaps = safeJsonParse(row.learningMaps, []);
    const practice = normalizePracticeQuestions(safeJsonParse(row.practice, []));
    const master = normalizeMasterQuestions(safeJsonParse(row.master, []));
    const assignments = safeJsonParse(row.assignments, []);
    const { deadline, learningContent } = extractExtendedFields(resources);
    const visualData = safeJsonParse(row.visualData, undefined);
    const assignmentContent = safeJsonParse(row.assignmentContent, undefined);
    const progress = row.progress ?? 0;
    const status = normalizeTaskStatus(row.status, progress);
    const progressMeta = safeJsonParse(row.progress_meta, {});

    return {
      id: row.id,
      title: row.title,
      subject: row.subject,
      description: row.description,
      type: row.type as TaskType,
      progress,
      status,
      startedAt: row.started_at ?? undefined,
      completedAt: row.completed_at ?? undefined,
      lastActivityAt: row.last_activity_at ?? undefined,
      progressMeta,
      deadline,
      learningContent,
      resources,
      learningMaps,
      practice,
      master,
      assignments,
      visualData,
      assignmentContent,
    };
  });
}