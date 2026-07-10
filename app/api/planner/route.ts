// /app/api/planner/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PlannerInput, PlannerTaskInput } from "@/types/planner";
import { generatePlan } from "@/lib/ai/planner/planner";

// Helper to convert stored task to planner input
function toPlannerTaskInput(task: any): PlannerTaskInput {
  const now = new Date();
  return {
    id: task.id,
    title: task.title || "Untitled",
    subject: task.subject || "General",
    type: task.type || "lesson",
    description: task.description || "",
    deadline: task.deadline || undefined,
    priority: task.priority || "medium",
    progress: typeof task.progress === "number" ? task.progress : 0,
    estimatedDuration: task.estimatedDuration || 45,
    learningContent: task.learningContent || undefined,
    assignmentContent: task.assignmentContent || undefined,
    practiceCount: Array.isArray(task.practice) ? task.practice.length : 0,
    masterCount: Array.isArray(task.master) ? task.master.length : 0,
    completed: task.status === "completed" || task.progress === 100,
    createdAt: task.createdAt || now.toISOString(),
    updatedAt: task.updatedAt || now.toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    // Fetch tasks from the tasks API endpoint
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`;
    const tasksRes = await fetch(`${baseUrl}/api/tasks/all`);
    if (!tasksRes.ok) {
      throw new Error(`Failed to fetch tasks: ${tasksRes.status}`);
    }
    const rawTasks = await tasksRes.json();

    // Ensure we have an array
    const tasks = (Array.isArray(rawTasks) ? rawTasks : []).map(toPlannerTaskInput);

    const now = new Date();
    const input: PlannerInput = {
      tasks,
      today: now.toISOString().split("T")[0],
      dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" }),
      currentTime: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };

    const plan = await generatePlan(input);
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Planner API error:", error);
    return NextResponse.json(
      { error: "Failed to generate study plan. Please try again later." },
      { status: 500 }
    );
  }
}