"use client";

import { Skeleton } from "@/components/Skeleton";

export function TimelineSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="text-center min-w-48">
                <Skeleton className="h-3 w-16 mx-auto mb-2" />
                <Skeleton className="h-6 w-48 mx-auto" />
              </div>
              <Skeleton className="w-10 h-10 rounded-lg" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-64 rounded-lg" />
              <Skeleton className="h-10 w-80 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Skeleton */}
      <div className="flex">
        {/* Left Sidebar Skeleton */}
        <div className="hidden lg:block w-80 flex-shrink-0 border-r border-border bg-card/30 p-6 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>

        {/* Center Content Skeleton */}
        <div className="flex-1 p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>

          {/* Timeline/List Skeleton */}
          <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <div className="hidden xl:block w-96 flex-shrink-0 border-l border-border bg-card/30 p-6">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
