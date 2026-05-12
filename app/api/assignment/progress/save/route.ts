import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { taskId, progressData } = await req.json();
    if (!taskId || !progressData) {
      return NextResponse.json({ error: "Missing taskId or progressData" }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO assignment_progress (id, task_id, progress_data, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(task_id) DO UPDATE SET
        progress_data = excluded.progress_data,
        updated_at = excluded.updated_at
    `);
    stmt.run(crypto.randomUUID(), taskId, JSON.stringify(progressData), Date.now());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}