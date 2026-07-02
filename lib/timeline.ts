// /lib/timeline.ts
import { StoredTask } from "@/lib/storage";
import { TimelineTask, FilterType, DayGroup } from "@/types/timeline";

export function normalizeTask(task: StoredTask): TimelineTask {
  // Priority: deadline → createdAt → today
  let date = task.deadline || task.createdAt || new Date().toISOString();
  
  // Ensure we have a valid date
  try {
    new Date(date);
  } catch {
    date = new Date().toISOString();
  }

  return {
    id: task.id,
    title: task.title || "Untitled",
    subject: task.subject || "General",
    date: date,
    progress: typeof task.progress === "number" ? task.progress : 0,
    type: task.type || "lesson",
    status: task.status || "learning",
    description: task.description || "",
  };
}

export function getTasksForTimeline(): TimelineTask[] {
  const { getTasks } = require("@/lib/storage");
  const rawTasks = getTasks();
  return rawTasks.map(normalizeTask);
}

export function filterTasks(tasks: TimelineTask[], filter: FilterType): TimelineTask[] {
  switch (filter) {
    case "lessons":
      return tasks.filter(t => t.type === "lesson");
    case "assignments":
      return tasks.filter(t => t.type === "assignment");
    case "completed":
      return tasks.filter(t => t.progress >= 80);
    case "all":
    default:
      return tasks;
  }
}

export function getWeekDates(referenceDate: Date = new Date()): Date[] {
  const dates: Date[] = [];
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - start.getDay()); // Start from Sunday
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function groupTasksByDate(tasks: TimelineTask[]): DayGroup[] {
  const groups: Record<string, TimelineTask[]> = {};
  
  // Sort tasks by date (overdue first, then upcoming)
  const sorted = [...tasks].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  sorted.forEach(task => {
    const dateKey = new Date(task.date).toISOString().split('T')[0]; // YYYY-MM-DD
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(task);
  });

  // Convert to array and sort by date
  return Object.entries(groups)
    .map(([date, tasks]) => ({ date, tasks }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getTodayGroup(tasks: TimelineTask[]): DayGroup[] {
  const today = new Date().toISOString().split('T')[0];
  return groupTasksByDate(tasks).filter(g => g.date === today);
}

export function getWeekGroup(tasks: TimelineTask[]): DayGroup[] {
  const weekDates = getWeekDates();
  const weekDateStrings = weekDates.map(d => d.toISOString().split('T')[0]);
  return groupTasksByDate(tasks).filter(g => weekDateStrings.includes(g.date));
}

export function getLaterGroup(tasks: TimelineTask[]): DayGroup[] {
  const weekDates = getWeekDates();
  const weekDateStrings = weekDates.map(d => d.toISOString().split('T')[0]);
  return groupTasksByDate(tasks).filter(g => !weekDateStrings.includes(g.date));
}

export function getUnscheduledTasks(tasks: TimelineTask[]): TimelineTask[] {
  // Tasks without a valid date or with date in the future
  const today = new Date();
  return tasks.filter(task => {
    const taskDate = new Date(task.date);
    return isNaN(taskDate.getTime()) || taskDate > today;
  });
}

export function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    'Math': 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300',
    'Science': 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300',
    'History': 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300',
    'English': 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300',
    'Biology': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300',
    'Physics': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-300',
    'Chemistry': 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300',
    'Computer Science': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300',
    'Programming': 'bg-violet-100 text-violet-800 dark:bg-violet-950/30 dark:text-violet-300',
    'General': 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300',
  };
  return colors[subject] || colors['General'];
}

export function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
}