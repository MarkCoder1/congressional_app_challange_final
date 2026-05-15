import type { Task } from "@/types/task";
import type { TaskProgressUpdateInput } from "@/lib/progress/taskProgressEngine";

export async function updateTaskProgress(
  taskId: string,
  updates: TaskProgressUpdateInput,
): Promise<Task> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Failed to update task progress");
  }

  return response.json();
}
