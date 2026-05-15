import { NextRequest, NextResponse } from "next/server";
import { getTaskById } from "@/lib/tasks";
import type { TaskProgressUpdateInput } from "@/lib/progress/taskProgressEngine";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const task = getTaskById(id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { progress, status, updates } = body;

  const { updateTaskProgress } = await import("@/lib/tasks");

  if (updates && typeof updates === "object") {
    updateTaskProgress(id, updates as TaskProgressUpdateInput);
  } else if (progress !== undefined || status !== undefined) {
    const legacyUpdates: TaskProgressUpdateInput = {};
    if (typeof progress === "number") {
      legacyUpdates.manualProgress = progress;
    }
    if (typeof status === "string") {
      legacyUpdates.status = status as TaskProgressUpdateInput["status"];
    }
    updateTaskProgress(id, legacyUpdates);
  }

  const updatedTask = getTaskById(id);
  if (!updatedTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(updatedTask);
}
