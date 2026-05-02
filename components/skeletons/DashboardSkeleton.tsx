/**
 * Dashboard Loading Skeleton
 */

import { Skeleton, SkeletonCard } from "../Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Next Action Skeleton */}
      <div className="space-y-4">
        <Skeleton height="h-5" width="w-32" />
        <div className="bg-gradient-to-br from-secondary via-secondary/50 to-secondary border border-border rounded-2xl p-6 lg:p-8 space-y-4 animate-pulse">
          <Skeleton height="h-6" width="w-2/3" />
          <Skeleton height="h-4" width="w-full" />
          <div className="flex gap-3 pt-4">
            <Skeleton height="h-10" width="w-32" />
            <Skeleton height="h-10" width="w-32" />
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <Skeleton height="h-5" width="w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg p-4 space-y-3 animate-pulse"
              >
                <Skeleton height="h-4" width="w-2/3" />
                <Skeleton height="h-3" width="w-1/2" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Skeleton height="h-5" width="w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
