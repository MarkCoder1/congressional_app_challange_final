// /app/api/tasks/clear/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE() {
  db.prepare("DELETE FROM tasks").run();
  return NextResponse.json({ success: true });
}