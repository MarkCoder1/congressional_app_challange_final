// Navigation and routing utilities for the learning platform

import { Task } from "./types";

/**
 * Determines if a task is an assignment type
 */
export function isAssignment(task: Task | { taskType: string }): boolean {
  return task.taskType.toLowerCase() === "assignment";
}

/**
 * Get the correct route for a task based on its type
 */
export function getTaskRoute(
  task: Task | { id: string; taskType: string },
): string {
  if (isAssignment(task)) {
    return `/assignments/${task.id}`;
  }
  return `/task/${task.id}`;
}

/**
 * Get a user-friendly label for task type
 */
export function getTaskTypeLabel(taskType: string): string {
  const type = taskType.toLowerCase();
  switch (type) {
    case "concept":
      return "Concept";
    case "lesson":
      return "Lesson";
    case "assignment":
      return "Assignment";
    case "mixed":
      return "Mixed";
    default:
      return taskType;
  }
}

/**
 * Normalize task type to lowercase
 */
export function normalizeTaskType(taskType: string): string {
  return taskType.toLowerCase();
}

/**
 * Check if task type uses Task Workspace (non-assignment)
 */
export function usesTaskWorkspace(task: Task | { taskType: string }): boolean {
  return !isAssignment(task);
}

/**
 * Check if task type uses Assignment Workspace
 */
export function usesAssignmentWorkspace(
  task: Task | { taskType: string },
): boolean {
  return isAssignment(task);
}

/**
 * Get visual styling for task type
 */
export function getTaskTypeStyle(taskType: string): {
  badge: string;
  icon: string;
  color: string;
} {
  const type = normalizeTaskType(taskType);
  switch (type) {
    case "concept":
      return {
        badge: "bg-primary-tint text-primary",
        icon: "📚",
        color: "blue",
      };
    case "lesson":
      return {
        badge: "bg-success-tint text-success",
        icon: "📖",
        color: "green",
      };
    case "assignment":
      return {
        badge: "bg-ai-violet-tint text-ai-violet",
        icon: "✍️",
        color: "purple",
      };
    case "mixed":
      return {
        badge: "bg-warning-tint text-warning",
        icon: "🎯",
        color: "orange",
      };
    default:
      return {
        badge: "bg-secondary text-secondary",
        icon: "📝",
        color: "gray",
      };
  }
}
