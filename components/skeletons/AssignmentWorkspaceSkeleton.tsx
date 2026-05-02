/**
 * Assignment Workspace Loading Skeleton
 */

import { Skeleton, SkeletonCard } from "../Skeleton";

export function AssignmentWorkspaceSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Left Panel */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Right Panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Question Navigation */}
        <div className="flex items-center justify-between">
          <Skeleton height="h-10" width="w-20" />
          <Skeleton height="h-5" width="w-16" />
          <Skeleton height="h-10" width="w-20" />
        </div>

        {/* Question Content */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <Skeleton height="h-5" width="w-2/3" />
            <Skeleton height="h-20" width="w-full" />
          </div>

          {/* Step by Step */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg p-4"
              >
                <Skeleton height="h-4" width="w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
