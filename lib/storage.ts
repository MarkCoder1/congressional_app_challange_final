import seedTasks from "@/data/tasks.json";

const TASKS_STORAGE_KEY = "learning_tasks_v1";

type StoredTaskStatus = "not_started" | "in_progress" | "completed";

type StoredTaskProgressMeta = {
  learnCompleted?: boolean;
  practiceCompleted?: boolean;
  masterCompleted?: boolean;
  assignmentWorkflowProgress?: number;
  assignmentSectionsCompleted?: string[];
  manuallyAdjusted?: boolean;
};

export type StoredTask = {
  id: string;
  title: string;
  subject: string;
  description: string;
  resources?: {
    text?: string;
    urls?: string[];
    files?: string[];
  };
  learningMaps: any[];
  practice: any[];
  master: any[];
  assignments: any[];
  progress?: number;
  status?: StoredTaskStatus;
  completedAt?: string;
  startedAt?: string;
  lastActivityAt?: string;
  progressMeta?: StoredTaskProgressMeta;
  [key: string]: unknown;
};

let memoryTasks: StoredTask[] = [...(seedTasks as StoredTask[])];

function normalizeStoredTask(task: StoredTask): StoredTask {
  const progress =
    typeof task.progress === "number"
      ? Math.min(100, Math.max(0, Math.round(task.progress)))
      : 0;
  const status: StoredTaskStatus =
    task.status === "completed"
      ? "completed"
      : task.status === "in_progress"
        ? "in_progress"
        : progress > 0
          ? "in_progress"
          : "not_started";

  return {
    ...task,
    progress,
    status,
    lastActivityAt: task.lastActivityAt || new Date().toISOString(),
    progressMeta: task.progressMeta || { assignmentSectionsCompleted: [] },
  };
}

function isBrowser() {
  return typeof window !== "undefined";
}

function readStoredTasks(): StoredTask[] {
  if (!isBrowser()) {
    return memoryTasks.map(normalizeStoredTask);
  }

  const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
  if (!raw) {
    const normalizedSeeds = (seedTasks as StoredTask[]).map(
      normalizeStoredTask,
    );
    window.localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify(normalizedSeeds),
    );
    return [...normalizedSeeds];
  }

  try {
    const parsed = JSON.parse(raw) as StoredTask[];
    return Array.isArray(parsed) ? parsed.map(normalizeStoredTask) : [];
  } catch {
    return [];
  }
}

function writeStoredTasks(tasks: StoredTask[]): void {
  memoryTasks = tasks.map(normalizeStoredTask);
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(memoryTasks));
}

export function getTasks(): StoredTask[] {
  return readStoredTasks();
}

export function getTaskById(id: string): StoredTask | undefined {
  return getTasks().find((task) => task.id === id);
}

export function saveTask(task: StoredTask): StoredTask {
  const tasks = getTasks();
  const next = [...tasks, task];
  writeStoredTasks(next);
  return task;
}

export function updateTask(
  id: string,
  updates: Partial<StoredTask>,
): StoredTask | undefined {
  const tasks = getTasks();
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return undefined;

  const updated = { ...tasks[index], ...updates };
  const next = [...tasks];
  next[index] = updated;
  writeStoredTasks(next);
  return updated;
}

export function deleteTask(id: string): boolean {
  const tasks = getTasks();
  const next = tasks.filter((task) => task.id !== id);
  if (next.length === tasks.length) return false;
  writeStoredTasks(next);
  return true;
}
