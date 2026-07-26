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
    <div className="flex flex-col items-center justify-center py-16 lg:py-24 px-4">
      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3 text-center">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-8 max-w-md leading-relaxed">
        {description}
      </p>
      {actionHref && (
        <Link href={actionHref}>
          <button className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl hover:opacity-90 transition-all duration-200 font-medium text-sm shadow-md shadow-accent/20 hover:shadow-lg active:scale-[0.98]">
            <Plus size={18} />
            {actionLabel}
          </button>
        </Link>
      )}
    </div>
  );
}
