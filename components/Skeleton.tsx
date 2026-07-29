export function Skeleton({
  className = "",
  height = "h-4",
  width = "w-full",
}: {
  className?: string;
  height?: string;
  width?: string;
}) {
  return (
    <div
      className={`${width} ${height} shimmer rounded-lg ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card-base p-6 space-y-4">
      <Skeleton height="h-6" width="w-2/3" />
      <Skeleton height="h-4" width="w-full" />
      <Skeleton height="h-4" width="w-4/5" />
    </div>
  );
}

export function SkeletonLine() {
  return <Skeleton height="h-3" width="w-full" />;
}

export function SkeletonCircle() {
  return (
    <div className="w-12 h-12 shimmer rounded-full" />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card-stat space-y-2">
      <Skeleton height="h-3" width="w-16" />
      <Skeleton height="h-6" width="w-20" />
    </div>
  );
}
