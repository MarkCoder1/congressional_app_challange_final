/**
 * Timeline Loading Skeleton
 */

import { Skeleton } from "../Skeleton";

export function TimelineSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton height="h-8" width="w-32" />
        <Skeleton height="h-4" width="w-48" />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton height="h-10" width="w-40" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton height="h-10" width="w-32" />
          <Skeleton height="h-10" width="w-32" />
        </div>
      </div>

      {/* Timeline Grid Skeleton */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
        <div className="h-96 bg-gradient-to-b from-secondary/30 via-transparent to-secondary/10 space-y-4 p-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-gradient-to-r from-secondary via-secondary/50 to-secondary rounded-lg"
            />
          ))}
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="bg-secondary/30 rounded-lg p-4 border border-border">
        <Skeleton height="h-4" width="w-64" />
      </div>
    </div>
  );
}
