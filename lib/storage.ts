import seedTasks from "@/data/tasks.json";

const TASKS_STORAGE_KEY = "learning_tasks_v1";

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
  [key: string]: unknown;
};

let memoryTasks: StoredTask[] = [...(seedTasks as StoredTask[])];

function isBrowser() {
  return typeof window !== "undefined";
}

function readStoredTasks(): StoredTask[] {
  if (!isBrowser()) {
    return memoryTasks;
  }

  const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(seedTasks));
    return [...(seedTasks as StoredTask[])];
  }

  try {
    const parsed = JSON.parse(raw) as StoredTask[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredTasks(tasks: StoredTask[]): void {
  memoryTasks = tasks;
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
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
