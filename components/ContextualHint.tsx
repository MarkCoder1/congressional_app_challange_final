"use client";

import { motion } from "framer-motion";
import { Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextualHintProps {
  message: string;
  variant?: "info" | "tip";
  className?: string;
}

export function ContextualHint({ message, variant = "info", className }: ContextualHintProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm",
        variant === "tip"
          ? "bg-accent/5 border border-accent/10 text-accent"
          : "bg-secondary/50 border border-border text-muted-foreground",
        className
      )}
    >
      {variant === "tip" ? (
        <Lightbulb size={16} className="shrink-0 mt-0.5" />
      ) : (
        <Info size={16} className="shrink-0 mt-0.5" />
      )}
      <p className="leading-relaxed">{message}</p>
    </motion.div>
  );
}
