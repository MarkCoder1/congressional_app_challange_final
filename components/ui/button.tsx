"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const buttonVariants = {
  variant: {
    default: "btn-primary",
    destructive: "btn-danger",
    outline: "border border-border bg-transparent hover:bg-secondary h-10 px-4 rounded-lg font-medium text-sm inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    link: "text-accent underline-offset-4 hover:underline inline-flex items-center gap-2 font-medium text-sm transition-all duration-200",
  },
  size: {
    sm: "btn-sm",
    default: "h-10 px-4 text-sm rounded-lg",
    lg: "btn-lg",
    icon: "btn-icon",
  },
} as const;

type Variant = keyof typeof buttonVariants.variant;
type Size = keyof typeof buttonVariants.size;

function getButtonClasses(variant: Variant = "default", size: Size = "default", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    buttonVariants.variant[variant],
    buttonVariants.size[size],
    className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={getButtonClasses(variant, size, className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, getButtonClasses };
export type { Variant as ButtonVariant, Size as ButtonSize };
