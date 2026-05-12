import { NextRequest, NextResponse } from "next/server";
import { getTaskById } from "@/lib/tasks";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = getTaskById(id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { progress, status } = body;
  
  // Optional: update progress / status
  if (progress !== undefined) {
    const { updateTaskProgress } = await import("@/lib/tasks");
    updateTaskProgress(id, progress);
  }
  if (status !== undefined) {
    const { updateTaskStatus } = await import("@/lib/tasks");
    updateTaskStatus(id, status);
  }
  
  const updatedTask = getTaskById(id);
  return NextResponse.json(updatedTask);
}