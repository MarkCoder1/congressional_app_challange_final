/**
 * Empty State Component
 * Shows when there are no tasks, assignments, or timeline items
 */

import Link from "next/link";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel = "Create Task",
  actionHref = "/create-task",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 lg:py-16">
      <div className="text-muted-foreground mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
        {description}
      </p>
      {actionHref && (
        <Link href={actionHref}>
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium text-sm">
            <Plus size={18} />
            {actionLabel}
          </button>
        </Link>
      )}
    </div>
  );
}
