import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  variant: {
    default: "badge-default",
    accent: "badge-accent",
    destructive: "badge-destructive",
    success: "badge-success",
    warning: "badge-warning",
    outline: "badge-outline",
    muted: "badge-muted",
  },
} as const;

type BadgeVariant = keyof typeof badgeVariants.variant;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200",
        badgeVariants.variant[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeVariant };
