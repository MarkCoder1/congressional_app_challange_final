// /lib/tasks.ts
import "server-only";
import { db } from "./db";
import { Task, TaskType, TaskStatus, LearningContent, PracticeQuestion, MasterQuestion, AssignmentContent } from "@/types/task";
import { TaskRow } from "@/types/db";

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
  return questions.map(q => ({
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
  return questions.map(q => ({
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

function statusFromProgress(progress: number): TaskStatus {
  if (progress <= 30) return "learning";
  if (progress <= 70) return "practice";
  if (progress < 100) return "mastering";
  return "completed";
}

// ========== Public API ==========
export function createTask(task: Task) {
  const mergedResources = {
    ...task.resources,
    deadline: task.deadline,
    progress: task.progress ?? 0,
    learningContent: task.learningContent,
  };
  const stmt = db.prepare(`
    INSERT INTO tasks 
      (id, title, subject, description, type, resources, learningMaps, practice, master, assignments, progress, status, visualData, assignmentContent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    task.status ?? "learning",
    JSON.stringify(task.visualData ?? {}),
    JSON.stringify(task.assignmentContent ?? {})
  );
}

export function getTaskById(id: string): Task | null {
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as TaskRow | undefined;
  if (!row) return null;

  const resources = safeJsonParse<Record<string, any>>(row.resources, {});
  const learningMaps = safeJsonParse(row.learningMaps, []);
  const practice = normalizePracticeQuestions(safeJsonParse(row.practice, []));
  const master = normalizeMasterQuestions(safeJsonParse(row.master, []));
  const assignments = safeJsonParse(row.assignments, []);
  const { deadline, learningContent } = extractExtendedFields(resources);
  const visualData = safeJsonParse(row.visualData, undefined);
  const assignmentContent = safeJsonParse(row.assignmentContent, undefined);

  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    description: row.description,
    type: row.type as TaskType,
    progress: row.progress ?? 0,
    status: (row.status as TaskStatus) ?? "learning",
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

export function updateTaskProgress(id: string, newProgress: number): void {
  const progress = Math.min(100, Math.max(0, newProgress));
  const newStatus = statusFromProgress(progress);
  db.prepare("UPDATE tasks SET progress = ?, status = ? WHERE id = ?").run(progress, newStatus, id);
}

export function updateTaskStatus(id: string, status: TaskStatus): void {
  db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, id);
}