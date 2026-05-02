/**
 * Task Workspace Loading Skeleton
 */

import { Skeleton, SkeletonCard } from "../Skeleton";

export function TaskWorkspaceSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Left Panel */}
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Right Panel */}
      <div className="lg:col-span-2 space-y-4">
        {/* Tabs Skeleton */}
        <div className="flex gap-2 border-b border-border pb-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="h-10" width="w-24" />
          ))}
        </div>

        {/* Content Area Skeleton */}
        <div className="space-y-4 pt-4">
          <Skeleton height="h-6" width="w-2/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg p-4 space-y-3"
              >
                <Skeleton height="h-4" width="w-3/4" />
                <Skeleton height="h-3" width="w-full" />
                <Skeleton height="h-3" width="w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
