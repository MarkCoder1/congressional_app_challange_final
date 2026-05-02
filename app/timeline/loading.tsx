import { TimelineSkeleton } from "@/components/skeletons/TimelineSkeleton";

export default function Loading() {
  return (
    <div className="p-6 lg:p-8">
      <TimelineSkeleton />
    </div>
  );
}