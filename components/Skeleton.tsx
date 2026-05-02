/**
 * Basic Skeleton Loader Component
 * Used for loading states across the app
 */

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
      className={`${width} ${height} bg-gradient-to-r from-secondary via-secondary/50 to-secondary animate-pulse rounded-lg ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
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
    <div className="w-12 h-12 bg-gradient-to-r from-secondary via-secondary/50 to-secondary animate-pulse rounded-full" />
  );
}
