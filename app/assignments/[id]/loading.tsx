import { AssignmentWorkspaceSkeleton } from "@/components/skeletons/AssignmentWorkspaceSkeleton";

export default function Loading() {
  return (
    <div className="p-6 lg:p-8">
      <AssignmentWorkspaceSkeleton />
    </div>
  );
}