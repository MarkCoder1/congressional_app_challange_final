// /app/api/planner/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildPlannerState } from "@/lib/planner/plannerEngine";
import { normalizeRawTaskInput } from "@/lib/planner/plannerNormalizer";
import {
  buildAIPlannerState,
  toLegacyPlannerAIOutput,
} from "@/lib/planner/ai/plannerAI";
import type { RawTask } from "@/lib/planner/plannerTypes";

export async function POST(req: NextRequest) {
  try {
    // Fetch tasks from the existing API
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      `http://localhost:${process.env.PORT || 3000}`;
    const tasksRes = await fetch(`${baseUrl}/api/tasks/all`);
    if (!tasksRes.ok) throw new Error("Failed to fetch tasks");

    const rawTasks = await tasksRes.json();
    const tasks: RawTask[] = Array.isArray(rawTasks)
      ? rawTasks
          .map((task) => normalizeRawTaskInput(task))
          .filter((task): task is RawTask => Boolean(task))
      : [];

    const plannerState = buildPlannerState({
      tasks,
      currentDate: new Date(),
    });

    const aiState = buildAIPlannerState(plannerState);
    return NextResponse.json(toLegacyPlannerAIOutput(aiState));
  } catch (error) {
    console.error("Planner API error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI plan." },
      { status: 500 },
    );
  }
}
