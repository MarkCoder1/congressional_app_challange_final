import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");
    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    const row = db.prepare("SELECT progress_data FROM assignment_progress WHERE task_id = ?").get(taskId) as { progress_data: string } | undefined;
    if (!row) {
      return NextResponse.json({ progressData: null });
    }

    return NextResponse.json({ progressData: JSON.parse(row.progress_data) });
  } catch (error) {
    console.error("Failed to load progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}