import { TaskWorkspaceSkeleton } from "@/components/skeletons/TaskWorkspaceSkeleton";

export default function Loading() {
  return (
    <div className="p-6 lg:p-8">
      <TaskWorkspaceSkeleton />
    </div>
  );
}