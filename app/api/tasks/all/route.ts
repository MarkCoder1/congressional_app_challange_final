import { NextResponse } from "next/server";
import { getAllTasks } from "@/lib/tasks";

export async function GET() {
  try {
    const tasks = getAllTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("[API Tasks All] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}