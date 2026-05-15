import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AssignmentWorkflowStage } from "@/types/task";
import { updateTaskProgress } from "@/lib/tasks";

export async function POST(req: NextRequest) {
  try {
    const {
      taskId,
      progressData,
      completedStages = [],
      currentStage,
    } = await req.json();
    if (!taskId || !progressData) {
      return NextResponse.json(
        { error: "Missing taskId or progressData" },
        { status: 400 },
      );
    }

    const mapStage = (
      stage: string | undefined,
    ): AssignmentWorkflowStage | undefined => {
      if (!stage) return undefined;
      if (stage === "plan") return "planning";
      return stage as AssignmentWorkflowStage;
    };

    const normalizedCompletedStages = (completedStages as string[])
      .map((stage) => mapStage(stage))
      .filter(Boolean) as AssignmentWorkflowStage[];

    const stmt = db.prepare(`
      INSERT INTO assignment_progress (id, task_id, progress_data, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(task_id) DO UPDATE SET
        progress_data = excluded.progress_data,
        updated_at = excluded.updated_at
    `);
    stmt.run(
      crypto.randomUUID(),
      taskId,
      
      JSON.stringify(progressData),
      Date.now(),
    );

    updateTaskProgress(taskId, {
      assignmentStagesCompleted: normalizedCompletedStages,
      workflowAdvancedTo: mapStage(currentStage),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
