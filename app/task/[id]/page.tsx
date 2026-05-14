// /app/task/[id]/page.tsx
import { getTaskById } from "@/lib/tasks";
import TaskWorkspaceClient from "./TaskWorkspaceClient";
import { EmptyState } from "@/components/EmptyState";
import { BookOpen } from "lucide-react";
import { AssignmentContent } from "@/types/task";

// We'll import the component later; for now use a placeholder or comment
// import AssignmentWorkspace from "@/components/assignment/AssignmentWorkspace";

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log("[TaskPage] loading task", { taskId: id });
  const task = getTaskById(id);

  // Safely extract assignmentContent with correct type
  const assignment: AssignmentContent | null = task?.assignmentContent ?? null;

  // Determine if we have valid assignment data
  const hasAssignment = !!(
    assignment &&
    assignment.plan?.steps &&
    assignment.plan.steps.length > 0
  );

  console.log("[TaskPage] task lookup result", {
    taskId: id,
    found: !!task,
    hasAssignment,
    hasVisualData: !!task?.visualData,
    visualType: task?.visualData?.type,
  });

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-sm">
          <EmptyState
            icon={<BookOpen size={32} />}
            title="Task not found"
            description="The requested task does not exist in the database."
            actionLabel="Back to Dashboard"
            actionHref="/"
          />
        </div>
      </div>
    );
  }

  // Pass both task and assignment flags to client component
  return (
    <TaskWorkspaceClient
      initialTask={task}
      assignment={assignment}
      hasAssignment={hasAssignment}
    />
  );
}